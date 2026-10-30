import React from 'react';
import Link from 'next/link';
import styles from './auth.module.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authLayout}>
      <div className={styles.authCard}>
        <div className={styles.logo}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #2563eb, #0284c7)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
            }}>
              M
            </span>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>
              MailHive <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, border: '1px solid #334155', padding: '1px 5px', borderRadius: '4px' }}>ENTERPRISE</span>
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
