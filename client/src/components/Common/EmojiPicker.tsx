import { useState, useRef, useEffect } from 'react';
import { emojiCategories } from './emojiData';

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
}

export default function EmojiPicker({ onPick }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handlePick = (emoji: string) => {
    onPick(emoji);
    setOpen(false);
  };

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="表情"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '2px 4px', lineHeight: 1, borderRadius: 4,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-hint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: 6,
            background: 'var(--color-bg-white)', border: '1px solid var(--color-border)',
            borderRadius: 8, boxShadow: 'var(--shadow-form)', zIndex: 1001,
            width: 296, padding: 8, overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', gap: 2, marginBottom: 6, borderBottom: '1px solid var(--color-border-lighter)', paddingBottom: 6 }}>
            {emojiCategories.map((cat, i) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setTab(i)}
                title={cat.name}
                style={{
                  background: i === tab ? 'var(--color-primary-bg)' : 'none',
                  border: 'none', borderRadius: 4, cursor: 'pointer',
                  fontSize: 16, padding: '4px 6px', lineHeight: 1,
                }}
              >
                {cat.icon}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', width: 280 }}>
            {emojiCategories[tab].items.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handlePick(emoji)}
                style={{
                  width: 35, height: 32,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 19, lineHeight: 1, borderRadius: 4,
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--color-bg)'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'none'; }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  );
}
