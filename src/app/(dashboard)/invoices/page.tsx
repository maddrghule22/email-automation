'use client';

import React, { useEffect, useState } from 'react';
import styles from './invoices.module.css';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  status: 'QUEUED_NET30' | 'UNDER_REVIEW' | 'PAID' | 'APPROVED';
  confidence: number;
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-089',
    vendorName: 'Acro Corporation Inc.',
    subtotal: 13000.00,
    tax: 1250.00,
    total: 14250.00,
    dueDate: '15 Nov 2026',
    status: 'UNDER_REVIEW',
    confidence: 98,
  },
  {
    id: 'inv-2',
    invoiceNumber: 'PO-98441-INV',
    vendorName: 'Omni Logistics Ltd.',
    subtotal: 7800.00,
    tax: 600.00,
    total: 8400.00,
    dueDate: '20 Nov 2026',
    status: 'APPROVED',
    confidence: 96,
  },
  {
    id: 'inv-3',
    invoiceNumber: 'AWS-CORP-9921',
    vendorName: 'Amazon Web Services Cloud',
    subtotal: 4200.00,
    tax: 378.00,
    total: 4578.00,
    dueDate: '30 Oct 2026',
    status: 'PAID',
    confidence: 99,
  },
  {
    id: 'inv-4',
    invoiceNumber: 'BILL-4402',
    vendorName: 'Apex Systems Solutions',
    subtotal: 3500.00,
    tax: 300.00,
    total: 3800.00,
    dueDate: '05 Nov 2026',
    status: 'QUEUED_NET30',
    confidence: 94,
  },
  {
    id: 'inv-5',
    invoiceNumber: 'SAP-LIC-771',
    vendorName: 'SAP Global Licensing',
    subtotal: 10422.00,
    tax: 0.00,
    total: 10422.00,
    dueDate: '10 Nov 2026',
    status: 'UNDER_REVIEW',
    confidence: 97,
  },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [activeBrick, setActiveBrick] = useState<any>(null);
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
        if (json.data) {
          if (json.data.role) setCurrentRole(json.data.role);
          if (json.data.databrick) setActiveBrick(json.data.databrick);
        }
      })
      .catch(() => {});
  }, []);

  const handleApproveInvoice = (inv: InvoiceItem) => {
    const userLimit = currentRole?.maxApprovalLimitUsd ?? Infinity;

    if (currentRole?.tier === 1) {
      showToast('🔒 Auditor accounts have read-only access and cannot authorize financial payments.');
      return;
    }

    if (inv.total > userLimit) {
      const requiredRole = inv.total > 25000 ? 'Level 4 (Super Admin)' : 'Level 3 (Operations Manager)';
      showToast(`🔒 Power Limit Exceeded: Invoice amount ($${inv.total.toLocaleString()}) exceeds your approval limit ($${userLimit.toLocaleString()}). Requires ${requiredRole}.`);
      return;
    }

    setInvoices(prev =>
      prev.map(item => item.id === inv.id ? { ...item, status: 'APPROVED' } : item)
    );
    showToast(`✓ Invoice #${inv.invoiceNumber} ($${inv.total.toLocaleString()}) approved for automated Net-30 disbursement.`);
  };

  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.total, 0);
  const pendingTotal = invoices.filter(i => i.status === 'UNDER_REVIEW').reduce((acc, curr) => acc + curr.total, 0);
  const approvedTotal = invoices.filter(i => i.status === 'APPROVED' || i.status === 'PAID').reduce((acc, curr) => acc + curr.total, 0);

  const userApprovalLimit = currentRole?.maxApprovalLimitUsd ?? Infinity;

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
            Data Brick: <strong style={{ color: 'var(--voltus-blue)' }}>{activeBrick?.name || 'Vorynex Global Enterprise'}</strong>
          </span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Disbursement Limit: <strong>{userApprovalLimit === Infinity ? 'Unlimited ($∞)' : `$${userApprovalLimit?.toLocaleString()}`}</strong>
        </div>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Automated Accounts Payable &amp; Invoices</h1>
          <p className={styles.subtitle}>OCR extracted invoice ledger with multi-level hierarchical approval thresholds.</p>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Invoiced Amount</span>
          <p className={styles.statValue}>${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Disbursement Approved</span>
          <p className={styles.statValue} style={{ color: '#059669' }}>
            ${approvedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Executive Sign-off</span>
          <p className={styles.statValue} style={{ color: '#d97706' }}>
            ${pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>OCR Extraction Precision</span>
          <p className={styles.statValue} style={{ color: 'var(--voltus-blue)' }}>97.2%</p>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Extracted Invoices &amp; Payment Ledger</h2>
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>● Connected to SAP ERP Sync</span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Invoice #</th>
              <th className={styles.th}>Vendor Name</th>
              <th className={styles.th}>Due Date</th>
              <th className={styles.th}>Amount (USD)</th>
              <th className={styles.th}>OCR Conf</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Authorization Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => {
              const canSignOff = currentRole?.tier > 1 && inv.total <= userApprovalLimit;
              const isApproved = inv.status === 'APPROVED' || inv.status === 'PAID';

              return (
                <tr key={inv.id} className={styles.tr}>
                  <td className={styles.td} style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--voltus-blue)' }}>
                    {inv.invoiceNumber}
                  </td>
                  <td className={styles.td} style={{ fontWeight: 600 }}>{inv.vendorName}</td>
                  <td className={styles.td} style={{ color: 'var(--text-secondary)' }}>{inv.dueDate}</td>
                  <td className={styles.td} style={{ fontWeight: 700 }}>
                    ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={styles.td}>
                    <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>{inv.confidence}%</span>
                  </td>
                  <td className={styles.td}>
                    {inv.status === 'PAID' ? (
                      <span className={styles.badgePaid}>✓ Paid &amp; Synced</span>
                    ) : inv.status === 'APPROVED' ? (
                      <span className={styles.badgeApproved}>● Approved for Net-30</span>
                    ) : (
                      <span className={styles.badgeReview}>○ Review Required</span>
                    )}
                  </td>
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    {isApproved ? (
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Authorized</span>
                    ) : canSignOff ? (
                      <button
                        onClick={() => handleApproveInvoice(inv)}
                        style={{
                          padding: '5px 12px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Authorize Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproveInvoice(inv)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#f1f5f9',
                          color: '#94a3b8',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'not-allowed'
                        }}
                        title={`Locked: Exceeds $${userApprovalLimit.toLocaleString()}`}
                      >
                        🔒 Exceeds Power Limit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
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
