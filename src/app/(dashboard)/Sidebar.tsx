'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'MailHive Inbox',
    href: '/inbox',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
  {
    name: 'Dashboard',
    href: '/overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    name: 'Email Automation',
    href: '/workflows',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    name: 'Document Processing',
    href: '/documents',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    name: 'Invoices & Ledger',
    href: '/invoices',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    name: 'Approvals',
    href: '/exceptions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    name: 'Integrations',
    href: '/integrations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="8" height="8" rx="2" />
        <rect x="14" y="2" width="8" height="8" rx="2" />
        <rect x="2" y="14" width="8" height="8" rx="2" />
        <path d="M18 14v4m-2-2h4" />
      </svg>
    ),
  },
  {
    name: 'Support',
    href: '/support',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    name: 'Settings',
    href: '/customers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string; initials: string; color: string }>({
    name: 'Yash Salunke',
    role: 'Super Admin',
    initials: 'YS',
    color: '#7c3aed',
  });

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.user) {
          const u = json.data.user;
          const r = json.data.role;
          const initials = u.name
            ? u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
            : 'YS';
          setUser({
            name: u.name,
            role: r?.name || 'Admin',
            initials,
            color: r?.badgeColor || '#7c3aed',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoWrap}>
        <div className={styles.logoIcon}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 5L14 22L24 5H19L14 14L9 5H4Z" fill="url(#vGrad)" />
            <path d="M19 5L14 14L17 19L26 5H19Z" fill="url(#vGrad2)" opacity="0.8"/>
            <defs>
              <linearGradient id="vGrad" x1="4" y1="5" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa"/>
                <stop offset="1" stopColor="#2563eb"/>
              </linearGradient>
              <linearGradient id="vGrad2" x1="14" y1="5" x2="26" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#93c5fd"/>
                <stop offset="1" stopColor="#1d4ed8"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <div className={styles.logoName}>Vorynex</div>
          <div className={styles.logoSub}>Automation Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav + user */}
      <div className={styles.sidebarBottom}>
        {BOTTOM_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            <span className={styles.navIcon}>{item.icon}</span>
            {item.name}
          </Link>
        ))}
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar} style={{ backgroundColor: user.color }}>{user.initials}</div>
          <div className={styles.sidebarUserInfo}>
            <p className={styles.sidebarUserName}>{user.name}</p>
            <p className={styles.sidebarUserRole}>{user.role}</p>
          </div>
          <span style={{ color: '#64748b', fontSize: 12 }}>⌄</span>
        </div>
      </div>
    </aside>
  );
}
