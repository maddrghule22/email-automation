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

-- Seed Default Admin User & Organization
-- Password is 'admin123' (bcrypt hash: $2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW)
-- Or 'Admin@123' (bcrypt hash: $2a$12$k2QcM2LwUf/qGfK5qWJcbe6I0BwJp8JzF4d7qgYxYm7kO6l4.J9q.)
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
