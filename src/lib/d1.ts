import { getRequestContext } from '@cloudflare/next-on-pages';

export interface D1User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  status: string;
  roleId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface D1Membership {
  id: string;
  userId: string;
  tenantId: string;
  roleId?: string | null;
  status: string;
}

export interface D1Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

// Global fallback memory store when running in Node dev without D1 binding
const devUsers: Map<string, D1User & { memberships: D1Membership[] }> = new Map([
  [
    'admin@vorynex.com',
    {
      id: 'user-admin-yash',
      email: 'admin@vorynex.com',
      name: 'Yash Salunke',
      passwordHash: '$2b$10$L7TfSIfBYhAM1LO54iOtfOOHpur0ATPKh01DHJRUoSePG/BZgjvK.', // admin123
      status: 'ACTIVE',
      roleId: 'role-admin',
      memberships: [
        {
          id: 'member-admin-yash',
          userId: 'user-admin-yash',
          tenantId: 'tenant-vorynex-prod',
          roleId: 'role-admin',
          status: 'Active',
        },
      ],
    },
  ],
]);

/**
 * Retrieves the Cloudflare D1 database instance from request context.
 */
export function getD1Database(): any | null {
  try {
    const ctx = getRequestContext();
    if (ctx && ctx.env) {
      if ((ctx.env as any).DB) return (ctx.env as any).DB;
      if ((ctx.env as any).email_automation_db) return (ctx.env as any).email_automation_db;
    }
  } catch (err) {
    // In build phase, unit tests, or pure Node.js environments
  }
  return null;
}

/**
 * Finds a user by email in Cloudflare D1 with memberships attached.
 */
export async function findUserByEmailFromD1(
  email: string
): Promise<(D1User & { memberships: D1Membership[] }) | null> {
  const d1 = getD1Database();

  if (d1) {
    try {
      const user = (await d1
        .prepare('SELECT id, email, name, passwordHash, status, roleId, createdAt, updatedAt FROM users WHERE lower(email) = lower(?) LIMIT 1')
        .bind(email.trim())
        .first()) as D1User | null;

      if (!user) return null;

      const membershipsResult = (await d1
        .prepare('SELECT id, userId, tenantId, roleId, status FROM memberships WHERE userId = ?')
        .bind(user.id)
        .all()) as { results?: D1Membership[] } | null;

      const memberships = (membershipsResult?.results as D1Membership[]) || [];

      return {
        ...user,
        memberships,
      };
    } catch (error) {
      console.error('[D1] Error querying users table:', error);
    }
  }

  // Fallback to local memory store for local development/testing
  const normalized = email.trim().toLowerCase();
  for (const [key, val] of devUsers.entries()) {
    if (key.toLowerCase() === normalized) {
      return val;
    }
  }

  return null;
}

/**
 * Creates a session record in Cloudflare D1.
 */
export async function createD1Session(
  userId: string,
  metadata?: any
): Promise<{ id: string; token: string; expiresAt: Date }> {
  const d1 = getD1Database();
  const id = crypto.randomUUID();
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  if (d1) {
    try {
      await d1
        .prepare(
          'INSERT INTO sessions (id, userId, token, expiresAt, metadata) VALUES (?, ?, ?, ?, ?)'
        )
        .bind(
          id,
          userId,
          token,
          expiresAt.toISOString(),
          metadata ? JSON.stringify(metadata) : null
        )
        .run();
    } catch (err) {
      console.error('[D1] Failed to insert session:', err);
    }
  }

  return { id, token, expiresAt };
}

/**
 * Validates a session in Cloudflare D1.
 */
export async function getD1Session(sessionId: string): Promise<any | null> {
  const d1 = getD1Database();
  if (!d1) return { id: sessionId, isValid: true };

  try {
    const session = await d1
      .prepare('SELECT * FROM sessions WHERE id = ? AND revokedAt IS NULL LIMIT 1')
      .bind(sessionId)
      .first();

    return session;
  } catch (err) {
    console.error('[D1] Error fetching session:', err);
    return null;
  }
}

/**
 * Logs an audit event into Cloudflare D1.
 */
export async function logD1Audit(params: {
  actorType: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  tenantId?: string;
  metadata?: any;
}): Promise<void> {
  const d1 = getD1Database();
  if (!d1) return;

  try {
    const id = crypto.randomUUID();
    await d1
      .prepare(
        'INSERT INTO audit_logs (id, actorType, actorId, action, resourceType, resourceId, tenantId, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id,
        params.actorType,
        params.actorId,
        params.action,
        params.resourceType,
        params.resourceId,
        params.tenantId || null,
        params.metadata ? JSON.stringify(params.metadata) : null
      )
      .run();
  } catch (err) {
    console.error('[D1] Audit log error:', err);
  }
}

/**
 * Registers a new user and tenant in Cloudflare D1.
 */
export async function registerD1User(params: {
  email: string;
  name: string;
  passwordHash: string;
  organizationName: string;
}): Promise<{ userId: string; tenantId: string }> {
  const d1 = getD1Database();
  const userId = crypto.randomUUID();
  const tenantId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const slug = params.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (d1) {
    await d1.batch([
      d1.prepare('INSERT INTO users (id, email, name, passwordHash, status) VALUES (?, ?, ?, ?, ?)').bind(
        userId,
        params.email.toLowerCase(),
        params.name,
        params.passwordHash,
        'ACTIVE'
      ),
      d1.prepare('INSERT INTO tenants (id, name, slug, status) VALUES (?, ?, ?, ?)').bind(
        tenantId,
        params.organizationName,
        slug,
        'Active'
      ),
      d1.prepare('INSERT INTO memberships (id, userId, tenantId, roleId, status) VALUES (?, ?, ?, ?, ?)').bind(
        membershipId,
        userId,
        tenantId,
        'role-admin',
        'Active'
      ),
    ]);
  } else {
    // Save to dev in-memory
    devUsers.set(params.email.toLowerCase(), {
      id: userId,
      email: params.email.toLowerCase(),
      name: params.name,
      passwordHash: params.passwordHash,
      status: 'ACTIVE',
      memberships: [
        {
          id: membershipId,
          userId,
          tenantId,
          roleId: 'role-admin',
          status: 'Active',
        },
      ],
    });
  }

  return { userId, tenantId };
}
