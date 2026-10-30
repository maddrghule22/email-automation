'use client';

import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

export default function HomePage() {
  return (
    <div className={styles.landingRoot}>
      {/* ── Top Global Status Banner ── */}
      <div className={styles.topBanner}>
        <span className={styles.topBannerBadge}>Cloudflare D1 Multi-Tenant Edge</span>
        <span>Dedicated SQLite Data Bricks with Tier-4 Access Specifiers now operational globally.</span>
      </div>

      {/* ── Header Navigation ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brandGroup}>
            <div className={styles.brandLogo}>M</div>
            <div>
              <span className={styles.brandName}>MailHive</span>
            </div>
            <span className={styles.brandBadge}>Enterprise</span>
          </Link>

          <nav className={styles.navLinks}>
            <a href="#capabilities" className={styles.navLink}>Capabilities</a>
            <a href="#databricks" className={styles.navLink}>Data Bricks</a>
            <a href="#hierarchy" className={styles.navLink}>Hierarchy of Power</a>
            <a href="#security" className={styles.navLink}>Security &amp; Edge</a>
          </nav>

          <div className={styles.headerActions}>
            <Link href="/login" className={styles.signInBtn}>
              Sign In
            </Link>
            <Link href="/register" className={styles.ctaBtnPrimary}>
              <span>Start Workspace</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroEyebrow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>Autonomous Email Operations &amp; AP Automation</span>
        </div>

        <h1 className={styles.heroHeadline}>
          Intelligent Email Automation with <span className={styles.heroGradientText}>Multi-Tenant Data Bricks</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Eliminate manual email triage, enforce multi-tier financial signing hierarchies, and orchestrate zero-latency automated pipelines directly on Cloudflare Edge D1.
        </p>

        <div className={styles.heroCtaGroup}>
          <Link href="/register" className={styles.heroMainCta}>
            <span>Provision New Workspace</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link href="/login" className={styles.heroSecondaryCta}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Sign In to Existing Brick</span>
          </Link>
          <Link href="/inbox" className={styles.heroSecondaryCta} style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span style={{ color: '#60a5fa' }}>Explore Console</span>
          </Link>
        </div>

        {/* ── Console Preview Window ── */}
        <div className={styles.previewWindow}>
          <div className={styles.windowBar}>
            <div className={styles.windowDots}>
              <span className={`${styles.dot} ${styles.dotRed}`} />
              <span className={`${styles.dot} ${styles.dotYellow}`} />
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </div>
            <div className={styles.windowTitle}>MailHive Edge Console • databrick-active.d1.sqlite</div>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>● SYNCED</div>
          </div>

          <div className={styles.previewGrid}>
            {/* Column 1: Workspace Folders */}
            <div className={styles.previewCol}>
              <div className={styles.previewColTitle}>Workspace Navigation</div>
              <div className={`${styles.mockItem} ${styles.mockItemActive}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: '#60a5fa' }}>📥 Inbound Triage</span>
                  <span style={{ color: '#93c5fd', fontWeight: 700 }}>24</span>
                </div>
              </div>
              <div className={styles.mockItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>⚡ Active Automation Rules</span>
                  <span style={{ color: '#64748b' }}>6</span>
                </div>
              </div>
              <div className={styles.mockItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>🛡️ Exception Queue</span>
                  <span style={{ color: '#f87171', fontWeight: 600 }}>2</span>
                </div>
              </div>
            </div>

            {/* Column 2: Inbound Messages */}
            <div className={styles.previewCol} style={{ background: '#0a0f1d' }}>
              <div className={styles.previewColTitle}>Inbound Correspondence Stream</div>
              <div className={`${styles.mockItem} ${styles.mockItemActive}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.mockSender}>Apex Logistics Global</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Just now</span>
                </div>
                <div className={styles.mockSubject}>AP Remittance Exception: $48,900.00 Wire Request</div>
                <div>
                  <span className={styles.mockBadge}>Tier-4 Required</span>{' '}
                  <span className={styles.mockBadgeAi}>⚡ AI Extracted</span>
                </div>
              </div>

              <div className={styles.mockItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.mockSender}>CloudScale Systems</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>12m ago</span>
                </div>
                <div className={styles.mockSubject}>SOC-2 Type II Annual Security Certification Pack</div>
                <span style={{ fontSize: '10px', color: '#38bdf8' }}>🏷️ Compliance</span>
              </div>
            </div>

            {/* Column 3: AI & Approval Engine */}
            <div className={styles.previewCol}>
              <div className={styles.previewColTitle}>Edge AI &amp; Hierarchy Gate</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '12px' }}>
                <strong style={{ color: '#f1f5f9' }}>Rule Triggered:</strong> IF invoice &gt; $25,000 THEN require Tier-4 Sign-off.
              </div>
              <div style={{ padding: '8px', background: '#0f172a', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '11px', color: '#cbd5e1', marginBottom: '10px' }}>
                <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: '2px' }}>AI Extracted Details:</div>
                • Vendor: Apex Logistics<br />
                • Amount: $48,900.00 USD<br />
                • Sign-off Status: Ready
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ flex: 1, padding: '6px', background: '#2563eb', color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Approve</button>
                <button style={{ flex: 1, padding: '6px', background: '#1e293b', color: '#cbd5e1', borderRadius: '4px', fontSize: '11px' }}>Escalate</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Performance Metrics Strip ── */}
      <section className={styles.metricsStrip}>
        <div className={styles.metricsInner}>
          <div>
            <div className={styles.metricValue}>100%</div>
            <div className={styles.metricLabel}>Data Brick Isolation per Tenant</div>
          </div>
          <div>
            <div className={styles.metricValue}>&lt; 14ms</div>
            <div className={styles.metricLabel}>Edge Query Latency on Cloudflare D1</div>
          </div>
          <div>
            <div className={styles.metricValue}>4-Tier</div>
            <div className={styles.metricLabel}>Granular Financial Signing RBAC</div>
          </div>
          <div>
            <div className={styles.metricValue}>99.9%</div>
            <div className={styles.metricLabel}>Automated Inbound Triage Rate</div>
          </div>
        </div>
      </section>

      {/* ── Platform Capabilities Grid ── */}
      <section id="capabilities" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Architectural Capabilities</div>
          <h2 className={styles.sectionTitle}>Built for High-Stakes Operations</h2>
          <p className={styles.sectionDesc}>
            Traditional mail clients trap business workflows in silos. MailHive converts your organization’s incoming correspondence into structured, audited action items.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {/* Card 1 */}
          <div className={styles.featureCard} id="databricks">
            <div className={styles.featureIconBox}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>Dedicated Multi-Tenant Data Bricks</h3>
            <p className={styles.featureCardDesc}>
              Every organization gets an isolated, high-performance Cloudflare D1 SQLite database store. Zero shared tables, zero cross-tenant contamination, and sub-millisecond edge indexing.
            </p>
          </div>

          {/* Card 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>Visual IF/THEN Rule Pipelines</h3>
            <p className={styles.featureCardDesc}>
              Create multi-condition automation rules based on sender, subject, keywords, and priority. Tag messages, trigger webhooks, archive spam, or stage draft responses automatically.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>Deterministic Edge AI Synthesis</h3>
            <p className={styles.featureCardDesc}>
              Instant thread summarization, tone-configurable reply drafting (Professional, Friendly, Urgent, Concise), and automated extraction of deadlines, dates, and action items.
            </p>
          </div>

          {/* Card 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>Document &amp; Invoice OCR Extraction</h3>
            <p className={styles.featureCardDesc}>
              Inbound PDF invoices and bills of lading are ingested, line items parsed, and payment amounts validated against ERP records with automated exception flagging.
            </p>
          </div>

          {/* Card 5 */}
          <div className={styles.featureCard} id="security">
            <div className={styles.featureIconBox}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>Edge-Native Defense &amp; Compliance</h3>
            <p className={styles.featureCardDesc}>
              Global TLS 1.3 encryption, immutable audit trails for every automated rule execution, and strict access specifiers ensure compliance with SOC-2 and ISO 27001 standards.
            </p>
          </div>

          {/* Card 6 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>Keyboard-First Triage Console</h3>
            <p className={styles.featureCardDesc}>
              Navigate at lightspeed with vim-inspired keyboard shortcuts: press <kbd style={{ padding: '2px 5px', background: '#1e293b', borderRadius: '4px', border: '1px solid #334155' }}>c</kbd> to compose, <kbd style={{ padding: '2px 5px', background: '#1e293b', borderRadius: '4px', border: '1px solid #334155' }}>e</kbd> to archive, and <kbd style={{ padding: '2px 5px', background: '#1e293b', borderRadius: '4px', border: '1px solid #334155' }}>r</kbd> to reply.
            </p>
          </div>
        </div>
      </section>

      {/* ── Hierarchy of Power (RBAC) Section ── */}
      <section id="hierarchy" className={styles.hierarchySection}>
        <div className={styles.hierarchyInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Access Specifier Governance</div>
            <h2 className={styles.sectionTitle}>Hierarchy of Power Architecture</h2>
            <p className={styles.sectionDesc}>
              Enterprise automation requires clear boundaries. MailHive enforces role-specific financial signing ceilings and workflow permissions across your team.
            </p>
          </div>

          <table className={styles.hierarchyTable}>
            <thead>
              <tr>
                <th>Tier &amp; Power Level</th>
                <th>Role Designation</th>
                <th>Signing Authority</th>
                <th>Permitted Capabilities</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className={`${styles.tierPill} ${styles.tierPill4}`}>
                    Level 4 • Power 100
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#ffffff' }}>Super Admin / Managing Director</td>
                <td style={{ color: '#c084fc', fontWeight: 600 }}>$1,000,000+ USD</td>
                <td>Full governance, tenant provisioning, ERP credentials, rule deletion &amp; bypass override.</td>
              </tr>
              <tr>
                <td>
                  <span className={`${styles.tierPill} ${styles.tierPill3}`}>
                    Level 3 • Power 75
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#ffffff' }}>Operations Director / Manager</td>
                <td style={{ color: '#60a5fa', fontWeight: 600 }}>Up to $250,000 USD</td>
                <td>Exception approval, rule creation, invoice variance sign-off, live queue management.</td>
              </tr>
              <tr>
                <td>
                  <span className={`${styles.tierPill} ${styles.tierPill2}`}>
                    Level 2 • Power 50
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#ffffff' }}>Automation Specialist / Operator</td>
                <td style={{ color: '#34d399', fontWeight: 600 }}>Up to $50,000 USD</td>
                <td>Routine email triage, rule builder configuration, AI draft generation, standard remittances.</td>
              </tr>
              <tr>
                <td>
                  <span className={`${styles.tierPill} ${styles.tierPill1}`}>
                    Level 1 • Power 25
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#ffffff' }}>Compliance Auditor / Viewer</td>
                <td style={{ color: '#fbbf24', fontWeight: 600 }}>Read-Only ($0 USD)</td>
                <td>Forensic audit access, execution log inspection, report generation. Strict read-only enforcement.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Pre-Footer Call to Action ── */}
      <section className={styles.preFooterCta}>
        <h2 className={styles.preFooterTitle}>Ready to Automate Your Operations?</h2>
        <p className={styles.preFooterSubtitle}>
          Provision your organization’s dedicated Cloudflare D1 Data Brick in under 30 seconds.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/register" className={styles.heroMainCta}>
            <span>Create Workspace Now</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link href="/login" className={styles.heroSecondaryCta}>
            <span>Sign In to Existing Account</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.brandGroup}>
            <div className={styles.brandLogo} style={{ width: 24, height: 24, fontSize: 13 }}>M</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>MailHive Enterprise</span>
          </div>

          <div className={styles.footerLegal}>
            &copy; {new Date().getFullYear()} Vorynex Technologies Inc. All rights reserved. Cloudflare Edge Architecture.
          </div>

          <div className={styles.statusIndicator}>
            <span className={styles.statusDot} />
            <span>Cloudflare Edge D1: Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
