import React from 'react';
import Link from 'next/link';
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
          <span className={styles.logoTag}>Cloudflare Edge</span>
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
            Launch Workspace →
          </Link>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.pillBadge}>
          <span className={styles.pillBadgeDot} />
          <span>Stage 42 Certified Release • Enterprise AI Copilot</span>
        </div>

        <h1 className={styles.heroTitle}>
          Autonomous Operations for <br />
          <span className={styles.heroGradientText}>Modern Enterprise Supply Chains</span>
        </h1>

        <p className={styles.subtitle || styles.heroSubtitle}>
          Ingest unstructured invoices, automate multi-step ERP workflows, and resolve edge-case exceptions with sub-second AI latency. Powered by Cloudflare global Edge runtime.
        </p>

        <div className={styles.heroActions}>
          <Link href="/register" className={styles.btnPrimary}>
            <span>⚡ Start Free Workspace</span>
          </Link>
          <Link href="/login" className={styles.btnSecondary}>
            <span>Enter Demo Environment →</span>
          </Link>
        </div>

        {/* ── Live Visualizer Card ─────────────────────────── */}
        <div className={styles.previewWrapper}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div className={styles.windowControls}>
                <span className={`${styles.winDot} ${styles.winRed}`} />
                <span className={`${styles.winDot} ${styles.winYellow}`} />
                <span className={`${styles.winDot} ${styles.winGreen}`} />
              </div>
              <div className={styles.previewTitle}>vorynex-pipeline-runtime.cloudflare-edge.live</div>
              <div className={styles.previewBadge}>● LIVE STREAMING</div>
            </div>

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

              {/* Pipeline Step Flow */}
              <div className={styles.pipelinePreview}>
                <div className={styles.pipelineLabel}>
                  <span>ACTIVE PIPELINE EXECUTION: #RUN-8841-INV</span>
                  <span style={{ color: '#38bdf8' }}>STATUS: MATCHED &amp; POSTED</span>
                </div>
                <div className={styles.pipelineSteps}>
                  <div className={styles.pipelineStep}>
                    <div className={`${styles.stepIconBox} ${styles.stepIconActive}`}>📩</div>
                    <div className={styles.stepText}>Email / Ingestion</div>
                    <div className={styles.stepStatus}>✓ Received</div>
                  </div>

                  <div className={styles.pipelineLine} />

                  <div className={styles.pipelineStep}>
                    <div className={`${styles.stepIconBox} ${styles.stepIconActive}`}>👁️</div>
                    <div className={styles.stepText}>Dual-Engine OCR</div>
                    <div className={styles.stepStatus}>✓ Extracted (99.8%)</div>
                  </div>

                  <div className={styles.pipelineLine} />

                  <div className={styles.pipelineStep}>
                    <div className={`${styles.stepIconBox} ${styles.stepIconActive}`}>🤖</div>
                    <div className={styles.stepText}>Schema Validation</div>
                    <div className={styles.stepStatus}>✓ Verified</div>
                  </div>

                  <div className={styles.pipelineLine} />

                  <div className={styles.pipelineStep}>
                    <div className={`${styles.stepIconBox} ${styles.stepIconActive}`}>⚡</div>
                    <div className={styles.stepText}>ERP Synchronization</div>
                    <div className={styles.stepStatus}>✓ Synced (SAP)</div>
                  </div>
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
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📄</div>
            <h3 className={styles.featureTitle}>Dual-Engine Document OCR</h3>
            <p className={styles.featureDesc}>
              State-of-the-art vision and layout models extract multi-line tabular invoices, purchase orders, and bill of ladings with sub-pixel field coordinates.
            </p>
            <span className={styles.featureBadge}>Sub-second extraction</span>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔄</div>
            <h3 className={styles.featureTitle}>Visual DAG Workflows</h3>
            <p className={styles.featureDesc}>
              Drag-and-drop orchestration engine for complex financial approvals, multi-tier matching rules, and conditional webhooks.
            </p>
            <span className={styles.featureBadge}>Event-driven Engine</span>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3 className={styles.featureTitle}>Autonomous Exception Triage</h3>
            <p className={styles.featureDesc}>
              Identifies line-item price mismatches, missing tax IDs, and duplicate submissions. Automatically calculates SLA deadlines and risk scores.
            </p>
            <span className={styles.featureBadge}>Automated SLA tracking</span>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔗</div>
            <h3 className={styles.featureTitle}>Enterprise Connectors</h3>
            <p className={styles.featureDesc}>
              Pre-built bi-directional connectors for SAP ERP, Microsoft 365, Gmail Workspace, SFTP servers, and generic REST endpoints.
            </p>
            <span className={styles.featureBadge}>OAuth2 + AES-256</span>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🧠</div>
            <h3 className={styles.featureTitle}>Conversational AI Copilot</h3>
            <p className={styles.featureDesc}>
              Query transactions, verify suppliers, and investigate disputed invoices in plain natural language with deep operational memory.
            </p>
            <span className={styles.featureBadge}>Multi-turn Context</span>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Cloudflare Edge Network</h3>
            <p className={styles.featureDesc}>
              Globally distributed execution across 300+ edge data centers. Ultra-low latency response times with bank-grade encryption and DDoS protection.
            </p>
            <span className={styles.featureBadge}>99.99% Availability</span>
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
            Get Started Free →
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
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot} />
              <span>All Systems Operational</span>
            </div>
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
