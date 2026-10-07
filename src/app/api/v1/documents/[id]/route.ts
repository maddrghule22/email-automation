export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await AuthorizationService.authorize('documents', 'read');
    const { tenant } = await AuthorizationService.resolveContext();

    const document = await db.document.findFirst({
      where: { id, tenantId: tenant!.id },
      include: {
        ingestion: true,
        reviewTasks: true
      }
    });

    if (!document) throw new NotFoundError('Document not found');

    return successResponse(document);
  } catch (error) {
    return errorResponse(error);
  }
}
