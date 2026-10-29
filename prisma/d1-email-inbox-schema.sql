-- D1 Email Management & Automation Schema

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL DEFAULT 'tenant-vorynex-prod',
  senderName TEXT NOT NULL,
  senderEmail TEXT NOT NULL,
  recipientEmail TEXT NOT NULL DEFAULT 'yash@vorynex.com',
  ccEmails TEXT,
  bccEmails TEXT,
  subject TEXT NOT NULL,
  snippet TEXT NOT NULL,
  body TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'inbox', -- inbox, starred, snoozed, sent, draft, spam, trash
  isRead INTEGER NOT NULL DEFAULT 0,
  isStarred INTEGER NOT NULL DEFAULT 0,
  isImportant INTEGER NOT NULL DEFAULT 0,
  labels TEXT DEFAULT '[]', -- JSON string of labels
  snoozedUntil DATETIME,
  threadId TEXT,
  avatarUrl TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emails_tenant_folder ON emails(tenantId, folder);
CREATE INDEX IF NOT EXISTS idx_emails_read ON emails(isRead);
CREATE INDEX IF NOT EXISTS idx_emails_starred ON emails(isStarred);

CREATE TABLE IF NOT EXISTS email_rules (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL DEFAULT 'tenant-vorynex-prod',
  name TEXT NOT NULL,
  description TEXT,
  triggerType TEXT NOT NULL DEFAULT 'ON_RECEIVE', -- ON_RECEIVE, SENDER_MATCH, SUBJECT_MATCH, KEYWORD_MATCH, LABEL_ATTACHED
  conditionLogic TEXT NOT NULL DEFAULT 'AND', -- AND / OR
  conditions TEXT NOT NULL, -- JSON array of conditions
  actions TEXT NOT NULL, -- JSON array of actions
  isEnabled INTEGER NOT NULL DEFAULT 1,
  executionCount INTEGER NOT NULL DEFAULT 0,
  requireApprovalBeforeSend INTEGER NOT NULL DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_rule_executions (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL DEFAULT 'tenant-vorynex-prod',
  ruleId TEXT NOT NULL,
  ruleName TEXT NOT NULL,
  emailId TEXT,
  emailSubject TEXT,
  actionsExecuted TEXT,
  status TEXT NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, REQUIRES_APPROVAL, SKIPPED, ERROR
  details TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed realistic production emails
INSERT OR REPLACE INTO emails (id, tenantId, senderName, senderEmail, recipientEmail, subject, snippet, body, folder, isRead, isStarred, isImportant, labels, avatarUrl, createdAt) VALUES
(
  'em-prod-01',
  'tenant-vorynex-prod',
  'Emily Robertson',
  'emily.robertson@mailhive.com',
  'yash@vorynex.com',
  'Urgent Update on Q1 Enterprise Architecture Timeline',
  'Hi Yash, I wanted to inform you all about some adjustments to the project timeline. We have finalized the edge worker specifications...',
  'Hi Yash,

I wanted to inform you all about some adjustments to the project timeline. We have finalized the edge worker specifications and Cloudflare D1 multi-tenant data brick bindings.

Key deliverables for this sprint:
1. Zero-latency edge session authorization with role specifiers.
2. Direct synchronization between invoice OCR attachments and SAP S/4HANA.
3. Automated dead-letter queue escalation for payment mismatches > $25,000.

I will update the live deployment dashboard before 17:00 EST. Please let me know if any compliance considerations need review before rollout.

Best regards,
Emily Robertson
Principal Systems Architect | MailHive Core Platform',
  'inbox',
  0,
  1,
  1,
  '["Architecture", "Urgent", "Q1"]',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-2 hours')
),
(
  'em-prod-02',
  'tenant-vorynex-prod',
  'John Anderson',
  'j.anderson@acmesolutions.io',
  'yash@vorynex.com',
  'Invitation: Weekly Automated Logistics Sync & SLA Review',
  'Dear All, Please be reminded that our weekly operations synchronization will take place tomorrow at 10:00 AM EST on Teams...',
  'Dear All,

Please be reminded that our weekly operations synchronization will take place tomorrow at 10:00 AM EST on Teams.

Agenda:
1. Inbound Carrier Bill of Lading Multi-Pass OCR throughput (current: 99.8% precision).
2. Port of Singapore demurrage waiver audit and invoice validation.
3. Automated payment rule configurations for freight forwarders.

Attached please find the monthly SLA breakdown report. Looking forward to reviewing the metrics.

Regards,
John Anderson
VP of Supply Chain Operations | ACME Solutions',
  'inbox',
  0,
  0,
  1,
  '["Operations", "Meeting"]',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-5 hours')
),
(
  'em-prod-03',
  'tenant-vorynex-prod',
  'Michael Perez',
  'm.perez@financecorp.net',
  'yash@vorynex.com',
  'AP Invoice Over-Limit Exception: Wire Remittance Approval Required ($48,900.00)',
  'Hi Yash, Vendor CloudScale Infrastructure submitted invoice INV-2026-9902 totaling $48,900.00 for annual cloud commitments...',
  'Hi Yash,

Vendor CloudScale Infrastructure submitted invoice INV-2026-9902 totaling $48,900.00 for annual dedicated compute clusters.

Because this transaction exceeds the Tier 3 ($25,000.00) authorization limit, the email automation gateway automatically routed this case to your Super Admin approval queue (Case #EXC-1093).

Vendor Payment Details:
- Beneficiary: CloudScale Global Inc.
- Amount: $48,900.00 USD
- Net Terms: 15 Days (Due: Nov 20, 2026)
- Matching Purchase Order: PO-99410 (Pre-approved)

Please confirm approval directly in the Approvals tab or reply to release the escrow hold.

Thank you,
Michael Perez
Finance Controller | Treasury & Disbursements',
  'inbox',
  0,
  1,
  1,
  '["Finance", "Approvals", "High-Value"]',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-8 hours')
),
(
  'em-prod-04',
  'tenant-vorynex-prod',
  'Sophia Martinez',
  'sophia@cloudtech.co',
  'yash@vorynex.com',
  'Annual SOC-2 Type II & ISO 27001 Certification Renewal Completed',
  'Team, our third-party compliance auditor Ernst & Young has officially concluded the annual surveillance audit with zero findings...',
  'Team,

Our third-party compliance auditor Ernst & Young has officially concluded the annual surveillance audit with zero findings or non-conformities across our multi-tenant data bricks.

Audit Scope Summary:
- Data encryption in transit (TLS 1.3) and at rest (AES-256 via Cloudflare D1).
- Role-Based Access Control and Hierarchy of Power specifiers.
- Immutable event audit logging with tenant boundary isolation.

The verified SOC-2 Type II audit report has been deposited into our secure customer compliance repository.

Cheers,
Sophia Martinez
Chief Information Security Officer | CloudTech Corp',
  'inbox',
  1,
  1,
  0,
  '["Security", "Compliance"]',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-1 day')
),
(
  'em-prod-05',
  'tenant-vorynex-prod',
  'Emma Li',
  'emma.li@enterprise-hr.org',
  'yash@vorynex.com',
  'Quarterly Employee Benefits & 2026 Holiday Schedule Guide',
  'Dear Team, Please find attached the updated corporate calendar and benefits enrolment window open from November 1st to 15th...',
  'Dear Team,

Please find attached the updated corporate calendar and benefits enrolment window open from November 1st to 15th.

If you plan on making adjustments to your health insurance or retirement allocations, please log in to the employee portal before the deadline.

Warm regards,
Emma Li
People & Culture Operations',
  'inbox',
  1,
  0,
  0,
  '["HR"]',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-2 days')
),
(
  'em-prod-06',
  'tenant-vorynex-prod',
  'Carlos Santana',
  'c.santana@globalfreight.net',
  'yash@vorynex.com',
  'Customs Bill of Lading & Commercial Invoice: Vessel EverForward BL-88201',
  'Please find enclosed the formal bill of lading and commercial pack list for 4 TEU containers arriving at Long Beach Terminal 4...',
  'Hello Logistics Team,

Please find enclosed the formal bill of lading and commercial pack list for 4 TEU containers arriving at Long Beach Terminal 4 on Nov 2nd.

Container Numbers:
- MSCU-9921402 (Standard 40ft)
- MSCU-9921418 (Standard 40ft)
- MSCU-9921423 (Refrigerated 40ft)

Customs broker code: US-CBP-8819. Please acknowledge receipt so automated clearance codes can be issued.

Best regards,
Carlos Santana
Senior Freight Broker | Global Freight Logistics',
  'inbox',
  0,
  0,
  0,
  '["Logistics", "Invoices"]',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-3 days')
),
(
  'em-prod-07',
  'tenant-vorynex-prod',
  'Sarah Jenkins',
  'sarah.ops@vorynex.com',
  'yash@vorynex.com',
  'Re: Weekly Automated Logistics Sync & SLA Review',
  'Yash, regarding the demurrage surcharge: we negotiated a 48-hour grace period with the carrier port master, so no penalty will be billed...',
  'Yash,

Regarding the demurrage surcharge: we negotiated a 48-hour grace period with the carrier port master, so no penalty will be billed to Vorynex for container hold BL-4412.

I verified the automated exception case #EXC-201 and marked the financial liability resolved.

Thanks,
Sarah Jenkins
Operations Director',
  'inbox',
  1,
  1,
  0,
  '["Operations"]',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-4 days')
),
-- Sent messages
(
  'em-sent-01',
  'tenant-vorynex-prod',
  'Yash Salunke',
  'yash@vorynex.com',
  'm.perez@financecorp.net',
  'Approved: PO-99410 CloudScale Global Dedicated Cluster',
  'Michael, I have reviewed the SLA and architecture specifications. The $48,900.00 disbursement is approved under Tier 4 Super Admin limits...',
  'Michael,

I have reviewed the SLA and architecture specifications. The $48,900.00 disbursement is approved under Tier 4 Super Admin limits. 

Please execute the wire transfer and confirm invoice INV-2026-9902 is reconciled in SAP.

Best regards,
Yash Salunke
Managing Director | Vorynex Technologies',
  'sent',
  1,
  0,
  1,
  '["Finance"]',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-6 hours')
),
-- Drafts
(
  'em-draft-01',
  'tenant-vorynex-prod',
  'Yash Salunke',
  'yash@vorynex.com',
  'partners@enterprise-cloud.io',
  'Draft: 2026 Strategic Cloudflare Edge & D1 Co-Location Partnership',
  'Hi Marcus, following up on our discussions regarding global multi-tenant edge database performance across EMEA and APAC...',
  'Hi Marcus,

Following up on our discussions regarding global multi-tenant edge database performance across EMEA and APAC regions. We have benchmarked sub-10ms query latency using Cloudflare D1 with automated Data Brick isolation.

Proposed next steps:
1. Schedule a joint technical deep dive next Thursday.
2. Review API rate-limiting thresholds and tenant replication guarantees.

Looking forward to your thoughts.

Best,
Yash',
  'draft',
  1,
  0,
  0,
  '["Draft", "Partnership"]',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-1 hour')
),
-- Spam
(
  'em-spam-01',
  'tenant-vorynex-prod',
  'Crypto Yield Alpha',
  'noreply@cryptoboost-yield29.xyz',
  'yash@vorynex.com',
  'Claim your guaranteed 350% APY institutional liquidity rewards now!',
  'Exclusive invitation to participate in private seed liquidity pool with instant returns on staked collateral...',
  'Exclusive invitation to participate in private seed liquidity pool with instant returns on staked collateral. Click here to connect your wallet immediately.',
  'spam',
  1,
  0,
  0,
  '["Spam"]',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop&crop=faces&q=80',
  DATETIME('now', '-3 days')
);

-- Seed realistic Email Automation Rules
INSERT OR REPLACE INTO email_rules (id, tenantId, name, description, triggerType, conditionLogic, conditions, actions, isEnabled, executionCount, requireApprovalBeforeSend) VALUES
(
  'rule-01',
  'tenant-vorynex-prod',
  'AP Invoice Ingestion & Auto-Label',
  'Detects incoming vendor invoices and POs, applies the Finance & Invoices labels, and marks the message as Important.',
  'ON_RECEIVE',
  'OR',
  '[{"field":"subject","operator":"contains","value":"Invoice"},{"field":"subject","operator":"contains","value":"PO-"},{"field":"body","operator":"contains","value":"Remittance"}]',
  '[{"action":"apply_label","value":"Finance"},{"action":"apply_label","value":"Invoices"},{"action":"mark_important","value":true}]',
  1,
  142,
  0
),
(
  'rule-02',
  'tenant-vorynex-prod',
  'High-Value Financial Approvals Escalation',
  'Flags any message discussing amounts > $25,000 and routes them to the executive approval workflow.',
  'ON_RECEIVE',
  'AND',
  '[{"field":"body","operator":"contains","value":"$"},{"field":"subject","operator":"contains","value":"Approval"}]',
  '[{"action":"apply_label","value":"Approvals"},{"action":"mark_important","value":true},{"action":"star","value":true}]',
  1,
  29,
  1
),
(
  'rule-03',
  'tenant-vorynex-prod',
  'Carrier Freight & Customs Auto-Route',
  'Automatically classifies bills of lading and container notices under Logistics.',
  'ON_RECEIVE',
  'OR',
  '[{"field":"subject","operator":"contains","value":"Bill of Lading"},{"field":"subject","operator":"contains","value":"Customs"},{"field":"sender","operator":"contains","value":"freight"}]',
  '[{"action":"apply_label","value":"Logistics"}]',
  1,
  87,
  0
),
(
  'rule-04',
  'tenant-vorynex-prod',
  'Vendor Inquiry Automated Acknowledgement Draft',
  'Generates a standardized draft acknowledgement response when partners send delivery notifications.',
  'SENDER_MATCH',
  'AND',
  '[{"field":"sender","operator":"contains","value":"acmesolutions.io"},{"field":"subject","operator":"contains","value":"Sync"}]',
  '[{"action":"create_draft","value":"Thank you for the update. Our operations team has received the schedule and queued it for review."}]',
  1,
  18,
  1
);

-- Seed rule execution logs
INSERT OR REPLACE INTO email_rule_executions (id, tenantId, ruleId, ruleName, emailId, emailSubject, actionsExecuted, status, details, createdAt) VALUES
('exec-01', 'tenant-vorynex-prod', 'rule-01', 'AP Invoice Ingestion & Auto-Label', 'em-prod-03', 'AP Invoice Over-Limit Exception: Wire Remittance Approval Required ($48,900.00)', '["apply_label: Finance", "apply_label: Invoices", "mark_important: true"]', 'SUCCESS', 'Matched subject containing "Invoice" and body containing "Remittance"', DATETIME('now', '-8 hours')),
('exec-02', 'tenant-vorynex-prod', 'rule-02', 'High-Value Financial Approvals Escalation', 'em-prod-03', 'AP Invoice Over-Limit Exception: Wire Remittance Approval Required ($48,900.00)', '["apply_label: Approvals", "mark_important: true", "star: true"]', 'SUCCESS', 'Matched subject containing "Approval" and amount exceeding $25,000 threshold', DATETIME('now', '-8 hours')),
('exec-03', 'tenant-vorynex-prod', 'rule-03', 'Carrier Freight & Customs Auto-Route', 'em-prod-06', 'Customs Bill of Lading & Commercial Invoice: Vessel EverForward BL-88201', '["apply_label: Logistics"]', 'SUCCESS', 'Matched subject containing "Bill of Lading"', DATETIME('now', '-3 days'));
