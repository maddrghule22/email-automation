import styles from './page.module.css';

const STATS = [
  { label: 'Total Emails',        value: '186', trend: '+12% vs yesterday', up: true,  icon: '✉',  color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Auto Replies Sent',   value: '142', trend: '+18% vs yesterday', up: true,  icon: '⚡',  color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'Documents Processed', value: '48',  trend: '+20% vs yesterday', up: true,  icon: '📋', color: '#10b981', bg: '#ecfdf5' },
  { label: 'Pending Approvals',   value: '6',   trend: '–33% vs yesterday', up: false, icon: '⏱',  color: '#f59e0b', bg: '#fffbeb' },
];

const INBOX = [
  { initials: 'IC', color: '#3b82f6', from: 'info@client.com',      subject: 'Project Proposal – Requirements',   preview: 'Hi, Please find the attached document with...', time: '10:24 AM', badge: 'ai',      active: true },
  { initials: 'SV', color: '#8b5cf6', from: 'support@vendor.com',   subject: 'Invoice for September',             preview: 'Please find the invoice for the services...', time: '09:58 AM', badge: 'doc' },
  { initials: 'HR', color: '#10b981', from: 'hr@company.com',       subject: 'Employee Onboarding Details',       preview: 'We are excited to have you on board...',       time: '09:32 AM', badge: 'sent' },
  { initials: 'AC', color: '#ef4444', from: 'admin@client.org',     subject: 'Follow up on Order #4587',          preview: 'Just checking the status of the order...',    time: '09:18 AM', badge: 'approve' },
  { initials: 'SP', color: '#06b6d4', from: 'sales@partner.com',    subject: 'Partnership Proposal',              preview: 'Here is the proposal for our collaboration...', time: '08:47 AM', badge: 'ai' },
  { initials: 'DF', color: '#f59e0b', from: 'documents@finance.com',subject: 'Tax Document Request',              preview: 'Please share the requested tax documents...',  time: '08:12 AM', badge: 'doc' },
  { initials: 'NS', color: '#64748b', from: 'no-reply@system.com',  subject: 'System Notification',               preview: 'Your account has been updated successfully.',  time: '07:52 AM', badge: 'sent' },
];

const BADGE_MAP: Record<string, { label: string; cls: string }> = {
  ai:      { label: '✦ AI Reply Ready',        cls: 'badge badge-ai' },
  doc:     { label: '📄 Document Processing',  cls: 'badge badge-doc' },
  sent:    { label: '✓ Auto Reply Sent',        cls: 'badge badge-sent' },
  approve: { label: '⏳ Needs Approval',        cls: 'badge badge-approve' },
};

const KEY_INFO = [
  { label: 'Project Name',    value: 'Website Redesign' },
  { label: 'Client Name',     value: 'ABC Technologies' },
  { label: 'Deadline',        value: '30 Oct 2026' },
  { label: 'Budget',          value: '₹ 2,50,000' },
  { label: 'Key Requirements', value: null, list: ['Modern UI/UX design', 'Responsive layout', 'SEO optimization', 'Integration with existing system'] },
];

export default function DashboardOverview() {
  return (
    <div className={styles.page}>
      {/* Stats row */}
      <div className={styles.statsRow}>
        {STATS.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statTop}>
              <div>
                <p className={styles.statLabel}>{s.label}</p>
                <p className={styles.statValue}>{s.value}</p>
              </div>
              <div className={styles.statIconWrap} style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <p className={`${styles.statTrend} ${s.up ? styles.trendUp : styles.trendDown}`}>
              {s.up ? '↑' : '↓'} {s.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Three-panel layout */}
      <div className={styles.panels}>

        {/* Panel 1: Inbox */}
        <div className={styles.inboxPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Inbox</h3>
            <div className={styles.panelActions}>
              <button className={styles.iconBtn}>↻</button>
              <select className={styles.filterSelect}>
                <option>All</option>
                <option>AI Ready</option>
                <option>Needs Approval</option>
              </select>
            </div>
          </div>
          <div className={styles.inboxList}>
            {INBOX.map((email, i) => (
              <div key={i} className={`${styles.inboxItem} ${email.active ? styles.inboxItemActive : ''}`}>
                <div className={styles.inboxAvatar} style={{ background: email.color }}>
                  {email.initials}
                </div>
                <div className={styles.inboxBody}>
                  <div className={styles.inboxTop}>
                    <span className={styles.inboxFrom}>{email.from}</span>
                    <span className={styles.inboxTime}>{email.time}</span>
                  </div>
                  <p className={styles.inboxSubject}>{email.subject}</p>
                  <p className={styles.inboxPreview}>{email.preview}</p>
                  {email.badge && (
                    <span className={BADGE_MAP[email.badge].cls}>{BADGE_MAP[email.badge].label}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Email detail */}
        <div className={styles.emailPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.emailPanelTitle}>
              <button className={styles.iconBtn}>←</button>
              <h3 className={styles.panelTitle}>Project Proposal – Requirements</h3>
            </div>
            <div className={styles.panelActions}>
              <span className="badge badge-ai">✦ AI Reply Ready</span>
              <button className={styles.iconBtn}>⋮</button>
            </div>
          </div>

          {/* Email thread */}
          <div className={styles.emailThread}>
            <div className={styles.emailMeta}>
              <div className={styles.inboxAvatar} style={{ background: '#3b82f6' }}>IC</div>
              <div className={styles.emailMetaText}>
                <div className={styles.emailMetaTop}>
                  <strong>info@client.com</strong>
                  <span className={styles.inboxTime}>10:24 AM ☆</span>
                </div>
                <span className={styles.emailTo}>to me</span>
              </div>
            </div>

            <div className={styles.emailBody}>
              <p>Hi,</p>
              <p>Please find the attached document with the project requirements. We would like to know if you can share your proposal and estimated timeline for the same.</p>
              <p>Thanks,<br />Client Team</p>
            </div>

            {/* Attachments */}
            <div className={styles.attachments}>
              <div className={styles.attachment}>
                <span className={styles.attachIcon} style={{ color: '#ef4444' }}>📄</span>
                <div>
                  <p className={styles.attachName}>Project_Requirements.pdf</p>
                  <p className={styles.attachSize}>2.4 MB</p>
                </div>
              </div>
              <div className={styles.attachment}>
                <span className={styles.attachIcon} style={{ color: '#3b82f6' }}>📝</span>
                <div>
                  <p className={styles.attachName}>Additional_Details.docx</p>
                  <p className={styles.attachSize}>1.1 MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Reply */}
          <div className={styles.aiReply}>
            <div className={styles.aiReplyHeader}>
              <span className={styles.aiReplyTitle}>✦ AI Generated Reply</span>
              <button className={styles.regenerateBtn}>↻ Regenerate</button>
            </div>
            <div className={styles.aiReplyBody}>
              <p>Hi,</p>
              <p>Thank you for sharing the project requirements. We have reviewed the document and are excited to move forward.</p>
              <p>Our team will prepare a detailed proposal along with the estimated timeline and share it with you shortly. If you have any specific questions or additional requirements, please let us know.</p>
              <p>Best regards,<br />Voltus Technologies</p>
            </div>
            <div className={styles.aiReplyActions}>
              <button className={`${styles.actionBtn}`}>✏ Edit</button>
              <button className={`${styles.actionBtn}`}>⊡ Use Template</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>↑ Send for Approval</button>
            </div>
          </div>
        </div>

        {/* Panel 3: Document analysis */}
        <div className={styles.docPanel}>
          <div className={styles.docTabs}>
            <button className={`${styles.docTab} ${styles.docTabActive}`}>Document Analysis</button>
            <button className={styles.docTab}>Approval Flow</button>
          </div>

          {/* File */}
          <div className={styles.docFile}>
            <span className={styles.attachIcon} style={{ color: '#3b82f6', fontSize: '20px' }}>📋</span>
            <div className={styles.docFileInfo}>
              <p className={styles.docFileName}>Project_Requirements.pdf</p>
              <p className={styles.attachSize}>2.4 MB</p>
            </div>
            <span className={styles.processedBadge}>✓ Processed</span>
          </div>

          <p className={styles.sectionLabel}>Key Information Extracted</p>

          {/* Key info table */}
          <div className={styles.keyInfoTable}>
            {KEY_INFO.map((row, i) => (
              <div key={i} className={styles.keyInfoRow}>
                <span className={styles.keyInfoLabel}>{row.label}</span>
                {row.list ? (
                  <ul className={styles.keyInfoList}>
                    {row.list.map((item, j) => <li key={j}>{item}</li>)}
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
              <div className={styles.confidenceFill} style={{ width: '92%' }} />
            </div>
            <span className={styles.confidenceNum}>92%</span>
          </div>

          {/* Approval required */}
          <div className={styles.approvalCard}>
            <div className={styles.approvalHeader}>
              <span>⏱</span>
              <p className={styles.approvalTitle}>Approval Required</p>
            </div>
            <p className={styles.approvalText}>The generated reply and document summary need your approval before sending.</p>
            <button className={styles.approveBtn}>✓ Review &amp; Approve</button>
            <p className={styles.approvalNote}>
              <span style={{ color: '#10b981' }}>✦</span> Once approved, the email will be automatically sent to the client and marked as completed.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
