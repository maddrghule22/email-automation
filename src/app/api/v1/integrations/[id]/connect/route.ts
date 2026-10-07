export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { IntegrationService } from '@/lib/services/integration-service';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    const body = await request.json();
    if (!body.redirectUri) throw new Error('redirectUri is required');

    const result = await IntegrationService.startOAuthFlow(id, body.redirectUri);

    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
