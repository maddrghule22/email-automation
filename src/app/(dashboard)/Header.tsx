'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './layout.module.css';

interface Notification {
  id: string;
  text: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', text: '⚡ AI Reply auto-generated for info@client.com', time: '5m ago', unread: true },
  { id: '2', text: '📄 Project_Requirements.pdf processed (92% confidence)', time: '18m ago', unread: true },
  { id: '3', text: '☁️ Cloudflare D1 synced: 13 tables & 4 databricks ready', time: '1h ago', unread: false },
  { id: '4', text: '✅ Email automation workflow "Inbound RFP" triggered', time: '3h ago', unread: false },
];

export default function DashboardHeader() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Yash Salunke', email: 'admin@vorynex.com' });
  const [currentRole, setCurrentRole] = useState<any>({ name: 'Super Admin', tier: 4, badge: '⚡ Level 4: Super Admin', badgeColor: '#7c3aed' });
  const [activeBrick, setActiveBrick] = useState<any>({ name: 'Vorynex Global Enterprise' });
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const hasUnread = notifications.some((n) => n.unread);

  const loadUserData = () => {
    fetch('/api/v1/auth/me')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          if (json.data.user) setCurrentUser(json.data.user);
          if (json.data.role) setCurrentRole(json.data.role);
          if (json.data.databrick) setActiveBrick(json.data.databrick);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleSwitchUser = async (email: string) => {
    try {
      await fetch('/api/v1/auth/switch-brick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setShowUserMenu(false);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'YS';

  return (
    <header className={styles.header}>
      <div className={styles.headerGreeting}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ margin: 0 }}>Good Morning, {currentUser.name?.split(' ')[0] || 'Yash'}</h1>
          <span style={{
            backgroundColor: currentRole?.badgeColor || '#7c3aed',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            letterSpacing: '0.2px'
          }}>
            {currentRole?.badge || '⚡ Level 4: Super Admin'}
          </span>
        </div>
        <p style={{ marginTop: '2px' }}>
          Unified Database Brick: <strong style={{ color: 'var(--voltus-blue)' }}>{activeBrick?.name || 'Vorynex Global Enterprise'}</strong>
        </p>
      </div>

      <div className={styles.headerRight}>
        {/* Interactive Search Bar */}
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search emails, documents, or actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, padding: 0 }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Notifications Popover */}
        <div className={styles.relativeWrap} ref={notifRef}>
          <button
            className={styles.headerBtn}
            aria-label="Notifications"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {hasUnread && <span className={styles.notifDot} />}
          </button>

          {showNotifs && (
            <div className={styles.popoverMenu}>
              <div className={styles.popoverHeader}>
                <span className={styles.popoverTitle}>Automation Alerts</span>
                {hasUnread && (
                  <button className={styles.popoverAction} onClick={markAllRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className={styles.popoverList}>
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    className={styles.popoverItem}
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                      );
                    }}
                  >
                    <span className={styles.popoverItemText} style={{ fontWeight: n.unread ? 600 : 400 }}>
                      {n.text}
                    </span>
                    <span className={styles.popoverItemTime}>{n.time}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Menu */}
        <div className={styles.relativeWrap} ref={userMenuRef}>
          <div
            className={styles.avatar}
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="User Profile & Hierarchy Settings"
            style={{ backgroundColor: currentRole?.badgeColor || '#7c3aed' }}
          >
            {initials}
          </div>

          {showUserMenu && (
            <div className={`${styles.popoverMenu} ${styles.userMenu}`} style={{ width: '280px' }}>
              <div className={styles.userMenuHeader}>
                <div className={styles.userName}>{currentUser.name}</div>
                <div className={styles.userEmail}>{currentUser.email}</div>
                <div style={{
                  marginTop: '6px',
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: currentRole?.badgeColor || '#7c3aed',
                  backgroundColor: '#f5f3ff',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {currentRole?.badge}
                </div>
              </div>

              {/* Data Brick & Hierarchy Switcher */}
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)', backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  SWITCH DATA BRICK &amp; ROLE:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    onClick={() => handleSwitchUser('admin@vorynex.com')}
                    style={{
                      textAlign: 'left',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      border: 'none',
                      background: currentUser.email === 'admin@vorynex.com' ? '#ede9fe' : 'none',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontWeight: currentUser.email === 'admin@vorynex.com' ? 700 : 400
                    }}
                  >
                    ⚡ Yash Salunke (Super Admin)
                  </button>
                  <button
                    onClick={() => handleSwitchUser('sarah.ops@vorynex.com')}
                    style={{
                      textAlign: 'left',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      border: 'none',
                      background: currentUser.email === 'sarah.ops@vorynex.com' ? '#dbeafe' : 'none',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontWeight: currentUser.email === 'sarah.ops@vorynex.com' ? 700 : 400
                    }}
                  >
                    🛡️ Sarah Jenkins (Ops Manager)
                  </button>
                  <button
                    onClick={() => handleSwitchUser('alex.dev@vorynex.com')}
                    style={{
                      textAlign: 'left',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      border: 'none',
                      background: currentUser.email === 'alex.dev@vorynex.com' ? '#d1fae5' : 'none',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontWeight: currentUser.email === 'alex.dev@vorynex.com' ? 700 : 400
                    }}
                  >
                    ⚙️ Alex Chen (Operator)
                  </button>
                  <button
                    onClick={() => handleSwitchUser('david.audit@vorynex.com')}
                    style={{
                      textAlign: 'left',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      border: 'none',
                      background: currentUser.email === 'david.audit@vorynex.com' ? '#fef3c7' : 'none',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontWeight: currentUser.email === 'david.audit@vorynex.com' ? 700 : 400
                    }}
                  >
                    👁️ David Vance (Auditor)
                  </button>
                </div>
              </div>

              <Link href="/inbox" className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
                <span>📬</span> MailHive Inbox
              </Link>
              <Link href="/exceptions" className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
                <span>🛡️</span> Operations Control &amp; Approvals
              </Link>
              <Link href="/workflows" className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
                <span>⚡</span> Automation Engine
              </Link>
              <Link href="/integrations" className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
                <span>🔗</span> Integrations &amp; Gateways
              </Link>
              <Link href="/customers" className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
                <span>⚙️</span> Tenant &amp; Security Settings
              </Link>
              <button
                className={styles.userMenuItem}
                style={{ color: '#ef4444' }}
                onClick={handleSignOut}
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
