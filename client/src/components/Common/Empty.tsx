interface EmptyProps {
  message?: string;
}

export default function Empty({ message = '暂无数据' }: EmptyProps) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-hint)' }}>
      <div style={{ fontSize: 14 }}>{message}</div>
    </div>
  );
}
