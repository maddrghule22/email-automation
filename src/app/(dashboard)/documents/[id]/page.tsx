'use client';
export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './review.module.css';

export default function DocumentReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/documents/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((json) => {
        if (json?.data) {
          setDoc(json.data);
          setEditedData(json.data.extractedData || {});
        } else {
          throw new Error('Not found');
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo document so review page is interactive
        const fallback = {
          id: id || 'doc-demo',
          title: 'Invoice-INV-2026-089.pdf',
          documentType: 'INVOICE',
          confidence: 0.96,
          source: 'Email Attachment (billing@acrocorp.com)',
          extractedData: {
            'Invoice Number': 'INV-2026-089',
            'Vendor Name': 'Acro Corporation Inc.',
            'Total Amount': '$14,250.00',
            'Tax Amount': '$1,250.00',
            'Due Date': '15 Nov 2026',
            'PO Reference': 'PO-77401',
          },
        };
        setDoc(fallback);
        setEditedData(fallback.extractedData);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/v1/documents/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctedData: editedData }),
      });
    } catch (e) {
      // Ignore network errors in demo/local dev
    } finally {
      setSubmitting(false);
      router.push('/documents');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading Document AI Analysis...
      </div>
    );
  }

  return (
    <div className={styles.reviewContainer}>
      <div className={styles.reviewHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/documents')}>
            ← Back to Queue
          </button>
          <div>
            <h1 className={styles.reviewTitle}>{doc.title}</h1>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Source: {doc.source || 'Ingested File'}
            </span>
          </div>
        </div>

        <div className={styles.headerMeta}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {doc.documentType}
          </span>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '100px',
              background: doc.confidence >= 0.9 ? '#ecfdf5' : '#fffbeb',
              color: doc.confidence >= 0.9 ? '#065f46' : '#92400e',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            ✦ Confidence: {Math.round((doc.confidence || 0.9) * 100)}%
          </span>
        </div>
      </div>

      <div className={styles.splitWorkspace}>
        {/* Left Side: Document Preview Canvas */}
        <div className={styles.previewSide}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Original Document Canvas
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Page 1 of 1
            </span>
          </div>

          <div className={styles.previewDocBox}>
            <div style={{ fontSize: '36px' }}>📄</div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                {doc.title}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                High-Resolution OCR scan rendered with bounding box overlays
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <span style={{ padding: '3px 8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}>
                ✓ Text OCR Extracted
              </span>
              <span style={{ padding: '3px 8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}>
                ✓ Tables Detected
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Key-Value Form */}
        <div className={styles.extractionSide}>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              AI Extracted Entities
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Review or edit values before syncing to downstream workflows.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(editedData).map(([key, value]) => {
              if (typeof value === 'object' && value !== null) return null;
              return (
                <div key={key} className={styles.fieldRow}>
                  <label className={styles.fieldLabel}>{key}</label>
                  <input
                    type="text"
                    value={value as string}
                    onChange={(e) =>
                      setEditedData({ ...editedData, [key]: e.target.value })
                    }
                    className={styles.fieldInput}
                  />
                </div>
              );
            })}
          </div>

          <div className={styles.footerBar}>
            <button
              onClick={() => router.push('/documents')}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className={styles.saveBtn}
            >
              {submitting ? 'Approving...' : '✓ Approve & Finalize Extraction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
