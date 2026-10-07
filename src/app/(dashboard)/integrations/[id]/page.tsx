'use client';
export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './manage.module.css';

import { use } from 'react';

export default function ManageIntegrationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/v1/integrations/${resolvedParams.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => {
        setIntegration(json.data);
        setLoading(false);
      })
      .catch(err => {
        router.push('/integrations');
      });
  }, [resolvedParams.id, router]);

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;
    
    try {
      await fetch(`/api/v1/integrations/${resolvedParams.id}`, { method: 'DELETE' });
      router.push('/integrations');
    } catch (err) {
      alert('Failed to disconnect');
    }
  };

  if (loading) return <div className={styles.container}>Loading integration details...</div>;
  if (!integration) return null;

  return (
    <div className={styles.container}>
      <Link href="/integrations" className={styles.backLink}>
        &larr; Back to Integrations
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{integration.name}</h1>
          <p className={styles.subtitle}>Manage your {integration.type} connection</p>
        </div>
        <span className={`${styles.badge} ${integration.status === 'CONNECTED' ? styles.badgeConnected : styles.badgeDisconnected}`}>
          {integration.status}
        </span>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Connection Details</h2>
        <div className={styles.detailRow}>
          <div className={styles.detailLabel}>Provider</div>
          <div className={styles.detailValue}>{integration.provider}</div>
        </div>
        <div className={styles.detailRow}>
          <div className={styles.detailLabel}>Connected On</div>
          <div className={styles.detailValue}>{new Date(integration.createdAt).toLocaleString()}</div>
        </div>
        <div className={styles.detailRow}>
          <div className={styles.detailLabel}>Last Sync</div>
          <div className={styles.detailValue}>
            {integration.lastConnectedAt ? new Date(integration.lastConnectedAt).toLocaleString() : 'Never'}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Capabilities</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {integration.capabilities.map((cap: string) => (
            <span key={cap} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '0.75rem', color: '#4b5563' }}>
              {cap}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h2 className={styles.dangerTitle}>Danger Zone</h2>
        <p className={styles.dangerDesc}>
          Disconnecting this integration will immediately stop all data syncing and automation workflows relying on it.
        </p>
        <button onClick={handleDisconnect} className={styles.deleteButton}>
          Disconnect Integration
        </button>
      </div>
    </div>
  );
}
