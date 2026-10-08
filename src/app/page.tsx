import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.glowTop} />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className={styles.header}>
        <Link href="/" className={styles.logoGroup}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4L12 20L20 4H15L12 11L9 4H4Z" fill="white" />
              <path d="M15 4L12 11L14.5 16L19.5 4H15Z" fill="#93c5fd" opacity="0.9" />
            </svg>
          </div>
          <span className={styles.logoText}>Vorynex</span>
        </Link>

        <nav className={styles.navLinks}>
          <Link href="/documents" className={styles.navLink}>Document AI</Link>
          <Link href="/workflows" className={styles.navLink}>Workflows</Link>
          <Link href="/exceptions" className={styles.navLink}>Exceptions</Link>
          <Link href="/integrations" className={styles.navLink}>Integrations</Link>
          <Link href="/support" className={styles.navLink}>Documentation</Link>
        </nav>

        <div className={styles.headerActions}>
          <Link href="/login" className={styles.signInLink}>
            Sign In
          </Link>
          <Link href="/register" className={styles.navCta}>
            Launch Workspace
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Autonomous Operations for <br />
          <span className={styles.heroGradientText}>Modern Enterprise Supply Chains</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Ingest unstructured invoices, automate multi-step ERP workflows, and resolve edge-case exceptions with sub-second AI latency. Powered by Cloudflare global Edge runtime.
        </p>

        <div className={styles.heroActions}>
          <Link href="/register" className={styles.btnPrimary}>
            Start Free Workspace
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link href="/login" className={styles.btnSecondary}>
            Enter Demo Environment
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </Link>
        </div>

        {/* ── Real Platform UI Graphic Preview ─────────────── */}
        <div className={styles.previewWrapper}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div className={styles.windowControls}>
                <span className={`${styles.winDot} ${styles.winRed}`} />
                <span className={`${styles.winDot} ${styles.winYellow}`} />
                <span className={`${styles.winDot} ${styles.winGreen}`} />
              </div>
              <div className={styles.previewTitle}>vorynex-pipeline-runtime.cloudflare-edge.live</div>
            </div>

            {/* High-Resolution Platform Visualizer Image */}
            <div className={styles.previewImageContainer}>
              <Image
                src="/images/platform-preview.jpg"
                alt="Vorynex AI Automation Platform Dashboard Interface"
                width={1920}
                height={1080}
                priority
                className={styles.previewImage}
              />
            </div>

            {/* Key Edge Metrics Bar */}
            <div className={styles.previewBody}>
              <div className={styles.metricTile}>
                <div className={styles.metricLabel}>Total Volume Processed</div>
                <div className={styles.metricVal}>
                  $4,829,140 <span className={styles.metricSub}>+18.4%</span>
                </div>
              </div>

              <div className={styles.metricTile}>
                <div className={styles.metricLabel}>AI Extraction Accuracy</div>
                <div className={styles.metricVal}>
                  99.82% <span className={styles.metricSub}>Dual-OCR</span>
                </div>
              </div>

              <div className={styles.metricTile}>
                <div className={styles.metricLabel}>Global Edge P99 Latency</div>
                <div className={styles.metricVal}>
                  14.2ms <span className={styles.metricSub}>Cloudflare</span>
                </div>
              </div>

              <div className={styles.metricTile}>
                <div className={styles.metricLabel}>Autonomous Resolution</div>
                <div className={styles.metricVal}>
                  94.6% <span className={styles.metricSub}>Zero-Touch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Grid Section ───────────────────────────── */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionPretitle}>Core Capabilities</div>
          <h2 className={styles.sectionTitle}>Built for High-Stakes Financial Operations</h2>
          <p className={styles.sectionSubtitle}>
            End-to-end intelligence that connects supplier communications directly to your core ledger without manual intervention.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {/* Card 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Dual-Engine Document OCR</h3>
            <p className={styles.featureDesc}>
              State-of-the-art vision models extract multi-line tabular invoices, purchase orders, and bill of ladings with sub-pixel field coordinates.
            </p>
          </div>

          {/* Card 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Visual DAG Workflows</h3>
            <p className={styles.featureDesc}>
              Drag-and-drop orchestration engine for complex financial approvals, multi-tier matching rules, and conditional webhooks.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Autonomous Exception Triage</h3>
            <p className={styles.featureDesc}>
              Identifies line-item price mismatches, missing tax IDs, and duplicate submissions. Automatically calculates SLA deadlines and risk scores.
            </p>
          </div>

          {/* Card 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                <line x1="6" y1="9" x2="6" y2="21" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Enterprise Connectors</h3>
            <p className={styles.featureDesc}>
              Pre-built bi-directional connectors for SAP ERP, Microsoft 365, Gmail Workspace, SFTP servers, and generic REST endpoints.
            </p>
          </div>

          {/* Card 5 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8.01" y2="16" />
                <line x1="16" y1="16" x2="16.01" y2="16" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Conversational AI Copilot</h3>
            <p className={styles.featureDesc}>
              Query transactions, verify suppliers, and investigate disputed invoices in plain natural language with deep operational memory.
            </p>
          </div>

          {/* Card 6 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Cloudflare Edge Network</h3>
            <p className={styles.featureDesc}>
              Globally distributed execution across 300+ edge data centers. Ultra-low latency response times with bank-grade encryption and DDoS protection.
            </p>
          </div>
        </div>
      </section>

      {/* ── Ready to Scale Banner ──────────────────────────── */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaTitle}>Accelerate Your Operational Workflows Today</h2>
        <p className={styles.ctaSubtitle}>
          Eliminate manual invoice processing delays and maintain 100% audit compliance across your global supply chain.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className={styles.btnPrimary}>
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link href="/overview" className={styles.btnSecondary}>
            View Live Dashboard
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <span className={styles.footerCopyright}>
              &copy; 2026 Vorynex Technologies, Inc. All rights reserved.
            </span>
          </div>

          <div className={styles.footerLinks}>
            <Link href="/overview" className={styles.footerLink}>Overview</Link>
            <Link href="/documents" className={styles.footerLink}>Documents</Link>
            <Link href="/workflows" className={styles.footerLink}>Workflows</Link>
            <Link href="/support" className={styles.footerLink}>Security &amp; Compliance</Link>
            <Link href="/login" className={styles.footerLink}>Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
