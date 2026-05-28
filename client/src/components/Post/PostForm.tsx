import { useState, useRef } from 'react';
import EmojiPicker from '../Common/EmojiPicker';

interface PostFormProps {
  initialTitle?: string;
  initialContent?: string;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  submitLabel: string;
}

export default function PostForm({ initialTitle = '', initialContent = '', onSubmit, submitLabel }: PostFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
    setError('');
    if (!title.trim()) { setError('请输入标题'); return; }
    if (!content.trim()) { setError('请输入内容'); return; }
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: 16, padding: '8px 12px', background: 'var(--color-error-bg)', borderRadius: 4 }}>
          {error}
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="请输入帖子标题"
          style={{
            width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)',
            borderRadius: 4, fontSize: 16, fontWeight: 500, background: 'var(--color-bg-white)', color: 'var(--color-text)',
          }}
        />
      </div>
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          required
          rows={12}
          placeholder="请输入帖子内容"
          style={{
            width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)',
            borderRadius: 4, fontSize: 14, lineHeight: 1.8, resize: 'vertical', background: 'var(--color-bg-white)', color: 'var(--color-text)',
          }}
        />
        <div style={{ position: 'absolute', right: 6, bottom: 8 }}>
          <EmojiPicker onPick={insertEmoji} />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%', padding: '10px 0', background: 'var(--color-primary)', color: 'var(--color-text-inverse)',
          border: 'none', borderRadius: 4, fontSize: 16,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? '提交中...' : submitLabel}
      </button>
    </form>
  );
}
