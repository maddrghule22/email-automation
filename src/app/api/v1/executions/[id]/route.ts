export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await AuthorizationService.authorize('workflows', 'read');
    const { tenant } = await AuthorizationService.resolveContext();

    const run = await db.workflowRun.findFirst({
      where: { id, tenantId: tenant!.id },
      include: {
        version: {
          select: { version: true, workflowId: true },
        },
        tasks: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!run) throw new NotFoundError('Execution not found');

    return successResponse(run);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await AuthorizationService.authorize('workflows', 'execute');
    const { tenant, user } = await AuthorizationService.resolveContext();

    const run = await db.workflowRun.findFirst({
      where: { id, tenantId: tenant!.id },
    });

    if (!run) throw new NotFoundError('Execution not found');

    // Can only cancel if not already terminal
    if (['Succeeded', 'Failed', 'Cancelled'].includes(run.status)) {
      return successResponse({ message: `Execution already in terminal state: ${run.status}` });
    }

    await db.workflowRun.update({
      where: { id },
      data: { status: 'Cancelled', completedAt: new Date() },
    });

    return successResponse({ message: 'Execution cancelled' });
  } catch (error) {
    return errorResponse(error);
  }
}
