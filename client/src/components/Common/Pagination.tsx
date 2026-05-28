interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export default function Pagination({ current, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, current + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
      <button
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        style={btnStyle(current <= 1)}
      >
        上一页
      </button>
      {start > 1 && <span style={{ padding: '6px 4px' }}>...</span>}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            ...btnStyle(false),
            background: p === current ? 'var(--color-primary)' : 'var(--color-bg-white)',
            color: p === current ? 'var(--color-text-inverse)' : 'var(--color-text)',
          }}
        >
          {p}
        </button>
      ))}
      {end < totalPages && <span style={{ padding: '6px 4px' }}>...</span>}
      <button
        disabled={current >= totalPages}
        onClick={() => onChange(current + 1)}
        style={btnStyle(current >= totalPages)}
      >
        下一页
      </button>
    </div>
  );
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    background: disabled ? 'var(--color-bg)' : 'var(--color-bg-white)',
    color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 14,
  };
}
