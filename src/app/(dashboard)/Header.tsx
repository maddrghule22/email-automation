'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  { id: '3', text: '☁️ Cloudflare D1 synced: 10 tables ready', time: '1h ago', unread: false },
  { id: '4', text: '✅ Email automation workflow "Inbound RFP" triggered', time: '3h ago', unread: false },
];

export default function DashboardHeader() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const hasUnread = notifications.some((n) => n.unread);

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

  return (
    <header className={styles.header}>
      <div className={styles.headerGreeting}>
        <h1>Good Morning, Yash</h1>
        <p>Here&apos;s what&apos;s happening with your email automation today.</p>
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
            title="User Profile"
          >
            YS
          </div>

          {showUserMenu && (
            <div className={`${styles.popoverMenu} ${styles.userMenu}`}>
              <div className={styles.userMenuHeader}>
                <div className={styles.userName}>Yash Salunke</div>
                <div className={styles.userEmail}>yash@vorynex.com</div>
              </div>
              <Link href="/inbox" className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
                <span>📬</span> MailHive Inbox
              </Link>
              <Link href="/customers" className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
                <span>⚙️</span> Workspace Settings
              </Link>
              <Link href="/integrations" className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
                <span>🔗</span> Integrations &amp; API
              </Link>
              <button
                className={styles.userMenuItem}
                style={{ color: '#ef4444' }}
                onClick={() => {
                  setShowUserMenu(false);
                  alert('Signed out of Vorynex Automation');
                }}
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
