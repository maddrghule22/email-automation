'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid work email address.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!organizationName.trim()) {
        setError('Please specify your organization or workspace name.');
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    setError('');
    if (step > 1) {
      setStep((step - 1) as 1 | 2);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setStatusMessage('Provisioning isolated D1 Data Brick...');

    try {
      setTimeout(() => setStatusMessage('Configuring Level 4 Super Admin governance...'), 500);

      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          organizationName: organizationName.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to initialize workspace');
      }

      setStatusMessage('Initializing inbox & redirecting...');
      setTimeout(() => {
        router.push('/inbox');
      }, 400);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during setup');
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h1 className={styles.title} style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
          Workspace Onboarding
        </h1>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          Provision your dedicated multi-tenant Data Brick in 3 quick steps
        </p>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            fontSize: '11px',
            fontWeight: 700,
            background: step >= 1 ? '#2563eb' : '#1e293b',
            color: '#fff',
          }}>
            1
          </div>
          <div style={{ width: '28px', height: '2px', background: step >= 2 ? '#2563eb' : '#1e293b' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            fontSize: '11px',
            fontWeight: 700,
            background: step >= 2 ? '#2563eb' : '#1e293b',
            color: '#fff',
          }}>
            2
          </div>
          <div style={{ width: '28px', height: '2px', background: step >= 3 ? '#2563eb' : '#1e293b' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            fontSize: '11px',
            fontWeight: 700,
            background: step >= 3 ? '#2563eb' : '#1e293b',
            color: '#fff',
          }}>
            3
          </div>
        </div>
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

      {statusMessage && (
        <div style={{
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '12px',
          marginBottom: '1rem',
          textAlign: 'center',
          fontWeight: 500,
        }}>
          ⚡ {statusMessage}
        </div>
      )}

      <form className={styles.form} onSubmit={handleRegister}>
        {/* Step 1: Personal Essentials */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                placeholder="e.g. Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Work Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="alex.morgan@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="button"
              onClick={nextStep}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '0.5rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>Continue to Workspace Setup</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Step 2: Dedicated Data Brick Configuration */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="organizationName">Organization / Workspace Name</label>
              <input
                type="text"
                id="organizationName"
                placeholder="e.g. Nexus Logistics Global"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Architectural Role Specifier Preview */}
            <div style={{
              background: '#0d1527',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: 1.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>Default Creator Role:</span>
                <span style={{
                  background: 'rgba(124, 58, 237, 0.2)',
                  color: '#c084fc',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '10px',
                }}>
                  Level 4 • Power 100
                </span>
              </div>
              <div>• Signing Authority: <strong>$1,000,000+ USD</strong></div>
              <div>• D1 Data Brick: <strong>Isolated SQLite Edge Store</strong></div>
              <div>• Starter Automation: <strong>High-Priority Inbound Triage Rule</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={prevStep}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#94a3b8',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '35%',
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '65%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>Continue</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Security & Final Provisioning */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Create Workspace Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
              <button
                type="button"
                disabled={loading}
                onClick={prevStep}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#94a3b8',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '35%',
                }}
              >
                Back
              </button>
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
                  width: '65%',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {loading ? 'Initializing Brick...' : 'Launch Workspace'}
              </button>
            </div>
          </div>
        )}
      </form>

      <p className={styles.footerText} style={{ marginTop: '1.25rem' }}>
        Already have an active workspace?{' '}
        <Link href="/login" className={styles.link}>
          Sign in here
        </Link>
      </p>
    </>
  );
}
