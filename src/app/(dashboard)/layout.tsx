import React from 'react';
import Sidebar from './Sidebar';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerGreeting}>
            <h1>Good Morning, Yash 👋</h1>
            <p>Here&apos;s what&apos;s happening with your email automation today.</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input type="text" placeholder="Search emails, documents, or actions..." />
            </div>
            <button className={styles.headerBtn}>
              🔔
              <span className={styles.notifDot} />
            </button>
            <div className={styles.avatar}>YS</div>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
