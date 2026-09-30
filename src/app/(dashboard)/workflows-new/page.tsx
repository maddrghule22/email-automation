'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './new-workflow.module.css';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/integrations')
      .then(res => res.json())
      .then(json => {
        setIntegrations(json.data?.connected || []);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };

    try {
      const res = await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create workflow');
      
      router.push(`/workflows/${json.data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/workflows" className={styles.backLink}>
        &larr; Back to Workflows
      </Link>
      
      <h1 className={styles.title}>Create Automation Rule</h1>
      <p className={styles.subtitle}>Define how incoming data should be processed and routed.</p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="name">Workflow Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            className={styles.input} 
            placeholder="e.g. Invoice Processor" 
            required 
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="description">Description (Optional)</label>
          <input 
            type="text" 
            id="description" 
            name="description" 
            className={styles.input} 
            placeholder="Extracts data from vendor emails and sends to ERP" 
          />
        </div>

        <div className={styles.divider} />

        <h2 className={styles.sectionTitle}>Rule Builder</h2>
        
        <div className={styles.stepRow}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <label className={styles.label}>When this happens...</label>
            <select className={styles.select} required defaultValue="">
              <option value="" disabled>Select a trigger event</option>
              {integrations.map(int => (
                <option key={int.id} value={int.id}>New email received in {int.name}</option>
              ))}
              <option value="api">Webhook / API Request received</option>
            </select>
          </div>
        </div>

        <div className={styles.stepRow}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <label className={styles.label}>If these conditions are met...</label>
            <select className={styles.select} required defaultValue="">
              <option value="" disabled>Select a condition</option>
              <option value="attachment">Email has a PDF attachment</option>
              <option value="subject">Subject contains specific keywords</option>
              <option value="all">Always run (No conditions)</option>
            </select>
          </div>
        </div>

        <div className={styles.stepRow}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <label className={styles.label}>Then do this...</label>
            <select className={styles.select} required defaultValue="">
              <option value="" disabled>Select an action</option>
              <option value="ai_extract">Use Document AI to extract data</option>
              <option value="auto_reply">Send automated email reply</option>
              <option value="webhook">Forward payload to URL</option>
            </select>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Saving...' : 'Create Workflow'}
        </button>
      </form>
    </div>
  );
}
