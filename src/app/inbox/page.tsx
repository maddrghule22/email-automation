'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './inbox.module.css';

interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  avatar: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  timeAgo: string;
  isRead: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'starred' | 'snoozed' | 'sent' | 'draft' | 'all' | 'spam';
}

const INITIAL_EMAILS: Email[] = [
  {
    id: 'em-1',
    senderName: 'Emily Robertson',
    senderEmail: 'emily.robertson@mailhive.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces&q=80',
    subject: 'Urgent Update on Project Timeline',
    snippet: "Hi Team, I wanted to inform you all about some changes to the project timeline. We've ...",
    body: `Hi Team,\n\nI wanted to inform you all about some changes to the project timeline. We've encountered a slight delay due to unforeseen circumstances. I'll be updating the schedule in the shared document by the end of the day. Please make sure to review it once it's uploaded. Let me know if you have any questions.\n\nBest,\nEmily Robertson`,
    date: '7 Jan 2025, 23:47',
    timeAgo: '3 hours ago',
    isRead: false,
    isStarred: true,
    folder: 'inbox',
  },
  {
    id: 'em-2',
    senderName: 'John Anderson',
    senderEmail: 'j.anderson@acmesolutions.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80',
    subject: 'Invitation to Weekly Team Meeting',
    snippet: 'Dear All, Please be reminded that our weekly team meeting will take place tomorrow at 10 ...',
    body: `Dear All,\n\nPlease be reminded that our weekly team meeting will take place tomorrow at 10:00 AM EST. We will be discussing the Q1 deliverables, platform metrics, and deployment pipelines.\n\nAgenda:\n1. Sprint Retrospective\n2. Q1 Architecture Milestones\n3. Q&A\n\nLooking forward to seeing everyone there.\n\nRegards,\nJohn Anderson`,
    date: '7 Jan 2025, 18:20',
    timeAgo: '8 hours ago',
    isRead: false,
    isStarred: false,
    folder: 'inbox',
  },
  {
    id: 'em-3',
    senderName: 'Emma Li',
    senderEmail: 'emma.li@enterprise-hr.org',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces&q=80',
    subject: 'New Company Policy Announcement',
    snippet: 'Dear Team, I wanted to bring to your attention an important update regarding our new ...',
    body: `Dear Team,\n\nI wanted to bring to your attention an important update regarding our new hybrid workplace guidelines and holiday schedule for 2025. Please review the attached handbook on the internal portal by Friday.\n\nWarm regards,\nEmma Li\nPeople & Culture Lead`,
    date: '7 Jan 2025, 14:15',
    timeAgo: '12 hours ago',
    isRead: false,
    isStarred: false,
    folder: 'inbox',
  },
  {
    id: 'em-4',
    senderName: 'Michael Perez',
    senderEmail: 'm.perez@financecorp.net',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces&q=80',
    subject: 'Quarterly Budget Review Meeting',
    snippet: "Hi Everyone, We're scheduled for a quarterly budget review next Wednesday at 3 PM ...",
    body: `Hi Everyone,\n\nWe're scheduled for a quarterly budget review next Wednesday at 3 PM. Please make sure all departmental expenditures and forecasts are finalized in the ERP system prior to the call.\n\nThank you,\nMichael Perez\nVP of Finance`,
    date: '6 Jan 2025, 16:40',
    timeAgo: '1 day ago',
    isRead: false,
    isStarred: false,
    folder: 'inbox',
  },
  {
    id: 'em-5',
    senderName: 'Sophia Martinez',
    senderEmail: 'sophia@cloudtech.co',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces&q=80',
    subject: 'Security Audit & Compliance Report',
    snippet: 'Team, the ISO/SOC-2 compliance certification has been officially renewed ...',
    body: `Team,\n\nThe ISO/SOC-2 compliance certification has been officially renewed. Huge congratulations to everyone on the security and operations teams for their diligent work throughout the audit process.\n\nCheers,\nSophia`,
    date: '5 Jan 2025, 11:05',
    timeAgo: '2 days ago',
    isRead: true,
    isStarred: true,
    folder: 'inbox',
  },
];

export default function MailHivePage() {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [selectedId, setSelectedId] = useState<string>('em-1');
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [filterMode, setFilterMode] = useState<'all' | 'read' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compose & Reply state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered emails
  const filteredEmails = useMemo(() => {
    return emails.filter((item) => {
      // Folder check
      if (activeFolder === 'starred' && !item.isStarred) return false;
      if (activeFolder === 'inbox' && item.folder !== 'inbox') return false;
      if (activeFolder === 'sent' && item.folder !== 'sent') return false;
      if (activeFolder === 'spam' && item.folder !== 'spam') return false;
      if (activeFolder === 'draft' && item.folder !== 'draft') return false;

      // Filter Read / Unread
      if (filterMode === 'read' && !item.isRead) return false;
      if (filterMode === 'unread' && item.isRead) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchSender = item.senderName.toLowerCase().includes(query);
        const matchSubject = item.subject.toLowerCase().includes(query);
        const matchSnippet = item.snippet.toLowerCase().includes(query);
        if (!matchSender && !matchSubject && !matchSnippet) return false;
      }

      return true;
    });
  }, [emails, activeFolder, filterMode, searchQuery]);

  // Selected email
  const currentEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedId) || filteredEmails[0] || emails[0];
  }, [emails, selectedId, filteredEmails]);

  // Select email & mark read
  const handleSelectEmail = (id: string) => {
    setSelectedId(id);
    setIsReplying(false);
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
    );
  };

  // Delete email
  const handleDelete = () => {
    if (!currentEmail) return;
    const removedId = currentEmail.id;
    setEmails((prev) => prev.filter((e) => e.id !== removedId));
    triggerToast('Email deleted successfully');
  };

  // Toggle Important / Star
  const handleToggleImportant = () => {
    if (!currentEmail) return;
    setEmails((prev) =>
      prev.map((e) =>
        e.id === currentEmail.id ? { ...e, isStarred: !e.isStarred } : e
      )
    );
    triggerToast(
      currentEmail.isStarred ? 'Removed from Important' : 'Marked as Important'
    );
  };

  // Send Reply
  const handleSendReply = () => {
    if (!replyText.trim()) return;
    triggerToast(`Reply sent to ${currentEmail?.senderName}`);
    setReplyText('');
    setIsReplying(false);
  };

  // Send Compose
  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject) return;

    const newEmail: Email = {
      id: `em-${Date.now()}`,
      senderName: 'You',
      senderEmail: 'yash@vorynex.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces&q=80',
      subject: composeSubject,
      snippet: composeBody.slice(0, 90) + '...',
      body: composeBody,
      date: 'Just now',
      timeAgo: 'Just now',
      isRead: true,
      isStarred: false,
      folder: 'sent',
    };

    setEmails((prev) => [newEmail, ...prev]);
    setIsComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    triggerToast('Message sent');
  };

  const unreadCount = 15; // Exact badge number from screenshot

  return (
    <div className={styles.viewport}>
      {/* ── Background Organic Glow Wavy Curves matching reference screenshot ── */}
      <svg
        className={styles.backgroundWaves}
        viewBox="0 0 1600 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Subtle mesh background curves in flowing magenta/violet */}
        <path
          d="M0,320 C350,140 700,560 1200,240 C1450,80 1550,220 1650,320"
          stroke="#db2777"
          strokeWidth="1.6"
          opacity="0.38"
        />
        <path
          d="M-50,420 C300,200 640,620 1140,300 C1390,140 1520,310 1620,410"
          stroke="#e879f9"
          strokeWidth="1.8"
          opacity="0.45"
        />
        <path
          d="M-80,540 C260,310 580,720 1080,410 C1320,240 1480,420 1600,500"
          stroke="#c026d3"
          strokeWidth="1.5"
          opacity="0.35"
        />
        <path
          d="M80,890 C450,620 800,980 1300,640 C1440,540 1540,660 1620,740"
          stroke="#f472b6"
          strokeWidth="1.4"
          opacity="0.32"
        />
        <path
          d="M-40,730 C380,490 850,840 1220,510 C1360,400 1480,540 1580,590"
          stroke="#e879f9"
          strokeWidth="1.6"
          opacity="0.28"
        />
        {/* Dense glowing silk lines on right side */}
        <path
          d="M700,0 C900,300 1300,200 1500,600 C1600,800 1400,950 1600,1000"
          stroke="#ec4899"
          strokeWidth="1.8"
          opacity="0.35"
        />
        <path
          d="M780,0 C980,280 1360,220 1540,580 C1640,760 1460,930 1620,1000"
          stroke="#f472b6"
          strokeWidth="1.4"
          opacity="0.4"
        />
        <path
          d="M860,0 C1040,260 1420,240 1580,560 C1680,740 1520,910 1650,1000"
          stroke="#d946ef"
          strokeWidth="1.2"
          opacity="0.3"
        />
      </svg>

      {/* Top quick navigation */}
      <div className={styles.topBar}>
        <Link href="/overview" className={styles.backLink}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Enterprise Dashboard
        </Link>
        <div className={styles.statusIndicator}>
          <span className={styles.liveDot} />
          MailHive Edge Online
        </div>
      </div>

      {/* ── Main Glassmorphic Container Window ── */}
      <div className={styles.mailWindow}>
        {/* ── Column 1: Brand + Compose + Dark Floating Pill Nav ── */}
        <aside className={styles.navColumn}>
          <div className={styles.brand}>
            <span className={styles.brandTitle}>MailHive</span>
          </div>

          <button
            className={styles.composeBtn}
            onClick={() => setIsComposeOpen(true)}
            aria-label="Compose email"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Compose</span>
          </button>

          {/* Dark Floating Pill Menu */}
          <div className={styles.darkPillMenu}>
            <div className={styles.navItemsList}>
              {/* Inbox (active white capsule pill) */}
              <button
                className={`${styles.navItem} ${activeFolder === 'inbox' ? styles.navItemActive : ''}`}
                onClick={() => setActiveFolder('inbox')}
              >
                <div className={styles.navItemContent}>
                  <span className={styles.navItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>
                  </span>
                  <span>Inbox</span>
                </div>
                <span className={styles.unreadBadge}>{unreadCount}</span>
              </button>

              {/* Starred */}
              <button
                className={`${styles.navItem} ${activeFolder === 'starred' ? styles.navItemActive : ''}`}
                onClick={() => setActiveFolder('starred')}
              >
                <div className={styles.navItemContent}>
                  <span className={styles.navItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  <span>Starred</span>
                </div>
              </button>

              {/* Snoozed */}
              <button
                className={`${styles.navItem} ${activeFolder === 'snoozed' ? styles.navItemActive : ''}`}
                onClick={() => setActiveFolder('snoozed')}
              >
                <div className={styles.navItemContent}>
                  <span className={styles.navItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <span>Snoozed</span>
                </div>
              </button>

              {/* Sent */}
              <button
                className={`${styles.navItem} ${activeFolder === 'sent' ? styles.navItemActive : ''}`}
                onClick={() => setActiveFolder('sent')}
              >
                <div className={styles.navItemContent}>
                  <span className={styles.navItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </span>
                  <span>Sent</span>
                </div>
              </button>

              {/* Draft */}
              <button
                className={`${styles.navItem} ${activeFolder === 'draft' ? styles.navItemActive : ''}`}
                onClick={() => setActiveFolder('draft')}
              >
                <div className={styles.navItemContent}>
                  <span className={styles.navItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </span>
                  <span>Draft</span>
                </div>
              </button>

              {/* All Mail */}
              <button
                className={`${styles.navItem} ${activeFolder === 'all' ? styles.navItemActive : ''}`}
                onClick={() => setActiveFolder('all')}
              >
                <div className={styles.navItemContent}>
                  <span className={styles.navItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <span>All Mail</span>
                </div>
              </button>

              {/* Spam */}
              <button
                className={`${styles.navItem} ${activeFolder === 'spam' ? styles.navItemActive : ''}`}
                onClick={() => setActiveFolder('spam')}
              >
                <div className={styles.navItemContent}>
                  <span className={styles.navItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </span>
                  <span>Spam</span>
                </div>
              </button>
            </div>

            {/* Bottom settings item */}
            <div className={styles.settingsWrapper}>
              <Link href="/customers" className={styles.navItem} style={{ textDecoration: 'none' }}>
                <div className={styles.navItemContent}>
                  <span className={styles.navItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </span>
                  <span>Settings</span>
                </div>
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Column 2: Search + Filter Tabs + Email List ── */}
        <section className={styles.listColumn}>
          {/* Search bar */}
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search mail"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter segment tabs */}
          <div className={styles.filterPills}>
            <button
              className={`${styles.filterBtn} ${filterMode === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterMode('all')}
            >
              ALL
            </button>
            <button
              className={`${styles.filterBtn} ${filterMode === 'read' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterMode('read')}
            >
              Read
            </button>
            <button
              className={`${styles.filterBtn} ${filterMode === 'unread' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterMode('unread')}
            >
              Unread
            </button>
          </div>

          {/* Email item list */}
          <div className={styles.emailList}>
            {filteredEmails.length === 0 ? (
              <div className={styles.emptyNotice}>No messages in this view</div>
            ) : (
              filteredEmails.map((item) => {
                const isSelected = item.id === currentEmail?.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectEmail(item.id)}
                    className={`${styles.emailCard} ${
                      isSelected ? styles.emailCardSelected : styles.emailCardDefault
                    }`}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.senderName}>{item.senderName}</span>
                      <span className={styles.unreadDot} />
                    </div>
                    <div className={styles.emailSubject}>{item.subject}</div>
                    <div className={styles.emailSnippet}>{item.snippet}</div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── Column 3: Email Reader Pane ── */}
        <main className={styles.readerColumn}>
          {currentEmail ? (
            <>
              {/* Header */}
              <div className={styles.readerHeader}>
                <div className={styles.subjectGroup}>
                  <h1 className={styles.readerSubject}>{currentEmail.subject}</h1>
                  <span className={styles.inboxBadge}>► inbox</span>
                </div>

                <div className={styles.readerActions}>
                  <button className={styles.actionBtn} onClick={handleDelete} title="Delete">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Delete</span>
                  </button>

                  <button
                    className={`${styles.actionBtn} ${currentEmail.isStarred ? styles.actionBtnStarred : ''}`}
                    onClick={handleToggleImportant}
                    title="Important"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill={currentEmail.isStarred ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>Important</span>
                  </button>
                </div>
              </div>

              {/* Sender Info Row */}
              <div className={styles.senderRow}>
                <div className={styles.senderDetails}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentEmail.avatar}
                    alt={currentEmail.senderName}
                    className={styles.avatar}
                  />
                  <div className={styles.senderText}>
                    <div className={styles.senderNameEmail}>
                      <span>{currentEmail.senderName}</span>
                      <span className={styles.senderEmail}>&lt;{currentEmail.senderEmail}&gt;</span>
                    </div>
                    <span className={styles.recipientDetail}>
                      to me
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className={styles.timestamp}>
                  {currentEmail.date} ({currentEmail.timeAgo})
                </div>
              </div>

              {/* Body Text */}
              <div className={styles.emailBody}>{currentEmail.body}</div>

              {/* Footer Pill Action Buttons */}
              <div className={styles.replyActions}>
                <button
                  className={styles.pillActionBtn}
                  onClick={() => setIsReplying((prev) => !prev)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 17 4 12 9 7" />
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                  </svg>
                  <span>Reply</span>
                </button>

                <button
                  className={styles.pillActionBtn}
                  onClick={() => {
                    setIsComposeOpen(true);
                    setComposeSubject(`Fwd: ${currentEmail.subject}`);
                    setComposeBody(`\n\n---------- Forwarded message ---------\nFrom: ${currentEmail.senderName} <${currentEmail.senderEmail}>\nSubject: ${currentEmail.subject}\n\n${currentEmail.body}`);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 17 20 12 15 7" />
                    <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
                  </svg>
                  <span>Forward</span>
                </button>
              </div>

              {/* Inline Reply Composer */}
              {isReplying && (
                <div className={styles.replyBox}>
                  <div className={styles.replyHeader}>
                    <span>Replying to {currentEmail.senderName}...</span>
                  </div>
                  <textarea
                    className={styles.replyTextarea}
                    placeholder="Write your response here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoFocus
                  />
                  <div className={styles.replyFooter}>
                    <button
                      className={styles.discardBtn}
                      onClick={() => {
                        setIsReplying(false);
                        setReplyText('');
                      }}
                    >
                      Discard
                    </button>
                    <button className={styles.sendBtn} onClick={handleSendReply}>
                      Send Response
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyNotice}>Select an email to view its content</div>
          )}
        </main>
      </div>

      {/* ── Compose Modal ── */}
      {isComposeOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsComposeOpen(false)}>
          <div className={styles.composeModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>New Message</span>
              <button
                className={styles.modalClose}
                onClick={() => setIsComposeOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSendCompose}>
              <div className={styles.modalForm}>
                <input
                  type="email"
                  placeholder="Recipients (e.g. emily.robertson@mailhive.com)"
                  className={styles.formInput}
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className={styles.formInput}
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Compose your email here..."
                  className={styles.formTextarea}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                />
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.discardBtn}
                  onClick={() => setIsComposeOpen(false)}
                >
                  Discard
                </button>
                <button type="submit" className={styles.sendBtn}>
                  Send Email
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast Alert ── */}
      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
}
