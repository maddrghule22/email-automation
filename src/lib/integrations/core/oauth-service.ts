import db from '@/lib/db';
import { ProviderRegistry } from '../provider-registry';
import { IntegrationService } from './integration-service';

export class OAuthService {
  /**
   * Generates an authorization URL and stores the state securely.
   */
  static async getAuthorizationUrl(tenantId: string, userId: string, providerId: string, redirectUri: string): Promise<string> {
    const provider = ProviderRegistry.get(providerId);
    if (!provider || provider.metadata.authMethod !== 'OAUTH2') {
      throw new Error(`Provider ${providerId} does not support OAuth2`);
    }

    if (!provider.getAuthorizationUrl) {
      throw new Error(`Provider ${providerId} missing getAuthorizationUrl implementation`);
    }

    const stateBytes = new Uint8Array(32);
    crypto.getRandomValues(stateBytes);
    const state = Array.from(stateBytes, b => b.toString(16).padStart(2, '0')).join('');
    
    // Store OAuth state to prevent CSRF
    await db.oAuthSession.create({
      data: {
        state,
        tenantId,
        provider: providerId,
        userId,
        redirectUri,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
      }
    });

    const url = await provider.getAuthorizationUrl({ state, redirectUri, tenantId });
    return url;
  }

  /**
   * Handles the OAuth callback, validates state, and exchanges tokens.
   */
  static async handleCallback(state: string, code: string): Promise<{ integrationId: string, tenantId: string }> {
    const session = await db.oAuthSession.findUnique({
      where: { state }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new Error('Invalid or expired OAuth state');
    }

    const provider = ProviderRegistry.get(session.provider);
    if (!provider || !provider.exchangeTokens) {
      throw new Error('Invalid provider for token exchange');
    }

    // Exchange token securely
    const credentials = await provider.exchangeTokens({
      code,
      redirectUri: session.redirectUri,
    });

    // Create Integration Record if it doesn't exist
    let integration = await db.integration.findFirst({
      where: { tenantId: session.tenantId, provider: session.provider }
    });

    if (!integration) {
      integration = await IntegrationService.createIntegration(
        session.tenantId, 
        session.provider, 
        provider.metadata.displayName
      );
    }

    // Save encrypted credentials
    await IntegrationService.setCredentials(session.tenantId, integration.id, 'oauth', credentials);

    // Clean up state
    await db.oAuthSession.delete({ where: { state } });

    return { integrationId: integration.id, tenantId: session.tenantId };
  }
}
