'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import styles from './inbox.module.css';

interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail?: string;
  ccEmails?: string;
  bccEmails?: string;
  avatarUrl?: string;
  subject: string;
  snippet: string;
  body: string;
  date?: string;
  folder: 'inbox' | 'starred' | 'snoozed' | 'sent' | 'draft' | 'all' | 'spam' | 'trash';
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  labels: string[];
  snoozedUntil?: string | null;
  createdAt?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  conditionLogic: 'AND' | 'OR';
  conditions: Array<{ field: string; operator: string; value: string }>;
  actions: Array<{ action: string; value?: any }>;
  isEnabled: boolean;
  executionCount: number;
}

interface RuleExecution {
  id: string;
  ruleName: string;
  emailSubject?: string;
  actionsExecuted?: string;
  status: string;
  details?: string;
  createdAt: string;
}

export default function MailHivePage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [filterMode, setFilterMode] = useState<'all' | 'read' | 'unread' | 'important'>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({
    inbox: 0,
    starred: 0,
    snoozed: 0,
    sent: 0,
    draft: 0,
    all: 0,
    spam: 0,
    trash: 0,
  });

  // Compose state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeBcc, setComposeBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Reply state
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  // AI Assistant state
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiDraft, setAiDraft] = useState<string>('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [aiActionItems, setAiActionItems] = useState<string[]>([]);
  const [isExtractingActions, setIsExtractingActions] = useState(false);

  // Automation Rules state
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [ruleExecutions, setRuleExecutions] = useState<RuleExecution[]>([]);
  const [rulesTab, setRulesTab] = useState<'rules' | 'builder' | 'history'>('rules');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState('ON_RECEIVE');
  const [newRuleLogic, setNewRuleLogic] = useState<'AND' | 'OR'>('AND');
  const [newRuleCondField, setNewRuleCondField] = useState('subject');
  const [newRuleCondVal, setNewRuleCondVal] = useState('');
  const [newRuleActionType, setNewRuleActionType] = useState('apply_label');
  const [newRuleActionVal, setNewRuleActionVal] = useState('Urgent');
  const [ruleTestResult, setRuleTestResult] = useState<string | null>(null);

  // Toast & Undo
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [undoAction, setUndoAction] = useState<(() => void) | null>(null);

  const showToast = (msg: string, undoFn?: () => void) => {
    setToastMessage(msg);
    setUndoAction(undoFn ? () => undoFn : null);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
      setUndoAction(null);
    }, 4500);
  };

  // Fetch emails from D1 Edge backend
  const fetchEmails = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      folder: activeFolder,
      filter: filterMode,
      sortBy,
      search: searchQuery,
    });

    fetch(`/api/v1/emails?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setEmails(json.data);
          if (json.folderCounts) {
            setFolderCounts(json.folderCounts);
          }
          if (json.data.length > 0 && !selectedId) {
            setSelectedId(json.data[0].id);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [activeFolder, filterMode, sortBy, searchQuery, selectedId]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Fetch automation rules
  const fetchRules = () => {
    fetch('/api/v1/emails/rules')
      .then(r => r.json())
      .then(res => {
        if (res.data) setRules(res.data);
      })
      .catch(() => {});

    fetch('/api/v1/emails/rules/executions')
      .then(r => r.json())
      .then(res => {
        if (res.data) setRuleExecutions(res.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isRulesModalOpen) {
      fetchRules();
    }
  }, [isRulesModalOpen]);

  // Currently selected email
  const currentEmail = useMemo(() => {
    return emails.find(e => e.id === selectedId) || emails[0] || null;
  }, [emails, selectedId]);

  // Handle email selection & mark read
  const handleSelectEmail = (id: string) => {
    setSelectedId(id);
    setIsReplying(false);
    setAiSummary(null);
    setAiDraft('');
    setAiActionItems([]);

    const email = emails.find(e => e.id === id);
    if (email && !email.isRead) {
      setEmails(prev => prev.map(e => (e.id === id ? { ...e, isRead: true } : e)));
      fetch(`/api/v1/emails/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      }).catch(() => {});
    }
  };

  // Toggle Star
  const handleToggleStar = (email: Email, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newStatus = !email.isStarred;
    setEmails(prev => prev.map(item => (item.id === email.id ? { ...item, isStarred: newStatus } : item)));
    showToast(newStatus ? 'Starred message' : 'Unstarred message');

    fetch(`/api/v1/emails/${email.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStarred: newStatus }),
    }).catch(() => {});
  };

  // Toggle Important
  const handleToggleImportant = () => {
    if (!currentEmail) return;
    const newStatus = !currentEmail.isImportant;
    setEmails(prev => prev.map(item => (item.id === currentEmail.id ? { ...item, isImportant: newStatus } : item)));
    showToast(newStatus ? 'Marked as Important' : 'Removed from Important');

    fetch(`/api/v1/emails/${currentEmail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isImportant: newStatus }),
    }).catch(() => {});
  };

  // Archive Email with Undo
  const handleArchive = () => {
    if (!currentEmail) return;
    const target = currentEmail;
    const prevFolder = target.folder;

    setEmails(prev => prev.filter(e => e.id !== target.id));
    showToast('Conversation archived', () => {
      // Undo
      setEmails(prev => [target, ...prev]);
      fetch(`/api/v1/emails/${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: prevFolder }),
      }).catch(() => {});
    });

    fetch(`/api/v1/emails/${target.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'archive' }),
    }).catch(() => {});
  };

  // Delete / Trash Email with Undo
  const handleDelete = () => {
    if (!currentEmail) return;
    const target = currentEmail;
    const prevFolder = target.folder;

    setEmails(prev => prev.filter(e => e.id !== target.id));
    showToast('Moved to Trash', () => {
      // Undo
      setEmails(prev => [target, ...prev]);
      fetch(`/api/v1/emails/${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: prevFolder }),
      }).catch(() => {});
    });

    fetch(`/api/v1/emails/${target.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'trash' }),
    }).catch(() => {});
  };

  // Mark Unread
  const handleMarkUnread = () => {
    if (!currentEmail) return;
    setEmails(prev => prev.map(e => (e.id === currentEmail.id ? { ...e, isRead: false } : e)));
    showToast('Marked as unread');

    fetch(`/api/v1/emails/${currentEmail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: false }),
    }).catch(() => {});
  };

  // Snooze
  const handleSnooze = (durationHours: number) => {
    if (!currentEmail) return;
    const snoozeDate = new Date(Date.now() + durationHours * 3600000).toISOString();
    setEmails(prev => prev.filter(e => e.id !== currentEmail.id));
    showToast(`Snoozed for ${durationHours} hours`);

    fetch(`/api/v1/emails/${currentEmail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snoozedUntil: snoozeDate, folder: 'snoozed' }),
    }).catch(() => {});
  };

  // Move to Spam
  const handleMoveToSpam = () => {
    if (!currentEmail) return;
    const target = currentEmail;
    setEmails(prev => prev.filter(e => e.id !== target.id));
    showToast('Reported as spam and moved');

    fetch(`/api/v1/emails/${target.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'spam' }),
    }).catch(() => {});
  };

  // Send Reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !currentEmail) return;
    setIsSending(true);

    try {
      const res = await fetch('/api/v1/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: currentEmail.senderEmail,
          subject: currentEmail.subject.startsWith('Re:') ? currentEmail.subject : `Re: ${currentEmail.subject}`,
          body: replyText,
          folder: 'sent',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to send reply');

      showToast(`Reply dispatched to ${currentEmail.senderName}`);
      setReplyText('');
      setIsReplying(false);
      fetchEmails();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Send Compose
  const handleSendCompose = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!composeTo && !isDraft) {
      showToast('Please provide a recipient email address.');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/v1/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          cc: composeCc,
          bcc: composeBcc,
          subject: composeSubject || (isDraft ? 'Draft Message' : '(No Subject)'),
          body: composeBody,
          folder: isDraft ? 'draft' : 'sent',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to dispatch email');

      showToast(isDraft ? 'Draft saved to D1' : 'Message sent via Verified Edge Outbox');
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeCc('');
      setComposeBcc('');
      setComposeSubject('');
      setComposeBody('');
      fetchEmails();
    } catch (err: any) {
      showToast(`Send Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // AI Summarize Thread
  const handleAiSummarize = async () => {
    if (!currentEmail) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/v1/emails/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: currentEmail.body, subject: currentEmail.subject }),
      });
      const json = await res.json();
      if (json.data) {
        setAiSummary(json.data);
      }
    } catch (e) {
      showToast('AI Summarizer temporarily offline');
    } finally {
      setIsSummarizing(false);
    }
  };

  // AI Draft Reply
  const handleAiDraftReply = async (tone = selectedTone) => {
    if (!currentEmail) return;
    setIsGeneratingDraft(true);
    try {
      const res = await fetch('/api/v1/emails/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: currentEmail.body,
          subject: currentEmail.subject,
          senderName: currentEmail.senderName,
          tone,
        }),
      });
      const json = await res.json();
      if (json.data?.draft) {
        setAiDraft(json.data.draft);
      }
    } catch (e) {
      showToast('AI Drafting unavailable');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // AI Extract Actions & Deadlines
  const handleAiExtractActions = async () => {
    if (!currentEmail) return;
    setIsExtractingActions(true);
    try {
      const res = await fetch('/api/v1/emails/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: currentEmail.body }),
      });
      const json = await res.json();
      if (json.data?.actionItems) {
        setAiActionItems(json.data.actionItems);
      }
    } catch (e) {
      showToast('Extraction service unavailable');
    } finally {
      setIsExtractingActions(false);
    }
  };

  // Automation Rule Creation
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRuleCondVal) return;

    try {
      const res = await fetch('/api/v1/emails/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRuleName,
          triggerType: newRuleTrigger,
          conditionLogic: newRuleLogic,
          conditions: [{ field: newRuleCondField, operator: 'contains', value: newRuleCondVal }],
          actions: [{ action: newRuleActionType, value: newRuleActionVal }],
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create rule');

      showToast(`Automation rule "${newRuleName}" activated!`);
      setNewRuleName('');
      setNewRuleCondVal('');
      setRulesTab('rules');
      fetchRules();
    } catch (err: any) {
      showToast(`Rule Error: ${err.message}`);
    }
  };

  // Test Rule Preview
  const handleTestRule = async () => {
    if (!newRuleCondVal || !currentEmail) return;
    try {
      const res = await fetch('/api/v1/emails/rules/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule: {
            conditionLogic: newRuleLogic,
            conditions: [{ field: newRuleCondField, operator: 'contains', value: newRuleCondVal }],
            actions: [{ action: newRuleActionType, value: newRuleActionVal }],
          },
          sampleEmail: currentEmail,
        }),
      });
      const json = await res.json();
      setRuleTestResult(json.verdict || 'Test evaluation finished.');
    } catch (e) {
      setRuleTestResult('Preview error');
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 'Escape') {
          setIsComposeOpen(false);
          setIsRulesModalOpen(false);
          setIsReplying(false);
        }
        return;
      }

      if (e.key === 'j') {
        // Next email
        const idx = emails.findIndex(item => item.id === selectedId);
        if (idx < emails.length - 1) handleSelectEmail(emails[idx + 1].id);
      } else if (e.key === 'k') {
        // Prev email
        const idx = emails.findIndex(item => item.id === selectedId);
        if (idx > 0) handleSelectEmail(emails[idx - 1].id);
      } else if (e.key === 'c') {
        e.preventDefault();
        setIsComposeOpen(true);
      } else if (e.key === 'r') {
        e.preventDefault();
        setIsReplying(true);
      } else if (e.key === 'e') {
        handleArchive();
      } else if (e.key === 's' && currentEmail) {
        handleToggleStar(currentEmail);
      } else if (e.key === 'Escape') {
        setIsComposeOpen(false);
        setIsRulesModalOpen(false);
        setIsReplying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emails, selectedId, currentEmail]);

  return (
    <div className={styles.viewport}>
      {/* ── Top Unified App Bar ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.appBrand}>
            <div className={styles.appBrandIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
            </div>
            <span>Vorynex MailHive</span>
          </div>

          <Link href="/overview" className={styles.backLink}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Dashboard
          </Link>

          <Link href="/workflows" className={styles.backLink}>
            Automation Engine
          </Link>
        </div>

        <div className={styles.topBarRight}>
          <button
            className={styles.automationBtn}
            onClick={() => setIsRulesModalOpen(true)}
            title="Manage Email Automation Rules & Triggers"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Automation Rules ({rules.length || 4})
          </button>

          <div className={styles.userBadge}>
            <div className={styles.userAvatar}>YS</div>
            <span>yash@vorynex.com</span>
          </div>
        </div>
      </header>

      {/* ── 3-Column Email Client Main Grid ── */}
      <div className={styles.mailGrid}>
        {/* ── Column 1: Folder Navigation Sidebar ── */}
        <aside className={styles.navSidebar}>
          <button className={styles.composeActionBtn} onClick={() => setIsComposeOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Compose</span>
          </button>

          <div className={styles.navSectionTitle}>Mailboxes</div>
          <div className={styles.navGroup}>
            <button
              className={`${styles.navFolderItem} ${activeFolder === 'inbox' ? styles.navFolderItemActive : ''}`}
              onClick={() => setActiveFolder('inbox')}
            >
              <div className={styles.navFolderLeft}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
                <span>Inbox</span>
              </div>
              <span className={`${styles.folderCountBadge} ${activeFolder === 'inbox' ? styles.folderCountBadgeActive : ''}`}>
                {folderCounts.inbox}
              </span>
            </button>

            <button
              className={`${styles.navFolderItem} ${activeFolder === 'starred' ? styles.navFolderItemActive : ''}`}
              onClick={() => setActiveFolder('starred')}
            >
              <div className={styles.navFolderLeft}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>Starred</span>
              </div>
              <span className={styles.folderCountBadge}>{folderCounts.starred}</span>
            </button>

            <button
              className={`${styles.navFolderItem} ${activeFolder === 'snoozed' ? styles.navFolderItemActive : ''}`}
              onClick={() => setActiveFolder('snoozed')}
            >
              <div className={styles.navFolderLeft}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Snoozed</span>
              </div>
              <span className={styles.folderCountBadge}>{folderCounts.snoozed}</span>
            </button>

            <button
              className={`${styles.navFolderItem} ${activeFolder === 'sent' ? styles.navFolderItemActive : ''}`}
              onClick={() => setActiveFolder('sent')}
            >
              <div className={styles.navFolderLeft}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span>Sent</span>
              </div>
              <span className={styles.folderCountBadge}>{folderCounts.sent}</span>
            </button>

            <button
              className={`${styles.navFolderItem} ${activeFolder === 'draft' ? styles.navFolderItemActive : ''}`}
              onClick={() => setActiveFolder('draft')}
            >
              <div className={styles.navFolderLeft}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Drafts</span>
              </div>
              <span className={styles.folderCountBadge}>{folderCounts.draft}</span>
            </button>

            <button
              className={`${styles.navFolderItem} ${activeFolder === 'all' ? styles.navFolderItemActive : ''}`}
              onClick={() => setActiveFolder('all')}
            >
              <div className={styles.navFolderLeft}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>All Mail</span>
              </div>
              <span className={styles.folderCountBadge}>{folderCounts.all}</span>
            </button>

            <button
              className={`${styles.navFolderItem} ${activeFolder === 'spam' ? styles.navFolderItemActive : ''}`}
              onClick={() => setActiveFolder('spam')}
            >
              <div className={styles.navFolderLeft}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Spam</span>
              </div>
              <span className={styles.folderCountBadge}>{folderCounts.spam}</span>
            </button>

            <button
              className={`${styles.navFolderItem} ${activeFolder === 'trash' ? styles.navFolderItemActive : ''}`}
              onClick={() => setActiveFolder('trash')}
            >
              <div className={styles.navFolderLeft}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Trash</span>
              </div>
              <span className={styles.folderCountBadge}>{folderCounts.trash}</span>
            </button>
          </div>

          <div className={styles.navSidebarFooter}>
            <div className={styles.statusIndicator}>
              <span className={styles.liveDot} />
              <span>Edge D1 Synced</span>
            </div>
            <div style={{ fontSize: 10, color: '#475569', padding: '0 4px' }}>
              Press <b>?</b> for keyboard shortcuts
            </div>
          </div>
        </aside>

        {/* ── Column 2: Message List ── */}
        <section className={styles.listColumn}>
          <div className={styles.listHeader}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search mail (subject, sender, body)..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className={styles.searchClearBtn} onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>

            <div className={styles.controlsBar}>
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterTabBtn} ${filterMode === 'all' ? styles.filterTabBtnActive : ''}`}
                  onClick={() => setFilterMode('all')}
                >
                  All
                </button>
                <button
                  className={`${styles.filterTabBtn} ${filterMode === 'unread' ? styles.filterTabBtnActive : ''}`}
                  onClick={() => setFilterMode('unread')}
                >
                  Unread
                </button>
                <button
                  className={`${styles.filterTabBtn} ${filterMode === 'important' ? styles.filterTabBtnActive : ''}`}
                  onClick={() => setFilterMode('important')}
                >
                  Important
                </button>
              </div>

              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="date_desc">Newest</option>
                <option value="date_asc">Oldest</option>
                <option value="sender">Sender</option>
                <option value="subject">Subject</option>
              </select>
            </div>
          </div>

          <div className={styles.messagesContainer}>
            {loading ? (
              <div className={styles.emptyState}>Loading mailbox data from edge...</div>
            ) : emails.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
                <p>No messages in this folder.</p>
              </div>
            ) : (
              emails.map(item => {
                const isSelected = item.id === currentEmail?.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectEmail(item.id)}
                    className={`${styles.messageItem} ${isSelected ? styles.messageItemActive : ''} ${
                      !item.isRead ? styles.messageItemUnread : ''
                    }`}
                  >
                    <div className={styles.messageRowTop}>
                      <div className={styles.senderWrap}>
                        {!item.isRead && <span className={styles.unreadMarker} />}
                        <span className={`${styles.senderText} ${!item.isRead ? styles.senderTextUnread : ''}`}>
                          {item.senderName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          className={`${styles.starBtn} ${item.isStarred ? styles.starBtnActive : ''}`}
                          onClick={e => handleToggleStar(item, e)}
                          title={item.isStarred ? 'Starred' : 'Not starred'}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={item.isStarred ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                        <span className={styles.timestamp}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </span>
                      </div>
                    </div>

                    <div className={`${styles.subjectText} ${!item.isRead ? styles.subjectTextUnread : ''}`}>
                      {item.isImportant && (
                        <span className={styles.importantBadge} title="Important">
                          🏷️{' '}
                        </span>
                      )}
                      {item.subject}
                    </div>

                    <div className={styles.snippetText}>{item.snippet}</div>

                    {item.labels && item.labels.length > 0 && (
                      <div className={styles.badgesRow}>
                        {item.labels.slice(0, 3).map((lbl, idx) => (
                          <span key={idx} className={styles.tagBadge}>
                            {lbl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── Column 3: Message Reader Pane ── */}
        <main className={styles.readerColumn}>
          {currentEmail ? (
            <>
              {/* Reader Action Bar */}
              <div className={styles.readerActionBar}>
                <div className={styles.actionGroup}>
                  <button className={styles.readerToolBtn} onClick={handleArchive} title="Archive (e)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="5" rx="2" />
                      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
                      <path d="M10 13h4" />
                    </svg>
                    <span>Archive</span>
                  </button>

                  <button className={styles.readerToolBtn} onClick={handleDelete} title="Delete (#)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Delete</span>
                  </button>

                  <button className={styles.readerToolBtn} onClick={handleMarkUnread} title="Mark Unread">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>Mark Unread</span>
                  </button>

                  <button
                    className={`${styles.readerToolBtn} ${currentEmail.isStarred ? styles.readerToolBtnStarred : ''}`}
                    onClick={() => handleToggleStar(currentEmail)}
                    title="Toggle Star (s)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={currentEmail.isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{currentEmail.isStarred ? 'Starred' : 'Star'}</span>
                  </button>

                  <button className={styles.readerToolBtn} onClick={handleToggleImportant} title="Toggle Important">
                    <span>🏷️ {currentEmail.isImportant ? 'Important' : 'Mark Important'}</span>
                  </button>
                </div>

                <div className={styles.actionGroup}>
                  <button className={styles.readerToolBtn} onClick={() => handleSnooze(24)} title="Snooze 24h">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Snooze</span>
                  </button>

                  <button className={styles.readerToolBtn} onClick={handleMoveToSpam} title="Spam">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                    </svg>
                    <span>Spam</span>
                  </button>
                </div>
              </div>

              {/* Reader Content */}
              <div className={styles.readerContent}>
                {/* Title & Folder Header */}
                <div className={styles.mailSubjectHeader}>
                  <h1 className={styles.readerTitle}>{currentEmail.subject}</h1>
                  <span className={styles.folderIndicatorPill}>► {currentEmail.folder}</span>
                </div>

                {/* Sender Card */}
                <div className={styles.participantCard}>
                  <div className={styles.participantDetails}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentEmail.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces&q=80'}
                      alt={currentEmail.senderName}
                      className={styles.senderImg}
                    />
                    <div className={styles.participantNames}>
                      <div className={styles.senderFullName}>{currentEmail.senderName}</div>
                      <div className={styles.senderAddress}>&lt;{currentEmail.senderEmail}&gt;</div>
                      <div className={styles.recipientAddress}>to {currentEmail.recipientEmail || 'me'}</div>
                    </div>
                  </div>
                  <div className={styles.fullDateTimestamp}>
                    {currentEmail.createdAt ? new Date(currentEmail.createdAt).toLocaleString() : 'Today'}
                  </div>
                </div>

                {/* AI Assistant Drawer */}
                <div className={styles.aiAssistantDrawer}>
                  <div className={styles.aiHeader}>
                    <div className={styles.aiHeaderLeft}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <span>AI Copilot & Extraction</span>
                    </div>

                    <div className={styles.aiActionBtnGroup}>
                      <button className={styles.aiPillBtn} onClick={handleAiSummarize} disabled={isSummarizing}>
                        {isSummarizing ? 'Analyzing...' : '⚡ Summarize Thread'}
                      </button>
                      <button className={styles.aiPillBtn} onClick={() => handleAiDraftReply()} disabled={isGeneratingDraft}>
                        {isGeneratingDraft ? 'Drafting...' : '✍️ Draft Reply'}
                      </button>
                      <button className={styles.aiPillBtn} onClick={handleAiExtractActions} disabled={isExtractingActions}>
                        {isExtractingActions ? 'Extracting...' : '📋 Extract Deadlines'}
                      </button>
                    </div>
                  </div>

                  {/* Render AI Summary */}
                  {aiSummary && (
                    <div className={styles.aiSummaryBox}>
                      <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: 4 }}>
                        Executive Summary ({aiSummary.sentiment})
                      </div>
                      <p>{aiSummary.overview}</p>
                      {aiSummary.keyPoints && (
                        <ul>
                          {aiSummary.keyPoints.map((pt: string, idx: number) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Render AI Action Items */}
                  {aiActionItems.length > 0 && (
                    <div className={styles.aiSummaryBox}>
                      <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>
                        Extracted Action Items & Deadlines
                      </div>
                      <ul>
                        {aiActionItems.map((act, idx) => (
                          <li key={idx}>✓ {act}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Render AI Draft Reply */}
                  {aiDraft && (
                    <div className={styles.aiDraftContainer}>
                      <div className={styles.aiToneSelector}>
                        <span className={styles.toneLabel}>Tone:</span>
                        {['professional', 'concise', 'friendly', 'formal'].map(tone => (
                          <button
                            key={tone}
                            className={`${styles.toneBtn} ${selectedTone === tone ? styles.toneBtnActive : ''}`}
                            onClick={() => {
                              setSelectedTone(tone);
                              handleAiDraftReply(tone);
                            }}
                          >
                            {tone.charAt(0).toUpperCase() + tone.slice(1)}
                          </button>
                        ))}
                      </div>

                      <textarea
                        className={styles.aiDraftTextarea}
                        value={aiDraft}
                        onChange={e => setAiDraft(e.target.value)}
                      />

                      <div className={styles.aiDraftFooter}>
                        <button className={styles.secondaryActionBtn} onClick={() => setAiDraft('')}>
                          Discard Draft
                        </button>
                        <button
                          className={styles.primaryReplyBtn}
                          onClick={() => {
                            setReplyText(aiDraft);
                            setIsReplying(true);
                            setAiDraft('');
                          }}
                        >
                          Insert into Reply Composer
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Body */}
                <div className={styles.messageBodyCard}>{currentEmail.body}</div>

                {/* Quick Action Footer */}
                <div className={styles.quickActionFooter}>
                  <button className={styles.primaryReplyBtn} onClick={() => setIsReplying(prev => !prev)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 17 4 12 9 7" />
                      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                    </svg>
                    <span>Reply (r)</span>
                  </button>

                  <button
                    className={styles.secondaryActionBtn}
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
                  <div className={styles.inlineComposer}>
                    <div className={styles.inlineComposerHeader}>
                      <span>Replying to {currentEmail.senderName} &lt;{currentEmail.senderEmail}&gt;</span>
                      <button className={styles.modalCloseBtn} onClick={() => setIsReplying(false)}>
                        ✕
                      </button>
                    </div>

                    <textarea
                      className={styles.inlineTextarea}
                      placeholder="Type your response here..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      autoFocus
                    />

                    <div className={styles.inlineComposerFooter}>
                      <button
                        className={styles.secondaryActionBtn}
                        onClick={() => {
                          setIsReplying(false);
                          setReplyText('');
                        }}
                      >
                        Discard
                      </button>

                      <button
                        className={styles.primaryReplyBtn}
                        onClick={handleSendReply}
                        disabled={isSending}
                      >
                        {isSending ? 'Sending...' : 'Send Response'}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>Select an email from the list to preview details.</div>
          )}
        </main>
      </div>

      {/* ── Compose Modal ── */}
      {isComposeOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsComposeOpen(false)}>
          <div className={styles.composeModalWindow} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>New Message</span>
              <button className={styles.modalCloseBtn} onClick={() => setIsComposeOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={e => handleSendCompose(e, false)}>
              <div className={styles.modalForm}>
                <div className={styles.fieldRow}>
                  <input
                    type="email"
                    placeholder="Recipients (To)"
                    className={styles.fieldInput}
                    value={composeTo}
                    onChange={e => setComposeTo(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      className={styles.readerToolBtn}
                      style={{ padding: '4px 6px', fontSize: 11 }}
                      onClick={() => setShowCc(!showCc)}
                    >
                      Cc
                    </button>
                    <button
                      type="button"
                      className={styles.readerToolBtn}
                      style={{ padding: '4px 6px', fontSize: 11 }}
                      onClick={() => setShowBcc(!showBcc)}
                    >
                      Bcc
                    </button>
                  </div>
                </div>

                {showCc && (
                  <input
                    type="text"
                    placeholder="Cc recipients"
                    className={styles.fieldInput}
                    value={composeCc}
                    onChange={e => setComposeCc(e.target.value)}
                  />
                )}

                {showBcc && (
                  <input
                    type="text"
                    placeholder="Bcc recipients"
                    className={styles.fieldInput}
                    value={composeBcc}
                    onChange={e => setComposeBcc(e.target.value)}
                  />
                )}

                <input
                  type="text"
                  placeholder="Subject"
                  className={styles.fieldInput}
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  required
                />

                <textarea
                  placeholder="Compose your email here..."
                  className={styles.bodyTextarea}
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryActionBtn}
                  onClick={e => handleSendCompose(e, true)}
                >
                  Save as Draft
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className={styles.secondaryActionBtn}
                    onClick={() => setIsComposeOpen(false)}
                  >
                    Discard
                  </button>

                  <button type="submit" className={styles.primaryReplyBtn} disabled={isSending}>
                    {isSending ? 'Dispatching...' : 'Send Email'}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Automation Rules Modal ── */}
      {isRulesModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsRulesModalOpen(false)}>
          <div className={styles.rulesModalWindow} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={styles.modalTitle}>⚡ Email Automation Rules Engine</span>
                <div className={styles.filterTabs}>
                  <button
                    className={`${styles.filterTabBtn} ${rulesTab === 'rules' ? styles.filterTabBtnActive : ''}`}
                    onClick={() => setRulesTab('rules')}
                  >
                    Active Rules ({rules.length})
                  </button>
                  <button
                    className={`${styles.filterTabBtn} ${rulesTab === 'builder' ? styles.filterTabBtnActive : ''}`}
                    onClick={() => setRulesTab('builder')}
                  >
                    + New Rule
                  </button>
                  <button
                    className={`${styles.filterTabBtn} ${rulesTab === 'history' ? styles.filterTabBtnActive : ''}`}
                    onClick={() => setRulesTab('history')}
                  >
                    Audit History ({ruleExecutions.length})
                  </button>
                </div>
              </div>

              <button className={styles.modalCloseBtn} onClick={() => setIsRulesModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className={styles.rulesModalBody}>
              {rulesTab === 'rules' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {rules.length === 0 ? (
                    <div className={styles.emptyState}>No automation rules configured yet.</div>
                  ) : (
                    rules.map(rule => (
                      <div key={rule.id} className={styles.ruleCard}>
                        <div className={styles.ruleTopRow}>
                          <div>
                            <span className={styles.ruleNameText}>{rule.name}</span>
                            <div className={styles.ruleDescText}>{rule.description}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={styles.tagBadge}>Trigger: {rule.triggerType}</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                              Ran {rule.executionCount} time(s)
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 4,
                                backgroundColor: rule.isEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: rule.isEnabled ? '#10b981' : '#ef4444',
                              }}
                            >
                              {rule.isEnabled ? 'ENABLED' : 'PAUSED'}
                            </span>
                          </div>
                        </div>

                        <div className={styles.ruleConditionsBox}>
                          Match ({rule.conditionLogic}): {JSON.stringify(rule.conditions)} → Actions: {JSON.stringify(rule.actions)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {rulesTab === 'builder' && (
                <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Rule Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inbound Vendor Invoices Router"
                      className={styles.fieldInput}
                      style={{ width: '100%' }}
                      value={newRuleName}
                      onChange={e => setNewRuleName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                        Trigger Event:
                      </label>
                      <select
                        className={styles.fieldInput}
                        style={{ width: '100%' }}
                        value={newRuleTrigger}
                        onChange={e => setNewRuleTrigger(e.target.value)}
                      >
                        <option value="ON_RECEIVE">When New Email Arrives</option>
                        <option value="SENDER_MATCH">When Sender Matches Domain</option>
                        <option value="KEYWORD_MATCH">When Keywords Detected in Body</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                        Condition Evaluation:
                      </label>
                      <select
                        className={styles.fieldInput}
                        style={{ width: '100%' }}
                        value={newRuleLogic}
                        onChange={e => setNewRuleLogic(e.target.value as any)}
                      >
                        <option value="AND">Match ALL Conditions (AND)</option>
                        <option value="OR">Match ANY Condition (OR)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                        Field to Inspect:
                      </label>
                      <select
                        className={styles.fieldInput}
                        style={{ width: '100%' }}
                        value={newRuleCondField}
                        onChange={e => setNewRuleCondField(e.target.value)}
                      >
                        <option value="subject">Subject Line</option>
                        <option value="sender">Sender Email / Name</option>
                        <option value="body">Email Body Content</option>
                        <option value="recipient">Recipient</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                        Contains Keyword:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Invoice, PO-, Demurrage"
                        className={styles.fieldInput}
                        style={{ width: '100%' }}
                        value={newRuleCondVal}
                        onChange={e => setNewRuleCondVal(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                        Automated Action:
                      </label>
                      <select
                        className={styles.fieldInput}
                        style={{ width: '100%' }}
                        value={newRuleActionType}
                        onChange={e => setNewRuleActionType(e.target.value)}
                      >
                        <option value="apply_label">Apply Label</option>
                        <option value="mark_important">Mark Important</option>
                        <option value="star">Star Conversation</option>
                        <option value="create_draft">Draft Auto-Reply</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                        Action Parameter:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Finance, High-Priority"
                        className={styles.fieldInput}
                        style={{ width: '100%' }}
                        value={newRuleActionVal}
                        onChange={e => setNewRuleActionVal(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Rule Preview Tester */}
                  <div style={{ padding: 12, backgroundColor: '#090e18', border: '1px solid #1e293b', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8' }}>
                        Preview Test against Current Email
                      </span>
                      <button type="button" className={styles.secondaryActionBtn} onClick={handleTestRule}>
                        Run Rule Simulation
                      </button>
                    </div>
                    {ruleTestResult && (
                      <div style={{ fontSize: 12, color: '#cbd5e1' }}>{ruleTestResult}</div>
                    )}
                  </div>

                  <button type="submit" className={styles.primaryReplyBtn} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
                    Deploy Automation Rule to D1 Edge
                  </button>
                </form>
              )}

              {rulesTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ruleExecutions.length === 0 ? (
                    <div className={styles.emptyState}>No execution logs recorded yet.</div>
                  ) : (
                    ruleExecutions.map(exec => (
                      <div key={exec.id} className={styles.ruleCard}>
                        <div className={styles.ruleTopRow}>
                          <span className={styles.ruleNameText}>{exec.ruleName}</span>
                          <span style={{ fontSize: 11, color: '#10b981' }}>{exec.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#cbd5e1' }}>Email: {exec.emailSubject}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Executed: {exec.actionsExecuted} • {new Date(exec.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Alert with Undo ── */}
      {toastMessage && (
        <div className={styles.toastAlert}>
          <span>{toastMessage}</span>
          {undoAction && (
            <button className={styles.undoBtn} onClick={() => undoAction()}>
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
