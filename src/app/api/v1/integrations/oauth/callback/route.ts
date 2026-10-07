export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { IntegrationService } from '@/lib/services/integration-service';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.state || !body.code) {
      throw new Error('State and code are required');
    }

    const integration = await IntegrationService.handleOAuthCallback(body.state, body.code);
    return successResponse(integration, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const code = searchParams.get('code');
  
  if (!state || !code) {
    return NextResponse.json({ error: 'State and code are required' }, { status: 400 });
  }

  try {
    const integration = await IntegrationService.handleOAuthCallback(state, code);
    return NextResponse.redirect(new URL('/integrations', request.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
