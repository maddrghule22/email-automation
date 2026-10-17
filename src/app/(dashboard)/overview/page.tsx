'use client';

import React, { useState, useMemo } from 'react';
import styles from './page.module.css';

interface StatItem {
  id: string;
  label: string;
  value: number;
  trend: string;
  up: boolean;
  color: string;
  bg: string;
}

interface KeyInfoItem {
  label: string;
  value?: string | null;
  list?: string[];
}

interface EmailItem {
  id: string;
  initials: string;
  color: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  badge: 'ai' | 'doc' | 'sent' | 'approve';
  body: string[];
  attachments: { name: string; size: string; type: 'pdf' | 'doc' }[];
  aiReply: string;
  document: {
    name: string;
    size: string;
    confidence: number;
    keyInfo: KeyInfoItem[];
  };
  isApproved?: boolean;
  approvedAt?: string;
  isStarred?: boolean;
  isRead?: boolean;
}

const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'em-1',
    initials: 'IC',
    color: '#3b82f6',
    from: 'info@client.com',
    subject: 'Project Proposal – Requirements',
    preview: 'Hi, Please find the attached document with...',
    time: '10:24 AM',
    badge: 'ai',
    body: [
      'Hi,',
      'Please find the attached document with the project requirements. We would like to know if you can share your proposal and estimated timeline for the same.',
      'Looking forward to your prompt response.',
      'Thanks,\nClient Team',
    ],
    attachments: [
      { name: 'Project_Requirements.pdf', size: '2.4 MB', type: 'pdf' },
      { name: 'Additional_Details.docx', size: '1.1 MB', type: 'doc' },
    ],
    aiReply:
      'Hi,\n\nThank you for sharing the project requirements. We have reviewed the document and are excited to move forward.\n\nOur team will prepare a detailed proposal along with the estimated timeline and share it with you shortly. If you have any specific questions or additional requirements, please let us know.\n\nBest regards,\nVorynex Technologies',
    document: {
      name: 'Project_Requirements.pdf',
      size: '2.4 MB',
      confidence: 92,
      keyInfo: [
        { label: 'Project Name', value: 'Website Redesign & Portal' },
        { label: 'Client Name', value: 'ABC Technologies' },
        { label: 'Deadline', value: '30 Oct 2026' },
        { label: 'Budget', value: '₹ 2,50,000' },
        {
          label: 'Key Requirements',
          value: null,
          list: [
            'Modern UI/UX design',
            'Responsive layout across mobile/desktop',
            'SEO optimization & Performance audit',
            'Integration with existing auth system',
          ],
        },
      ],
    },
    isApproved: false,
    isRead: true,
  },
  {
    id: 'em-2',
    initials: 'SV',
    color: '#8b5cf6',
    from: 'support@vendor.com',
    subject: 'Invoice for September 2026',
    preview: 'Please find the invoice for the services rendered...',
    time: '09:58 AM',
    badge: 'doc',
    body: [
      'Dear Accounts Team,',
      'Please find attached our invoice #INV-9842 for cloud infrastructure and managed services during September 2026.',
      'Payment terms are Net-30. Please confirm receipt and let us know if you need purchase order reconciliation.',
      'Regards,\nVendor Billing Services',
    ],
    attachments: [{ name: 'Vendor_Invoice_Sept.pdf', size: '840 KB', type: 'pdf' }],
    aiReply:
      'Dear Vendor Billing Team,\n\nWe have received invoice #INV-9842 for September 2026 services ($14,250.00). The line items have been validated by our finance automation system and queued for disbursement according to Net-30 terms.\n\nThank you,\nFinance Department, Vorynex Technologies',
    document: {
      name: 'Vendor_Invoice_Sept.pdf',
      size: '840 KB',
      confidence: 98,
      keyInfo: [
        { label: 'Vendor Name', value: 'CloudOps Infrastructure Ltd' },
        { label: 'Invoice No', value: '#INV-9842' },
        { label: 'Amount Due', value: '$14,250.00' },
        { label: 'Due Date', value: '25 Oct 2026' },
        { label: 'Tax ID', value: 'US-948210492' },
      ],
    },
    isApproved: false,
    isRead: true,
  },
  {
    id: 'em-3',
    initials: 'HR',
    color: '#10b981',
    from: 'hr@company.com',
    subject: 'Employee Onboarding Details',
    preview: 'We are excited to have you on board with us...',
    time: '09:32 AM',
    badge: 'sent',
    body: [
      'Hello Yash,',
      'We are delighted to welcome Alex Chen to the team starting November 1, 2026 as Senior Fullstack Engineer.',
      'The signed offer letter, equipment provisioning checklist, and benefits enrollment guide are attached for archiving in the HRMS.',
      'Warm regards,\nPeople Operations Team',
    ],
    attachments: [{ name: 'Alex_Offer_Signed.pdf', size: '1.8 MB', type: 'pdf' }],
    aiReply:
      'Hi People Ops Team,\n\nThank you for the onboarding update for Alex Chen. The documents have been archived and automated workspace provisioning (Slack, GitHub, AWS IAM) has been scheduled for November 1st morning.\n\nBest,\nAutomated HR Gateway',
    document: {
      name: 'Alex_Offer_Signed.pdf',
      size: '1.8 MB',
      confidence: 96,
      keyInfo: [
        { label: 'Employee', value: 'Alex Chen' },
        { label: 'Role', value: 'Senior Fullstack Engineer' },
        { label: 'Start Date', value: '01 Nov 2026' },
        { label: 'Department', value: 'Core Engineering' },
        { label: 'Location', value: 'Remote (Bengaluru, IN)' },
      ],
    },
    isApproved: true,
    approvedAt: '09:35 AM',
    isRead: true,
  },
  {
    id: 'em-4',
    initials: 'AC',
    color: '#ef4444',
    from: 'admin@client.org',
    subject: 'Follow up on Order #4587',
    preview: 'Just checking the status of the order placed last week...',
    time: '09:18 AM',
    badge: 'approve',
    body: [
      'Hi Support Team,',
      'Could you please provide an expedited shipping update on order #4587? The client requires delivery by this Thursday for their executive summit.',
      'Attached is the original purchase confirmation and warehouse manifest.',
      'Thanks,\nAdmin Operations',
    ],
    attachments: [{ name: 'Order_Summary_4587.pdf', size: '512 KB', type: 'pdf' }],
    aiReply:
      'Hi Admin Team,\n\nOrder #4587 (12x Enterprise Hub units) was dispatched via Priority Express yesterday. Tracking #EXP-889104 is in transit with guaranteed delivery on Wednesday by 3:00 PM EST.\n\nLet us know if you need further dispatch assistance.\n\nSupport Team,\nVorynex Technologies',
    document: {
      name: 'Order_Summary_4587.pdf',
      size: '512 KB',
      confidence: 94,
      keyInfo: [
        { label: 'Order ID', value: '#4587' },
        { label: 'Carrier', value: 'FedEx Priority Air' },
        { label: 'Tracking #', value: 'EXP-889104' },
        { label: 'Est. Delivery', value: '22 Oct 2026, 3:00 PM' },
        { label: 'Destination', value: 'New York Distribution Hub' },
      ],
    },
    isApproved: false,
    isRead: false,
  },
  {
    id: 'em-5',
    initials: 'SP',
    color: '#06b6d4',
    from: 'sales@partner.com',
    subject: 'Partnership Proposal & Co-Marketing',
    preview: 'Here is the proposal for our joint solution offering...',
    time: '08:47 AM',
    badge: 'ai',
    body: [
      'Hello Vorynex Partnerships Team,',
      'Following our discussion on Tuesday, we have finalized the draft co-marketing agreement and mutual reseller commission framework.',
      'Please review the attached terms and let us know your availability for a contract signing session.',
      'Best regards,\nNexus Solutions Group',
    ],
    attachments: [{ name: 'Partnership_Agreement_Draft.pdf', size: '3.2 MB', type: 'pdf' }],
    aiReply:
      'Hi Partnerships Team at Nexus,\n\nThank you for circulating the revised co-marketing proposal. We are enthusiastic about aligning our enterprise automation engine with your distribution channels.\n\nOur legal and leadership teams will review the revenue share clause and get back to you with our comments by tomorrow.\n\nBest regards,\nYash Salunke, Vorynex Technologies',
    document: {
      name: 'Partnership_Agreement_Draft.pdf',
      size: '3.2 MB',
      confidence: 89,
      keyInfo: [
        { label: 'Partner Entity', value: 'Nexus Solutions Group' },
        { label: 'Partnership Tier', value: 'Tier 1 Reseller & Integrator' },
        { label: 'Revenue Share', value: '25% Annual Recurring' },
        { label: 'Exclusivity', value: 'Non-exclusive (Global)' },
        { label: 'Review Period', value: '14 Business Days' },
      ],
    },
    isApproved: false,
    isRead: true,
  },
  {
    id: 'em-6',
    initials: 'DF',
    color: '#f59e0b',
    from: 'documents@finance.com',
    subject: 'Tax Document Request & W-9 Verification',
    preview: 'Please share the requested tax documents for annual audit...',
    time: '08:12 AM',
    badge: 'doc',
    body: [
      'Dear Yash,',
      'Our compliance auditor requires an updated Form W-9 and certificate of good standing for fiscal year 2026 corporate filing.',
      'Kindly review the attached checklist and provide signed copies at your earliest convenience.',
      'Sincerely,\nAudit & Tax Advisory Team',
    ],
    attachments: [{ name: 'Tax_Checklist_FY2026.pdf', size: '720 KB', type: 'pdf' }],
    aiReply:
      'Dear Tax & Audit Team,\n\nAttached please find our executed Form W-9 and State Certificate of Good Standing for Vorynex Technologies for FY2026.\n\nPlease confirm receipt and let us know if any further documentation is required.\n\nWarm regards,\nVorynex Corporate Finance',
    document: {
      name: 'Tax_Checklist_FY2026.pdf',
      size: '720 KB',
      confidence: 97,
      keyInfo: [
        { label: 'Tax Year', value: 'FY 2026-2027' },
        { label: 'Entity Type', value: 'Corporation (C-Corp)' },
        { label: 'EIN Status', value: 'Verified & Active' },
        { label: 'Auditor', value: 'Ernst & Young LLP' },
        { label: 'Filing Deadline', value: '15 Nov 2026' },
      ],
    },
    isApproved: false,
    isRead: true,
  },
  {
    id: 'em-7',
    initials: 'NS',
    color: '#64748b',
    from: 'no-reply@system.com',
    subject: 'Weekly System Automation Health Report',
    preview: 'Your account automation jobs finished with 100% success...',
    time: '07:52 AM',
    badge: 'sent',
    body: [
      'Automation System Notice:',
      'All 142 automated email triggers and 48 OCR workflows completed successfully in the past 24 hours. Zero errors or dropped connections were recorded.',
      'Worker uptime on Cloudflare Pages + D1 is 99.98%.',
      'Vorynex Monitoring Daemon',
    ],
    attachments: [{ name: 'System_Audit_Report.pdf', size: '1.4 MB', type: 'pdf' }],
    aiReply:
      'System Log Acknowledged:\n\nWeekly automation health metrics have been recorded in the central observability dashboard. All nodes operating normally.',
    document: {
      name: 'System_Audit_Report.pdf',
      size: '1.4 MB',
      confidence: 99,
      keyInfo: [
        { label: 'Report Period', value: 'Last 7 Days' },
        { label: 'Tasks Processed', value: '1,894 Successful' },
        { label: 'Error Rate', value: '0.00% (Zero dropped)' },
        { label: 'Database Health', value: 'Cloudflare D1 Active' },
        { label: 'Latency', value: '42ms avg response' },
      ],
    },
    isApproved: true,
    approvedAt: '07:55 AM',
    isRead: true,
  },
];

const BADGE_MAP: Record<string, { label: string; cls: string }> = {
  ai: { label: 'AI Reply Ready', cls: 'badge badge-ai' },
  doc: { label: 'Document Processing', cls: 'badge badge-doc' },
  sent: { label: 'Auto Reply Sent', cls: 'badge badge-sent' },
  approve: { label: 'Needs Approval', cls: 'badge badge-approve' },
};

const TEMPLATES = [
  {
    id: 'formal-proposal',
    name: 'Formal Proposal Acknowledgment',
    snippet: 'Thank you for sharing the specifications. We have reviewed the scope and will share a full milestone proposal...',
    text: 'Hi,\n\nThank you for reaching out and sharing the requirements. We have reviewed the scope with our engineering team and are excited to collaborate.\n\nWe will prepare a comprehensive proposal outlining our milestone plan, deliverables, and commercial terms by the end of today.\n\nBest regards,\nVorynex Technologies',
  },
  {
    id: 'clarifications',
    name: 'Technical Scope Clarifications',
    snippet: 'Before finalizing the estimate, could you clarify third-party authentication and API integration SLAs?...',
    text: 'Hi,\n\nThank you for providing the initial requirements. To ensure our proposal and architecture are accurate, could you clarify:\n1. Preferred authentication provider (OAuth, SAML, or custom SSO)?\n2. Target expected monthly active user volume?\n3. Any compliance mandates (SOC2, HIPAA, GDPR)?\n\nLooking forward to your input.\n\nBest regards,\nEngineering Team, Vorynex Technologies',
  },
  {
    id: 'payment-net30',
    name: 'Invoice Received & Net-30 Payment',
    snippet: 'Invoice verified and logged into our ERP system for scheduled Net-30 disbursement...',
    text: 'Dear Billing Operations,\n\nWe have verified and logged the attached invoice into our automated accounts payable ledger. Payment will be released within our standard Net-30 cycle.\n\nIf you have any questions or require an updated remittance receipt, please let us know.\n\nWarm regards,\nFinance & Accounts, Vorynex Technologies',
  },
  {
    id: 'meeting-invite',
    name: 'Meeting & Architecture Review Invite',
    snippet: 'We would love to schedule a 30-minute discovery session with our technical leads this week...',
    text: 'Hi,\n\nWe have analyzed your requirements and would love to invite you to a 30-minute discovery and architecture alignment session.\n\nPlease let us know if Thursday at 3:00 PM or Friday at 11:00 AM works for your team.\n\nBest regards,\nYash Salunke, Vorynex Technologies',
  },
  {
    id: 'quick-sla',
    name: 'Standard SLA Acknowledgment',
    snippet: 'Your request has been prioritized under our tier-1 enterprise SLA and assigned to an automation specialist...',
    text: 'Hi,\n\nThis is an automated confirmation that your email has been received and routed under our Tier-1 Priority SLA.\n\nA senior team member has been assigned to your ticket and will follow up with actionable next steps shortly.\n\nBest regards,\nVorynex Automation Support',
  },
];

export default function DashboardOverview() {
  const [emails, setEmails] = useState<EmailItem[]>(INITIAL_EMAILS);
  const [selectedId, setSelectedId] = useState<string>('em-1');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'analysis' | 'approval'>('analysis');

  // Interactivity states
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isEditingReply, setIsEditingReply] = useState<boolean>(false);
  const [editReplyText, setEditReplyText] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active email
  const currentEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedId) || emails[0];
  }, [emails, selectedId]);

  // Filtered emails
  const filteredEmails = useMemo(() => {
    if (filterCategory === 'all') return emails;
    return emails.filter((e) => e.badge === filterCategory);
  }, [emails, filterCategory]);

  // Dynamic stats
  const totalEmailsCount = emails.length;
  const sentCount = emails.filter((e) => e.badge === 'sent' || e.isApproved).length;
  const docCount = emails.filter((e) => e.attachments.length > 0).length;
  const pendingCount = emails.filter((e) => e.badge === 'approve' || (!e.isApproved && e.badge === 'ai')).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Inbox refreshed: 7 emails up to date');
    }, 600);
  };

  const handleSelectEmail = (id: string) => {
    setSelectedId(id);
    setIsEditingReply(false);
    setShowOptionsMenu(false);
  };

  const handlePrevEmail = () => {
    const currentIndex = filteredEmails.findIndex((e) => e.id === currentEmail.id);
    if (currentIndex > 0) {
      setSelectedId(filteredEmails[currentIndex - 1].id);
    } else if (filteredEmails.length > 0) {
      setSelectedId(filteredEmails[filteredEmails.length - 1].id);
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      const enhancedReply = `Hi ${currentEmail.from.split('@')[0]},\n\nThank you for reaching out regarding "${currentEmail.subject}". Our AI pipeline has comprehensively evaluated the deliverables and constraints.\n\nWe have scheduled our senior solutions architect to review your scope and provide a tailored execution plan with guaranteed milestones.\n\nPlease feel free to reach out if you have any immediate questions.\n\nBest regards,\nVorynex Technologies`;

      setEmails((prev) =>
        prev.map((e) => (e.id === currentEmail.id ? { ...e, aiReply: enhancedReply } : e))
      );
      showToast('✨ AI Reply regenerated with Gemini 1.5 Pro');
    }, 700);
  };

  const handleStartEdit = () => {
    setEditReplyText(currentEmail.aiReply);
    setIsEditingReply(true);
  };

  const handleSaveEdit = () => {
    setEmails((prev) =>
      prev.map((e) => (e.id === currentEmail.id ? { ...e, aiReply: editReplyText } : e))
    );
    setIsEditingReply(false);
    showToast('Changes saved to AI reply');
  };

  const handleCancelEdit = () => {
    setIsEditingReply(false);
  };

  const handleSelectTemplate = (templateText: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === currentEmail.id ? { ...e, aiReply: templateText } : e))
    );
    setShowTemplateModal(false);
    showToast('Template applied to AI reply');
  };

  const handleSendForApproval = () => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === currentEmail.id ? { ...e, badge: 'approve', isApproved: false } : e
      )
    );
    setActiveTab('approval');
    showToast('🚀 Sent to manager approval queue');
  };

  const handleApproveEmail = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEmails((prev) =>
      prev.map((e) =>
        e.id === currentEmail.id
          ? { ...e, isApproved: true, approvedAt: timeNow, badge: 'sent' }
          : e
      )
    );
    showToast('🎉 Email and AI reply approved! Dispatched to client.');
  };

  const handleUndoApproval = () => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === currentEmail.id
          ? { ...e, isApproved: false, approvedAt: undefined, badge: 'approve' }
          : e
      )
    );
    showToast('Approval revoked — returned to pending');
  };

  const handleToggleStar = () => {
    setEmails((prev) =>
      prev.map((e) => (e.id === currentEmail.id ? { ...e, isStarred: !e.isStarred } : e))
    );
    setShowOptionsMenu(false);
    showToast(currentEmail.isStarred ? 'Email unstarred' : '⭐ Email starred');
  };

  const handleToggleRead = () => {
    setEmails((prev) =>
      prev.map((e) => (e.id === currentEmail.id ? { ...e, isRead: !e.isRead } : e))
    );
    setShowOptionsMenu(false);
    showToast(currentEmail.isRead ? 'Marked as unread' : 'Marked as read');
  };

  const handleArchive = () => {
    setEmails((prev) => prev.filter((e) => e.id !== currentEmail.id));
    setShowOptionsMenu(false);
    showToast('📥 Email archived');
    if (filteredEmails.length > 1) {
      const nextEmail = filteredEmails.find((e) => e.id !== currentEmail.id);
      if (nextEmail) setSelectedId(nextEmail.id);
    }
  };

  const handleExportPDF = () => {
    setShowOptionsMenu(false);
    showToast('📄 Exporting email summary to PDF...');
  };

  const handleAttachmentClick = (filename: string) => {
    showToast(`Opening preview for ${filename}...`);
  };

  return (
    <div className={styles.page}>
      {/* Dynamic Stats Row */}
      <div className={styles.statsRow}>
        <div
          className={styles.statCard}
          onClick={() => setFilterCategory('all')}
          style={{ cursor: 'pointer' }}
          title="Click to view all emails"
        >
          <div className={styles.statTop}>
            <div>
              <p className={styles.statLabel}>Total Emails</p>
              <p className={styles.statValue}>{totalEmailsCount}</p>
            </div>
            <div className={styles.statIconWrap} style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
          </div>
          <p className={`${styles.statTrend} ${styles.trendUp}`}>↑ +12% vs yesterday</p>
        </div>

        <div
          className={styles.statCard}
          onClick={() => setFilterCategory('sent')}
          style={{ cursor: 'pointer' }}
          title="Click to view auto replies sent"
        >
          <div className={styles.statTop}>
            <div>
              <p className={styles.statLabel}>Auto Replies Sent</p>
              <p className={styles.statValue}>{sentCount}</p>
            </div>
            <div className={styles.statIconWrap} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
          </div>
          <p className={`${styles.statTrend} ${styles.trendUp}`}>↑ +18% vs yesterday</p>
        </div>

        <div
          className={styles.statCard}
          onClick={() => setFilterCategory('doc')}
          style={{ cursor: 'pointer' }}
          title="Click to view processed documents"
        >
          <div className={styles.statTop}>
            <div>
              <p className={styles.statLabel}>Documents Processed</p>
              <p className={styles.statValue}>{docCount}</p>
            </div>
            <div className={styles.statIconWrap} style={{ background: '#ecfdf5', color: '#10b981' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
          </div>
          <p className={`${styles.statTrend} ${styles.trendUp}`}>↑ +20% vs yesterday</p>
        </div>

        <div
          className={styles.statCard}
          onClick={() => setFilterCategory('approve')}
          style={{ cursor: 'pointer' }}
          title="Click to view pending approvals"
        >
          <div className={styles.statTop}>
            <div>
              <p className={styles.statLabel}>Pending Approvals</p>
              <p className={styles.statValue}>{pendingCount}</p>
            </div>
            <div className={styles.statIconWrap} style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <p className={`${styles.statTrend} ${styles.trendDown}`}>–33% vs yesterday</p>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className={styles.panels}>
        {/* Panel 1: Interactive Inbox */}
        <div className={styles.inboxPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Inbox</h3>
            <div className={styles.panelActions}>
              <button
                className={styles.iconBtn}
                onClick={handleRefresh}
                title="Refresh inbox"
                disabled={isRefreshing}
              >
                <span className={isRefreshing ? styles.spinning : ''}>↻</span>
              </button>
              <select
                className={styles.filterSelect}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All ({emails.length})</option>
                <option value="ai">AI Ready</option>
                <option value="approve">Needs Approval</option>
                <option value="doc">Document Processing</option>
                <option value="sent">Auto Reply Sent</option>
              </select>
            </div>
          </div>

          <div className={styles.inboxList}>
            {filteredEmails.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No emails found for this filter.
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = email.id === currentEmail.id;
                return (
                  <div
                    key={email.id}
                    className={`${styles.inboxItem} ${isSelected ? styles.inboxItemActive : ''}`}
                    onClick={() => handleSelectEmail(email.id)}
                  >
                    <div className={styles.inboxAvatar} style={{ background: email.color }}>
                      {email.initials}
                    </div>
                    <div className={styles.inboxBody}>
                      <div className={styles.inboxTop}>
                        <span className={styles.inboxFrom}>
                          {email.isStarred && '⭐ '}
                          {email.from}
                        </span>
                        <span className={styles.inboxTime}>{email.time}</span>
                      </div>
                      <p className={styles.inboxSubject} style={{ fontWeight: email.isRead ? 500 : 700 }}>
                        {email.subject}
                      </p>
                      <p className={styles.inboxPreview}>{email.preview}</p>
                      {email.badge && (
                        <span className={BADGE_MAP[email.badge]?.cls}>
                          {BADGE_MAP[email.badge]?.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel 2: Email Detail Reader */}
        <div className={styles.emailPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.emailPanelTitle}>
              <button className={styles.iconBtn} onClick={handlePrevEmail} title="Previous email">
                ←
              </button>
              <h3 className={styles.panelTitle}>{currentEmail.subject}</h3>
            </div>
            <div className={styles.panelActions}>
              <span className={BADGE_MAP[currentEmail.badge]?.cls}>
                {BADGE_MAP[currentEmail.badge]?.label}
              </span>

              {/* Options Menu */}
              <div className={styles.menuWrapper}>
                <button
                  className={styles.iconBtn}
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  title="More actions"
                >
                  ⋮
                </button>
                {showOptionsMenu && (
                  <div className={styles.menuDropdown}>
                    <button className={styles.menuItem} onClick={handleToggleStar}>
                      <span>{currentEmail.isStarred ? '⭐' : '☆'}</span>
                      {currentEmail.isStarred ? 'Unstar Email' : 'Star Email'}
                    </button>
                    <button className={styles.menuItem} onClick={handleToggleRead}>
                      <span>✉️</span>
                      {currentEmail.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    </button>
                    <button className={styles.menuItem} onClick={handleExportPDF}>
                      <span>📄</span> Export to PDF
                    </button>
                    <button
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      onClick={handleArchive}
                    >
                      <span>📥</span> Archive Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Thread */}
          <div className={styles.emailThread}>
            <div className={styles.emailMeta}>
              <div className={styles.inboxAvatar} style={{ background: currentEmail.color }}>
                {currentEmail.initials}
              </div>
              <div className={styles.emailMetaText}>
                <div className={styles.emailMetaTop}>
                  <strong>{currentEmail.from}</strong>
                  <span className={styles.inboxTime}>{currentEmail.time}</span>
                </div>
                <span className={styles.emailTo}>to me</span>
              </div>
            </div>

            <div className={styles.emailBody}>
              {currentEmail.body.map((para, idx) => (
                <p key={idx} style={{ whiteSpace: 'pre-line' }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Attachments */}
            {currentEmail.attachments.length > 0 && (
              <div className={styles.attachments}>
                {currentEmail.attachments.map((att, i) => (
                  <div
                    key={i}
                    className={styles.attachment}
                    onClick={() => handleAttachmentClick(att.name)}
                    title={`Click to preview ${att.name}`}
                  >
                    <span
                      className={styles.attachIcon}
                      style={{ color: att.type === 'pdf' ? '#ef4444' : '#3b82f6' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        {att.type === 'doc' && (
                          <>
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </>
                        )}
                      </svg>
                    </span>
                    <div>
                      <p className={styles.attachName}>{att.name}</p>
                      <p className={styles.attachSize}>{att.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Reply Card */}
          <div className={styles.aiReply}>
            <div className={styles.aiReplyHeader}>
              <span className={styles.aiReplyTitle}>AI Generated Reply</span>
              <button
                className={styles.regenerateBtn}
                onClick={handleRegenerate}
                disabled={isRegenerating}
                title="Regenerate reply with AI"
              >
                {isRegenerating ? (
                  <span className={styles.spinning}>⚡ Regenerating...</span>
                ) : (
                  'Regenerate'
                )}
              </button>
            </div>

            {isEditingReply ? (
              <div className={styles.editReplyArea}>
                <textarea
                  className={styles.editReplyTextarea}
                  value={editReplyText}
                  onChange={(e) => setEditReplyText(e.target.value)}
                  placeholder="Edit your AI reply draft here..."
                />
                <div className={styles.editActions}>
                  <button className={styles.cancelBtn} onClick={handleCancelEdit}>
                    Cancel
                  </button>
                  <button className={styles.saveBtn} onClick={handleSaveEdit}>
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.aiReplyBody}>
                {currentEmail.aiReply.split('\n\n').map((block, bIdx) => (
                  <p key={bIdx} style={{ whiteSpace: 'pre-line' }}>
                    {block}
                  </p>
                ))}
              </div>
            )}

            {!isEditingReply && (
              <div className={styles.aiReplyActions}>
                <button className={styles.actionBtn} onClick={handleStartEdit} title="Edit AI reply text">
                  ✏️ Edit
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => setShowTemplateModal(true)}
                  title="Choose from response templates"
                >
                  📋 Use Template
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                  onClick={handleSendForApproval}
                  title="Forward to manager for approval"
                >
                  Send for Approval
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Document Analysis & Approval Flow */}
        <div className={styles.docPanel}>
          <div className={styles.docTabs}>
            <button
              className={`${styles.docTab} ${activeTab === 'analysis' ? styles.docTabActive : ''}`}
              onClick={() => setActiveTab('analysis')}
            >
              Document Analysis
            </button>
            <button
              className={`${styles.docTab} ${activeTab === 'approval' ? styles.docTabActive : ''}`}
              onClick={() => setActiveTab('approval')}
            >
              Approval Flow
            </button>
          </div>

          {activeTab === 'analysis' ? (
            <>
              {/* Document File Info */}
              <div className={styles.docFile}>
                <span className={styles.attachIcon} style={{ color: '#3b82f6' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <div className={styles.docFileInfo}>
                  <p className={styles.docFileName}>{currentEmail.document.name}</p>
                  <p className={styles.attachSize}>{currentEmail.document.size}</p>
                </div>
                <span className={styles.processedBadge}>Processed</span>
              </div>

              <p className={styles.sectionLabel}>Key Information Extracted</p>

              {/* Key Info Table */}
              <div className={styles.keyInfoTable}>
                {currentEmail.document.keyInfo.map((row, i) => (
                  <div key={i} className={styles.keyInfoRow}>
                    <span className={styles.keyInfoLabel}>{row.label}</span>
                    {row.list ? (
                      <ul className={styles.keyInfoList}>
                        {row.list.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className={styles.keyInfoValue}>{row.value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Confidence */}
              <div className={styles.confidenceRow}>
                <span className={styles.keyInfoLabel}>Confidence Score</span>
                <div className={styles.confidenceBar}>
                  <div
                    className={styles.confidenceFill}
                    style={{ width: `${currentEmail.document.confidence}%` }}
                  />
                </div>
                <span className={styles.confidenceNum}>{currentEmail.document.confidence}%</span>
              </div>

              {/* Approval Required Card */}
              {currentEmail.isApproved ? (
                <div className={styles.approvedStateCard}>
                  <span className={styles.approvedBadge}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Approved &amp; Dispatched
                  </span>
                  <p className={styles.approvedSub}>
                    Verified by Yash Salunke at {currentEmail.approvedAt || 'Today'}.
                  </p>
                  <button className={styles.undoApprovalBtn} onClick={handleUndoApproval}>
                    Revoke Approval
                  </button>
                </div>
              ) : (
                <div className={styles.approvalCard}>
                  <div className={styles.approvalHeader}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p className={styles.approvalTitle}>Approval Required</p>
                  </div>
                  <p className={styles.approvalText}>
                    The generated reply and document summary need your approval before sending.
                  </p>
                  <button className={styles.approveBtn} onClick={handleApproveEmail}>
                    Review &amp; Approve
                  </button>
                  <p className={styles.approvalNote}>
                    Once approved, the email will be automatically sent to the client and marked as completed.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Tab 2: Approval Flow Timeline */
            <div className={styles.flowContainer}>
              <div className={styles.flowStep}>
                <div className={`${styles.stepCheck} ${styles.stepCompleted}`}>✓</div>
                <div className={styles.stepContent}>
                  <div className={styles.stepTitleRow}>
                    <span className={styles.stepTitle}>Email Ingestion &amp; Classification</span>
                    <span className={styles.stepTime}>{currentEmail.time}</span>
                  </div>
                  <p className={styles.stepDesc}>Matched workflow rule &apos;Inbound Request Router&apos;</p>
                </div>
              </div>

              <div className={styles.flowStep}>
                <div className={`${styles.stepCheck} ${styles.stepCompleted}`}>✓</div>
                <div className={styles.stepContent}>
                  <div className={styles.stepTitleRow}>
                    <span className={styles.stepTitle}>OCR &amp; Document Parsing</span>
                    <span className={styles.stepTime}>{currentEmail.document.confidence}% Conf</span>
                  </div>
                  <p className={styles.stepDesc}>Extracted 5 key entities from {currentEmail.document.name}</p>
                </div>
              </div>

              <div className={styles.flowStep}>
                <div className={`${styles.stepCheck} ${styles.stepCompleted}`}>✓</div>
                <div className={styles.stepContent}>
                  <div className={styles.stepTitleRow}>
                    <span className={styles.stepTitle}>AI Draft Generation</span>
                    <span className={styles.stepTime}>Gemini 1.5</span>
                  </div>
                  <p className={styles.stepDesc}>High-confidence context-grounded response drafted</p>
                </div>
              </div>

              <div className={styles.flowStep}>
                <div
                  className={`${styles.stepCheck} ${
                    currentEmail.isApproved ? styles.stepCompleted : styles.stepPending
                  }`}
                >
                  {currentEmail.isApproved ? '✓' : '●'}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepTitleRow}>
                    <span className={styles.stepTitle}>Human Review &amp; Sign-off</span>
                    <span className={styles.stepTime}>
                      {currentEmail.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className={styles.stepDesc}>
                    {currentEmail.isApproved
                      ? `Signed off by Yash Salunke at ${currentEmail.approvedAt}`
                      : 'Requires review before outgoing SMTP dispatch'}
                  </p>
                </div>
              </div>

              <div className={styles.flowStep}>
                <div
                  className={`${styles.stepCheck} ${
                    currentEmail.isApproved ? styles.stepCompleted : styles.stepUpcoming
                  }`}
                >
                  {currentEmail.isApproved ? '✓' : '5'}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepTitleRow}>
                    <span className={styles.stepTitle}>SMTP Dispatch &amp; CRM Sync</span>
                    <span className={styles.stepTime}>
                      {currentEmail.isApproved ? 'Dispatched' : 'Queued'}
                    </span>
                  </div>
                  <p className={styles.stepDesc}>
                    {currentEmail.isApproved
                      ? 'Dispatched to recipient and synchronized to CRM'
                      : 'Awaiting human sign-off in step 4'}
                  </p>
                </div>
              </div>

              {/* Action Button within Approval Flow */}
              {!currentEmail.isApproved ? (
                <button
                  className={styles.approveBtn}
                  style={{ marginTop: 12 }}
                  onClick={handleApproveEmail}
                >
                  Approve This Workflow Step
                </button>
              ) : (
                <button
                  className={styles.undoApprovalBtn}
                  style={{ width: '100%', marginTop: 12, padding: '8px' }}
                  onClick={handleUndoApproval}
                >
                  Revoke Step Sign-off
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowTemplateModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Choose a Reply Template</h4>
              <button
                className={styles.closeModalBtn}
                onClick={() => setShowTemplateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className={styles.templateOption}
                  onClick={() => handleSelectTemplate(tpl.text)}
                >
                  <p className={styles.templateName}>{tpl.name}</p>
                  <p className={styles.templateSnippet}>{tpl.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className={styles.toastContainer}>
          <div className={styles.toast}>
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                marginLeft: 8,
                fontSize: 14,
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
