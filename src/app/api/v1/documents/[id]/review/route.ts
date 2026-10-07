export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { DocumentPipeline } from '@/lib/documents/pipeline';
import { NotFoundError } from '@/lib/errors';
import { eventBus } from '@/lib/events/event-bus';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await AuthorizationService.authorize('documents', 'update');
    const { tenant } = await AuthorizationService.resolveContext();

    const body = await request.json();
    const { correctedData } = body;

    const doc = await db.document.findFirst({
      where: { id, tenantId: tenant!.id, status: 'REVIEW_REQUIRED' },
    });

    if (!doc) throw new NotFoundError('Document not found or not in REVIEW_REQUIRED state');

    // Save correction, close review task, trigger pipeline continuation
    await db.$transaction(async (tx) => {
      await tx.document.update({
        where: { id },
        data: {
          extractedData: correctedData,
          status: 'COMPLETED',
          confidence: 1.0, // Human corrected
        },
      });

      await tx.reviewTask.updateMany({
        where: { documentId: id, status: 'PENDING' },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    });

    await eventBus.publish({
      eventId: crypto.randomUUID(),
      eventType: 'DocumentCompleted',
      aggregateType: 'Document',
      aggregateId: id,
      tenantId: tenant!.id,
      version: 1,
      timestamp: new Date().toISOString(),
      payload: {},
    });

    return successResponse({ message: 'Review completed' });
  } catch (error) {
    return errorResponse(error);
  }
}
