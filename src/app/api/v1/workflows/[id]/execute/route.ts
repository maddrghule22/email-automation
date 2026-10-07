export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { WorkflowService } from '@/lib/services/workflow-service';
import { executeWorkflowSchema } from '@/lib/validations/workflow';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // Idempotency key from headers
    const idempotencyKey = request.headers.get('x-idempotency-key') || undefined;
    
    let body = {};
    if (request.headers.get('content-type')?.includes('application/json')) {
      body = await request.json();
    }
    
    const validated = executeWorkflowSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.issues.map((e: any) => e.message).join(', '));
    }

    const run = await WorkflowService.executeWorkflow(id, validated.data.metadata as Record<string, unknown>, idempotencyKey);
    return successResponse(run, 202); // 202 Accepted for async operations
  } catch (error) {
    return errorResponse(error);
  }
}
