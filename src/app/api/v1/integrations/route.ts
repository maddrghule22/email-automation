export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ProviderRegistry } from '@/lib/integrations/provider-registry';

export async function GET(request: Request) {
  try {
    await AuthorizationService.authorize('integrations', 'read');
    const { tenant } = await AuthorizationService.resolveContext();

    let dbIntegrations: any[] = [];
    try {
      const { getD1Integrations } = await import('@/lib/d1');
      dbIntegrations = await getD1Integrations(tenant!.id);
    } catch {
      try {
        dbIntegrations = await db.integration.findMany({
          where: { tenantId: tenant!.id },
          orderBy: { createdAt: 'desc' },
        });
      } catch {
        dbIntegrations = [];
      }
    }

    // Provide the combined catalog (available + connected)
    const availableProviders = ProviderRegistry.list().map(c => c.metadata);
    
    return successResponse({
      providers: availableProviders,
      connected: dbIntegrations,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
