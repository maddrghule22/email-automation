export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { WorkflowService } from '@/lib/services/workflow-service';
import { createWorkflowSchema } from '@/lib/validations/workflow';
import { paginationSchema } from '@/lib/validations/pagination';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const take = url.searchParams.has('take') ? parseInt(url.searchParams.get('take')!, 10) : undefined;
    const skip = url.searchParams.has('skip') ? parseInt(url.searchParams.get('skip')!, 10) : undefined;
    const cursor = url.searchParams.get('cursor') || undefined;

    // TODO: Zod parse search params, but reusing paginationSchema from validations/pagination.ts
    // For now we'll do basic validation
    const result = await WorkflowService.listWorkflows({ take, skip, cursor });
    
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createWorkflowSchema.safeParse(body);

    if (!validated.success) {
      throw new ValidationError(validated.error.issues.map((e: any) => e.message).join(', '));
    }

    const workflow = await WorkflowService.createWorkflow(validated.data);
    return successResponse(workflow, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
