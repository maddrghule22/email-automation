export const runtime = 'edge';
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { PasswordService } from '@/lib/auth/password';
import { SessionService } from '@/lib/auth/session';
import { auditService } from '@/lib/audit';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

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

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      throw new ValidationError('Email is already registered'); // In a public SaaS, we might obscure this
    }

    const passwordHash = await PasswordService.hash(password);

    // Create user, tenant, and membership in one transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: { email, name, passwordHash, status: 'ACTIVE' }
      });

      // 2. Create Tenant
      const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const tenant = await tx.tenant.create({
        data: { name: organizationName, slug, status: 'Active' }
      });

      // 3. Ensure Admin Role exists
      let adminRole = await tx.role.findFirst({
        where: { name: 'Admin', isSystem: true }
      });
      
      if (!adminRole) {
        adminRole = await tx.role.create({
          data: { name: 'Admin', isSystem: true }
        });
      }

      // 4. Create Membership
      await tx.membership.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          roleId: adminRole.id,
          status: 'Active'
        }
      });

      return { user, tenant };
    });

    // Create DB-backed session & set cookies
    await SessionService.createSession(result.user.id, result.tenant.id, {
      userAgent: request.headers.get('user-agent'),
    });

    await auditService.log({
      actorType: 'USER',
      actorId: result.user.id,
      action: 'user.registered',
      resourceType: 'user',
      resourceId: result.user.id,
      tenantId: result.tenant.id
    });

    return successResponse({
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      tenantId: result.tenant.id
    });
  } catch (error) {
    return errorResponse(error);
  }
}
