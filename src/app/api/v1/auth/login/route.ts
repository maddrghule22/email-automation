export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { PasswordService } from '@/lib/auth/password';
import { TokenService } from '@/lib/auth/token';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { applyRateLimit } from '@/lib/security/api-rate-limit';
import { findUserByEmailFromD1, logD1Audit, createD1Session } from '@/lib/d1';

export async function POST(request: Request) {
  try {
    // Brute-force protection: 10 login attempts per minute per IP
    const rateLimited = applyRateLimit(request, 'auth/login', 10, 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { email, password, tenantId } = body;

    if (!email || !password) {
      throw new AuthenticationError('Invalid credentials');
    }

    // 1. Query Cloudflare D1 database for user
    const user = await findUserByEmailFromD1(email);

    if (!user || user.status !== 'ACTIVE' || !user.passwordHash) {
      await logD1Audit({
        actorType: 'SYSTEM',
        actorId: 'system',
        action: 'login.failed',
        resourceType: 'user',
        resourceId: user?.id || email,
        metadata: { reason: 'invalid_account' }
      });
      throw new AuthenticationError('Invalid credentials');
    }

    // 2. Verify password
    const isValid = await PasswordService.verify(password, user.passwordHash);

    if (!isValid) {
      await logD1Audit({
        actorType: 'USER',
        actorId: user.id,
        action: 'login.failed',
        resourceType: 'user',
        resourceId: user.id,
        metadata: { reason: 'invalid_password' }
      });
      throw new AuthenticationError('Invalid credentials');
    }

    // 3. Resolve tenant
    let selectedTenantId = tenantId;
    const memberships = user.memberships || [];
    if (!selectedTenantId && memberships.length > 0) {
      const activeMembership = memberships.find((m: any) => m.status === 'Active');
      if (activeMembership) {
        selectedTenantId = activeMembership.tenantId;
      }
    }

    // 4. Create session in D1
    const { id: sessionId } = await createD1Session(user.id, {
      userAgent: request.headers.get('user-agent'),
    });

    // 5. Sign JWT session token
    const token = await TokenService.sign({
      sub: user.id,
      sid: sessionId,
      tid: selectedTenantId,
    });

    // 6. Audit success
    await logD1Audit({
      actorType: 'USER',
      actorId: user.id,
      action: 'login.success',
      resourceType: 'user',
      resourceId: user.id,
      tenantId: selectedTenantId,
    });

    // 7. Form response and set secure session cookie
    const response = successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: selectedTenantId,
    });

    response.cookies.set('sid', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
