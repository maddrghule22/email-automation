export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { SyncEngine } from '@/lib/integrations/sync-engine';
import { NotFoundError, ValidationError } from '@/lib/errors';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await AuthorizationService.authorize('transactions', 'sync');
    const { tenant } = await AuthorizationService.resolveContext();

    const body = await request.json();
    const { integrationId, type = 'Invoice' } = body; 
    
    if (!integrationId) throw new ValidationError('integrationId is required');

    // Only allow syncing APPROVED or POSTED invoices manually to prevent bypassing approval
    if (type === 'Invoice') {
      const invoice = await db.invoice.findFirst({ where: { id, tenantId: tenant!.id } });
      if (!invoice) throw new NotFoundError('Invoice not found');
      
      if (invoice.status !== 'APPROVED' && invoice.status !== 'POSTED') {
        throw new ValidationError(`Cannot sync invoice in ${invoice.status} state. Must be APPROVED.`);
      }
    }

    const syncRecord = await SyncEngine.syncTransactionOutbound(
      tenant!.id,
      type,
      id,
      integrationId
    );

    return successResponse(syncRecord);
  } catch (error) {
    return errorResponse(error);
  }
}
