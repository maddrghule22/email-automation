export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await AuthorizationService.authorize('integrations', 'read');
    const { tenant } = await AuthorizationService.resolveContext();
    
    const resolvedParams = await params;

    const integration = await db.integration.findUnique({
      where: { 
        id: resolvedParams.id,
        tenantId: tenant!.id 
      }
    });

    if (!integration) {
      throw new NotFoundError('Integration not found');
    }

    return successResponse(integration);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await AuthorizationService.authorize('integrations', 'delete');
    const { tenant } = await AuthorizationService.resolveContext();

    const resolvedParams = await params;

    // Check if exists
    const integration = await db.integration.findUnique({
      where: { 
        id: resolvedParams.id,
        tenantId: tenant!.id 
      }
    });

    if (!integration) {
      throw new NotFoundError('Integration not found');
    }

    // Delete credentials (cascade delete might not be set up on credentials, do it explicitly)
    await db.integrationCredential.deleteMany({
      where: { integrationId: integration.id }
    });

    // Delete integration
    await db.integration.delete({
      where: { id: integration.id }
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
