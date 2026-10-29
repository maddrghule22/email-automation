-- Extensions for D1 Schema: Exceptions, Roles, and Hierarchy Access Specifiers

CREATE TABLE IF NOT EXISTS exceptions (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  caseNumber TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
  status TEXT DEFAULT 'OPEN', -- OPEN, IN_REVIEW, RESOLVED, ESCALATED, REJECTED
  financialImpact REAL DEFAULT 0, -- Dollar amount for hierarchy power checks
  requiredPowerLevel INTEGER DEFAULT 50, -- 25, 50, 75, 100
  assignedTo TEXT,
  dueAt DATETIME,
  resolvedAt DATETIME,
  resolvedBy TEXT,
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  powerLevel INTEGER NOT NULL,
  tier INTEGER NOT NULL,
  maxApprovalLimitUsd REAL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_specifiers (
  id TEXT PRIMARY KEY,
  specifierKey TEXT NOT NULL,
  requiredTier INTEGER NOT NULL,
  requiredPowerLevel INTEGER NOT NULL,
  description TEXT
);

-- Seed Roles into Unified D1 Database
INSERT OR IGNORE INTO roles (id, key, name, powerLevel, tier, maxApprovalLimitUsd, description)
VALUES 
  ('role-super-admin', 'SUPER_ADMIN', 'Super Admin / Managing Director', 100, 4, 999999999, 'Full executive authority over workflows, financial approvals, and user databricks.'),
  ('role-operations-manager', 'OPERATIONS_MANAGER', 'Operations Director / Manager', 75, 3, 25000, 'Workflow management and financial approval up to $25,000.'),
  ('role-automation-operator', 'AUTOMATION_OPERATOR', 'Automation Specialist / Operator', 50, 2, 5000, 'Day-to-day workflow execution and operational approvals up to $5,000.'),
  ('role-compliance-auditor', 'COMPLIANCE_AUDITOR', 'Compliance Auditor / Viewer', 25, 1, 0, 'Read-only compliance and transparency oversight across databricks.');

-- Seed Access Specifiers
INSERT OR IGNORE INTO access_specifiers (id, specifierKey, requiredTier, requiredPowerLevel, description)
VALUES
  ('spec-wf-create', 'WORKFLOW_CREATE', 3, 75, 'Creation of new automation workflows'),
  ('spec-wf-publish', 'WORKFLOW_PUBLISH', 3, 75, 'Publishing and deploying workflows into production'),
  ('spec-wf-execute', 'WORKFLOW_EXECUTE', 2, 50, 'Triggering workflow execution runs'),
  ('spec-wf-delete', 'WORKFLOW_DELETE', 4, 100, 'Permanent deletion of workflows'),
  ('spec-fin-low', 'FINANCIAL_APPROVAL_LOW', 2, 50, 'Approval of transactions up to $5,000'),
  ('spec-fin-mid', 'FINANCIAL_APPROVAL_MID', 3, 75, 'Approval of transactions between $5,001 and $25,000'),
  ('spec-fin-high', 'FINANCIAL_APPROVAL_HIGH', 4, 100, 'Approval of transactions over $25,000'),
  ('spec-int-manage', 'INTEGRATION_MANAGE', 3, 75, 'Connecting, updating, or disconnecting third-party connectors'),
  ('spec-plat-settings', 'PLATFORM_SETTINGS', 4, 100, 'Modifying organization tenant policies and global security');
