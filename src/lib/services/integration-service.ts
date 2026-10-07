import db from '@/lib/db';
import { AuthorizationService } from '@/lib/auth/authorization';
import { ProviderRegistry } from '@/lib/integrations/provider-registry';
import { CryptoService } from '@/lib/integrations/crypto';
import { CredentialPayload } from '@/lib/integrations/types';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { auditService } from '@/lib/audit';

export class IntegrationService {
  /**
   * Start OAuth Flow: Generates a state token and returns the authorization URL.
   */
  static async startOAuthFlow(providerId: string, redirectUri: string) {
    await AuthorizationService.authorize('integrations', 'create');
    const { tenant, user } = await AuthorizationService.resolveContext();

    const connector = ProviderRegistry.get(providerId);
    if (!connector) throw new NotFoundError(`Provider ${providerId} not found`);
    if (connector.metadata.authMethod !== 'OAUTH2' || !connector.getAuthorizationUrl) {
      throw new ValidationError(`Provider ${providerId} does not support OAuth`);
    }

    // Generate cryptographically strong state using Web Crypto API
    const stateBytes = new Uint8Array(32);
    crypto.getRandomValues(stateBytes);
    const state = Array.from(stateBytes, b => b.toString(16).padStart(2, '0')).join('');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store state
    await db.oAuthSession.create({
      data: {
        state,
        tenantId: tenant!.id,
        provider: providerId,
        userId: user.id,
        redirectUri,
        expiresAt,
      },
    });

    const url = await connector.getAuthorizationUrl({ state, redirectUri, tenantId: tenant!.id });
    return { url };
  }

  /**
   * Handle OAuth Callback: Exchanges code for tokens and saves the connection.
   */
  static async handleOAuthCallback(state: string, code: string) {
    const session = await db.oAuthSession.findUnique({ where: { state } });
    if (!session || session.expiresAt < new Date()) {
      throw new ValidationError('Invalid or expired OAuth state');
    }

    const { tenantId, provider, redirectUri, userId } = session;

    // Delete session immediately to prevent replay
    await db.oAuthSession.delete({ where: { id: session.id } });

    const connector = ProviderRegistry.get(provider);
    if (!connector || !connector.exchangeTokens) {
      throw new ValidationError(`Provider ${provider} not configured for OAuth`);
    }

    // Exchange tokens
    const credentials = await connector.exchangeTokens({ code, redirectUri });

    // Ensure the integration record exists
    let integration = await db.integration.findFirst({
      where: { tenantId, name: connector.metadata.displayName },
    });

    if (!integration) {
      integration = await db.integration.create({
        data: {
          tenantId,
          name: connector.metadata.displayName,
          provider: connector.metadata.id,
          type: connector.metadata.category,
          status: 'CONNECTED',
          capabilities: connector.metadata.capabilities,
          enabled: true,
          lastConnectedAt: new Date()
        },
      });
    } else {
      await db.integration.update({
        where: { id: integration.id },
        data: { 
          status: 'CONNECTED',
          lastConnectedAt: new Date(),
          errorState: null
        },
      });
    }

    // Save encrypted credentials
    await this.saveCredentials(integration.id, 'oauth', credentials);

    await auditService.log({
      actorType: 'USER',
      actorId: userId,
      action: 'integration.connected',
      resourceType: 'integration',
      resourceId: integration.id,
      tenantId,
      metadata: { provider },
    });

    return integration;
  }

  /**
   * Encrypts and saves credentials for an integration.
   */
  private static async saveCredentials(integrationId: string, credentialType: string, payload: CredentialPayload) {
    const encryptedToken = CryptoService.encrypt(JSON.stringify(payload));
    const expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : null;

    // Upsert credential
    const existing = await db.integrationCredential.findFirst({
      where: { integrationId, credentialType },
    });

    if (existing) {
      await db.integrationCredential.update({
        where: { id: existing.id },
        data: { encryptedToken, expiresAt },
      });
    } else {
      await db.integrationCredential.create({
        data: {
          integrationId,
          credentialType,
          encryptedToken,
          expiresAt,
        },
      });
    }
  }

  /**
   * Retrieves and decrypts credentials for an integration safely.
   */
  static async getDecryptedCredentials(integrationId: string): Promise<CredentialPayload> {
    const cred = await db.integrationCredential.findFirst({
      where: { integrationId },
      orderBy: { createdAt: 'desc' },
    });

    if (!cred) throw new NotFoundError(`No credentials found for integration ${integrationId}`);

    const decrypted = CryptoService.decrypt(cred.encryptedToken);
    return JSON.parse(decrypted) as CredentialPayload;
  }
}
