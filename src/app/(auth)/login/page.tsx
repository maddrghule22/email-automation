'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to login');
      }

      router.push('/overview'); // Redirect to main dashboard on success
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('admin123');
  };

  return (
    <>
      <h1 className={styles.title}>Sign in to your account</h1>
      
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* D1 Hierarchy Power Accounts Box */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '1.25rem',
        fontSize: '12px',
        color: '#1e40af',
      }}>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>
          Unified D1 Database — Select Role &amp; Data Brick:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          <button
            type="button"
            onClick={() => fillCredentials('admin@vorynex.com')}
            style={{
              padding: '6px 8px',
              backgroundColor: '#7c3aed',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            ⚡ Level 4: Super Admin
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('sarah.ops@vorynex.com')}
            style={{
              padding: '6px 8px',
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            🛡️ Level 3: Ops Manager
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('alex.dev@vorynex.com')}
            style={{
              padding: '6px 8px',
              backgroundColor: '#059669',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            ⚙️ Level 2: Operator
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('david.audit@vorynex.com')}
            style={{
              padding: '6px 8px',
              backgroundColor: '#d97706',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            👁️ Level 1: Auditor
          </button>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="admin@vorynex.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        
        <Link href="/forgot-password" className={styles.link}>
          Forgot password?
        </Link>
        
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            backgroundColor: '#2563eb', 
            color: 'white', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: 'none', 
            fontWeight: 600, 
            cursor: 'pointer', 
            marginTop: '1rem',
            width: '100%',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Authenticating with D1...' : 'Sign In'}
        </button>
      </form>
      
      <p className={styles.footerText}>
        Don&apos;t have an account?{' '}
        <Link href="/register" className={styles.link}>
          Request Access
        </Link>
      </p>
    </>
  );
}
