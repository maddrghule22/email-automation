'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { name: 'Dashboard',           href: '/overview',              icon: '⊞' },
  { name: 'Email Automation',    href: '/workflows',             icon: '✉' },
  { name: 'Document Processing', href: '/documents',             icon: '📄' },
  { name: 'Approvals',           href: '/operations/exceptions', icon: '✓' },
  { name: 'Sent Emails',         href: '/integrations',          icon: '↑' },
  { name: 'Templates',           href: '/support',               icon: '⊡' },
];

const BOTTOM_ITEMS = [
  { name: 'Settings', href: '/customers', icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();

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

      {/* Promo card */}
      <div className={styles.promoCard}>
        <div className={styles.promoBadge}>✦</div>
        <p className={styles.promoTitle}>Smarter Emails.<br />Faster Business.</p>
        <p className={styles.promoSub}>Vorynex Automation Platform reads, understands, and responds — so you don't have to.</p>
      </div>

      {/* Bottom nav + user */}
      <div className={styles.sidebarBottom}>
        {BOTTOM_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            <span className={styles.navIcon}>{item.icon}</span>
            {item.name}
          </Link>
        ))}
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>YS</div>
          <div className={styles.sidebarUserInfo}>
            <p className={styles.sidebarUserName}>Yash Salunke</p>
            <p className={styles.sidebarUserRole}>Admin</p>
          </div>
          <span style={{ color: '#64748b', fontSize: 12 }}>⌄</span>
        </div>
      </div>
    </aside>
  );
}
