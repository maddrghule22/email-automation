export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { PasswordService } from '@/lib/auth/password';
import { TokenService } from '@/lib/auth/token';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';
import { findUserByEmailFromD1, registerD1User, createD1Session, logD1Audit, provisionUserDatabrick } from '@/lib/d1';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, organizationName } = body;

    if (!email || !name || !password || !organizationName) {
      throw new ValidationError('Missing required fields');
    }

    // Password complexity validation
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
    if (!/\d/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new ValidationError('Password must contain at least one special symbol');
    }
    if (password.toLowerCase().includes(name.toLowerCase())) {
      throw new ValidationError('Password cannot contain your name');
    }
    if (password.toLowerCase().includes(organizationName.toLowerCase())) {
      throw new ValidationError('Password cannot contain your organization name');
    }
    if (password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
      throw new ValidationError('Password cannot contain your email prefix');
    }

    // 1. Check if user already exists in D1
    const existing = await findUserByEmailFromD1(email);
    if (existing) {
      throw new ValidationError('Email is already registered');
    }

    // 2. Hash password
    const passwordHash = await PasswordService.hash(password);

    // 3. Register user and organization in D1
    const { userId, tenantId } = await registerD1User({
      email,
      name,
      passwordHash,
      organizationName,
    });

    // Automatically provision dedicated multi-tenant Data Brick in D1
    await provisionUserDatabrick({
      userId,
      email,
      name,
      organizationName,
      tenantId,
    });

    // 4. Create session in D1
    const { id: sessionId } = await createD1Session(userId, {
      userAgent: request.headers.get('user-agent'),
    });

    // 5. Sign JWT session token
    const token = await TokenService.sign({
      sub: userId,
      sid: sessionId,
      tid: tenantId,
    });

    // 6. Audit log in D1
    await logD1Audit({
      actorType: 'USER',
      actorId: userId,
      action: 'user.registered',
      resourceType: 'user',
      resourceId: userId,
      tenantId: tenantId,
      metadata: { organizationName }
    });

    // 7. Form response and set secure session cookie
    const response = successResponse({
      id: userId,
      email: email.toLowerCase(),
      name,
      tenantId,
    }, 201);

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
