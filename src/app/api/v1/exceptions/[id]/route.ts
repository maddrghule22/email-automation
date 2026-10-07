export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { ExceptionService } from '@/lib/exceptions/exception-service';
import { ResolutionEngine } from '@/lib/exceptions/resolution-engine';
import { successResponse, errorResponse } from '@/lib/api-response';
import db from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tenant_1';
    const { id } = await context.params;
    
    const exception = await db.exceptionCase.findUnique({
      where: { id, tenantId },
      include: { history: { orderBy: { createdAt: 'desc' } } }
    });

    if (!exception) return NextResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
    return successResponse(exception);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tenant_1';
    const actorId = 'user_1';
    const body = await request.json();
    const { id } = await context.params;
    
    if (body.action === 'RESOLVE') {
      const result = await ResolutionEngine.resolveException(
        tenantId,
        id,
        body.resolutionCode,
        body.resolutionSummary,
        actorId
      );
      return successResponse(result);
    }

    if (body.status) {
      const result = await ExceptionService.transitionStatus(
        tenantId,
        id,
        body.status,
        actorId,
        body.reason
      );
      return successResponse(result);
    }

    return errorResponse(new Error('Invalid action'));
  } catch (error) {
    return errorResponse(error);
  }
}
