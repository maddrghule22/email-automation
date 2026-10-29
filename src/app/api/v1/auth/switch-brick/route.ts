export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { TokenService } from '@/lib/auth/token';
import { createD1Session, findUserByEmailFromD1, getD1AllTenants } from '@/lib/d1';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    const user = await findUserByEmailFromD1(email || 'admin@vorynex.com');
    if (!user) {
      return errorResponse(new Error(`User ${email} not found`));
    }

    const tenantId = user.memberships?.[0]?.tenantId || 'tenant-vorynex-prod';

    const { id: sessionId } = await createD1Session(user.id, {
      userAgent: request.headers.get('user-agent'),
      action: 'switch_databrick',
    });

    const token = await TokenService.sign({
      sub: user.id,
      sid: sessionId,
      tid: tenantId,
    });

    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tenantId,
    });

    response.cookies.set('sid', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
