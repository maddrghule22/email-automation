import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { ProviderRegistry } from '../provider-registry';
import { CryptoService } from '../crypto';
import { Integration, IntegrationCredential, IntegrationEvent, Prisma } from '@prisma/client';


export class IntegrationService {
  static async createIntegration(tenantId: string, providerId: string, name: string): Promise<Integration> {
    const provider = ProviderRegistry.get(providerId);
    if (!provider) throw new Error(`Provider not found: ${providerId}`);

    return db.integration.create({
      data: {
        tenantId,
        provider: providerId,
        name,
        type: provider.metadata.category,
        status: 'NOT_CONFIGURED',
        enabled: true,
        capabilities: provider.metadata.capabilities,
      },
    });
  }

  static async listIntegrations(tenantId: string): Promise<Integration[]> {
    return db.integration.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getIntegration(tenantId: string, id: string): Promise<Integration | null> {
    return db.integration.findFirst({
      where: { id, tenantId },
    });
  }

  static async updateConfig(tenantId: string, id: string, config: any): Promise<Integration> {
    return db.integration.update({
      where: { id, tenantId },
      data: { config, status: 'CONFIGURING' },
    });
  }

  static async setCredentials(tenantId: string, integrationId: string, credentialType: string, payload: any): Promise<void> {
    // 1. Verify ownership
    const integration = await this.getIntegration(tenantId, integrationId);
    if (!integration) throw new Error('Integration not found');

    // 2. Encrypt
    const encryptedToken = CryptoService.encrypt(JSON.stringify(payload));

    // 3. Save
    await db.integrationCredential.create({
      data: {
        integrationId,
        credentialType,
        encryptedToken,
      },
    });

    // 4. Update Status to CONNECTING
    await db.integration.update({
      where: { id: integrationId },
      data: { status: 'CONNECTING' },
    });

    // 5. Test Connection
    await this.testConnection(tenantId, integrationId);
  }

  static async getCredentials(tenantId: string, integrationId: string): Promise<any | null> {
    const integration = await db.integration.findFirst({
      where: { id: integrationId, tenantId },
      include: { credentials: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!integration || integration.credentials.length === 0) return null;

    const cred = integration.credentials[0];
    const decrypted = CryptoService.decrypt(cred.encryptedToken);
    return JSON.parse(decrypted);
  }

  static async testConnection(tenantId: string, id: string): Promise<boolean> {
    const integration = await this.getIntegration(tenantId, id);
    if (!integration) throw new Error('Integration not found');

    const provider = ProviderRegistry.get(integration.provider);
    if (!provider) throw new Error(`Provider not found: ${integration.provider}`);

    const credentials = await this.getCredentials(tenantId, id);
    if (!credentials) {
      await this.updateStatus(id, 'AUTHENTICATION_FAILED', 'Missing credentials');
      return false;
    }

    try {
      const result = await provider.testConnection(credentials);
      if (result.success) {
        await db.integration.update({
          where: { id },
          data: {
            status: 'CONNECTED',
            lastConnectedAt: new Date(),
            errorState: null,
          }
        });
        await this.logEvent(tenantId, id, 'INFO', 'connection_test', 'Connection successful');
        return true;
      } else {
        await this.updateStatus(id, 'ERROR', result.message || 'Connection failed');
        return false;
      }
    } catch (error: any) {
      await this.updateStatus(id, 'ERROR', error.message);
      return false;
    }
  }

  static async updateStatus(id: string, status: string, errorState?: string) {
    await db.integration.update({
      where: { id },
      data: {
        status,
        errorState: errorState || null,
        lastErrorAt: errorState ? new Date() : undefined,
      },
    });
  }

  static async logEvent(tenantId: string, integrationId: string, level: string, action: string, message: string, metadata?: any) {
    await db.integrationLog.create({
      data: {
        tenantId,
        integrationId,
        level,
        action,
        message,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  }
}
