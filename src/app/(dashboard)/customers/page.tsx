'use client';

import React from 'react';
import styles from './customers.module.css';

export default function PlatformSettingsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tenant & Platform Settings</h1>
          <p className={styles.subtitle}>Configure organization metadata, security keys, and global automation policies.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Organization Profile</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.row}>
            <span className={styles.label}>Tenant Name</span>
            <span className={styles.value}>Vorynex Technologies Global</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Subscription Tier</span>
            <div><span className={styles.badge}>Enterprise Dedicated</span></div>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Primary Administrator</span>
            <span className={styles.value}>Yash Salunke (Admin)</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Cloud Region</span>
            <span className={styles.value}>Cloudflare Edge + Mumbai (ap-south-1)</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Automation Engine Policies</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.row}>
            <span className={styles.label}>AI Extraction Model</span>
            <span className={styles.value}>Gemini 1.5 Pro / Flash Fallback</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Auto-Approval Confidence Threshold</span>
            <span className={styles.value}>95% Confidence (Higher requires human review)</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Audit Log Retention</span>
            <span className={styles.value}>365 Days (Compliant with SOC2 / ISO 27001)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
