export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { WorkflowService } from '@/lib/services/workflow-service';
import { updateWorkflowSchema } from '@/lib/validations/workflow';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const workflow = await WorkflowService.getWorkflow(id);
    return successResponse(workflow);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validated = updateWorkflowSchema.safeParse(body);

    if (!validated.success) {
      throw new ValidationError(validated.error.issues.map((e: any) => e.message).join(', '));
    }

    const { version, ...updateData } = validated.data;
    const workflow = await WorkflowService.updateWorkflow(id, updateData, version);
    
    return successResponse(workflow);
  } catch (error) {
    return errorResponse(error);
  }
}
