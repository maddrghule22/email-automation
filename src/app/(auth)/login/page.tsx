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
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Invalid email or password.');
      }

      router.push('/inbox');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h1 className={styles.title} style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
          Sign In to Workspace
        </h1>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          Connect to your dedicated Cloudflare D1 Data Brick
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '12px',
          marginBottom: '1rem',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Work Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="alex.morgan@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
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
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '0.75rem',
            width: '100%',
            opacity: loading ? 0.7 : 1,
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Authenticating with D1...' : 'Sign In'}
        </button>
      </form>

      <p className={styles.footerText} style={{ marginTop: '1.5rem' }}>
        First time visiting?{' '}
        <Link href="/register" className={styles.link}>
          Create Dedicated Workspace
        </Link>
      </p>
    </>
  );
}
