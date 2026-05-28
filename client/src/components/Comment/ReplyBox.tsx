import { useState, useEffect } from 'react';
import ReplyItemView from './ReplyItem';
import { getReplies } from '../../api/comment';
import type { ReplyItem, Comment } from '../../types/comment';

interface ReplyBoxProps {
  parentID: number;
  replies: ReplyItem[];
  replyCount: number;
  hasMore: boolean;
  onReplyClick: () => void;
}

export default function ReplyBox({ parentID, replies, replyCount, hasMore, onReplyClick }: ReplyBoxProps) {
  const [expanded, setExpanded] = useState(false);
  const [allReplies, setAllReplies] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded) {
      setLoading(true);
      getReplies(parentID)
        .then(data => setAllReplies(data.list))
        .finally(() => setLoading(false));
    }
  }, [expanded, parentID]);

  if (replies.length === 0 && replyCount === 0) return null;

  return (
    <div style={{
      marginTop: 8, padding: '8px 12px',
      background: 'var(--color-bg-reply)', borderRadius: 4,
      borderLeft: '2px solid var(--color-border-light)',
    }}>
      {!expanded ? (
        <>
          {replies.map(r => (
            <ReplyItemView key={r.id} reply={r} />
          ))}
          {hasMore && (
            <button
              onClick={() => setExpanded(true)}
              style={{
                background: 'none', border: 'none', color: 'var(--color-primary)',
                fontSize: 12, cursor: 'pointer', padding: '4px 0',
              }}
            >
              展开 {replyCount} 条回复 ›
            </button>
          )}
        </>
      ) : (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--color-text-hint)', fontSize: 12 }}>加载中...</div>
          ) : (
            allReplies.map(r => (
              <ReplyItemView
                key={r.id}
                reply={{
                  id: r.id,
                  content: r.content,
                  user_id: r.user_id,
                  nickname: r.user?.nickname || '未知',
                  avatar: r.user?.avatar || '',
                  reply_to_user_id: r.reply_to_user_id,
                  reply_to_name: r.reply_to_user?.nickname || '',
                  like_count: r.like_count,
                  create_time: r.create_time,
                }}
              />
            ))
          )}
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: 'none', border: 'none', color: 'var(--color-primary)',
              fontSize: 12, cursor: 'pointer', padding: '4px 0',
            }}
          >
            收起 ›
          </button>
        </>
      )}
      {/* Reply button */}
      <button
        onClick={onReplyClick}
        style={{
          background: 'none', border: 'none', color: 'var(--color-text-hint)',
          fontSize: 12, cursor: 'pointer', padding: '4px 0',
        }}
      >
        💬 回复
      </button>
    </div>
  );
}
