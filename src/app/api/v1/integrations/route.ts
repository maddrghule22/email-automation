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

    const dbIntegrations = await db.integration.findMany({
      where: { tenantId: tenant!.id },
      orderBy: { createdAt: 'desc' },
    });

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
