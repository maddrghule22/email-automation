'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './workflows.module.css';

export default function WorkflowsDashboard() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/workflows')
      .then(res => res.json())
      .then(json => {
        setWorkflows(json.data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Automation Engine</h1>
          <p className={styles.subtitle}>Manage triggers, business rules, and AI orchestration.</p>
        </div>
        <Link href="/workflows-new" className={styles.createButton}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Workflow
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <StatCard 
          title="Active Workflows" 
          count={workflows.filter(w => w.status === 'Published').length}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        />
        <StatCard 
          title="Total Executions (Today)" 
          count={workflows.length * 12}
          colorClass={styles.colorGray}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
        />
        <StatCard 
          title="Failed Executions" 
          count={0} 
          colorClass={styles.colorRed}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
        />
        <StatCard 
          title="Pending Approvals" 
          count={3} 
          colorClass={styles.colorAmber}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Workflow Name</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Version</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>
                  <div className={styles.emptyStateContainer}>
                    <p className={styles.emptyTitle}>Loading workflows...</p>
                  </div>
                </td>
              </tr>
            ) : workflows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className={styles.emptyStateContainer}>
                    <div className={styles.emptyIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </svg>
                    </div>
                    <div className={styles.emptyTitle}>No workflows found</div>
                    <p className={styles.emptySub}>Get started by creating your first automated business workflow or import a pre-built template.</p>
                    <Link href="/workflows-new" className={styles.createButton} style={{ marginTop: '8px' }}>
                      Create First Workflow
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              workflows.map(wf => (
                <tr key={wf.id} className={styles.tr}>
                  <td className={styles.td} style={{ fontWeight: 600 }}>{wf.name}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${wf.status === 'Published' ? styles.badgePublished : styles.badgeDraft}`}>
                      {wf.status}
                    </span>
                  </td>
                  <td className={styles.td} style={{ color: 'var(--text-secondary)' }}>v{wf.version}</td>
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    <Link href={`/workflows/${wf.id}`} className={styles.actionLink}>
                      Builder & Monitor &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  count, 
  colorClass = styles.colorGray, 
  icon 
}: { 
  title: string; 
  count: number; 
  colorClass?: string; 
  icon?: React.ReactNode; 
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statTitle}>{title}</span>
        {icon && <span className={styles.statIcon}>{icon}</span>}
      </div>
      <p className={`${styles.statCount} ${colorClass}`}>{count}</p>
    </div>
  );
}
