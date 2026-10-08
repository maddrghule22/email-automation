'use client';

import React, { useState } from 'react';
import styles from './support.module.css';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'RESOLVED' | 'IN_PROGRESS';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  createdAt: string;
}

const INITIAL_TICKETS: Ticket[] = [
  { 
    id: '1', 
    subject: 'Integration Sync Failing', 
    description: 'ERP connector keeps dropping the payload when batch size exceeds 50 documents.', 
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: '2026-10-08T08:30:00Z'
  },
  { 
    id: '2', 
    subject: 'Invoice Module Setup', 
    description: 'Need assistance mapping customized VAT and reverse-charge tax fields.', 
    status: 'RESOLVED',
    priority: 'NORMAL',
    createdAt: '2026-10-07T14:15:00Z'
  }
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');

  const filteredTickets = tickets.filter(t => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const newTicket: Ticket = {
      id: String(Date.now()),
      subject,
      description: description || 'No detailed description provided.',
      status: 'OPEN',
      priority,
      createdAt: new Date().toISOString()
    };

    setTickets([newTicket, ...tickets]);
    setSubject('');
    setDescription('');
    setPriority('NORMAL');
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Support & Helpdesk</h1>
          <p className={styles.subtitle}>Track active service tickets, report platform incidents, and request technical assistance.</p>
        </div>
        <button className={styles.btnNew} onClick={() => setShowModal(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Ticket
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Open Tickets</span>
          <span className={styles.statCount} style={{ color: 'var(--voltus-blue)' }}>
            {tickets.filter(t => t.status === 'OPEN').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Resolved Tickets</span>
          <span className={styles.statCount} style={{ color: '#15803d' }}>
            {tickets.filter(t => t.status === 'RESOLVED').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Target SLA Response</span>
          <span className={styles.statCount} style={{ fontSize: '18px', paddingTop: '4px' }}>
            &lt; 15 mins
          </span>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Support Tickets</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['ALL', 'OPEN', 'RESOLVED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: filter === tab ? 'var(--voltus-blue)' : 'var(--border-light)',
                  backgroundColor: filter === tab ? 'var(--voltus-blue)' : 'var(--surface-card)',
                  color: filter === tab ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--t)'
                }}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        
        {filteredTickets.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 11 12 14 22 4" />
            </svg>
            <strong>No tickets found in this view</strong>
            <span>All inquiries have been addressed or no tickets match the current filter.</span>
          </div>
        ) : (
          <div className={styles.ticketList}>
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className={styles.ticketItem}>
                <div className={styles.ticketLeft}>
                  <div className={styles.ticketIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.ticketSubject}>{ticket.subject}</div>
                    <div className={styles.ticketDesc}>{ticket.description}</div>
                  </div>
                </div>
                <div className={styles.ticketMeta}>
                  <span className={`${styles.statusBadge} ${ticket.status === 'OPEN' ? styles.statusOpen : styles.statusResolved}`}>
                    {ticket.status}
                  </span>
                  <span className={styles.ticketDate}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--surface-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-modal)',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>Submit Support Ticket</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ fontSize: '18px', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Issue Subject
                </label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  placeholder="e.g. Inbound email parser webhook timed out"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Incident</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Description & Payload Details
                </label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={4}
                  placeholder="Provide context, error messages, or affected workflow IDs..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'vertical',
                    background: '#ffffff',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--surface-card)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnNew}
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
