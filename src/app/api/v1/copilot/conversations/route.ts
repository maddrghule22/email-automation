export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { CopilotEngine } from '@/lib/ai/copilot/engine';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    // In prod, resolve via AuthorizationService.resolveContext()
    const tenantId = 'tenant_1';
    const userId = 'user_1';
    
    const body = await request.json();
    
    const result = await CopilotEngine.processMessage({
      tenantId,
      userId,
      content: body.content,
      conversationId: body.conversationId,
      contextType: body.contextType,
      contextId: body.contextId
    });

    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
