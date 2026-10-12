-- D1 Database Schema for Cloudflare Pages Authentication & Tenancy

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  passwordHash TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  roleId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  tenantId TEXT NOT NULL,
  roleId TEXT,
  status TEXT DEFAULT 'Active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt DATETIME NOT NULL,
  revokedAt DATETIME,
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actorType TEXT NOT NULL,
  actorId TEXT NOT NULL,
  action TEXT NOT NULL,
  resourceType TEXT NOT NULL,
  resourceId TEXT NOT NULL,
  tenantId TEXT,
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Draft',
  version INTEGER DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_versions (
  id TEXT PRIMARY KEY,
  workflowId TEXT NOT NULL,
  version INTEGER NOT NULL,
  definition TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflowId) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY,
  workflowVersionId TEXT NOT NULL,
  tenantId TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  startedAt DATETIME,
  completedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'CONNECTED',
  enabled INTEGER DEFAULT 1,
  config TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  title TEXT NOT NULL,
  originalFilename TEXT,
  mimeType TEXT,
  fileSize INTEGER,
  status TEXT DEFAULT 'PARSED',
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Seed Default Admin User & Organization
INSERT OR IGNORE INTO tenants (id, name, slug, status)
VALUES ('tenant-vorynex-prod', 'Vorynex Enterprise', 'vorynex-enterprise', 'Active');

INSERT OR IGNORE INTO users (id, email, name, passwordHash, status)
VALUES (
  'user-admin-yash',
  'admin@vorynex.com',
  'Yash Salunke',
  '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW',
  'ACTIVE'
);

INSERT OR IGNORE INTO memberships (id, userId, tenantId, roleId, status)
VALUES (
  'member-admin-yash',
  'user-admin-yash',
  'tenant-vorynex-prod',
  'role-admin',
  'Active'
);

-- Seed Automation Workflows
INSERT OR IGNORE INTO workflows (id, tenantId, name, description, status, version)
VALUES (
  'wf-invoice-processor',
  'tenant-vorynex-prod',
  'Automated Invoice Ingestion & Parsing',
  'Extracts line items, vendor tax IDs, and totals from incoming AP emails and creates ERP draft invoices.',
  'Published',
  1
);

INSERT OR IGNORE INTO workflow_versions (id, workflowId, version, definition)
VALUES (
  'wfv-invoice-processor-v1',
  'wf-invoice-processor',
  1,
  '{"trigger":"email_received","actions":["ocr_extract","validate_schema","erp_sync"]}'
);

INSERT OR IGNORE INTO workflows (id, tenantId, name, description, status, version)
VALUES (
  'wf-customer-router',
  'tenant-vorynex-prod',
  'Customer Support Email Router & Auto-Reply',
  'Classifies urgent customer tickets, generates AI responses, and alerts on-call team for high-priority SLAs.',
  'Published',
  1
);

INSERT OR IGNORE INTO workflow_versions (id, workflowId, version, definition)
VALUES (
  'wfv-customer-router-v1',
  'wf-customer-router',
  1,
  '{"trigger":"email_received","actions":["sentiment_analysis","ai_draft_response","notify_slack"]}'
);

-- Seed Default Integrations
INSERT OR IGNORE INTO integrations (id, tenantId, provider, name, type, status, enabled)
VALUES (
  'int-exchange-365',
  'tenant-vorynex-prod',
  'office365',
  'Microsoft 365 Exchange',
  'EMAIL',
  'CONNECTED',
  1
);

INSERT OR IGNORE INTO integrations (id, tenantId, provider, name, type, status, enabled)
VALUES (
  'int-gmail-workspace',
  'tenant-vorynex-prod',
  'gmail',
  'Google Workspace Gmail',
  'EMAIL',
  'CONNECTED',
  1
);

INSERT OR IGNORE INTO integrations (id, tenantId, provider, name, type, status, enabled)
VALUES (
  'int-webhook-erp',
  'tenant-vorynex-prod',
  'webhook',
  'SAP S/4HANA ERP Webhook',
  'ERP',
  'CONNECTED',
  1
);
