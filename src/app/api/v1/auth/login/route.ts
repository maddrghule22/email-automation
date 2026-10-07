export const runtime = 'edge';
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { PasswordService } from '@/lib/auth/password';
import { SessionService } from '@/lib/auth/session';
import { auditService } from '@/lib/audit';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { applyRateLimit } from '@/lib/security/api-rate-limit';

export async function POST(request: Request) {
  try {
    // Brute-force protection: 10 login attempts per minute per IP
    const rateLimited = applyRateLimit(request, 'auth/login', 10, 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { email, password, tenantId } = body;

    if (!email || !password) {
      throw new AuthenticationError('Invalid credentials'); // General message to prevent enum
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { memberships: true }
    });

    if (!user || user.status !== 'ACTIVE' || !user.passwordHash) {
      await auditService.log({
        actorType: 'SYSTEM',
        actorId: 'system',
        action: 'login.failed',
        resourceType: 'user',
        resourceId: user?.id || email,
        metadata: { reason: 'invalid_account' }
      });
      throw new AuthenticationError('Invalid credentials');
    }

    const isValid = await PasswordService.verify(password, user.passwordHash);

    if (!isValid) {
      await auditService.log({
        actorType: 'USER',
        actorId: user.id,
        action: 'login.failed',
        resourceType: 'user',
        resourceId: user.id,
        metadata: { reason: 'invalid_password' }
      });
      throw new AuthenticationError('Invalid credentials');
    }

    // Default tenant selection if user belongs to multiple and one isn't specified
    let selectedTenantId = tenantId;
    if (!selectedTenantId && user.memberships.length > 0) {
      // Pick first active membership
      const activeMembership = user.memberships.find(m => m.status === 'Active');
      if (activeMembership) {
        selectedTenantId = activeMembership.tenantId;
      }
    }

    // Create DB-backed session & set cookies
    await SessionService.createSession(user.id, selectedTenantId, {
      userAgent: request.headers.get('user-agent'),
    });

    await auditService.log({
      actorType: 'USER',
      actorId: user.id,
      action: 'login.success',
      resourceType: 'user',
      resourceId: user.id,
      tenantId: selectedTenantId
    });

    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: selectedTenantId
    });
  } catch (error) {
    return errorResponse(error);
  }
}
