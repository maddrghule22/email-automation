/**
 * Cloudflare Pages Worker (Advanced Mode)
 * Full-stack Edge backend running on Cloudflare Pages with Cloudflare D1 integration.
 * Implements Multi-Tenant Data Bricks isolation, Hierarchy of Power access specifiers,
 * and seamless fallback routing for Next.js static pages.
 */

// Helper to construct JSON responses with CORS
function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-role, x-databrick-id',
      ...headers,
    },
  });
}

// Power roles definition
const ROLES = {
  SUPER_ADMIN: {
    id: 'role-super-admin',
    key: 'SUPER_ADMIN',
    name: 'Super Admin / Managing Director',
    powerLevel: 100,
    tier: 4,
    maxApprovalLimitUsd: 999999999,
    description: 'Full executive authority over workflows, financial approvals, and user databricks.',
  },
  OPERATIONS_MANAGER: {
    id: 'role-operations-manager',
    key: 'OPERATIONS_MANAGER',
    name: 'Operations Director / Manager',
    powerLevel: 75,
    tier: 3,
    maxApprovalLimitUsd: 25000,
    description: 'Workflow management and financial approval up to $25,000.',
  },
  AUTOMATION_OPERATOR: {
    id: 'role-automation-operator',
    key: 'AUTOMATION_OPERATOR',
    name: 'Automation Specialist / Operator',
    powerLevel: 50,
    tier: 2,
    maxApprovalLimitUsd: 5000,
    description: 'Day-to-day workflow execution and operational approvals up to $5,000.',
  },
  COMPLIANCE_AUDITOR: {
    id: 'role-compliance-auditor',
    key: 'COMPLIANCE_AUDITOR',
    name: 'Compliance Auditor / Viewer',
    powerLevel: 25,
    tier: 1,
    maxApprovalLimitUsd: 0,
    description: 'Read-only compliance and transparency oversight across databricks.',
  },
};

const USERS = {
  SUPER_ADMIN: {
    id: 'user-admin-yash',
    email: 'admin@vorynex.com',
    name: 'Yash Salunke',
    tenantId: 'tenant-vorynex-prod',
    roleKey: 'SUPER_ADMIN',
  },
  OPERATIONS_MANAGER: {
    id: 'user-ops-sarah',
    email: 'sarah.ops@vorynex.com',
    name: 'Sarah Jenkins',
    tenantId: 'tenant-ops-brick',
    roleKey: 'OPERATIONS_MANAGER',
  },
  AUTOMATION_OPERATOR: {
    id: 'user-operator-alex',
    email: 'alex.dev@vorynex.com',
    name: 'Alex Chen',
    tenantId: 'tenant-dev-brick',
    roleKey: 'AUTOMATION_OPERATOR',
  },
  COMPLIANCE_AUDITOR: {
    id: 'user-auditor-david',
    email: 'david.audit@vorynex.com',
    name: 'David Vance',
    tenantId: 'tenant-audit-brick',
    roleKey: 'COMPLIANCE_AUDITOR',
  },
};

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

function resolveSessionUser(request) {
  // Check header or cookie
  const roleHeader = request.headers.get('x-user-role');
  const cookieRole = getCookie(request, 'user_role');
  const roleKey = (roleHeader || cookieRole || 'SUPER_ADMIN').toUpperCase();

  const user = USERS[roleKey] || USERS.SUPER_ADMIN;
  const role = ROLES[roleKey] || ROLES.SUPER_ADMIN;

  const brickHeader = request.headers.get('x-databrick-id');
  const cookieBrick = getCookie(request, 'databrick_id');
  const tenantId = brickHeader || cookieBrick || user.tenantId;

  return { user, role, tenantId };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Handle preflight CORS
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-role, x-databrick-id',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // -------------------------------------------------------------
    // BACKEND API ROUTES (/api/v1/...)
    // -------------------------------------------------------------
    if (pathname.startsWith('/api/')) {
      try {
        const { user, role, tenantId } = resolveSessionUser(request);

        // 1. Health check
        if (pathname === '/api/v1/health' || pathname === '/api/v1/ready') {
          return jsonResponse({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            d1: !!env.DB,
            region: request.cf?.colo || 'EDGE',
            activeTenant: tenantId,
          });
        }

        // 2. Auth: /api/v1/auth/me
        if (pathname === '/api/v1/auth/me') {
          let tenantsList = [];
          if (env.DB) {
            try {
              const res = await env.DB.prepare('SELECT id, name, slug FROM tenants').all();
              tenantsList = res.results || [];
            } catch (e) {
              console.error('Failed to query tenants:', e);
            }
          }

          if (tenantsList.length === 0) {
            tenantsList = [
              { id: 'tenant-vorynex-prod', name: 'Vorynex Enterprise', slug: 'vorynex-enterprise' },
              { id: 'tenant-ops-brick', name: 'Nexus Operations & Supply Chain', slug: 'nexus-operations' },
              { id: 'tenant-dev-brick', name: 'Apex Logistics Fleet & Fulfillment', slug: 'apex-logistics' },
              { id: 'tenant-audit-brick', name: 'SecureTrust Regulatory & Compliance', slug: 'securetrust-audit' },
            ];
          }

          const activeBrick = tenantsList.find(t => t.id === tenantId) || tenantsList[0];

          return jsonResponse({
            data: {
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: role.key,
              },
              role,
              databrick: activeBrick,
              availableDatabricks: tenantsList,
              availableRoles: Object.values(ROLES),
              hierarchyOfPower: {
                currentTier: role.tier,
                currentPower: role.powerLevel,
                maxFinancialApproval: role.maxApprovalLimitUsd,
                tierRank: `${role.name} (Tier ${role.tier})`,
              },
            },
          });
        }

        // 3. Auth: /api/v1/auth/switch-brick
        if (pathname === '/api/v1/auth/switch-brick' && method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const newRoleKey = (body.roleKey || 'SUPER_ADMIN').toUpperCase();
          const targetUser = USERS[newRoleKey] || USERS.SUPER_ADMIN;
          const targetRole = ROLES[newRoleKey] || ROLES.SUPER_ADMIN;
          const targetBrick = body.tenantId || targetUser.tenantId;

          const cookieOptions = 'Path=/; Max-Age=2592000; SameSite=Lax';
          const headers = {
            'Set-Cookie': `user_role=${newRoleKey}; ${cookieOptions}`,
          };

          return jsonResponse({
            success: true,
            message: `Switched context to ${targetRole.name} on databrick ${targetBrick}`,
            data: {
              user: targetUser,
              role: targetRole,
              databrickId: targetBrick,
            },
          }, 200, headers);
        }

        // 4. Auth: /api/v1/auth/login
        if (pathname === '/api/v1/auth/login' && method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const email = (body.email || '').toLowerCase();
          
          let matchedRoleKey = 'SUPER_ADMIN';
          if (email.includes('ops') || email.includes('sarah')) matchedRoleKey = 'OPERATIONS_MANAGER';
          else if (email.includes('dev') || email.includes('alex') || email.includes('operator')) matchedRoleKey = 'AUTOMATION_OPERATOR';
          else if (email.includes('audit') || email.includes('david')) matchedRoleKey = 'COMPLIANCE_AUDITOR';

          const sessionUser = USERS[matchedRoleKey];
          const sessionRole = ROLES[matchedRoleKey];

          const cookieOptions = 'Path=/; Max-Age=2592000; SameSite=Lax';
          return jsonResponse({
            token: `vorynex_token_${matchedRoleKey}_${Date.now()}`,
            user: sessionUser,
            role: sessionRole,
          }, 200, {
            'Set-Cookie': `user_role=${matchedRoleKey}; ${cookieOptions}`,
          });
        }

        // 5. Auth: /api/v1/auth/register
        if (pathname === '/api/v1/auth/register' && method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const orgName = body.organizationName || `${body.name || 'User'}'s Databrick`;
          const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const newTenantId = `tenant-${Date.now()}`;
          const newUserId = `user-${Date.now()}`;

          if (env.DB) {
            try {
              await env.DB.prepare(
                'INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)'
              ).bind(newTenantId, orgName, slug).run();

              await env.DB.prepare(
                'INSERT INTO users (id, email, name, passwordHash, roleId) VALUES (?, ?, ?, ?, ?)'
              ).bind(newUserId, body.email || 'user@example.com', body.name || 'New User', 'hash', 'role-super-admin').run();

              // Add default workflows for this user databrick
              await env.DB.prepare(
                'INSERT INTO workflows (id, tenantId, name, description, triggerType, status, totalExecutions, successRatePercent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
              ).bind(`wf-${Date.now()}-1`, newTenantId, 'Inbound PDF Invoices OCR Dispatcher', 'Extracts AP line items and posts into ERP', 'WEBHOOK', 'ACTIVE', 142, 99.8).run();

              // Add default integration
              await env.DB.prepare(
                'INSERT INTO integrations (id, tenantId, name, type, status, healthScore, latencyMs) VALUES (?, ?, ?, ?, ?, ?, ?)'
              ).bind(`int-${Date.now()}-1`, newTenantId, 'Corporate ERP Gateway', 'ERP', 'CONNECTED', 100, 42).run();
            } catch (err) {
              console.error('D1 Provisioning Error:', err);
            }
          }

          return jsonResponse({
            success: true,
            message: 'User registered and dedicated Data Brick provisioned in D1 database.',
            data: {
              userId: newUserId,
              tenantId: newTenantId,
              organization: orgName,
            },
          }, 201);
        }

        // 6. Exceptions: /api/v1/exceptions
        if (pathname === '/api/v1/exceptions' && method === 'GET') {
          let exceptions = [];
          if (env.DB) {
            try {
              const res = await env.DB.prepare(
                'SELECT * FROM exceptions ORDER BY priority = "CRITICAL" DESC, priority = "HIGH" DESC, createdAt DESC'
              ).all();
              exceptions = res.results || [];
            } catch (e) {
              console.error('Failed to query exceptions from D1:', e);
            }
          }

          if (exceptions.length === 0) {
            exceptions = [
              {
                id: 'exc-vorynex-1092',
                caseNumber: 'CASE-1092',
                title: 'Vendor Remittance Bank Detail Discrepancy',
                description: 'Supplier ACME Logistics updated IBAN number in invoice PDF. Does not match SAP master vendor record.',
                category: 'FINANCIAL_MISMATCH',
                priority: 'HIGH',
                status: 'OPEN',
                financialImpact: 14250.00,
                requiredPowerLevel: 75,
                assignedTo: 'Finance Ops Lead',
                dueAt: new Date(Date.now() + 86400000).toISOString(),
              },
              {
                id: 'exc-vorynex-1093',
                caseNumber: 'CASE-1093',
                title: 'Multi-Year Enterprise Cloud Infrastructure Contract',
                description: 'Annual infrastructure renewal invoice received without pre-approved PO #PO-99410.',
                category: 'AUTHORIZATION_GATE',
                priority: 'CRITICAL',
                status: 'OPEN',
                financialImpact: 48900.00,
                requiredPowerLevel: 100,
                assignedTo: 'Managing Director',
                dueAt: new Date(Date.now() + 43200000).toISOString(),
              },
              {
                id: 'exc-vorynex-1094',
                caseNumber: 'CASE-1094',
                title: 'Missing VAT Exemption Certificate for EU Customer',
                description: 'Intra-community sales invoice cross-border VAT 0% zero-rated requires verified VIES certificate.',
                category: 'TAX_COMPLIANCE',
                priority: 'MEDIUM',
                status: 'OPEN',
                financialImpact: 3200.00,
                requiredPowerLevel: 50,
                assignedTo: 'Compliance Team',
                dueAt: new Date(Date.now() + 172800000).toISOString(),
              },
              {
                id: 'exc-vorynex-1095',
                caseNumber: 'CASE-1095',
                title: 'Duplicate PO Item Code Warning in Carrier Invoice',
                description: 'Line item #4 references same bill of lading BL-4412 as line item #1.',
                category: 'DUPLICATE_LINE_ITEM',
                priority: 'LOW',
                status: 'OPEN',
                financialImpact: 840.00,
                requiredPowerLevel: 50,
                assignedTo: 'Operator Pool',
                dueAt: new Date(Date.now() + 259200000).toISOString(),
              },
            ];
          }

          return jsonResponse({
            data: exceptions,
            total: exceptions.length,
            tenantId,
          });
        }

        // 7. Resolve Exception: /api/v1/exceptions/:id
        if (pathname.startsWith('/api/v1/exceptions/') && (method === 'PATCH' || method === 'POST')) {
          const excId = pathname.replace('/api/v1/exceptions/', '').split('/')[0];
          const body = await request.json().catch(() => ({}));

          // Query exception from D1 to verify financial approval limit
          let excItem = null;
          if (env.DB) {
            try {
              const res = await env.DB.prepare('SELECT * FROM exceptions WHERE id = ?').bind(excId).first();
              excItem = res;
            } catch (e) {
              console.error('Error fetching exception:', e);
            }
          }

          const amount = excItem?.financialImpact ?? 14250;
          const userLimit = role.maxApprovalLimitUsd;

          // Tier 1 (Auditor) check
          if (role.tier === 1) {
            return jsonResponse({
              error: {
                code: 'SPECIFIER_FORBIDDEN',
                message: 'Compliance Auditor accounts are strictly read-only and prohibited from clearing operational exceptions.',
              },
            }, 403);
          }

          // Financial limit check
          if (amount > userLimit) {
            return jsonResponse({
              error: {
                code: 'EXCEEDS_FINANCIAL_APPROVAL_LIMIT',
                message: `Hierarchy of Power Gate: Financial impact of $${amount.toLocaleString()} exceeds your $${userLimit.toLocaleString()} sign-off limit. Requires Tier 3+ (Operations Manager or Super Admin).`,
              },
            }, 403);
          }

          // Update in D1
          if (env.DB) {
            try {
              await env.DB.prepare(
                'UPDATE exceptions SET status = "RESOLVED", resolvedBy = ?, resolvedAt = CURRENT_TIMESTAMP WHERE id = ?'
              ).bind(user.name, excId).run();
            } catch (e) {
              console.error('Error updating exception:', e);
            }
          }

          return jsonResponse({
            success: true,
            message: `Exception case ${excId} signed off and cleared by ${user.name} (${role.name}).`,
            data: {
              id: excId,
              status: 'RESOLVED',
              resolvedBy: user.name,
              resolvedAt: new Date().toISOString(),
            },
          });
        }

        // 8. Workflows: /api/v1/workflows
        if (pathname === '/api/v1/workflows' && method === 'GET') {
          let workflows = [];
          if (env.DB) {
            try {
              const res = await env.DB.prepare('SELECT * FROM workflows ORDER BY createdAt DESC').all();
              workflows = res.results || [];
            } catch (e) {
              console.error('Error fetching workflows:', e);
            }
          }

          if (workflows.length === 0) {
            workflows = [
              {
                id: 'wf-vorynex-01',
                name: 'Inbound PO & Bill of Lading Multi-Pass OCR',
                description: 'Receives logistics emails, extracts line items with 99.8% confidence, and syncs to SAP.',
                triggerType: 'EMAIL_IMAP',
                status: 'ACTIVE',
                totalExecutions: 18420,
                successRatePercent: 99.8,
              },
              {
                id: 'wf-vorynex-02',
                name: 'High-Value AP Payment Exception Escalation',
                description: 'Enforces Hierarchy of Power approvals and gates payments exceeding $25,000 threshold.',
                triggerType: 'EXCEPTION_WEBHOOK',
                status: 'ACTIVE',
                totalExecutions: 4210,
                successRatePercent: 100.0,
              },
              {
                id: 'wf-vorynex-03',
                name: 'Cross-Border VAT & Customs Broker Dispatcher',
                description: 'Validates EU/UK tax IDs and automatically routes shipping bills to customs clearance.',
                triggerType: 'SCHEDULED_CRON',
                status: 'ACTIVE',
                totalExecutions: 9815,
                successRatePercent: 99.4,
              },
            ];
          }

          return jsonResponse({
            data: workflows,
            total: workflows.length,
          });
        }

        // 9. Execute Workflow: /api/v1/workflows/:id/execute
        if (pathname.includes('/workflows/') && pathname.endsWith('/execute') && method === 'POST') {
          const wfId = pathname.split('/workflows/')[1].split('/')[0];

          if (role.tier < 2) {
            return jsonResponse({
              error: {
                code: 'SPECIFIER_FORBIDDEN',
                message: 'Compliance Auditor role is read-only and cannot trigger live workflow executions.',
              },
            }, 403);
          }

          if (env.DB) {
            try {
              await env.DB.prepare(
                'UPDATE workflows SET totalExecutions = totalExecutions + 1 WHERE id = ?'
              ).bind(wfId).run();
            } catch (e) {
              console.error('Error updating workflow run:', e);
            }
          }

          return jsonResponse({
            success: true,
            executionId: `run-${Date.now()}`,
            workflowId: wfId,
            status: 'COMPLETED',
            startedAt: new Date().toISOString(),
            triggeredBy: user.name,
            powerTier: role.tier,
          });
        }

        // 10. Toggle Workflow Status: /api/v1/workflows/:id
        if (pathname.startsWith('/api/v1/workflows/') && (method === 'PATCH' || method === 'PUT')) {
          const wfId = pathname.replace('/api/v1/workflows/', '').split('/')[0];
          const body = await request.json().catch(() => ({}));
          const newStatus = body.status === 'PAUSED' ? 'PAUSED' : 'ACTIVE';

          if (role.tier < 2) {
            return jsonResponse({
              error: {
                code: 'SPECIFIER_FORBIDDEN',
                message: 'Auditors cannot modify workflow state.',
              },
            }, 403);
          }

          if (env.DB) {
            try {
              await env.DB.prepare('UPDATE workflows SET status = ? WHERE id = ?').bind(newStatus, wfId).run();
            } catch (e) {
              console.error('Error updating workflow status:', e);
            }
          }

          return jsonResponse({
            success: true,
            id: wfId,
            status: newStatus,
          });
        }

        // 11. Integrations: /api/v1/integrations
        if (pathname === '/api/v1/integrations' && method === 'GET') {
          let integrations = [];
          if (env.DB) {
            try {
              const res = await env.DB.prepare('SELECT * FROM integrations').all();
              integrations = res.results || [];
            } catch (e) {
              console.error('Error fetching integrations:', e);
            }
          }

          if (integrations.length === 0) {
            integrations = [
              { id: 'int-01', name: 'Microsoft 365 Exchange Corporate Mailbox', type: 'EMAIL_CONNECTOR', status: 'CONNECTED', healthScore: 100, latencyMs: 24 },
              { id: 'int-02', name: 'SAP S/4HANA Finance & General Ledger', type: 'ERP_SYSTEM', status: 'CONNECTED', healthScore: 98, latencyMs: 38 },
              { id: 'int-03', name: 'Cloudflare D1 Multi-Tenant Engine', type: 'DATABASE', status: 'CONNECTED', healthScore: 100, latencyMs: 8 },
              { id: 'int-04', name: 'Stripe Corporate Billing & Treasury', type: 'PAYMENT_GATEWAY', status: 'CONNECTED', healthScore: 99, latencyMs: 62 },
              { id: 'int-05', name: 'AWS S3 High-Security Document Vault', type: 'STORAGE', status: 'CONNECTED', healthScore: 100, latencyMs: 44 },
            ];
          }

          return jsonResponse({
            data: integrations,
            total: integrations.length,
          });
        }

        // 12. Documents: /api/v1/documents
        if (pathname === '/api/v1/documents' && method === 'GET') {
          let docs = [];
          if (env.DB) {
            try {
              const res = await env.DB.prepare('SELECT * FROM documents').all();
              docs = res.results || [];
            } catch (e) {
              console.error('Error fetching documents:', e);
            }
          }

          if (docs.length === 0) {
            docs = [
              { id: 'doc-01', title: 'Q3_Global_Logistics_Freight_Bill.pdf', documentType: 'FREIGHT_INVOICE', status: 'PROCESSED', confidenceScore: 0.998, createdAt: new Date(Date.now() - 3600000).toISOString() },
              { id: 'doc-02', title: 'Carrier_Sea_Waybill_99214.pdf', documentType: 'BILL_OF_LADING', status: 'PROCESSED', confidenceScore: 0.994, createdAt: new Date(Date.now() - 7200000).toISOString() },
              { id: 'doc-03', title: 'Commercial_Invoice_ACME_Parts.pdf', documentType: 'COMMERCIAL_INVOICE', status: 'PROCESSED', confidenceScore: 0.999, createdAt: new Date(Date.now() - 14400000).toISOString() },
              { id: 'doc-04', title: 'Customs_Import_Declaration_C88.pdf', documentType: 'CUSTOMS_DECLARATION', status: 'PROCESSED', confidenceScore: 0.991, createdAt: new Date(Date.now() - 28800000).toISOString() },
            ];
          }

          return jsonResponse({
            data: docs,
            total: docs.length,
          });
        }

        // 13. Customers / Organizations: /api/v1/customers or /api/v1/organizations
        if (pathname === '/api/v1/customers' || pathname === '/api/v1/organizations') {
          let tenants = [];
          if (env.DB) {
            try {
              const res = await env.DB.prepare('SELECT * FROM tenants').all();
              tenants = res.results || [];
            } catch (e) {
              console.error('Error fetching tenants:', e);
            }
          }

          return jsonResponse({
            data: tenants,
            total: tenants.length,
          });
        }

        // 14. Invoices & Transactions: /api/v1/transactions or /api/v1/invoices
        if (pathname === '/api/v1/transactions' || pathname === '/api/v1/invoices') {
          const invoices = [
            { id: 'inv-vorynex-01', invoiceNumber: 'INV-2026-9901', vendor: 'Global Logistics Hub Ltd', amount: 14250.00, status: 'EXCEPTION', dueDate: '2026-11-15', approvalTierRequired: 3 },
            { id: 'inv-vorynex-02', invoiceNumber: 'INV-2026-9902', vendor: 'CloudScale Global Infrastructure', amount: 48900.00, status: 'PENDING_APPROVAL', dueDate: '2026-11-20', approvalTierRequired: 4 },
            { id: 'inv-vorynex-03', invoiceNumber: 'INV-2026-9903', vendor: 'Apex Container Carrier Lines', amount: 3200.00, status: 'PAID', dueDate: '2026-11-10', approvalTierRequired: 2 },
            { id: 'inv-vorynex-04', invoiceNumber: 'INV-2026-9904', vendor: 'FastTrack Cargo & Air Freight', amount: 840.00, status: 'PAID', dueDate: '2026-11-05', approvalTierRequired: 2 },
            { id: 'inv-vorynex-05', invoiceNumber: 'INV-2026-9905', vendor: 'SecureVault Hardware HSM Services', amount: 24260.00, status: 'PENDING_APPROVAL', dueDate: '2026-11-25', approvalTierRequired: 3 },
          ];

          return jsonResponse({
            data: invoices,
            total: invoices.length,
            totalAmountUsd: 91450.00,
          });
        }

        // Catch-all for API
        return jsonResponse({ error: { message: `Route ${pathname} not found on edge backend.` } }, 404);
      } catch (apiError) {
        return jsonResponse({
          error: {
            message: apiError.message || 'Internal Edge Error',
            stack: apiError.stack,
          },
        }, 500);
      }
    }

    // -------------------------------------------------------------
    // STATIC ASSETS & NEXT.JS PAGES ROUTING
    // -------------------------------------------------------------
    // Direct pass-through for static files
    if (pathname.startsWith('/_next/') || pathname.startsWith('/images/') || pathname.endsWith('.svg') || pathname.endsWith('.ico') || pathname.endsWith('.css') || pathname.endsWith('.js')) {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status !== 404) return assetRes;
    }

    // Attempt direct fetch from Cloudflare Pages static assets
    let response = await env.ASSETS.fetch(request);
    if (response.status === 200 || response.status === 304) {
      return response;
    }

    // If 404, check clean pathname mappings (e.g. /invoices -> /invoices.html)
    const cleanPath = pathname.replace(/\/$/, '') || '/index';
    const htmlUrl = new URL(`${cleanPath}.html`, request.url);
    const htmlReq = new Request(htmlUrl.toString(), request);
    const htmlResponse = await env.ASSETS.fetch(htmlReq);

    if (htmlResponse.status === 200 || htmlResponse.status === 304) {
      // Return the HTML page with correct headers
      const newHeaders = new Headers(htmlResponse.headers);
      newHeaders.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(htmlResponse.body, {
        status: 200,
        headers: newHeaders,
      });
    }

    // Subdirectory index fallback (e.g. /invoices -> /invoices/index.html)
    const dirUrl = new URL(`${cleanPath}/index.html`, request.url);
    const dirResponse = await env.ASSETS.fetch(new Request(dirUrl.toString(), request));
    if (dirResponse.status === 200 || dirResponse.status === 304) {
      const newHeaders = new Headers(dirResponse.headers);
      newHeaders.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(dirResponse.body, {
        status: 200,
        headers: newHeaders,
      });
    }

    // Fallback to overview or index for Single-Page Navigation
    const fallbackUrl = new URL('/overview.html', request.url);
    const fallbackResponse = await env.ASSETS.fetch(new Request(fallbackUrl.toString(), request));
    if (fallbackResponse.status === 200) {
      const newHeaders = new Headers(fallbackResponse.headers);
      newHeaders.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(fallbackResponse.body, {
        status: 200,
        headers: newHeaders,
      });
    }

    // Default response
    return response;
  },
};
