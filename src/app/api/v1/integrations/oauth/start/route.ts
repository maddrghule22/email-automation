export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { IntegrationService } from '@/lib/services/integration-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const redirectUri = searchParams.get('redirectUri');

  if (!provider || !redirectUri) {
    return NextResponse.json({ error: 'provider and redirectUri are required' }, { status: 400 });
  }

  try {
    const { url } = await IntegrationService.startOAuthFlow(provider, redirectUri);
    return NextResponse.redirect(url);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
