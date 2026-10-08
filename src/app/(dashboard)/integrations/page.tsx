'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './integrations.module.css';

const DEFAULT_PROVIDERS = [
  {
    id: 'gmail',
    displayName: 'Google Workspace / Gmail',
    category: 'Email & Inbox',
    authMethod: 'OAuth 2.0',
    capabilities: ['Inbound Ingestion', 'Thread Tracking', 'Outbound Replies', 'Label Sync'],
  },
  {
    id: 'microsoft365',
    displayName: 'Microsoft 365 Exchange',
    category: 'Email & Inbox',
    authMethod: 'OAuth 2.0',
    capabilities: ['Exchange Web Services', 'Shared Mailboxes', 'Event Triggers', 'MIME Parsing'],
  },
  {
    id: 'erp-foundation',
    displayName: 'Enterprise ERP Connector',
    category: 'Finance & ERP',
    authMethod: 'API Key / Secret',
    capabilities: ['Invoice Export', 'Vendor Verification', 'PO Matching', 'GL Coding'],
  },
  {
    id: 'rest-connector',
    displayName: 'REST Webhook Gateway',
    category: 'Custom Systems',
    authMethod: 'HMAC / Bearer',
    capabilities: ['Webhook Ingestion', 'JSON Schema Validation', 'Bi-directional Sync'],
  },
  {
    id: 'sftp-storage',
    displayName: 'Secure SFTP / Network Storage',
    category: 'Document Storage',
    authMethod: 'SSH Keypair',
    capabilities: ['Automated Drop-folder', 'PDF Archival', 'Batch Polling'],
  },
];

export default function IntegrationHubPage() {
  const [data, setData] = useState<any>({ providers: [], connected: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/integrations')
      .then(res => res.json())
      .then(json => {
        const providers = json.data?.providers?.length > 0 ? json.data.providers : DEFAULT_PROVIDERS;
        setData({
          providers,
          connected: json.data?.connected || [],
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setData({ providers: DEFAULT_PROVIDERS, connected: [] });
        setLoading(false);
      });
  }, []);

  const catalog = data.providers?.length > 0 ? data.providers : DEFAULT_PROVIDERS;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Integration Hub</h1>
          <p className={styles.subtitle}>Connect external systems to your automation platform.</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Active Connections</h2>
        {data.connected.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="8" height="8" rx="2" />
                <rect x="14" y="2" width="8" height="8" rx="2" />
                <rect x="2" y="14" width="8" height="8" rx="2" />
                <path d="M18 14v4m-2-2h4" />
              </svg>
            </div>
            <strong>No active connections yet</strong>
            <span>Choose a provider from the catalog below to connect your mailbox or ERP system.</span>
          </div>
        ) : (
          <div className={styles.grid}>
            {data.connected.map((integration: any) => (
              <div key={integration.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{integration.name}</h3>
                  <span className={`${styles.badge} ${integration.status === 'CONNECTED' ? styles.badgeConnected : styles.badgeDisconnected}`}>
                    {integration.status}
                  </span>
                </div>
                <p className={styles.cardDesc}>Type: {integration.type}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.footerText}>
                    {integration.lastConnectedAt ? `Last active: ${new Date(integration.lastConnectedAt).toLocaleDateString()}` : 'Never connected'}
                  </span>
                  <Link href={`/integrations/${integration.id}`} className={styles.link}>
                    Manage &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Integration Catalog</h2>
        <div className={styles.grid}>
          {catalog.map((provider: any) => (
            <div key={provider.id} className={styles.card}>
              <div className={styles.iconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 className={styles.cardTitle}>{provider.displayName}</h3>
                <span className={styles.badgeCategory}>{provider.category}</span>
              </div>
              <p className={styles.cardDesc}>Secure authentication via {provider.authMethod}</p>
              
              <div className={styles.capabilities}>
                {provider.capabilities?.slice(0, 3).map((cap: string) => (
                  <span key={cap} className={styles.capBadge}>
                    {cap}
                  </span>
                ))}
                {(provider.capabilities?.length || 0) > 3 && (
                  <span className={styles.capBadge}>+{(provider.capabilities?.length || 0) - 3}</span>
                )}
              </div>

              <button 
                className={styles.button}
                onClick={() => {
                  if (provider.authMethod?.includes('OAuth')) {
                    window.location.href = `/api/v1/integrations/oauth/start?provider=${provider.id}&redirectUri=${encodeURIComponent(window.location.origin + '/api/v1/integrations/oauth/callback')}`;
                  } else {
                    alert('Connecting ' + provider.displayName + ' wizard. Configure credentials in your tenant settings.');
                  }
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                Connect Provider
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
