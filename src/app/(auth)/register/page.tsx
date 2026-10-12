'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('userName') as string;
    const organizationName = formData.get('organizationName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, organizationName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to register');
      }

      router.push('/overview'); // Redirect directly to overview dashboard
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className={styles.title}>Create Enterprise Account</h1>
      
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

      <form className={styles.form} onSubmit={handleRegister}>
        <div className={styles.inputGroup}>
          <label htmlFor="userName">Full Name</label>
          <input type="text" id="userName" name="userName" placeholder="John Doe" required />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="organizationName">Organization Name</label>
          <input type="text" id="organizationName" name="organizationName" placeholder="Acme Corp" required />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="email">Work Email</label>
          <input type="email" id="email" name="email" placeholder="admin@acme.com" required />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password (min 8 chars, 1 number, 1 symbol)</label>
          <input type="password" id="password" name="password" placeholder="••••••••" required />
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
            cursor: 'pointer', 
            marginTop: '1rem',
            width: '100%',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Creating Workspace...' : 'Create Account'}
        </button>
      </form>
      
      <p className={styles.footerText}>
        Already have an account?{' '}
        <Link href="/login" className={styles.link}>
          Sign in here
        </Link>
      </p>
    </>
  );
}
