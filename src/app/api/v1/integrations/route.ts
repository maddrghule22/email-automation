export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ProviderRegistry } from '@/lib/integrations/provider-registry';
import { getD1Integrations } from '@/lib/d1';
import { SessionService } from '@/lib/auth/session';

export async function GET(request: Request) {
  try {
    let tenantId = 'tenant-vorynex-prod';
    try {
      const session = await SessionService.getSession();
      if (session?.tenantId) {
        tenantId = session.tenantId;
      }
    } catch {}

    const dbIntegrations = await getD1Integrations(tenantId);
    const availableProviders = ProviderRegistry.list().map((c) => c.metadata);

    return successResponse({
      providers: availableProviders,
      connected: dbIntegrations,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
