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
      roleId: 'role-super-admin',
      memberships: [
        {
          id: 'member-admin-yash',
          userId: 'user-admin-yash',
          tenantId: 'tenant-vorynex-prod',
          roleId: 'role-super-admin',
          status: 'Active',
        },
      ],
    },
  ],
  [
    'sarah.ops@vorynex.com',
    {
      id: 'user-ops-sarah',
      email: 'sarah.ops@vorynex.com',
      name: 'Sarah Jenkins',
      passwordHash: '$2b$10$L7TfSIfBYhAM1LO54iOtfOOHpur0ATPKh01DHJRUoSePG/BZgjvK.', // manager123 / admin123
      status: 'ACTIVE',
      roleId: 'role-operations-manager',
      memberships: [
        {
          id: 'member-ops-sarah',
          userId: 'user-ops-sarah',
          tenantId: 'tenant-ops-brick',
          roleId: 'role-operations-manager',
          status: 'Active',
        },
      ],
    },
  ],
  [
    'alex.dev@vorynex.com',
    {
      id: 'user-operator-alex',
      email: 'alex.dev@vorynex.com',
      name: 'Alex Chen',
      passwordHash: '$2b$10$L7TfSIfBYhAM1LO54iOtfOOHpur0ATPKh01DHJRUoSePG/BZgjvK.', // operator123 / admin123
      status: 'ACTIVE',
      roleId: 'role-automation-operator',
      memberships: [
        {
          id: 'member-operator-alex',
          userId: 'user-operator-alex',
          tenantId: 'tenant-dev-brick',
          roleId: 'role-automation-operator',
          status: 'Active',
        },
      ],
    },
  ],
  [
    'david.audit@vorynex.com',
    {
      id: 'user-auditor-david',
      email: 'david.audit@vorynex.com',
      name: 'David Vance',
      passwordHash: '$2b$10$L7TfSIfBYhAM1LO54iOtfOOHpur0ATPKh01DHJRUoSePG/BZgjvK.', // auditor123 / admin123
      status: 'ACTIVE',
      roleId: 'role-compliance-auditor',
      memberships: [
        {
          id: 'member-auditor-david',
          userId: 'user-auditor-david',
          tenantId: 'tenant-audit-brick',
          roleId: 'role-compliance-auditor',
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

      const roleKey = (user.roleId || membership.roleId || 'role-super-admin').toLowerCase();
      let roleName = 'Super Admin';
      let tier = 4;
      let powerLevel = 100;
      let maxApproval = Infinity;

      if (roleKey.includes('manager')) {
        roleName = 'Operations Manager';
        tier = 3;
        powerLevel = 75;
        maxApproval = 25000;
      } else if (roleKey.includes('operator')) {
        roleName = 'Automation Operator';
        tier = 2;
        powerLevel = 50;
        maxApproval = 5000;
      } else if (roleKey.includes('auditor')) {
        roleName = 'Compliance Auditor';
        tier = 1;
        powerLevel = 25;
        maxApproval = 0;
      }

      const activeRole = {
        id: user.roleId || membership.roleId || 'role-super-admin',
        name: roleName,
        tier,
        powerLevel,
        maxApprovalLimitUsd: maxApproval,
        isSystem: tier >= 3,
        permissions: [
          { id: 'perm-all-actions', roleId: user.roleId || 'role-super-admin', action: '*', resource: '*' }
        ]
      };

      return {
        user,
        tenant,
        membership,
        roles: [activeRole]
      };
    } catch (err) {
      console.error('[D1] Error fetching auth context:', err);
    }
  }

  // Memory fallback for local dev
  for (const [_, u] of devUsers.entries()) {
    if (u.id === userId) {
      const tenant = { id: tenantId || (u.memberships[0]?.tenantId || 'tenant-vorynex-prod'), name: 'Vorynex Enterprise', slug: 'vorynex-enterprise', status: 'Active' };
      const mem = u.memberships.find(m => !tenantId || m.tenantId === tenantId) || u.memberships[0];
      
      const roleKey = (u.roleId || mem?.roleId || 'role-super-admin').toLowerCase();
      let roleName = 'Super Admin';
      let tier = 4;
      let powerLevel = 100;
      let maxApproval = Infinity;

      if (roleKey.includes('manager')) {
        roleName = 'Operations Manager';
        tier = 3;
        powerLevel = 75;
        maxApproval = 25000;
      } else if (roleKey.includes('operator')) {
        roleName = 'Automation Operator';
        tier = 2;
        powerLevel = 50;
        maxApproval = 5000;
      } else if (roleKey.includes('auditor')) {
        roleName = 'Compliance Auditor';
        tier = 1;
        powerLevel = 25;
        maxApproval = 0;
      }

      return {
        user: { id: u.id, email: u.email, name: u.name, status: u.status, roleId: u.roleId },
        tenant,
        membership: mem || { id: 'mem-admin', userId: u.id, tenantId: tenant.id, roleId: u.roleId, status: 'Active' },
        roles: [
          {
            id: u.roleId || 'role-super-admin',
            name: roleName,
            tier,
            powerLevel,
            maxApprovalLimitUsd: maxApproval,
            isSystem: tier >= 3,
            permissions: [{ id: 'perm-all', roleId: u.roleId || 'role-super-admin', action: '*', resource: '*' }]
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

// ============================================================================
// Multi-Tenant Data Bricks, Exceptions & Metrics (Unified D1 Database)
// ============================================================================

export interface D1Exception {
  id: string;
  tenantId: string;
  caseNumber: string;
  title: string;
  description: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'ESCALATED' | 'REJECTED';
  financialImpact: number;
  requiredPowerLevel: number;
  assignedTo?: string;
  dueAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

const devExceptions: D1Exception[] = [
  {
    id: 'exc-vorynex-1092',
    tenantId: 'tenant-vorynex-prod',
    caseNumber: 'EXC-1092',
    title: 'Vendor Remittance Bank Detail Discrepancy',
    description: 'Beneficiary IBAN on invoice INV-2026-089 does not match master ERP vendor record. Anti-fraud hold applied.',
    category: 'FINANCE_FRAUD',
    priority: 'HIGH',
    status: 'OPEN',
    financialImpact: 14250.00,
    requiredPowerLevel: 75,
    assignedTo: 'Sarah Jenkins (Ops Manager)',
    dueAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exc-vorynex-1093',
    tenantId: 'tenant-vorynex-prod',
    caseNumber: 'EXC-1093',
    title: 'Multi-Year Enterprise Cloud Infrastructure Contract',
    description: 'Annual commitment exceeds standard operational threshold. Executive sign-off required before vendor execution.',
    category: 'CONTRACT_AUTHORIZATION',
    priority: 'CRITICAL',
    status: 'OPEN',
    financialImpact: 84000.00,
    requiredPowerLevel: 100,
    assignedTo: 'Yash Salunke (Super Admin)',
    dueAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exc-vorynex-1094',
    tenantId: 'tenant-vorynex-prod',
    caseNumber: 'EXC-1094',
    title: 'Missing VAT Exemption Certificate for Cross-Border Order',
    description: 'Invoice generated without active reverse-charge VAT certification on VIES database.',
    category: 'TAX_COMPLIANCE',
    priority: 'MEDIUM',
    status: 'OPEN',
    financialImpact: 3150.00,
    requiredPowerLevel: 50,
    assignedTo: 'Alex Chen (Operator)',
    dueAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exc-vorynex-1095',
    tenantId: 'tenant-vorynex-prod',
    caseNumber: 'EXC-1095',
    title: 'Duplicate PO Item Code Warning in Carrier Invoice',
    description: 'Line item #4 lists same bill of lading sequence as shipment delivered 3 days ago.',
    category: 'DUPLICATE_AUDIT',
    priority: 'LOW',
    status: 'OPEN',
    financialImpact: 950.00,
    requiredPowerLevel: 50,
    assignedTo: 'Alex Chen (Operator)',
    dueAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exc-nexus-201',
    tenantId: 'tenant-ops-brick',
    caseNumber: 'EXC-201',
    title: 'Port Demurrage Surcharge Exceeds Free Time Limit',
    description: 'Container storage at Singapore terminal billed at 140% of contracted benchmark tariff.',
    category: 'LOGISTICS_FEE',
    priority: 'HIGH',
    status: 'OPEN',
    financialImpact: 6800.00,
    requiredPowerLevel: 75,
    assignedTo: 'Sarah Jenkins',
    dueAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

/**
 * Lists exceptions for a tenant from Cloudflare D1.
 */
export async function getD1Exceptions(tenantId: string, status?: string): Promise<D1Exception[]> {
  const d1 = getD1Database();
  if (d1) {
    try {
      let query = 'SELECT * FROM exceptions WHERE tenantId = ?';
      const params: any[] = [tenantId];
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      query += ' ORDER BY CASE priority WHEN "CRITICAL" THEN 1 WHEN "HIGH" THEN 2 WHEN "MEDIUM" THEN 3 ELSE 4 END, dueAt ASC';

      const res = await d1.prepare(query).bind(...params).all();
      if (res?.results && res.results.length > 0) {
        return res.results as D1Exception[];
      }
    } catch (err) {
      console.warn('[D1] Error querying exceptions table:', err);
    }
  }

  return devExceptions.filter((e) => (e.tenantId === tenantId || tenantId === 'tenant-vorynex-prod') && (!status || e.status === status));
}

/**
 * Updates or resolves an exception case in Cloudflare D1.
 */
export async function updateD1Exception(
  id: string,
  data: { status: 'RESOLVED' | 'ESCALATED' | 'REJECTED' | 'OPEN'; resolvedBy?: string }
): Promise<D1Exception | null> {
  const d1 = getD1Database();
  const now = new Date().toISOString();

  if (d1) {
    try {
      await d1
        .prepare('UPDATE exceptions SET status = ?, resolvedBy = ?, resolvedAt = ?, updatedAt = ? WHERE id = ?')
        .bind(data.status, data.resolvedBy || 'Admin User', now, now, id)
        .run();

      const updated = await d1.prepare('SELECT * FROM exceptions WHERE id = ? LIMIT 1').bind(id).first();
      if (updated) return updated as D1Exception;
    } catch (err) {
      console.error('[D1] Error updating exception:', err);
    }
  }

  const found = devExceptions.find((e) => e.id === id);
  if (found) {
    found.status = data.status;
    found.resolvedBy = data.resolvedBy || 'Admin User';
    found.resolvedAt = now;
    return found;
  }
  return null;
}

/**
 * Retrieves all tenants (Data Bricks) across the unified database.
 */
export async function getD1AllTenants(): Promise<Array<{ id: string; name: string; slug: string; status: string }>> {
  const d1 = getD1Database();
  if (d1) {
    try {
      const res = await d1.prepare('SELECT id, name, slug, status FROM tenants ORDER BY createdAt ASC').all();
      if (res?.results && res.results.length > 0) {
        return res.results as any[];
      }
    } catch (err) {
      console.warn('[D1] Error fetching all tenants:', err);
    }
  }

  return [
    { id: 'tenant-vorynex-prod', name: 'Vorynex Global Enterprise', slug: 'vorynex-enterprise', status: 'Active' },
    { id: 'tenant-ops-brick', name: 'Nexus Operations & Supply Chain', slug: 'nexus-operations', status: 'Active' },
    { id: 'tenant-dev-brick', name: 'Apex Logistics Fleet & Fulfillment', slug: 'apex-logistics', status: 'Active' },
    { id: 'tenant-audit-brick', name: 'SecureTrust Regulatory & Compliance', slug: 'securetrust-audit', status: 'Active' },
  ];
}

/**
 * Automatically provisions a dedicated Data Brick in Cloudflare D1 for any newly registered user.
 */
export async function provisionUserDatabrick(params: {
  userId: string;
  email: string;
  name: string;
  organizationName: string;
  tenantId: string;
}): Promise<void> {
  const d1 = getD1Database();
  const now = new Date().toISOString();

  // Create industry-standard starter workflows
  const wfId1 = crypto.randomUUID();
  const wfId2 = crypto.randomUUID();
  const intId1 = crypto.randomUUID();
  const intId2 = crypto.randomUUID();
  const excId1 = crypto.randomUUID();

  if (d1) {
    try {
      await d1.batch([
        d1.prepare('INSERT INTO workflows (id, tenantId, name, description, status, version) VALUES (?, ?, ?, ?, ?, ?)').bind(
          wfId1,
          params.tenantId,
          `${params.organizationName} Inbound Email & Invoice Router`,
          'Automates classification of emails, extracts line items from PDF attachments, and creates draft records.',
          'Published',
          1
        ),
        d1.prepare('INSERT INTO workflows (id, tenantId, name, description, status, version) VALUES (?, ?, ?, ?, ?, ?)').bind(
          wfId2,
          params.tenantId,
          'Executive Customer SLA Escalation',
          'Monitors urgent customer communications and alerts key personnel before SLA breaches.',
          'Published',
          1
        ),
        d1.prepare('INSERT INTO integrations (id, tenantId, provider, name, type, status, enabled, config) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(
          intId1,
          params.tenantId,
          'gmail',
          `${params.name}'s Google Workspace Mailbox`,
          'EMAIL',
          'CONNECTED',
          1,
          JSON.stringify({ email: params.email, latencyMs: 29 })
        ),
        d1.prepare('INSERT INTO integrations (id, tenantId, provider, name, type, status, enabled, config) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(
          intId2,
          params.tenantId,
          'rest-connector',
          'ERP System Webhook Gateway',
          'ERP',
          'CONNECTED',
          1,
          JSON.stringify({ mode: 'active', latencyMs: 45 })
        ),
        d1.prepare('INSERT INTO exceptions (id, tenantId, caseNumber, title, description, category, priority, status, financialImpact, requiredPowerLevel, assignedTo, dueAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(
          excId1,
          params.tenantId,
          'EXC-101',
          'Initial Onboarding Invoice Verification',
          'Automated validation check for first vendor transaction setup. Ready for role-authorized approval.',
          'FINANCE_VERIFICATION',
          'MEDIUM',
          'OPEN',
          2450.00,
          50,
          params.name,
          new Date(Date.now() + 8 * 3600 * 1000).toISOString()
        )
      ]);
    } catch (err) {
      console.error('[D1] Error provisioning user databrick in D1:', err);
    }
  }

  // Also add to in-memory fallback
  devWorkflows.push({
    id: wfId1,
    tenantId: params.tenantId,
    name: `${params.organizationName} Inbound Email & Invoice Router`,
    description: 'Automates classification of emails and extracts invoice lines.',
    status: 'Published',
    version: 1,
    createdAt: now,
    updatedAt: now,
  });

  devIntegrations.push({
    id: intId1,
    tenantId: params.tenantId,
    provider: 'gmail',
    name: `${params.name}'s Google Workspace Mailbox`,
    type: 'EMAIL',
    status: 'CONNECTED',
    enabled: 1,
    createdAt: now,
  });

  devExceptions.push({
    id: excId1,
    tenantId: params.tenantId,
    caseNumber: 'EXC-101',
    title: 'Initial Onboarding Invoice Verification',
    description: 'Automated validation check for first vendor transaction.',
    category: 'FINANCE_VERIFICATION',
    priority: 'MEDIUM',
    status: 'OPEN',
    financialImpact: 2450.00,
    requiredPowerLevel: 50,
    assignedTo: params.name,
    dueAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    createdAt: now,
  });
}

