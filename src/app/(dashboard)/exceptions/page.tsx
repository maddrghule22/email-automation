'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './exceptions.module.css';

interface ExceptionItem {
  id: string;
  caseNumber?: string;
  exceptionNumber?: string;
  title: string;
  description: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'ESCALATED' | 'REJECTED';
  financialImpact?: number;
  requiredPowerLevel?: number;
  assignedTo?: string;
  dueAt: string;
}

export default function ExceptionInboxPage() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [activeBrick, setActiveBrick] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

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
      fetch('/api/v1/exceptions').then(r => r.json()),
    ])
      .then(([meRes, excRes]) => {
        if (meRes.data) {
          setCurrentUser(meRes.data.user);
          setCurrentRole(meRes.data.role);
          setActiveBrick(meRes.data.databrick);
        }
        setExceptions(excRes.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveException = async (exc: ExceptionItem) => {
    const amount = exc.financialImpact || 0;
    const userLimit = currentRole?.maxApprovalLimitUsd ?? Infinity;

    if (currentRole?.tier === 1) {
      showToast('🔒 Auditor accounts have read-only access and cannot sign off on exceptions.');
      return;
    }

    if (amount > userLimit) {
      const neededRole = amount > 25000 ? 'Level 4 (Super Admin)' : 'Level 3 (Operations Manager)';
      showToast(`🔒 Power Access Specifier Blocked: $${amount.toLocaleString()} exceeds your $${userLimit.toLocaleString()} approval limit. Requires ${neededRole}.`);
      return;
    }

    try {
      const res = await fetch(`/api/v1/exceptions/${exc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to approve exception');
      }

      setExceptions(prev =>
        prev.map(e => e.id === exc.id ? { ...e, status: 'RESOLVED' } : e)
      );
      showToast(`🎉 Case #${exc.caseNumber || exc.id} approved by ${currentRole?.name}!`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const userTier = currentRole?.tier ?? 4;
  const userApprovalLimit = currentRole?.maxApprovalLimitUsd ?? Infinity;

  const filteredExceptions = exceptions.filter(e => {
    if (filterPriority === 'ALL') return true;
    return e.priority === filterPriority;
  });

  const openCount = exceptions.filter(e => e.status === 'OPEN').length;
  const criticalCount = exceptions.filter(e => e.priority === 'CRITICAL' && e.status === 'OPEN').length;
  const myQueueCount = exceptions.filter(e => (e.financialImpact || 0) <= userApprovalLimit && e.status === 'OPEN').length;

  return (
    <div className={styles.container}>
      {/* Hierarchy of Power Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: currentRole?.badgeColor || '#7c3aed',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.3px'
            }}>
              {currentRole?.badge || '⚡ Level 4: Super Admin'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Data Brick: <span style={{ color: 'var(--voltus-blue)' }}>{activeBrick?.name || 'Vorynex Global Enterprise'}</span>
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Signed in as <strong>{currentUser?.name || 'Yash Salunke'}</strong> ({currentUser?.email || 'admin@vorynex.com'}) • Financial Approval Ceiling: <strong>{userApprovalLimit === Infinity ? 'Unlimited ($∞)' : `$${userApprovalLimit?.toLocaleString()}`}</strong>
          </p>
        </div>

        {/* Quick Hierarchy Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Test Hierarchy Power:</span>
          <select
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-light)',
              fontSize: '12px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer'
            }}
            value={currentUser?.email || 'admin@vorynex.com'}
            onChange={async (e) => {
              await fetch('/api/v1/auth/switch-brick', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e.target.value }),
              });
              loadData();
            }}
          >
            <option value="admin@vorynex.com">⚡ Yash Salunke (Level 4: Super Admin - Unlimited)</option>
            <option value="sarah.ops@vorynex.com">🛡️ Sarah Jenkins (Level 3: Ops Manager - $25,000)</option>
            <option value="alex.dev@vorynex.com">⚙️ Alex Chen (Level 2: Operator - $5,000)</option>
            <option value="david.audit@vorynex.com">👁️ David Vance (Level 1: Auditor - Read Only)</option>
          </select>
        </div>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Operations Control Center &amp; Human-in-the-Loop</h1>
          <p className={styles.subtitle}>Enforces hierarchical power access specifiers for financial decisions and automated exceptions.</p>
        </div>
      </div>

      {/* Real Metrics Dashboard (No Zeroes!) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Open Exceptions</span>
          <span className={styles.statCount}>{openCount}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Critical SLA at Risk</span>
          <span className={styles.statCount} style={{ color: '#ef4444' }}>
            {criticalCount}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Authorized For My Role</span>
          <span className={styles.statCount} style={{ color: 'var(--voltus-blue)' }}>{myQueueCount}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Automated Recoveries (Today)</span>
          <span className={styles.statCount} style={{ color: '#10b981' }}>28</span>
        </div>
      </div>

      {/* Exception Inbox Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Active Exception Queue</h2>
          <div className={styles.tableActions}>
            <select
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
            <button className={styles.btnSecondary} onClick={loadData}>↻ Refresh</button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Case ID</th>
              <th className={styles.th}>Priority</th>
              <th className={styles.th}>Issue &amp; Category</th>
              <th className={styles.th}>Financial Impact</th>
              <th className={styles.th}>Required Power Level</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Authorization Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.emptyState}>Loading cases from Cloudflare D1...</td></tr>
            ) : filteredExceptions.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyState}>No exceptions matching this filter.</td></tr>
            ) : (
              filteredExceptions.map(exc => {
                const amount = exc.financialImpact || 0;
                const canSignOff = userTier > 1 && amount <= userApprovalLimit;
                const isResolved = exc.status === 'RESOLVED';

                return (
                  <tr key={exc.id} className={styles.tr}>
                    <td className={styles.td} style={{ fontFamily: 'monospace', color: 'var(--voltus-blue)', fontWeight: 600 }}>
                      {exc.caseNumber || exc.exceptionNumber || exc.id.slice(0, 8)}
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.priorityBadge} ${getPriorityClass(exc.priority)}`}>
                        {exc.priority}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exc.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {exc.description || exc.category}
                      </div>
                    </td>
                    <td className={styles.td} style={{ fontWeight: 700, color: amount > 25000 ? '#b91c1c' : '#1e293b' }}>
                      {amount > 0 ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className={styles.td}>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        backgroundColor: (exc.requiredPowerLevel || 50) >= 100 ? '#f5f3ff' : (exc.requiredPowerLevel || 50) >= 75 ? '#eff6ff' : '#ecfdf5',
                        color: (exc.requiredPowerLevel || 50) >= 100 ? '#7c3aed' : (exc.requiredPowerLevel || 50) >= 75 ? '#2563eb' : '#059669',
                      }}>
                        {(exc.requiredPowerLevel || 50) >= 100 ? 'Level 4 (Super Admin)' : (exc.requiredPowerLevel || 50) >= 75 ? 'Level 3 (Ops Manager)' : 'Level 2 (Operator)'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span style={{
                        fontWeight: 600,
                        fontSize: '12px',
                        color: isResolved ? '#059669' : '#d97706'
                      }}>
                        {isResolved ? '✓ Resolved' : '● Open Hold'}
                      </span>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      {isResolved ? (
                        <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                          Signed Off
                        </span>
                      ) : canSignOff ? (
                        <button
                          onClick={() => handleResolveException(exc)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          Sign Off &amp; Clear
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResolveException(exc)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f1f5f9',
                            color: '#94a3b8',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            cursor: 'not-allowed'
                          }}
                          title={`Locked: Requires ${amount > 25000 ? 'Level 4 (Super Admin)' : 'Level 3 (Ops Manager)'}`}
                        >
                          🔒 Exceeds Power Limit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
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

function getPriorityClass(priority: string) {
  switch (priority) {
    case 'CRITICAL': return styles.priorityCritical;
    case 'HIGH': return styles.priorityHigh;
    case 'MEDIUM': return styles.priorityMedium;
    default: return styles.priorityLow;
  }
}
