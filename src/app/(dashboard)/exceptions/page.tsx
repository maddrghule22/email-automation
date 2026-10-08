'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './exceptions.module.css';

export default function ExceptionInboxPage() {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/exceptions')
      .then(res => res.json())
      .then(json => {
        setExceptions(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Operations Control Center</h1>
          <p className={styles.subtitle}>Manage approvals, SLA exceptions, and workflow intervention queues.</p>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Open Exceptions</span>
          <span className={styles.statCount}>{exceptions.filter(e => e.status === 'OPEN').length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Critical SLA at Risk</span>
          <span className={styles.statCount} style={{ color: '#ef4444' }}>
            {exceptions.filter(e => e.priority === 'CRITICAL').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>My Work Queue</span>
          <span className={styles.statCount} style={{ color: 'var(--voltus-blue)' }}>0</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Automated Recoveries</span>
          <span className={styles.statCount} style={{ color: '#10b981' }}>24</span>
        </div>
      </div>

      {/* Exception Inbox Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Exception Inbox</h2>
          <div className={styles.tableActions}>
            <button className={styles.btnSecondary}>Filter Queue</button>
            <button className={styles.btnPrimary}>Bulk Assign</button>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Case ID</th>
              <th className={styles.th}>Priority</th>
              <th className={styles.th}>Title & Category</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>SLA Due</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.emptyState}>Loading cases...</td></tr>
            ) : exceptions.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyState}>Inbox is completely clear. No open exceptions.</td></tr>
            ) : (
              exceptions.map(exc => (
                <tr key={exc.id} className={styles.tr}>
                  <td className={styles.td} style={{ fontFamily: 'monospace', color: 'var(--voltus-blue)', fontWeight: 600 }}>
                    {exc.exceptionNumber}
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.priorityBadge} ${getPriorityClass(exc.priority)}`}>
                      {exc.priority}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exc.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{exc.category}</div>
                  </td>
                  <td className={styles.td} style={{ fontWeight: 600 }}>{exc.status}</td>
                  <td className={styles.td} style={{ color: 'var(--text-secondary)' }}>
                    {new Date(exc.dueAt).toLocaleString()}
                  </td>
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    <Link href={`/exceptions/${exc.id}`} className={styles.actionLink}>
                      Triage &rarr;
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

function getPriorityClass(priority: string) {
  switch (priority) {
    case 'CRITICAL': return styles.priorityCritical;
    case 'HIGH': return styles.priorityHigh;
    case 'MEDIUM': return styles.priorityMedium;
    default: return styles.priorityLow;
  }
}
