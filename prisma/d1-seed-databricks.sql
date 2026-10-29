-- Seed Multi-Tenant Data Bricks into Unified Cloudflare D1 Database

-- 1. Tenants (Data Bricks)
INSERT OR IGNORE INTO tenants (id, name, slug, status) VALUES
  ('tenant-vorynex-prod', 'Vorynex Global Enterprise', 'vorynex-enterprise', 'Active'),
  ('tenant-ops-brick', 'Nexus Operations & Supply Chain', 'nexus-operations', 'Active'),
  ('tenant-dev-brick', 'Apex Logistics Fleet & Fulfillment', 'apex-logistics', 'Active'),
  ('tenant-audit-brick', 'SecureTrust Regulatory & Compliance', 'securetrust-audit', 'Active');

-- 2. Users (Role-Specified Hierarchy Accounts)
INSERT OR IGNORE INTO users (id, email, name, passwordHash, status, roleId) VALUES
  ('user-admin-yash', 'admin@vorynex.com', 'Yash Salunke', '$2b$10$L7TfSIfBYhAM1LO54iOtfOOHpur0ATPKh01DHJRUoSePG/BZgjvK.', 'ACTIVE', 'role-super-admin'),
  ('user-ops-sarah', 'sarah.ops@vorynex.com', 'Sarah Jenkins', '$2b$10$L7TfSIfBYhAM1LO54iOtfOOHpur0ATPKh01DHJRUoSePG/BZgjvK.', 'ACTIVE', 'role-operations-manager'),
  ('user-operator-alex', 'alex.dev@vorynex.com', 'Alex Chen', '$2b$10$L7TfSIfBYhAM1LO54iOtfOOHpur0ATPKh01DHJRUoSePG/BZgjvK.', 'ACTIVE', 'role-automation-operator'),
  ('user-auditor-david', 'david.audit@vorynex.com', 'David Vance', '$2b$10$L7TfSIfBYhAM1LO54iOtfOOHpur0ATPKh01DHJRUoSePG/BZgjvK.', 'ACTIVE', 'role-compliance-auditor');

-- 3. Memberships linking Users to their respective Data Bricks
INSERT OR IGNORE INTO memberships (id, userId, tenantId, roleId, status) VALUES
  ('mem-admin-yash', 'user-admin-yash', 'tenant-vorynex-prod', 'role-super-admin', 'Active'),
  ('mem-ops-sarah', 'user-ops-sarah', 'tenant-ops-brick', 'role-operations-manager', 'Active'),
  ('mem-operator-alex', 'user-operator-alex', 'tenant-dev-brick', 'role-automation-operator', 'Active'),
  ('mem-auditor-david', 'user-auditor-david', 'tenant-audit-brick', 'role-compliance-auditor', 'Active');

-- 4. Workflows for Brick 1 (Vorynex Global Enterprise)
INSERT OR IGNORE INTO workflows (id, tenantId, name, description, status, version) VALUES
  ('wf-vorynex-ap', 'tenant-vorynex-prod', 'Enterprise AP Invoice Ingestion & ERP Match', 'Extracts line items, vendor tax IDs, and totals from incoming emails and synchronizes with SAP ERP.', 'Published', 3),
  ('wf-vorynex-vip', 'tenant-vorynex-prod', 'Executive VIP Client Escalations & SLAs', 'Classifies high-priority executive communications and dispatches on-call director alerts within 5 minutes.', 'Published', 2),
  ('wf-vorynex-contracts', 'tenant-vorynex-prod', 'Legal Contract Clause AI Risk Review', 'Scans incoming NDAs and service agreements for indemnity, liability caps, and termination anomalies.', 'Published', 1),
  ('wf-vorynex-remit', 'tenant-vorynex-prod', 'Automated Remittance & Vendor Payment Dispatch', 'Generates approved ACH remittance notices and delivers real-time confirmation receipts via email.', 'Published', 4);

-- 5. Workflows for Brick 2 (Nexus Operations)
INSERT OR IGNORE INTO workflows (id, tenantId, name, description, status, version) VALUES
  ('wf-nexus-carrier', 'tenant-ops-brick', 'Carrier Freight Manifest Ingestion', 'Extracts container tracking and weight tolerances from bill of lading documents.', 'Published', 2),
  ('wf-nexus-surcharge', 'tenant-ops-brick', 'Fuel Surcharge & Demurrage Audit', 'Flags abnormal port detention fees exceeding contract tariff schedules.', 'Published', 1);

-- 6. Workflows for Brick 3 (Apex Logistics)
INSERT OR IGNORE INTO workflows (id, tenantId, name, description, status, version) VALUES
  ('wf-apex-dispatch', 'tenant-dev-brick', 'Warehouse Dispatch & Order Routing', 'Validates delivery addresses, assigns carrier routes, and triggers dispatch notices.', 'Published', 2);

-- 7. Workflows for Brick 4 (SecureTrust Compliance)
INSERT OR IGNORE INTO workflows (id, tenantId, name, description, status, version) VALUES
  ('wf-securetrust-audit', 'tenant-audit-brick', 'Continuous SOC2 Access & Evidence Audit', 'Monitors privilege escalations, failed logins, and data brick access boundaries.', 'Published', 1);

-- 8. Workflow Versions
INSERT OR IGNORE INTO workflow_versions (id, workflowId, version, definition) VALUES
  ('wfv-vorynex-ap-1', 'wf-vorynex-ap', 3, '{"trigger":"email_received","actions":["ocr_extract","vendor_match","erp_sync"]}'),
  ('wfv-vorynex-vip-1', 'wf-vorynex-vip', 2, '{"trigger":"email_received","actions":["sentiment_ai","sla_escalation","slack_alert"]}'),
  ('wfv-vorynex-contracts-1', 'wf-vorynex-contracts', 1, '{"trigger":"attachment_uploaded","actions":["clause_extraction","risk_score"]}'),
  ('wfv-vorynex-remit-1', 'wf-vorynex-remit', 4, '{"trigger":"erp_payment_ready","actions":["generate_receipt","send_smtp"]}'),
  ('wfv-nexus-carrier-1', 'wf-nexus-carrier', 2, '{"trigger":"email_received","actions":["ocr_bol","manifest_sync"]}'),
  ('wfv-nexus-surcharge-1', 'wf-nexus-surcharge', 1, '{"trigger":"invoice_received","actions":["tariff_audit","exception_gate"]}'),
  ('wfv-apex-dispatch-1', 'wf-apex-dispatch', 2, '{"trigger":"order_placed","actions":["address_validate","route_assign"]}'),
  ('wfv-securetrust-1', 'wf-securetrust-audit', 1, '{"trigger":"hourly_cron","actions":["scan_audit_logs","generate_report"]}');

-- 9. Integrations for Brick 1 (Vorynex Global)
INSERT OR IGNORE INTO integrations (id, tenantId, provider, name, type, status, enabled, config) VALUES
  ('int-vorynex-m365', 'tenant-vorynex-prod', 'microsoft365', 'Microsoft 365 Exchange Gateway', 'EMAIL', 'CONNECTED', 1, '{"email":"automation@vorynex.com","latencyMs":28,"uptime":"99.99%"}'),
  ('int-vorynex-gmail', 'tenant-vorynex-prod', 'gmail', 'Google Workspace Executive Mailbox', 'EMAIL', 'CONNECTED', 1, '{"email":"exec@vorynex.com","latencyMs":35,"uptime":"99.98%"}'),
  ('int-vorynex-sap', 'tenant-vorynex-prod', 'erp-foundation', 'SAP S/4HANA Enterprise Cloud', 'ERP', 'CONNECTED', 1, '{"endpoint":"https://sap.vorynex.internal/api","latencyMs":64,"uptime":"99.95%"}'),
  ('int-vorynex-stripe', 'tenant-vorynex-prod', 'rest-connector', 'Stripe Enterprise Payments Gateway', 'FINANCE', 'CONNECTED', 1, '{"mode":"live","latencyMs":42,"uptime":"100.0%"}'),
  ('int-vorynex-sftp', 'tenant-vorynex-prod', 'sftp-storage', 'Secure Banking SFTP Storage Vault', 'STORAGE', 'CONNECTED', 1, '{"host":"sftp.vault.vorynex.com","port":22,"latencyMs":55,"uptime":"99.99%"}');

-- 10. Integrations for Other Bricks
INSERT OR IGNORE INTO integrations (id, tenantId, provider, name, type, status, enabled, config) VALUES
  ('int-nexus-m365', 'tenant-ops-brick', 'microsoft365', 'Nexus Operations Mailbox', 'EMAIL', 'CONNECTED', 1, '{"email":"ops@nexus.com","latencyMs":32}'),
  ('int-nexus-sap', 'tenant-ops-brick', 'erp-foundation', 'Oracle NetSuite Logistics Sync', 'ERP', 'CONNECTED', 1, '{"latencyMs":78}'),
  ('int-apex-gmail', 'tenant-dev-brick', 'gmail', 'Apex Fleet Operations Mailbox', 'EMAIL', 'CONNECTED', 1, '{"email":"dispatch@apex.com","latencyMs":40}'),
  ('int-audit-sftp', 'tenant-audit-brick', 'sftp-storage', 'Compliance Audit Archive (Immutable)', 'STORAGE', 'CONNECTED', 1, '{"latencyMs":48}');

-- 11. Documents for Brick 1 (Vorynex Global)
INSERT OR IGNORE INTO documents (id, tenantId, title, originalFilename, mimeType, fileSize, status, metadata) VALUES
  ('doc-vorynex-inv-089', 'tenant-vorynex-prod', 'Invoice-INV-2026-089.pdf', 'Invoice-INV-2026-089.pdf', 'application/pdf', 1258291, 'PARSED', '{"vendor":"Acro Corporation Inc.","amount":14250.00,"currency":"USD","dueDate":"2026-11-15","confidence":0.98,"tax":1250.00,"poNumber":"PO-77401"}'),
  ('doc-vorynex-req', 'tenant-vorynex-prod', 'Project_Requirements.pdf', 'Project_Requirements.pdf', 'application/pdf', 2516582, 'PARSED', '{"client":"ABC Technologies","project":"Website Redesign & AI Portal","budget":"₹ 2,50,000","confidence":0.94,"deadline":"2026-10-30"}'),
  ('doc-vorynex-po-984', 'tenant-vorynex-prod', 'PO_OmniLogistics_98441.pdf', 'PO_OmniLogistics_98441.pdf', 'application/pdf', 860160, 'PARSED', '{"vendor":"Omni Logistics Ltd.","amount":8400.00,"currency":"USD","confidence":0.96,"deliveryDate":"2026-11-05"}'),
  ('doc-vorynex-tax-w9', 'tenant-vorynex-prod', 'Form_W9_Corporate_2026.pdf', 'Form_W9_Corporate_2026.pdf', 'application/pdf', 737280, 'PARSED', '{"entity":"Vorynex Technologies Inc.","einStatus":"Verified","year":"2026","confidence":0.99}'),
  ('doc-vorynex-contract', 'tenant-vorynex-prod', 'Master_Services_Agreement_Nexus.pdf', 'Master_Services_Agreement_Nexus.pdf', 'application/pdf', 3355443, 'PARSED', '{"parties":"Vorynex & Nexus Solutions Group","term":"3 Years","liabilityCap":"$2,000,000","confidence":0.92}');

-- 12. Exceptions & Human-in-the-Loop Cases for Brick 1 (with Financial Impact & Required Power Levels)
INSERT OR IGNORE INTO exceptions (id, tenantId, caseNumber, title, description, category, priority, status, financialImpact, requiredPowerLevel, assignedTo, dueAt) VALUES
  ('exc-vorynex-1092', 'tenant-vorynex-prod', 'EXC-1092', 'Vendor Remittance Bank Detail Discrepancy', 'Beneficiary IBAN on invoice INV-2026-089 does not match the master ERP vendor file. Anti-fraud verification hold triggered.', 'FINANCE_FRAUD', 'HIGH', 'OPEN', 14250.00, 75, 'Sarah Jenkins (Ops Manager)', datetime('now', '+4 hours')),
  ('exc-vorynex-1093', 'tenant-vorynex-prod', 'EXC-1093', 'Multi-Year Enterprise Cloud Infrastructure Contract', 'Annual commitment exceeds standard operational expenditure limit. Requires executive sign-off before vendor execution.', 'CONTRACT_AUTHORIZATION', 'CRITICAL', 'OPEN', 84000.00, 100, 'Yash Salunke (Super Admin)', datetime('now', '+2 hours')),
  ('exc-vorynex-1094', 'tenant-vorynex-prod', 'EXC-1094', 'Missing VAT Exemption Certificate for EU Customer', 'Invoice generated for cross-border digital services without valid reverse-charge VAT validation on VIES.', 'TAX_COMPLIANCE', 'MEDIUM', 'OPEN', 3150.00, 50, 'Alex Chen (Operator)', datetime('now', '+12 hours')),
  ('exc-vorynex-1095', 'tenant-vorynex-prod', 'EXC-1095', 'Duplicate PO Item Code Warning in Carrier Invoice', 'Line item #4 lists same bill of lading sequence as shipment delivered 3 days ago. Requires line comparison.', 'DUPLICATE_AUDIT', 'LOW', 'OPEN', 950.00, 50, 'Alex Chen (Operator)', datetime('now', '+24 hours'));

-- 13. Exceptions for Nexus Operations Brick
INSERT OR IGNORE INTO exceptions (id, tenantId, caseNumber, title, description, category, priority, status, financialImpact, requiredPowerLevel, assignedTo, dueAt) VALUES
  ('exc-nexus-201', 'tenant-ops-brick', 'EXC-201', 'Port Demurrage Surcharge Exceeds Free Time Limit', 'Vessel delayed at Port of Singapore. Container storage billed at 140% of contracted benchmark.', 'LOGISTICS_FEE', 'HIGH', 'OPEN', 6800.00, 75, 'Sarah Jenkins', datetime('now', '+6 hours')),
  ('exc-nexus-202', 'tenant-ops-brick', 'EXC-202', 'Packaging Compliance Label Discrepancy', 'Pallet barcoding does not conform to automated scanner GS1-128 specifications.', 'LABEL_VERIFICATION', 'LOW', 'OPEN', 450.00, 50, 'Alex Chen', datetime('now', '+18 hours'));
