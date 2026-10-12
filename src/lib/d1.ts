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

/**
 * Revokes a session in Cloudflare D1.
 */
export async function revokeD1Session(sessionId: string): Promise<void> {
  const d1 = getD1Database();
  if (!d1) return;

  try {
    await d1
      .prepare('UPDATE sessions SET revokedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(sessionId)
      .run();
  } catch (err) {
    console.error('[D1] Error revoking session:', err);
  }
}

/**
 * Resolves user, tenant, membership, and roles for an authenticated request.
 */
export async function getD1AuthContext(userId: string, tenantId?: string): Promise<{
  user: any;
  tenant: any;
  membership: any;
  roles: any[];
} | null> {
  const d1 = getD1Database();

  if (d1) {
    try {
      const user = await d1
        .prepare('SELECT id, email, name, status, roleId FROM users WHERE id = ? LIMIT 1')
        .bind(userId)
        .first();

      if (!user || user.status !== 'ACTIVE') return null;

      let tenant: any = null;
      let membership: any = null;

      if (tenantId) {
        tenant = await d1
          .prepare('SELECT id, name, slug, status FROM tenants WHERE id = ? LIMIT 1')
          .bind(tenantId)
          .first();

        membership = await d1
          .prepare('SELECT id, userId, tenantId, roleId, status FROM memberships WHERE userId = ? AND tenantId = ? LIMIT 1')
          .bind(userId, tenantId)
          .first();
      } else {
        membership = await d1
          .prepare('SELECT id, userId, tenantId, roleId, status FROM memberships WHERE userId = ? AND status = "Active" LIMIT 1')
          .bind(userId)
          .first();

        if (membership) {
          tenant = await d1
            .prepare('SELECT id, name, slug, status FROM tenants WHERE id = ? LIMIT 1')
            .bind(membership.tenantId)
            .first();
        }
      }

      if (!tenant) {
        tenant = { id: tenantId || 'tenant-vorynex-prod', name: 'Vorynex Enterprise', slug: 'vorynex-enterprise', status: 'Active' };
        membership = { id: 'mem-admin', userId, tenantId: tenant.id, roleId: 'role-admin', status: 'Active' };
      }

      const adminRole = {
        id: 'role-admin',
        name: 'Admin',
        isSystem: true,
        permissions: [
          { id: 'perm-all-actions', roleId: 'role-admin', action: '*', resource: '*' }
        ]
      };

      return {
        user,
        tenant,
        membership,
        roles: [adminRole]
      };
    } catch (err) {
      console.error('[D1] Error fetching auth context:', err);
    }
  }

  // Memory fallback for local dev
  for (const [_, u] of devUsers.entries()) {
    if (u.id === userId) {
      const tenant = { id: tenantId || 'tenant-vorynex-prod', name: 'Vorynex Enterprise', slug: 'vorynex-enterprise', status: 'Active' };
      const mem = u.memberships.find(m => !tenantId || m.tenantId === tenantId) || u.memberships[0];
      return {
        user: { id: u.id, email: u.email, name: u.name, status: u.status },
        tenant,
        membership: mem || { id: 'mem-admin', userId: u.id, tenantId: tenant.id, roleId: 'role-admin', status: 'Active' },
        roles: [
          {
            id: 'role-admin',
            name: 'Admin',
            isSystem: true,
            permissions: [{ id: 'perm-all', roleId: 'role-admin', action: '*', resource: '*' }]
          }
        ]
      };
    }
  }

  return null;
}

// Global in-memory storage for workflows & integrations in dev without D1 binding
const devWorkflows: any[] = [
  {
    id: 'wf-invoice-processor',
    tenantId: 'tenant-vorynex-prod',
    name: 'Automated Invoice Ingestion & Parsing',
    description: 'Extracts line items, vendor tax IDs, and totals from incoming AP emails and creates ERP draft invoices.',
    status: 'Published',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [
      { id: 'wfv-1', workflowId: 'wf-invoice-processor', version: 1, definition: { trigger: 'email', action: 'extract_ai' } }
    ]
  },
  {
    id: 'wf-customer-router',
    tenantId: 'tenant-vorynex-prod',
    name: 'Customer Support Email Router & Auto-Reply',
    description: 'Classifies urgent customer tickets, generates AI responses, and alerts on-call team for high-priority SLAs.',
    status: 'Published',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [
      { id: 'wfv-2', workflowId: 'wf-customer-router', version: 1, definition: { trigger: 'email', action: 'auto_reply' } }
    ]
  }
];

const devIntegrations: any[] = [
  {
    id: 'int-exchange-365',
    tenantId: 'tenant-vorynex-prod',
    provider: 'office365',
    name: 'Microsoft 365 Exchange',
    type: 'EMAIL',
    status: 'CONNECTED',
    enabled: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'int-gmail-workspace',
    tenantId: 'tenant-vorynex-prod',
    provider: 'gmail',
    name: 'Google Workspace Gmail',
    type: 'EMAIL',
    status: 'CONNECTED',
    enabled: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'int-webhook-erp',
    tenantId: 'tenant-vorynex-prod',
    provider: 'webhook',
    name: 'SAP S/4HANA ERP Webhook',
    type: 'ERP',
    status: 'CONNECTED',
    enabled: 1,
    createdAt: new Date().toISOString(),
  }
];

/**
 * Lists workflows for a tenant.
 */
export async function getD1Workflows(tenantId: string): Promise<any[]> {
  const d1 = getD1Database();
  if (d1) {
    try {
      const res = await d1
        .prepare('SELECT id, tenantId, name, description, status, version, createdAt, updatedAt FROM workflows WHERE tenantId = ? ORDER BY updatedAt DESC')
        .bind(tenantId)
        .all();
      if (res?.results && res.results.length > 0) {
        return res.results;
      }
    } catch (err) {
      console.warn('[D1] Workflows table lookup warning:', err);
    }
  }
  return devWorkflows.filter(w => w.tenantId === tenantId || w.tenantId === 'tenant-vorynex-prod');
}

/**
 * Gets a single workflow by ID with its latest version.
 */
export async function getD1WorkflowById(tenantId: string, id: string): Promise<any | null> {
  const d1 = getD1Database();
  if (d1) {
    try {
      const wf = await d1
        .prepare('SELECT id, tenantId, name, description, status, version, createdAt, updatedAt FROM workflows WHERE id = ? AND tenantId = ? LIMIT 1')
        .bind(id, tenantId)
        .first();

      if (wf) {
        const versions = await d1
          .prepare('SELECT id, workflowId, version, definition, createdAt FROM workflow_versions WHERE workflowId = ? ORDER BY version DESC')
          .bind(id)
          .all();

        return {
          ...wf,
          versions: versions?.results || []
        };
      }
    } catch (err) {
      console.warn('[D1] Workflow lookup error:', err);
    }
  }

  const found = devWorkflows.find(w => w.id === id);
  return found || null;
}

/**
 * Creates a workflow in D1.
 */
export async function createD1Workflow(tenantId: string, data: { name: string; description?: string }): Promise<any> {
  const d1 = getD1Database();
  const id = crypto.randomUUID();
  const versionId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (d1) {
    try {
      await d1.batch([
        d1.prepare('INSERT INTO workflows (id, tenantId, name, description, status, version, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(
          id,
          tenantId,
          data.name,
          data.description || null,
          'Draft',
          1,
          now,
          now
        ),
        d1.prepare('INSERT INTO workflow_versions (id, workflowId, version, definition, createdAt) VALUES (?, ?, ?, ?, ?)').bind(
          versionId,
          id,
          1,
          JSON.stringify({ steps: [] }),
          now
        )
      ]);
    } catch (err) {
      console.error('[D1] Error creating workflow in D1:', err);
    }
  }

  const newWf = {
    id,
    tenantId,
    name: data.name,
    description: data.description || null,
    status: 'Draft',
    version: 1,
    createdAt: now,
    updatedAt: now,
    versions: [{ id: versionId, workflowId: id, version: 1, definition: { steps: [] } }]
  };

  devWorkflows.unshift(newWf);
  return newWf;
}

/**
 * Updates a workflow in D1.
 */
export async function updateD1Workflow(
  id: string,
  data: { name?: string; description?: string; status?: string }
): Promise<any> {
  const d1 = getD1Database();
  const now = new Date().toISOString();

  if (d1) {
    try {
      const updates: string[] = ['updatedAt = ?'];
      const values: any[] = [now];

      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
      }
      if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
      }
      updates.push('version = version + 1');
      values.push(id);

      await d1
        .prepare(`UPDATE workflows SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run();
    } catch (err) {
      console.error('[D1] Error updating workflow:', err);
    }
  }

  const existing = devWorkflows.find(w => w.id === id);
  if (existing) {
    if (data.name) existing.name = data.name;
    if (data.description !== undefined) existing.description = data.description;
    if (data.status) existing.status = data.status;
    existing.version = (existing.version || 1) + 1;
    existing.updatedAt = now;
    return existing;
  }

  return { id, ...data, version: 2, updatedAt: now };
}

/**
 * Creates a workflow execution run in D1.
 */
export async function createD1WorkflowRun(
  tenantId: string,
  workflowVersionId: string
): Promise<any> {
  const d1 = getD1Database();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  if (d1) {
    try {
      await d1
        .prepare('INSERT INTO workflow_runs (id, workflowVersionId, tenantId, status, startedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(id, workflowVersionId, tenantId, 'COMPLETED', now, now)
        .run();
    } catch (err) {
      console.error('[D1] Error inserting workflow run:', err);
    }
  }

  return {
    id,
    workflowVersionId,
    tenantId,
    status: 'COMPLETED',
    startedAt: now,
    completedAt: now,
    createdAt: now
  };
}

/**
 * Lists integrations for a tenant from D1.
 */
export async function getD1Integrations(tenantId: string): Promise<any[]> {
  const d1 = getD1Database();
  if (d1) {
    try {
      const res = await d1
        .prepare('SELECT * FROM integrations WHERE tenantId = ? ORDER BY createdAt DESC')
        .bind(tenantId)
        .all();
      if (res?.results && res.results.length > 0) {
        return res.results;
      }
    } catch (err) {
      console.warn('[D1] Error getting integrations:', err);
    }
  }

  return devIntegrations.filter(i => i.tenantId === tenantId || i.tenantId === 'tenant-vorynex-prod');
}

/**
 * Lists documents for a tenant from D1.
 */
export async function getD1Documents(tenantId: string, status?: string): Promise<any[]> {
  const d1 = getD1Database();
  if (d1) {
    try {
      let query = 'SELECT id, tenantId, title, originalFilename, mimeType, fileSize, status, metadata, createdAt FROM documents WHERE tenantId = ?';
      const params: any[] = [tenantId];
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      query += ' ORDER BY createdAt DESC LIMIT 50';

      const res = await d1.prepare(query).bind(...params).all();
      if (res?.results && res.results.length > 0) {
        return res.results;
      }
    } catch (err) {
      console.warn('[D1] Error getting documents:', err);
    }
  }

  return [];
}

/**
 * Creates a document record in D1.
 */
export async function createD1Document(tenantId: string, data: any): Promise<any> {
  const d1 = getD1Database();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  if (d1) {
    try {
      await d1
        .prepare('INSERT INTO documents (id, tenantId, title, originalFilename, mimeType, fileSize, status, metadata, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(
          id,
          tenantId,
          data.title || data.fileName || 'Untitled',
          data.originalFilename || data.fileName || null,
          data.mimeType || 'application/pdf',
          data.fileSize || 0,
          data.status || 'PARSED',
          data.metadata ? JSON.stringify(data.metadata) : null,
          now
        )
        .run();
    } catch (err) {
      console.error('[D1] Error saving document:', err);
    }
  }

  return {
    id,
    tenantId,
    title: data.title || data.fileName || 'Untitled',
    mimeType: data.mimeType || 'application/pdf',
    status: data.status || 'PARSED',
    createdAt: now,
  };
}
