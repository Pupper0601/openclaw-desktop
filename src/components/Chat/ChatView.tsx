import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowDown, Download, Loader2, Search, X, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useChatStore, type ChatMessage } from '@/stores/chatStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { gateway } from '@/services/gateway';
import { MessageBubble } from './MessageBubble';
import { ToolCallBubble } from './ToolCallBubble';
import { ThinkingBubble } from './ThinkingBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { InlineButtonBar } from './InlineButtonBar';
import { QuickReplyBar } from './QuickReplyBar';
import type { RenderBlock } from '@/types/RenderBlock';
import { exportChatMarkdown } from '@/utils/exportChat';
import clsx from 'clsx';

// ═══════════════════════════════════════════════════════════
// Compact Divider — shimmer animated line
// ═══════════════════════════════════════════════════════════

function CompactDivider({ timestamp }: { timestamp?: string }) {
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div className="flex items-center gap-0 py-5 px-4 group">
      {/* Left line with shimmer */}
      <div className="flex-1 h-px relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div
          className="absolute top-[-1px] h-[3px] w-[60%] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent rounded-full"
          style={{ animation: 'compact-shimmer 4s ease-in-out infinite' }}
        />
      </div>
      {/* Badge */}
      <div className="flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/[0.06] border border-amber-500/[0.12] rounded-full shrink-0 mx-1 transition-colors group-hover:bg-amber-500/[0.1] group-hover:border-amber-500/[0.2]">
        <Zap size={10} className="text-amber-500/50" />
        <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-amber-500/50 group-hover:text-amber-500/70 transition-colors">
          Context Compacted
        </span>
        {time && <span className="text-[9px] text-amber-500/25 font-mono">· {time}</span>}
      </div>
      {/* Right line with shimmer */}
      <div className="flex-1 h-px relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div
          className="absolute top-[-1px] h-[3px] w-[60%] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent rounded-full"
          style={{ animation: 'compact-shimmer 4s ease-in-out infinite 2s', right: 0 }}
        />
      </div>
      <style>{`
        @keyframes compact-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(260%); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Chat View — Virtualized chat area
// ═══════════════════════════════════════════════════════════

export function ChatView() {
  const { t } = useTranslation();

  // ── Store selectors (split to minimize re-renders) ──
  const renderBlocks = useChatStore((s) => s.renderBlocks);
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const thinkingText = useChatStore((s) => s.thinkingText);
  const thinkingRunId = useChatStore((s) => s.thinkingRunId);
  const quickReplies = useChatStore((s) => s.quickReplies);
  const isLoadingHistory = useChatStore((s) => s.isLoadingHistory);

  const { connected, connecting, connectionError } = useChatStore(
    useShallow((s) => ({ connected: s.connected, connecting: s.connecting, connectionError: s.connectionError }))
  );

  const activeSessionKey = useChatStore((s) => s.activeSessionKey);

  // Actions (stable references)
  const setMessages = useChatStore((s) => s.setMessages);
  const setIsLoadingHistory = useChatStore((s) => s.setIsLoadingHistory);
  const cacheMessagesForSession = useChatStore((s) => s.cacheMessagesForSession);
  const getCachedMessages = useChatStore((s) => s.getCachedMessages);
  const addMessage = useChatStore((s) => s.addMessage);
  const setHistoryLoader = useChatStore((s) => s.setHistoryLoader);
  const setQuickReplies = useChatStore((s) => s.setQuickReplies);

  const toolIntentEnabled = useSettingsStore((s) => s.toolIntentEnabled);

  // ── Search state ──
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]); // indices in renderBlocks
  const [searchIndex, setSearchIndex] = useState(0); // current highlight index

  // ── Virtuoso ref & scroll state ──
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  // ── Keyboard shortcut: Ctrl+F to open search ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  // ── Search logic: compute matching block indices ──
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results: number[] = [];
    renderBlocks.forEach((block, i) => {
      if (block.type === 'message' && block.markdown.toLowerCase().includes(q)) {
        results.push(i);
      } else if (block.type === 'tool' && (block.toolName.toLowerCase().includes(q) || (block.output || '').toLowerCase().includes(q))) {
        results.push(i);
      }
    });
    setSearchResults(results);
    setSearchIndex(0);
  }, [searchQuery, renderBlocks]);

  // ── Navigate to current search result ──
  useEffect(() => {
    if (searchResults.length > 0 && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index: searchResults[searchIndex], behavior: 'smooth', align: 'center' });
    }
  }, [searchIndex, searchResults]);

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: 'LAST',
      behavior: 'smooth',
      align: 'end',
    });
  }, []);

  // ── History loading ──
  const loadHistory = useCallback(async () => {
    const cached = getCachedMessages(activeSessionKey);
    if (cached && cached.length > 0) {
      setMessages(cached);
      return;
    }

    setIsLoadingHistory(true);
    try {
      const result = await gateway.getHistory(activeSessionKey, 200);
      const rawMessages = Array.isArray(result?.messages) ? result.messages : [];

      const messages = rawMessages.map((msg: any) => ({
        id: msg.id || msg.messageId || `hist-${crypto.randomUUID()}`,
        role: msg.role || 'unknown',
        content: msg.content,
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        mediaUrl: msg.mediaUrl || undefined,
        mediaType: msg.mediaType || undefined,
        attachments: msg.attachments,
        toolName: msg.toolName || msg.name,
        toolInput: msg.toolInput || msg.input,
        toolCallId: msg.toolCallId || msg.tool_call_id,
        thinkingContent: msg.thinkingContent,
      }));

      // Progressive load: show last 20 instantly, then full set
      if (messages.length > 20) {
        setMessages(messages.slice(-20));
        requestAnimationFrame(() => {
          setMessages(messages);
          cacheMessagesForSession(activeSessionKey, messages);
        });
      } else {
        setMessages(messages);
        cacheMessagesForSession(activeSessionKey, messages);
      }
    } catch (err) {
      console.error('[ChatView] History load failed:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [connected, activeSessionKey, setMessages, setIsLoadingHistory, getCachedMessages, cacheMessagesForSession]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || isLoadingHistory) return;
    setIsRefreshing(true);
    try { await loadHistory(); }
    finally { setTimeout(() => setIsRefreshing(false), 500); }
  }, [isRefreshing, isLoadingHistory, loadHistory]);

  // Auto-load history on connect
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (connected && !hasLoadedRef.current && messages.length === 0) {
      hasLoadedRef.current = true;
      loadHistory();
    }
  }, [connected, messages.length, loadHistory]);

  // Register loadHistory in store so MessageInput can trigger it before first send
  useEffect(() => {
    setHistoryLoader(loadHistory);
    return () => setHistoryLoader(null);
  }, [loadHistory, setHistoryLoader]);

  useEffect(() => {
    const handler = () => handleRefresh();
    window.addEventListener('aegis:refresh', handler);
    return () => window.removeEventListener('aegis:refresh', handler);
  }, [handleRefresh]);

  const handleResend = useCallback((content: string) => {
    gateway.sendMessage(content, undefined, activeSessionKey);
  }, [activeSessionKey]);

  // Regenerate: re-send the last user message
  const handleRegenerate = useCallback(() => {
    const lastUserMsg = [...renderBlocks].reverse().find(
      (b) => b.type === 'message' && b.role === 'user'
    );
    if (lastUserMsg && lastUserMsg.type === 'message') {
      gateway.sendMessage(lastUserMsg.markdown, undefined, activeSessionKey);
    }
  }, [renderBlocks, activeSessionKey]);

  const handleInlineButtonClick = useCallback(async (callbackData: string) => {
    const text = callbackData;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    const { setIsTyping } = useChatStore.getState();
    setIsTyping(true);
    try {
      await gateway.sendMessage(text, undefined, activeSessionKey);
    } catch (err) {
      console.error('[InlineButtons] Send error:', err);
    }
  }, [addMessage, activeSessionKey]);

  // ── Render a single block (used by Virtuoso) ──
  const renderBlock = useCallback((index: number, block: RenderBlock) => {
    switch (block.type) {
      case 'compaction':
        return <CompactDivider timestamp={block.timestamp} />;

      case 'inline-buttons':
        return (
          <InlineButtonBar
            buttons={block.rows.map(r => r.buttons.map(b => ({ text: b.text, callback_data: b.callback_data })))}
            onCallback={handleInlineButtonClick}
          />
        );

      case 'tool':
        if (!toolIntentEnabled) return <div />;
        return (
          <ToolCallBubble
            tool={{
              toolName: block.toolName,
              input: block.input,
              output: block.output,
              status: block.status,
              durationMs: block.durationMs,
            }}
          />
        );

      case 'thinking':
        return <ThinkingBubble content={block.content} />;

      case 'message':
        return (
          <div>
            {block.thinkingContent && (
              <ThinkingBubble content={block.thinkingContent} />
            )}
            <MessageBubble
              block={block}
              onResend={block.role === 'user' ? handleResend : undefined}
              onRegenerate={block.role === 'assistant' ? handleRegenerate : undefined}
            />
          </div>
        );

      default:
        return <div />;
    }
  }, [toolIntentEnabled, handleResend, handleRegenerate, handleInlineButtonClick]);

  // ── Footer: thinking stream + typing indicator ──
  const Footer = useCallback(() => (
    <div className="pb-1">
      {thinkingText && thinkingRunId && (
        <ThinkingBubble content={thinkingText} isStreaming />
      )}
      {isTyping && <TypingIndicator />}
    </div>
  ), [thinkingText, thinkingRunId, isTyping]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-aegis-bg">
      {/* Connection Banner */}
      {!connected && (
        <div className={clsx(
          'shrink-0 px-4 py-2 text-center text-[12px] border-b',
          connecting ? 'bg-aegis-warning-surface text-aegis-warning border-aegis-warning/10' : 'bg-aegis-danger-surface text-aegis-danger border-aegis-danger/10'
        )}>
          {connecting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-aegis-warning rounded-full animate-pulse-soft" />
              {t('connection.connectingBanner')}
            </span>
          ) : (
            <span>
              {t('connection.disconnectedBanner')}
              {connectionError && <span className="opacity-60"> — {connectionError}</span>}
              <button onClick={() => {
                window.aegis?.config.get().then((c: any) => {
                  gateway.connect(c.gatewayUrl || 'ws://127.0.0.1:18789', c.gatewayToken || '');
                });
              }} className="mx-2 underline hover:no-underline">
                {t('connection.reconnect')}
              </button>
            </span>
          )}
        </div>
      )}

      {/* Search Bar */}
      {searchOpen && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-aegis-border bg-aegis-elevated/50">
          <Search size={14} className="text-aegis-text-muted shrink-0" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setSearchIndex((prev) => (prev + 1) % Math.max(searchResults.length, 1));
              if (e.key === 'Enter' && e.shiftKey) setSearchIndex((prev) => (prev - 1 + searchResults.length) % Math.max(searchResults.length, 1));
            }}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-[12px] text-aegis-text outline-none placeholder:text-aegis-text-dim"
          />
          {searchResults.length > 0 && (
            <span className="text-[10px] font-mono text-aegis-text-muted shrink-0">
              {searchIndex + 1}/{searchResults.length}
            </span>
          )}
          {searchQuery && searchResults.length === 0 && (
            <span className="text-[10px] text-aegis-text-dim shrink-0">No results</span>
          )}
          <button onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
            className="p-1 rounded hover:bg-[rgb(var(--aegis-overlay)/0.06)]">
            <X size={12} className="text-aegis-text-muted" />
          </button>
        </div>
      )}

      {/* Messages Area — Virtualized */}
      <div className="flex-1 min-h-0 relative">
        {/* Export button — floating, shown when there are messages */}
        {renderBlocks.length > 0 && !searchOpen && (
          <button
            onClick={() => exportChatMarkdown(renderBlocks, activeSessionKey)}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg
              bg-[rgb(var(--aegis-overlay)/0.06)] border border-[rgb(var(--aegis-overlay)/0.10)]
              text-aegis-text-muted hover:text-aegis-text-secondary hover:bg-[rgb(var(--aegis-overlay)/0.12)]
              transition-colors"
            title="Export chat as Markdown"
          >
            <Download size={14} />
          </button>
        )}

        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Loader2 size={28} className="text-aegis-primary animate-spin mb-4" />
            <p className="text-aegis-text-muted text-[13px]">{t('chat.loadingHistory')}</p>
          </div>
        ) : renderBlocks.length === 0 ? (
          <div className="flex-1 h-full" />
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={renderBlocks}
            followOutput="smooth"
            overscan={{ main: 600, reverse: 600 }}
            increaseViewportBy={{ top: 400, bottom: 400 }}
            defaultItemHeight={120}
            initialTopMostItemIndex={renderBlocks.length - 1}
            atBottomStateChange={setAtBottom}
            atBottomThreshold={100}
            itemContent={renderBlock}
            components={{ Footer }}
            className="h-full py-3 scrollbar-thin"
            style={{ overflowX: 'clip' }}
          />
        )}

        {/* Scroll to bottom */}
        {!atBottom && renderBlocks.length > 3 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <button onClick={scrollToBottom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass shadow-float text-[11px] text-aegis-text-muted hover:text-aegis-text transition-colors">
              <ArrowDown size={13} />
              <span>{t('chat.newMessages')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Reply buttons */}
      {quickReplies.length > 0 && !isTyping && (
        <QuickReplyBar
          buttons={quickReplies}
          onSend={async (text) => {
            setQuickReplies([]);
            const userMsg: ChatMessage = {
              id: `user-${Date.now()}`,
              role: 'user',
              content: text,
              timestamp: new Date().toISOString(),
            };
            addMessage(userMsg);
            const { setIsTyping } = useChatStore.getState();
            setIsTyping(true);
            try {
              await gateway.sendMessage(text, undefined, activeSessionKey);
            } catch (err) {
              console.error('[QuickReplyBar] Send error:', err);
            }
          }}
          onDismiss={() => setQuickReplies([])}
        />
      )}

      <MessageInput />
    </div>
  );
}
