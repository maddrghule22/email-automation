'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './documents.module.css';

interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
}

interface DocItem {
  id: string;
  title: string;
  fileName: string;
  source: string;
  fileSize: string;
  documentType: 'INVOICE' | 'PURCHASE_ORDER' | 'REQUIREMENTS' | 'TAX_FORM' | 'CONTRACT' | 'RECEIPT';
  status: 'COMPLETED' | 'REVIEW_REQUIRED' | 'PROCESSING' | 'FAILED';
  confidence: number;
  createdAt: string;
  extractedFields: Record<string, ExtractedField>;
  validationRules: { rule: string; passed: boolean }[];
  anomalies?: string;
  ocrSnippet: string;
}

const INITIAL_DOCUMENTS: DocItem[] = [
  {
    id: 'doc-001',
    title: 'Project_Requirements.pdf',
    fileName: 'Project_Requirements.pdf',
    source: 'Email Attachment (info@client.com)',
    fileSize: '2.4 MB',
    documentType: 'REQUIREMENTS',
    status: 'COMPLETED',
    confidence: 0.94,
    createdAt: 'Today, 10:24 AM',
    extractedFields: {
      clientName: { label: 'Client Name', value: 'ABC Technologies', confidence: 0.99 },
      projectName: { label: 'Project Name', value: 'Website Redesign & AI Portal', confidence: 0.97 },
      budget: { label: 'Estimated Budget', value: '₹ 2,50,000', confidence: 0.92 },
      deadline: { label: 'Delivery Deadline', value: '30 Oct 2026', confidence: 0.95 },
      scopeItems: { label: 'Key Deliverables', value: 'UI/UX Design, Responsive Frontend, Document AI Integration', confidence: 0.89 },
    },
    validationRules: [
      { rule: 'Mandatory Deliverables Identified', passed: true },
      { rule: 'Budget Format Recognized', passed: true },
      { rule: 'Client Verified in Directory', passed: true },
    ],
    ocrSnippet: 'PROJECT PROPOSAL & SCOPE OF WORK - ABC Technologies hereby requests proposal for modern automation portal...',
  },
  {
    id: 'doc-002',
    title: 'Invoice-INV-2026-089.pdf',
    fileName: 'Invoice-INV-2026-089.pdf',
    source: 'Email Attachment (billing@acrocorp.com)',
    fileSize: '1.2 MB',
    documentType: 'INVOICE',
    status: 'COMPLETED',
    confidence: 0.96,
    createdAt: 'Today, 09:40 AM',
    extractedFields: {
      invoiceNumber: { label: 'Invoice #', value: 'INV-2026-089', confidence: 0.99 },
      vendorName: { label: 'Vendor Name', value: 'Acro Corporation Inc.', confidence: 0.98 },
      totalAmount: { label: 'Total Amount', value: '$14,250.00', confidence: 0.96 },
      dueDate: { label: 'Due Date', value: '15 Nov 2026', confidence: 0.94 },
      taxAmount: { label: 'Tax (GST / VAT)', value: '$1,250.00', confidence: 0.95 },
      poRef: { label: 'PO Reference', value: 'PO-77401', confidence: 0.93 },
    },
    validationRules: [
      { rule: 'Math Check: Subtotal + Tax = Total', passed: true },
      { rule: 'Vendor Bank Info Validated', passed: true },
      { rule: 'Duplicate Invoice Check Passed', passed: true },
    ],
    ocrSnippet: 'INVOICE: INV-2026-089 | DATE: 24/09/2026 | VENDOR: Acro Corp | TOTAL DUE: $14,250.00',
  },
  {
    id: 'doc-003',
    title: 'PO_OmniLogistics_98441.pdf',
    fileName: 'PO_OmniLogistics_98441.pdf',
    source: 'API Ingestion (ERP Sync)',
    fileSize: '840 KB',
    documentType: 'PURCHASE_ORDER',
    status: 'COMPLETED',
    confidence: 0.93,
    createdAt: 'Today, 08:15 AM',
    extractedFields: {
      poNumber: { label: 'PO Number', value: 'PO-98441', confidence: 0.98 },
      vendorName: { label: 'Vendor Name', value: 'Omni Logistics Ltd.', confidence: 0.95 },
      totalAmount: { label: 'Total Value', value: '$8,400.00', confidence: 0.92 },
      deliveryDate: { label: 'Delivery Date', value: '05 Nov 2026', confidence: 0.94 },
      shippingAddress: { label: 'Destination', value: 'Warehouse B, Sector 4, Mumbai', confidence: 0.91 },
    },
    validationRules: [
      { rule: 'Authorized Signatory Verified', passed: true },
      { rule: 'Line Items Match Catalog Pricing', passed: true },
    ],
    ocrSnippet: 'PURCHASE ORDER: PO-98441 | Omni Logistics Ltd | Total Authorized: $8,400.00',
  },
  {
    id: 'doc-004',
    title: 'Apex_Systems_Bill_4402.pdf',
    fileName: 'Apex_Systems_Bill_4402.pdf',
    source: 'Direct Upload (User: Yash)',
    fileSize: '620 KB',
    documentType: 'INVOICE',
    status: 'REVIEW_REQUIRED',
    confidence: 0.74,
    createdAt: 'Yesterday, 04:30 PM',
    extractedFields: {
      invoiceNumber: { label: 'Invoice #', value: 'BILL-4402', confidence: 0.88 },
      vendorName: { label: 'Vendor Name', value: 'Apex Systems Solutions', confidence: 0.90 },
      totalAmount: { label: 'Total Amount', value: '$3,800.00', confidence: 0.72 },
      dueDate: { label: 'Due Date', value: '01 Oct 2026', confidence: 0.65 },
      discrepancyNote: { label: 'Flag Reason', value: 'Unit price differs from Purchase Order #3312 by +12%', confidence: 0.92 },
    },
    validationRules: [
      { rule: 'Math Check: Subtotal + Tax = Total', passed: true },
      { rule: 'PO Match Rate', passed: false },
      { rule: 'Vendor Whitelist Check', passed: true },
    ],
    anomalies: 'Unit price ($380/hr) exceeds pre-approved rate card ($340/hr). Human sign-off required.',
    ocrSnippet: 'BILLING STATEMENT #4402 | Apex Systems Solutions | 10 Hours Consulting @ $380/hr = $3,800.00',
  },
  {
    id: 'doc-005',
    title: 'FinEdge_W9_Tax_Form.pdf',
    fileName: 'FinEdge_W9_Tax_Form.pdf',
    source: 'Email Attachment (documents@finance.com)',
    fileSize: '1.8 MB',
    documentType: 'TAX_FORM',
    status: 'COMPLETED',
    confidence: 0.98,
    createdAt: 'Yesterday, 02:15 PM',
    extractedFields: {
      entityName: { label: 'Entity Name', value: 'FinEdge Advisory Partners LLC', confidence: 0.99 },
      einNumber: { label: 'Tax ID (EIN)', value: 'XX-XXX4910', confidence: 0.98 },
      taxClassification: { label: 'Classification', value: 'C Corporation', confidence: 0.97 },
      certificationDate: { label: 'Sign Date', value: '18 Sep 2026', confidence: 0.99 },
    },
    validationRules: [
      { rule: 'TIN / EIN Format Validated', passed: true },
      { rule: 'Digital Signature Verified', passed: true },
    ],
    ocrSnippet: 'Department of the Treasury Internal Revenue Service Form W-9: FinEdge Advisory Partners LLC...',
  },
  {
    id: 'doc-006',
    title: 'CloudScale_Contractor_Agreement.pdf',
    fileName: 'CloudScale_Contractor_Agreement.pdf',
    source: 'Email Attachment (legal@cloudscale.io)',
    fileSize: '3.1 MB',
    documentType: 'CONTRACT',
    status: 'REVIEW_REQUIRED',
    confidence: 0.68,
    createdAt: '22 Sep, 11:10 AM',
    extractedFields: {
      contractor: { label: 'Party B', value: 'CloudScale Dev Team', confidence: 0.85 },
      effectiveDate: { label: 'Effective Date', value: '01 Nov 2026', confidence: 0.75 },
      indemnityClause: { label: 'Liability Cap', value: '$100,000.00', confidence: 0.62 },
      missingSignatures: { label: 'Signatures Detected', value: '1 of 2 (Counterparty Missing)', confidence: 0.94 },
    },
    validationRules: [
      { rule: 'Both Parties Identified', passed: true },
      { rule: 'Standard NDA Clause Found', passed: true },
      { rule: 'Full Signatures Execution Check', passed: false },
    ],
    anomalies: 'Counterparty signature block on page 8 is unsigned.',
    ocrSnippet: 'MASTER SERVICES AGREEMENT between Vorynex Technologies and CloudScale Dev Team...',
  },
  {
    id: 'doc-007',
    title: 'Freight_Waybill_9021.pdf',
    fileName: 'Freight_Waybill_9021.pdf',
    source: 'API Ingestion (CargoHub)',
    fileSize: '512 KB',
    documentType: 'PURCHASE_ORDER',
    status: 'PROCESSING',
    confidence: 0.91,
    createdAt: 'Today, 11:05 AM',
    extractedFields: {
      trackingNumber: { label: 'Air Waybill #', value: 'AWB-774-90219', confidence: 0.94 },
      carrier: { label: 'Carrier', value: 'Global Freight Express', confidence: 0.96 },
      weight: { label: 'Gross Weight', value: '142.5 KG', confidence: 0.89 },
    },
    validationRules: [
      { rule: 'Barcode / QR Decoded', passed: true },
      { rule: 'Customs Clearance Code Validated', passed: true },
    ],
    ocrSnippet: 'AIR WAYBILL - GLOBAL FREIGHT EXPRESS - TRACKING: AWB-774-90219...',
  },
  {
    id: 'doc-008',
    title: 'Store_Receipt_Scan_3310.png',
    fileName: 'Store_Receipt_Scan_3310.png',
    source: 'Direct Upload (Mobile App)',
    fileSize: '390 KB',
    documentType: 'RECEIPT',
    status: 'FAILED',
    confidence: 0.42,
    createdAt: '21 Sep, 05:45 PM',
    extractedFields: {
      merchant: { label: 'Merchant', value: 'OfficeSupply Depot [Uncertain]', confidence: 0.45 },
      total: { label: 'Total', value: '$420.50 [Ambiguous]', confidence: 0.38 },
    },
    validationRules: [
      { rule: 'Image Resolution Check (>300 DPI)', passed: false },
      { rule: 'Text Legibility Score', passed: false },
    ],
    anomalies: 'Low contrast image scan. OCR engine could not resolve itemized line items with >50% confidence.',
    ocrSnippet: 'OFF..E DEP.. #3310 ... SUB.. 380.00 .. TAX 40.50 .. TOTAL 420.50',
  },
];

export default function DocumentWorkspacePage() {
  const [documents, setDocuments] = useState<DocItem[]>(INITIAL_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>(INITIAL_DOCUMENTS[0].id);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<number>(0);
  const [uploadedFileName, setUploadedFileName] = useState('Vendor_Invoice_Q4.pdf');

  // Try to blend with real API if server responds with valid documents
  useEffect(() => {
    fetch('/api/v1/documents')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((json) => {
        if (json?.data?.data && Array.isArray(json.data.data) && json.data.data.length > 0) {
          // If real database docs exist, map and prepend them
          const remoteDocs: DocItem[] = json.data.data.map((d: any) => ({
            id: d.id,
            title: d.title || 'Document.pdf',
            fileName: d.title || 'Document.pdf',
            source: d.source || 'Ingested API',
            fileSize: '1.5 MB',
            documentType: (d.documentType as any) || 'INVOICE',
            status: (d.status as any) || 'COMPLETED',
            confidence: d.confidence || 0.92,
            createdAt: new Date(d.createdAt).toLocaleDateString(),
            extractedFields: {
              title: { label: 'Document Name', value: d.title, confidence: 0.95 },
              type: { label: 'Type', value: d.documentType || 'General', confidence: 0.92 },
            },
            validationRules: [{ rule: 'Automated Extraction Completed', passed: true }],
            ocrSnippet: `Ingested document: ${d.title}`,
          }));
          setDocuments((prev) => [...remoteDocs, ...prev]);
        }
      })
      .catch(() => {
        // Fall back gracefully to INITIAL_DOCUMENTS
      });
  }, []);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  // Filter calculations
  const filteredDocs = documents.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || d.documentType === typeFilter;
    const matchesSearch =
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(d.extractedFields).some((f) =>
        f.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: documents.length,
    review: documents.filter((d) => d.status === 'REVIEW_REQUIRED').length,
    processing: documents.filter((d) => d.status === 'PROCESSING').length,
    completed: documents.filter((d) => d.status === 'COMPLETED').length,
    failed: documents.filter((d) => d.status === 'FAILED').length,
  };

  const handleQuickApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              status: 'COMPLETED',
              anomalies: undefined,
              validationRules: doc.validationRules.map((r) => ({ ...r, passed: true })),
            }
          : doc
      )
    );
  };

  const handleUpdateFieldValue = (fieldKey: string, newValue: string) => {
    if (!selectedDoc) return;
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === selectedDoc.id) {
          return {
            ...doc,
            extractedFields: {
              ...doc.extractedFields,
              [fieldKey]: {
                ...doc.extractedFields[fieldKey],
                value: newValue,
              },
            },
          };
        }
        return doc;
      })
    );
  };

  const handleApproveInspection = () => {
    if (!selectedDoc) return;
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedDoc.id
          ? {
              ...doc,
              status: 'COMPLETED',
              confidence: Math.max(doc.confidence, 0.95),
              anomalies: undefined,
              validationRules: doc.validationRules.map((r) => ({ ...r, passed: true })),
            }
          : doc
      )
    );
  };

  const handleSimulateUpload = () => {
    setUploadStep(1);
    const interval = setInterval(() => {
      setUploadStep((step) => {
        if (step >= 5) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc: DocItem = {
              id: `doc-${Date.now().toString().slice(-4)}`,
              title: uploadedFileName,
              fileName: uploadedFileName,
              source: 'Direct Upload (AI Ingestion)',
              fileSize: '1.9 MB',
              documentType: 'INVOICE',
              status: 'COMPLETED',
              confidence: 0.97,
              createdAt: 'Just now',
              extractedFields: {
                invoiceNumber: { label: 'Invoice #', value: 'INV-2026-904', confidence: 0.99 },
                vendorName: { label: 'Vendor Name', value: 'Vorynex Global Solutions', confidence: 0.98 },
                totalAmount: { label: 'Total Amount', value: '$22,500.00', confidence: 0.97 },
                dueDate: { label: 'Due Date', value: '28 Nov 2026', confidence: 0.95 },
                taxAmount: { label: 'Tax Total', value: '$2,025.00', confidence: 0.96 },
              },
              validationRules: [
                { rule: 'Math Check: Subtotal + Tax = Total', passed: true },
                { rule: 'Entity Whitelist Match', passed: true },
                { rule: 'High-Confidence Extraction', passed: true },
              ],
              ocrSnippet: `INVOICE #INV-2026-904 | Vorynex Global Solutions | Amount Due: $22,500.00`,
            };
            setDocuments((prev) => [newDoc, ...prev]);
            setSelectedDocId(newDoc.id);
            setIsUploadOpen(false);
            setUploadStep(0);
          }, 600);
          return 5;
        }
        return step + 1;
      });
    }, 600);
  };

  return (
    <div className={styles.container}>
      {/* ── Page Header ───────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Document AI Workspace</h1>
          <p className={styles.subtitle}>
            Intelligent OCR, auto-classification, key-value extraction, and multi-tier validation.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => setSearchQuery('')}>
            ↻ Refresh Queue
          </button>
          <button className={styles.uploadBtn} onClick={() => setIsUploadOpen(true)}>
            <span>+</span> Upload Document
          </button>
        </div>
      </div>

      {/* ── 5 Uniform Stat Cards ────────────────── */}
      <div className={styles.statsGrid}>
        <div
          className={`${styles.statCard} ${statusFilter === 'ALL' ? styles.statCardActive : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          <div className={styles.statTop}>
            <span className={styles.statTitle}>Total Queue</span>
            <div className={styles.statIconWrap} style={{ background: '#eff6ff', color: '#2563eb' }}>
              📋
            </div>
          </div>
          <div className={styles.statCount}>{stats.total}</div>
          <span className={styles.statSub}>All ingested files</span>
        </div>

        <div
          className={`${styles.statCard} ${statusFilter === 'REVIEW_REQUIRED' ? styles.statCardActive : ''}`}
          onClick={() => setStatusFilter('REVIEW_REQUIRED')}
        >
          <div className={styles.statTop}>
            <span className={styles.statTitle}>Needs Review</span>
            <div className={styles.statIconWrap} style={{ background: '#fffbeb', color: '#d97706' }}>
              ⏱
            </div>
          </div>
          <div className={styles.statCount} style={{ color: '#d97706' }}>
            {stats.review}
          </div>
          <span className={styles.statSub}>Anomalies / flags</span>
        </div>

        <div
          className={`${styles.statCard} ${statusFilter === 'PROCESSING' ? styles.statCardActive : ''}`}
          onClick={() => setStatusFilter('PROCESSING')}
        >
          <div className={styles.statTop}>
            <span className={styles.statTitle}>In Pipeline</span>
            <div className={styles.statIconWrap} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              ⚡
            </div>
          </div>
          <div className={styles.statCount} style={{ color: '#8b5cf6' }}>
            {stats.processing}
          </div>
          <span className={styles.statSub}>OCR &amp; Extraction</span>
        </div>

        <div
          className={`${styles.statCard} ${statusFilter === 'COMPLETED' ? styles.statCardActive : ''}`}
          onClick={() => setStatusFilter('COMPLETED')}
        >
          <div className={styles.statTop}>
            <span className={styles.statTitle}>Auto-Approved</span>
            <div className={styles.statIconWrap} style={{ background: '#ecfdf5', color: '#10b981' }}>
              ✓
            </div>
          </div>
          <div className={styles.statCount} style={{ color: '#10b981' }}>
            {stats.completed}
          </div>
          <span className={styles.statSub}>Ready for ERP export</span>
        </div>

        <div
          className={`${styles.statCard} ${statusFilter === 'FAILED' ? styles.statCardActive : ''}`}
          onClick={() => setStatusFilter('FAILED')}
        >
          <div className={styles.statTop}>
            <span className={styles.statTitle}>Failed / Blurry</span>
            <div className={styles.statIconWrap} style={{ background: '#fef2f2', color: '#ef4444' }}>
              ✕
            </div>
          </div>
          <div className={styles.statCount} style={{ color: '#ef4444' }}>
            {stats.failed}
          </div>
          <span className={styles.statSub}>Resolution issues</span>
        </div>
      </div>

      {/* ── Toolbar: Search & Select Filters ──── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span style={{ color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by filename, vendor, PO number, or extracted value..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ fontSize: '11px', color: '#64748b' }}
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.filtersWrap}>
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Document Types</option>
            <option value="INVOICE">Invoices</option>
            <option value="PURCHASE_ORDER">Purchase Orders</option>
            <option value="REQUIREMENTS">Requirements Specs</option>
            <option value="TAX_FORM">Tax Forms (W-9 / GST)</option>
            <option value="CONTRACT">Contracts &amp; MSAs</option>
            <option value="RECEIPT">Receipts</option>
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed / Verified</option>
            <option value="REVIEW_REQUIRED">Needs Human Review</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* ── Split Layout: Documents List + Document AI Inspector ──── */}
      <div className={selectedDoc ? styles.contentGrid : styles.contentGridFull}>
        {/* Left Side: Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderBar}>
            <span className={styles.tableHeaderTitle}>Documents Queue</span>
            <span className={styles.tableHeaderCount}>
              Showing {filteredDocs.length} of {documents.length} files
            </span>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Document File</th>
                <th className={styles.th}>AI Classification</th>
                <th className={styles.th}>AI Confidence</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Timestamp</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.td} style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      No documents found matching the filter criteria.
                    </p>
                    <button
                      onClick={() => {
                        setStatusFilter('ALL');
                        setTypeFilter('ALL');
                        setSearchQuery('');
                      }}
                      className={styles.inspectBtn}
                      style={{ marginTop: '12px' }}
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  const typeColors: Record<string, { bg: string; text: string }> = {
                    INVOICE: { bg: '#eff6ff', text: '#1d4ed8' },
                    PURCHASE_ORDER: { bg: '#f5f3ff', text: '#6d28d9' },
                    REQUIREMENTS: { bg: '#ecfdf5', text: '#065f46' },
                    TAX_FORM: { bg: '#fffbeb', text: '#92400e' },
                    CONTRACT: { bg: '#f1f5f9', text: '#334155' },
                    RECEIPT: { bg: '#fef2f2', text: '#991b1b' },
                  };

                  const iconByExt = doc.fileName.endsWith('.png') ? '🖼' : '📄';

                  return (
                    <tr
                      key={doc.id}
                      className={`${styles.tr} ${isSelected ? styles.trActive : ''}`}
                      onClick={() => setSelectedDocId(doc.id)}
                    >
                      <td className={styles.td}>
                        <div className={styles.docCell}>
                          <div
                            className={styles.docIconWrap}
                            style={{
                              background: typeColors[doc.documentType]?.bg || '#f1f5f9',
                              color: typeColors[doc.documentType]?.text || '#334155',
                            }}
                          >
                            {iconByExt}
                          </div>
                          <div>
                            <div className={styles.docTitle}>{doc.title}</div>
                            <div className={styles.docMeta}>
                              <span>{doc.fileSize}</span>
                              <span>•</span>
                              <span className={styles.docSourceTag}>{doc.source}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <span
                          className={styles.typeBadge}
                          style={{
                            background: typeColors[doc.documentType]?.bg || '#f1f5f9',
                            color: typeColors[doc.documentType]?.text || '#334155',
                          }}
                        >
                          {doc.documentType.replace('_', ' ')}
                        </span>
                      </td>

                      <td className={styles.td}>
                        <div
                          className={styles.confidencePill}
                          style={{
                            background:
                              doc.confidence >= 0.9
                                ? '#ecfdf5'
                                : doc.confidence >= 0.7
                                ? '#fffbeb'
                                : '#fef2f2',
                            color:
                              doc.confidence >= 0.9
                                ? '#065f46'
                                : doc.confidence >= 0.7
                                ? '#92400e'
                                : '#991b1b',
                          }}
                        >
                          <span
                            className={styles.confidenceDot}
                            style={{
                              background:
                                doc.confidence >= 0.9
                                ? '#10b981'
                                : doc.confidence >= 0.7
                                ? '#f59e0b'
                                : '#ef4444',
                            }}
                          />
                          {Math.round(doc.confidence * 100)}%
                        </div>
                      </td>

                      <td className={styles.td}>
                        <StatusBadge status={doc.status} />
                      </td>

                      <td className={styles.td} style={{ color: 'var(--text-secondary)' }}>
                        {doc.createdAt}
                      </td>

                      <td className={styles.td}>
                        <div className={styles.actionBtnGroup}>
                          <button
                            className={styles.inspectBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocId(doc.id);
                            }}
                          >
                            Inspect AI
                          </button>
                          {doc.status === 'REVIEW_REQUIRED' && (
                            <button
                              className={styles.quickApproveBtn}
                              onClick={(e) => handleQuickApprove(doc.id, e)}
                            >
                              ✓ Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: Document AI Deep Dive Inspector */}
        {selectedDoc && (
          <div className={styles.inspectorCard}>
            <div className={styles.inspectorHeader}>
              <div className={styles.inspectorTitleWrap}>
                <span className={styles.aiBadge}>✦ Document AI</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Deep Inspection
                </span>
              </div>
              <button
                className={styles.closeInspectorBtn}
                onClick={() => setSelectedDocId('')}
                title="Hide Inspector"
              >
                ✕
              </button>
            </div>

            <div className={styles.inspectorBody}>
              {/* Document Mockup Box with bounding tags */}
              <div className={styles.previewBox}>
                <div className={styles.previewDocHeader}>
                  <div>
                    <p className={styles.previewDocName}>{selectedDoc.fileName}</p>
                    <p className={styles.previewDocSub}>
                      {selectedDoc.fileSize} • {selectedDoc.source}
                    </p>
                  </div>
                  <StatusBadge status={selectedDoc.status} />
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  &ldquo;{selectedDoc.ocrSnippet}&rdquo;
                </div>

                <div className={styles.detectedRegions}>
                  <span className={styles.detectedTag}>🔍 OCR Engine v2.4</span>
                  <span className={styles.detectedTag}>📐 Layout Parser</span>
                  <span className={styles.detectedTag}>🏷 {selectedDoc.documentType}</span>
                </div>
              </div>

              {/* Confidence Score Bar */}
              <div className={styles.confidenceRow}>
                <div className={styles.confidenceMeta}>
                  <span style={{ color: 'var(--text-secondary)' }}>Overall Model Confidence</span>
                  <span style={{ fontWeight: 700, color: selectedDoc.confidence >= 0.9 ? '#16a34a' : '#d97706' }}>
                    {Math.round(selectedDoc.confidence * 100)}%
                  </span>
                </div>
                <div className={styles.confidenceBarTrack}>
                  <div
                    className={styles.confidenceBarFill}
                    style={{
                      width: `${Math.round(selectedDoc.confidence * 100)}%`,
                      background:
                        selectedDoc.confidence >= 0.9
                          ? '#10b981'
                          : selectedDoc.confidence >= 0.7
                          ? '#f59e0b'
                          : '#ef4444',
                    }}
                  />
                </div>
              </div>

              {/* Anomaly Callout if present */}
              {selectedDoc.anomalies && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚠</span> VALIDATION FLAG
                  </div>
                  <p style={{ fontSize: '12px', color: '#78350f', marginTop: '4px' }}>
                    {selectedDoc.anomalies}
                  </p>
                </div>
              )}

              {/* Extracted Key-Value Fields */}
              <div>
                <p className={styles.sectionLabel} style={{ marginBottom: '8px' }}>
                  Extracted Entities &amp; Values
                </p>
                <div className={styles.fieldsList}>
                  {Object.entries(selectedDoc.extractedFields).map(([key, field]) => (
                    <div key={key} className={styles.fieldItem}>
                      <div className={styles.fieldTop}>
                        <span className={styles.fieldLabel}>{field.label}</span>
                        <span
                          className={styles.fieldScore}
                          style={{
                            color: field.confidence >= 0.9 ? '#16a34a' : '#d97706',
                          }}
                        >
                          {Math.round(field.confidence * 100)}% confidence
                        </span>
                      </div>
                      <input
                        type="text"
                        className={styles.fieldInput}
                        value={field.value}
                        onChange={(e) => handleUpdateFieldValue(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation & Business Rules */}
              <div className={styles.rulesBox}>
                <span className={styles.rulesTitle}>AI Business Rules Validation</span>
                {selectedDoc.validationRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className={styles.ruleItem}
                    style={{ color: rule.passed ? '#15803d' : '#b91c1c' }}
                  >
                    <span>{rule.passed ? '✓' : '✕'}</span>
                    <span>{rule.rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspector Footer Actions */}
            <div className={styles.inspectorFooter}>
              <button className={styles.approveFullBtn} onClick={handleApproveInspection}>
                ✓ Approve &amp; Sync to ERP
              </button>
              <div className={styles.secondaryActionRow}>
                <button
                  className={styles.rejectBtn}
                  onClick={() => {
                    setDocuments((prev) =>
                      prev.map((d) => (d.id === selectedDoc.id ? { ...d, status: 'FAILED' } : d))
                    );
                  }}
                >
                  ✕ Reject / Flag
                </button>
                <button
                  className={styles.reExtractBtn}
                  onClick={() => {
                    setDocuments((prev) =>
                      prev.map((d) =>
                        d.id === selectedDoc.id
                          ? { ...d, status: 'PROCESSING', confidence: 0.95 }
                          : d
                      )
                    );
                    setTimeout(() => {
                      setDocuments((prev) =>
                        prev.map((d) =>
                          d.id === selectedDoc.id
                            ? { ...d, status: 'COMPLETED', confidence: 0.98 }
                            : d
                        )
                      );
                    }, 1200);
                  }}
                >
                  ↻ Re-Run OCR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Document Upload & AI Processing Modal ──── */}
      {isUploadOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📄</span>
                <span className={styles.modalTitle}>Upload Document to AI Pipeline</span>
              </div>
              <button
                style={{ fontSize: '18px', color: '#64748b' }}
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadStep(0);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {uploadStep === 0 ? (
                <>
                  <div
                    className={styles.dropzone}
                    onClick={() => {
                      const sampleNames = [
                        'Vendor_Invoice_Q4_Acro.pdf',
                        'PurchaseOrder_7701_Apex.pdf',
                        'Master_Services_Contract_2026.pdf',
                      ];
                      const chosen = sampleNames[Math.floor(Math.random() * sampleNames.length)];
                      setUploadedFileName(chosen);
                    }}
                  >
                    <span className={styles.dropzoneIcon}>📥</span>
                    <p className={styles.dropzoneTitle}>
                      {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Drag & drop your document here'}
                    </p>
                    <p className={styles.dropzoneSub}>
                      Supports PDF, PNG, JPG, TIFF, DOCX up to 25MB
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Extraction Pipeline Profile
                    </label>
                    <select className={styles.filterSelect} style={{ width: '100%', marginTop: '6px' }}>
                      <option>Smart Auto-Detect (Recommended)</option>
                      <option>Financial Invoices &amp; Receipts</option>
                      <option>Purchase Orders &amp; Waybills</option>
                      <option>Legal Contracts &amp; NDAs</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className={styles.pipelineProgress}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Processing {uploadedFileName}...
                  </p>

                  <div className={styles.confidenceBarTrack}>
                    <div
                      className={styles.confidenceBarFill}
                      style={{
                        width: `${(uploadStep / 5) * 100}%`,
                        background: 'var(--voltus-blue)',
                      }}
                    />
                  </div>

                  <div className={`${styles.pipelineStep} ${uploadStep >= 1 ? styles.pipelineStepDone : ''}`}>
                    <span>{uploadStep >= 1 ? '✓' : '○'}</span>
                    <span>1. Ingestion &amp; Image Preprocessing (DPI normalize, deskew)</span>
                  </div>

                  <div className={`${styles.pipelineStep} ${uploadStep >= 2 ? (uploadStep === 2 ? styles.pipelineStepActive : styles.pipelineStepDone) : ''}`}>
                    <span>{uploadStep >= 3 ? '✓' : uploadStep === 2 ? '⏳' : '○'}</span>
                    <span>2. Dual-Engine OCR &amp; Text Layer Extraction</span>
                  </div>

                  <div className={`${styles.pipelineStep} ${uploadStep >= 3 ? (uploadStep === 3 ? styles.pipelineStepActive : styles.pipelineStepDone) : ''}`}>
                    <span>{uploadStep >= 4 ? '✓' : uploadStep === 3 ? '⏳' : '○'}</span>
                    <span>3. Layout Analysis &amp; Document Classification</span>
                  </div>

                  <div className={`${styles.pipelineStep} ${uploadStep >= 4 ? (uploadStep === 4 ? styles.pipelineStepActive : styles.pipelineStepDone) : ''}`}>
                    <span>{uploadStep >= 5 ? '✓' : uploadStep === 4 ? '⏳' : '○'}</span>
                    <span>4. Key-Value Entity &amp; Line-Item Extraction</span>
                  </div>

                  <div className={`${styles.pipelineStep} ${uploadStep >= 5 ? styles.pipelineStepDone : ''}`}>
                    <span>{uploadStep >= 5 ? '✓' : '○'}</span>
                    <span>5. Schema Validation &amp; Confidence Scoring</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadStep(0);
                }}
              >
                Cancel
              </button>
              {uploadStep === 0 ? (
                <button className={styles.uploadBtn} onClick={handleSimulateUpload}>
                  ⚡ Process with AI
                </button>
              ) : (
                <button className={styles.uploadBtn} disabled style={{ opacity: 0.7 }}>
                  Analyzing...
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const stylesMap: Record<string, { bg: string; text: string; label: string }> = {
    COMPLETED: { bg: '#ecfdf5', text: '#065f46', label: '✓ Verified' },
    REVIEW_REQUIRED: { bg: '#fffbeb', text: '#92400e', label: '⏳ Needs Review' },
    PROCESSING: { bg: '#eff6ff', text: '#1d4ed8', label: '⚡ Processing' },
    FAILED: { bg: '#fef2f2', text: '#991b1b', label: '✕ Failed' },
  };

  const current = stylesMap[status] || { bg: '#f1f5f9', text: '#334155', label: status };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: current.bg,
        color: current.text,
        whiteSpace: 'nowrap',
      }}
    >
      {current.label}
    </span>
  );
}
