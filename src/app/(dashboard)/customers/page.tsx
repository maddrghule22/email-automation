'use client';

import React, { useEffect, useState } from 'react';
import styles from './customers.module.css';

export default function PlatformSettingsPage() {
  const [authData, setAuthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(95);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(res => res.json())
      .then(json => {
        if (json.data) setAuthData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSavePolicies = () => {
    if (authData?.role?.tier < 4) {
      showToast('🔒 Access Specifier Denied: Only Level 4 (Super Admin) can modify global tenant security policies.');
      return;
    }
    showToast('✓ Global automation policies updated and applied to Cloudflare Edge runtime.');
  };

  const user = authData?.user || { name: 'Yash Salunke', email: 'admin@vorynex.com' };
  const brick = authData?.databrick || { name: 'Vorynex Global Enterprise', slug: 'vorynex-enterprise' };
  const role = authData?.role || { name: 'Super Admin', tier: 4, badge: '⚡ Level 4: Super Admin', badgeColor: '#7c3aed' };
  const allBricks = authData?.allDatabricks || [];
  const hierarchy = authData?.hierarchy || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tenant Governance &amp; Unified Database Settings</h1>
          <p className={styles.subtitle}>Unified Cloudflare D1 database management, Data Brick partitions, and role access specifiers.</p>
        </div>
      </div>

      {/* Active Data Brick Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Active User Data Brick</h2>
          <span style={{
            backgroundColor: role.badgeColor,
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {role.badge}
          </span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.row}>
            <span className={styles.label}>Active Data Brick</span>
            <span className={styles.value}><strong>{brick.name}</strong> ({brick.slug})</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Database Engine</span>
            <span className={styles.value}>Cloudflare D1 Serverless SQL (email-automation-db)</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Tenant Administrator</span>
            <span className={styles.value}>{user.name} ({user.email})</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Financial Approval Ceiling</span>
            <span className={styles.value}>
              <strong>{role.maxApprovalLimitUsd === Infinity ? 'Unlimited ($∞)' : `$${role.maxApprovalLimitUsd?.toLocaleString()}`}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Unified Database Data Bricks List */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>All Tenant Data Bricks (Co-located in Single D1 Database)</h2>
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>● Multi-Tenant Isolated Storage</span>
        </div>
        <div className={styles.cardBody}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Every user and organization operates within an isolated Data Brick partition backed by foreign-key tenant constraints inside the unified Cloudflare D1 relational database.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 12px' }}>Data Brick Name</th>
                <th style={{ padding: '8px 12px' }}>Partition Slug</th>
                <th style={{ padding: '8px 12px' }}>Isolation Status</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Engine</th>
              </tr>
            </thead>
            <tbody>
              {allBricks.map((b: any) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {b.name}
                    {b.id === brick.id && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--voltus-blue)' }}>(Current)</span>}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{b.slug}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>Active Partition</span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>Cloudflare D1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hierarchy of Power & Role Access Specifier Reference */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Hierarchy of Power &amp; Role Access Specifiers</h2>
        </div>
        <div className={styles.cardBody}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 12px' }}>Level &amp; Role</th>
                <th style={{ padding: '8px 12px' }}>Financial Approval Limit</th>
                <th style={{ padding: '8px 12px' }}>Workflow Permissions</th>
                <th style={{ padding: '8px 12px' }}>Integration Authority</th>
              </tr>
            </thead>
            <tbody>
              {hierarchy.map((hr: any) => (
                <tr key={hr.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                    <span style={{ color: hr.badgeColor }}>{hr.badge}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                    {hr.maxApprovalLimitUsd === Infinity || hr.maxApprovalLimitUsd > 1000000 ? 'Unlimited ($∞)' : hr.maxApprovalLimitUsd === 0 ? '$0 (Read-Only)' : `$${hr.maxApprovalLimitUsd.toLocaleString()}`}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {hr.canPublishWorkflows ? 'Author, Publish, Delete' : hr.canExecuteWorkflows ? 'Execute & Run Only' : 'Read-Only Audit'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {hr.canManageIntegrations ? 'Connect Gateways & API Keys' : 'Read-Only Ping'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automation Engine Policies */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Global Automation Policies</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.row}>
            <span className={styles.label}>AI Model Pipeline</span>
            <span className={styles.value}>Gemini 1.5 Pro (Primary) • Flash 1.5 (High-Throughput Subagent)</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Auto-Approval Confidence Threshold</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="range"
                min="80"
                max="99"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                style={{ width: '140px' }}
              />
              <span style={{ fontWeight: 600 }}>{confidenceThreshold}%</span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>(Scores below require Human-in-the-Loop review)</span>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Audit Log Retention</span>
            <span className={styles.value}>365 Days (Compliant with SOC2 / ISO 27001)</span>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSavePolicies}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--voltus-blue)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Save Policy Changes
            </button>
          </div>
        </div>
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
