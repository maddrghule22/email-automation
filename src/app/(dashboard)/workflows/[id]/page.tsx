'use client';

export const runtime = 'edge';

import React, { useEffect, useState, use } from 'react';
import styles from './builder.module.css';

export default function WorkflowBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'BUILDER' | 'MONITOR'>('BUILDER');

  useEffect(() => {
    fetch(`/api/v1/workflows/${resolvedParams.id}`)
      .then(res => res.json())
      .then(json => {
        setWorkflow(json.data);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Builder...</div>;
  if (!workflow) return <div style={{ padding: '2rem' }}>Workflow not found</div>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{workflow.name} <span className={styles.versionBadge}>v{workflow.version}</span></h1>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'BUILDER' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('BUILDER')}
            >
              Visual Builder
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'MONITOR' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('MONITOR')}
            >
              Execution Monitor
            </button>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnSecondary}>Save Draft</button>
          <button className={styles.btnPrimary}>Publish Version</button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className={styles.mainArea}>
        
        {/* Left Palette */}
        {activeTab === 'BUILDER' && (
          <div className={styles.sidebarLeft}>
            <h3 className={styles.sectionTitle}>Triggers</h3>
            <NodeDraggable label="Event Trigger" iconType="zap" />
            <NodeDraggable label="Schedule" iconType="clock" />
            
            <h3 className={styles.sectionTitle}>Actions</h3>
            <NodeDraggable label="Create Transaction" iconType="credit-card" />
            <NodeDraggable label="Send Email" iconType="mail" />
            <NodeDraggable label="AI Extraction" iconType="cpu" />
            
            <h3 className={styles.sectionTitle}>Logic</h3>
            <NodeDraggable label="Condition Branch" iconType="git-branch" />
            <NodeDraggable label="Wait / Delay" iconType="hourglass" />
            <NodeDraggable label="Human Approval" iconType="user" />
          </div>
        )}

        {/* Center Canvas Workspace */}
        <div className={styles.workspace}>
          {activeTab === 'BUILDER' ? (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', color: '#9ca3af' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                  <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                  <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <h2 className={styles.placeholderTitle}>Visual Node Canvas</h2>
              <p className={styles.placeholderDesc}>Drag and drop nodes here to construct the workflow.</p>
            </div>
          ) : (
            <div className={styles.monitorContainer}>
              <h2 className={styles.monitorTitle}>Execution History</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Run ID</th>
                    <th className={styles.th}>Started</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mock execution logs */}
                  {workflow.runs?.map((run: any) => (
                    <tr key={run.id}>
                      <td className={styles.td} style={{ fontFamily: 'monospace', color: '#2563eb' }}>{run.id}</td>
                      <td className={styles.td}>{new Date(run.createdAt).toLocaleString()}</td>
                      <td className={styles.td}>
                        <span className={run.status === 'Succeeded' ? styles.badgeSucceeded : run.status === 'Failed' ? styles.badgeFailed : styles.badgePending}>
                          {run.status}
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>1.2s</td>
                    </tr>
                  ))}
                  {(!workflow.runs || workflow.runs.length === 0) && (
                    <tr>
                      <td colSpan={4} className={styles.td} style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}>
                        No executions yet. Publish your workflow to start running.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Configuration Panel */}
        {activeTab === 'BUILDER' && (
          <div className={styles.sidebarRight}>
            <h3 className={styles.sectionTitle}>Node Configuration</h3>
            <div className={styles.configPlaceholder}>
              Select a node on the canvas to configure variables, AI prompts, or business logic.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NodeDraggable({ label, iconType }: { label: string, iconType: string }) {
  const getIcon = () => {
    const props = { width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (iconType) {
      case 'zap': return <svg {...props} style={{ color: '#eab308' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
      case 'clock': return <svg {...props} style={{ color: '#8b5cf6' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
      case 'credit-card': return <svg {...props} style={{ color: '#10b981' }}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
      case 'mail': return <svg {...props} style={{ color: '#3b82f6' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
      case 'cpu': return <svg {...props} style={{ color: '#ec4899' }}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>;
      case 'git-branch': return <svg {...props} style={{ color: '#0ea5e9' }}><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>;
      case 'hourglass': return <svg {...props} style={{ color: '#f59e0b' }}><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>;
      case 'user': return <svg {...props} style={{ color: '#6366f1' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
      default: return null;
    }
  };

  return (
    <div className={styles.nodeDraggable}>
      <span className={styles.nodeIcon}>{getIcon()}</span>
      <span className={styles.nodeLabel}>{label}</span>
    </div>
  );
}
