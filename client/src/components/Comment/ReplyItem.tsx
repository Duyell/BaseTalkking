import type { ReplyItem } from '../../types/comment';
import { formatRelativeTime } from '../../utils/format';

interface ReplyItemProps {
  reply: ReplyItem;
}

export default function ReplyItemView({ reply }: ReplyItemProps) {
  return (
    <div style={{ padding: '4px 0', fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
      <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{reply.nickname}</span>
      {reply.reply_to_name && (
        <>
          <span style={{ margin: '0 4px', color: 'var(--color-text-hint)' }}>回复</span>
          <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{reply.reply_to_name}</span>
        </>
      )}
      <span style={{ margin: '0 4px' }}>:</span>
      <span>{reply.content}</span>
      <span style={{ marginLeft: 8, color: 'var(--color-text-disabled)', fontSize: 11 }}>
        {formatRelativeTime(reply.create_time)}
      </span>
    </div>
  );
}
