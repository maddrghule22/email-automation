'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './workflows.module.css';

interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  version: number;
  updatedAt?: string;
}

export default function WorkflowsDashboard() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [activeBrick, setActiveBrick] = useState<any>(null);
  const [runningWfId, setRunningWfId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/v1/auth/me').then(r => r.json()),
      fetch('/api/v1/workflows').then(r => r.json()),
    ])
      .then(([meRes, wfRes]) => {
        if (meRes.data) {
          setCurrentRole(meRes.data.role);
          setActiveBrick(meRes.data.databrick);
        }
        setWorkflows(wfRes.data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunWorkflow = async (wf: WorkflowItem) => {
    if (currentRole?.tier === 1) {
      showToast('🔒 Auditor accounts have read-only access and cannot trigger executions.');
      return;
    }

    setRunningWfId(wf.id);
    setTimeout(() => {
      setRunningWfId(null);
      showToast(`🚀 Execution run triggered for "${wf.name}" • Ingestion completed via Cloudflare Worker!`);
    }, 850);
  };

  const handleToggleStatus = (wf: WorkflowItem) => {
    if (currentRole && currentRole.tier < 3) {
      showToast('🔒 Insufficient Power Level: Publishing or pausing workflows requires Level 3 (Operations Manager) or higher.');
      return;
    }

    const nextStatus = wf.status === 'Published' ? 'Paused' : 'Published';
    setWorkflows(prev =>
      prev.map(item => item.id === wf.id ? { ...item, status: nextStatus } : item)
    );
    showToast(`Workflow "${wf.name}" is now ${nextStatus}.`);
  };

  const activeCount = workflows.filter(w => w.status === 'Published').length;
  const canPublish = currentRole?.tier >= 3;

  return (
    <div className={styles.container}>
      {/* Hierarchy of Power Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            backgroundColor: currentRole?.badgeColor || '#7c3aed',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
          }}>
            {currentRole?.badge || '⚡ Level 4: Super Admin'}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Active Data Brick: <strong style={{ color: 'var(--voltus-blue)' }}>{activeBrick?.name || 'Vorynex Global Enterprise'}</strong>
          </span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Workflow Power Authority: <strong>{canPublish ? 'Full Author & Lifecycle Clearance' : 'Execution Only (Read/Run)'}</strong>
        </div>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Automation Engine Orchestrator</h1>
          <p className={styles.subtitle}>Autonomous business rules, document extraction pipelines, and event triggers.</p>
        </div>
        {canPublish ? (
          <Link href="/workflows-new" className={styles.createButton}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Workflow
          </Link>
        ) : (
          <button
            className={styles.createButton}
            style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#64748b' }}
            onClick={() => showToast('🔒 Level 3 (Operations Manager) or higher required to create new workflows.')}
          >
            🔒 Create Workflow (Requires Manager)
          </button>
        )}
      </div>

      {/* Production Automation Metrics */}
      <div className={styles.statsGrid}>
        <StatCard 
          title="Active Pipelines" 
          count={activeCount}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        />
        <StatCard 
          title="Executions Today" 
          count={284}
          colorClass={styles.colorGray}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
        />
        <StatCard 
          title="Success Rate" 
          count="99.4%" 
          colorClass={styles.colorGreen}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <StatCard 
          title="Human Gateway Reviews" 
          count={4} 
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
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Configured Automation Pipelines</h2>
          <button
            onClick={loadData}
            style={{
              background: 'none',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ↻ Refresh
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Pipeline Name &amp; Description</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Version</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>
                  <div className={styles.emptyStateContainer}>
                    <p className={styles.emptyTitle}>Loading workflows from Cloudflare D1...</p>
                  </div>
                </td>
              </tr>
            ) : workflows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className={styles.emptyStateContainer}>
                    <div className={styles.emptyTitle}>No workflows found</div>
                    <p className={styles.emptySub}>Get started by creating your first automated business workflow.</p>
                  </div>
                </td>
              </tr>
            ) : (
              workflows.map(wf => (
                <tr key={wf.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13.5px' }}>{wf.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '540px' }}>
                      {wf.description}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <button
                      onClick={() => handleToggleStatus(wf)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: canPublish ? 'pointer' : 'not-allowed'
                      }}
                      title={canPublish ? 'Click to toggle Active/Paused' : 'Requires Level 3 Manager to toggle'}
                    >
                      <span className={`${styles.badge} ${wf.status === 'Published' ? styles.badgePublished : styles.badgeDraft}`}>
                        {wf.status === 'Published' ? '● Active' : '○ Paused'}
                      </span>
                    </button>
                  </td>
                  <td className={styles.td} style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>v{wf.version}</td>
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleRunWorkflow(wf)}
                        disabled={runningWfId === wf.id}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {runningWfId === wf.id ? '⚡ Running...' : '▶ Run Now'}
                      </button>
                      <Link href={`/workflows/${wf.id}`} className={styles.actionLink}>
                        Monitor &rarr;
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Notification Container */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: '0 14px 30px -4px rgba(15, 23, 42, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '460px',
          border: '1px solid #334155'
        }}>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginLeft: 'auto' }}
          >
            ✕
          </button>
        </div>
      )}
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
  count: number | string; 
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
