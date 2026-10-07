export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ApprovalService } from '@/lib/domain/approval-service';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await AuthorizationService.authorize('transactions', 'approve');
    const { tenant, user } = await AuthorizationService.resolveContext();

    const body = await request.json();
    const { approvalId, decision } = body; 

    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      throw new Error('Invalid decision');
    }

    await ApprovalService.makeDecision(tenant!.id, approvalId, user.id, decision);

    return successResponse({ message: `Transaction ${decision}` });
  } catch (error) {
    return errorResponse(error);
  }
}
