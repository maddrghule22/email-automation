import React from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './Header';
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
        <DashboardHeader />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
