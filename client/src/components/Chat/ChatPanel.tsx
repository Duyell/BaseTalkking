import { useState, useEffect, useRef, useCallback } from 'react';
import { getSession, deleteSession, sendChatMessage } from '../../api/chat';
import type { ChatMessage } from '../../types/chat';
import ChatMessageBubble from './ChatMessageBubble';
import EmojiPicker from '../Common/EmojiPicker';

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(10);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamingRef = useRef('');
  const doneRef = useRef(false);

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = ta.value.slice(0, start) + emoji + ta.value.slice(end);
    setInput(newValue);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + emoji.length;
      ta.focus();
    });
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSession();
      setSessionId(data.session.id);
      setMessages(data.messages);
      setRemaining(data.remaining);
    } catch {
      // session not found or error, start fresh
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadSession();
    }
  }, [open, loadSession]);

  const handleClose = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setStreamingContent('');
      setStreaming(false);
      setError('');
    }, 250);
  };

  const handleClear = async () => {
    if (!sessionId) return;
    try {
      await deleteSession(sessionId);
      setMessages([]);
      setSessionId(null);
      setStreamingContent('');
      setError('');
      loadSession();
    } catch {
      setError('清除上下文失败');
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput('');
    setError('');
    setStreaming(true);
    setStreamingContent('');
    streamingRef.current = '';
    doneRef.current = false;

    const userMsg: ChatMessage = {
      id: Date.now(),
      session_id: sessionId || 0,
      role: 'user',
      content: text,
      token_count: 0,
      create_time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    controllerRef.current = sendChatMessage(
      text,
      (sid) => {
        setSessionId(sid);
        setRemaining((prev) => Math.max(0, prev - 1));
      },
      (delta) => {
        streamingRef.current += delta;
        setStreamingContent(streamingRef.current);
      },
      () => {
        if (doneRef.current) return;
        doneRef.current = true;
        const content = streamingRef.current;
        if (content) {
          const aiMsg: ChatMessage = {
            id: Date.now(),
            session_id: sessionId || 0,
            role: 'assistant',
            content,
            token_count: 0,
            create_time: new Date().toISOString(),
          };
          setMessages((msgs) => [...msgs, aiMsg]);
        }
        setStreamingContent('');
        setStreaming(false);
      },
      (err) => {
        setError(err);
        setStreaming(false);
        setStreamingContent('');
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        className="fab-button"
        onClick={() => setOpen(true)}
        title="AI 助手"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: open ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          zIndex: 999,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      {open && (
        <div
          className={`chat-panel${closing ? ' closing' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 380,
            maxWidth: '100vw',
            height: '100vh',
            background: 'var(--color-bg-white)',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border-light)',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)' }}>
              AI 助手
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleClear}
                disabled={streaming}
                title="清除上下文"
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-hint)',
                  background: 'none',
                  border: 'none',
                  cursor: streaming ? 'not-allowed' : 'pointer',
                  opacity: streaming ? 0.5 : 1,
                }}
              >
                清除
              </button>
              <button
                onClick={handleClose}
                style={{
                  fontSize: 18,
                  color: 'var(--color-text-hint)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            {loading && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-hint)', fontSize: 13, padding: 40 }}>
                加载中...
              </div>
            )}
            {!loading && messages.length === 0 && !streamingContent && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-hint)', fontSize: 13, padding: 40 }}>
                你好！我是论坛 AI 助手，有什么可以帮你？
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            {streamingContent && (
              <div
                className="msg-bubble"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    border: '1px solid var(--color-border-light)',
                  }}
                >
                  {streamingContent}
                  <span className="typing-dot" style={{ marginLeft: 2 }} />
                </div>
              </div>
            )}
            {streaming && !streamingContent && (
              <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
            {error && (
              <div style={{
                padding: '8px 12px',
                marginBottom: 12,
                borderRadius: 8,
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: '8px 16px',
              fontSize: 11,
              color: 'var(--color-text-hint)',
              textAlign: 'center',
              borderTop: '1px solid var(--color-border-lighter)',
            }}
          >
            剩余 {remaining} 次 / 每小时 10 次
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 16px 16px',
              borderTop: '1px solid var(--color-border-light)',
            }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                disabled={streaming}
                rows={2}
                style={{
                  width: '100%',
                  resize: 'none',
                  padding: '8px 36px 8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <div style={{ position: 'absolute', right: 4, bottom: 2 }}>
                <EmojiPicker onPick={insertEmoji} />
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={streaming || !input.trim()}
              style={{
                alignSelf: 'flex-end',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: streaming || !input.trim() ? 'var(--color-border)' : 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
