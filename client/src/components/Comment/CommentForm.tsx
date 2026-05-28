import { useState, useRef } from 'react';
import EmojiPicker from '../Common/EmojiPicker';

interface CommentFormProps {
  placeholder: string;
  onSubmit: (content: string) => Promise<void>;
  autoFocus?: boolean;
}

export default function CommentForm({ placeholder, onSubmit, autoFocus = false }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = content.slice(0, start) + emoji + content.slice(end);
    setContent(newValue);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + emoji.length;
      ta.focus();
    });
  };

  const doSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      doSubmit();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={2}
            style={{
              width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
              borderRadius: 4, fontSize: 14, lineHeight: 1.6, resize: 'vertical',
              background: 'var(--color-bg-white)', color: 'var(--color-text)',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ position: 'absolute', right: 6, bottom: 4 }}>
            <EmojiPicker onPick={insertEmoji} />
          </div>
        </div>
        <button
          type="button"
          onClick={doSubmit}
          disabled={submitting || !content.trim()}
          style={{
            alignSelf: 'flex-end', padding: '8px 18px', background: 'var(--color-primary)',
            color: 'var(--color-text-inverse)', border: 'none', borderRadius: 4, fontSize: 13,
            cursor: submitting ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {submitting ? '发送中' : '发送'}
        </button>
      </div>
      {error && <div style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
  );
}
