import { useState } from 'react';
import ReplyBox from './ReplyBox';
import { likeComment, pinComment } from '../../api/comment';
import { formatRelativeTime } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import type { Comment } from '../../types/comment';

interface CommentItemProps {
  comment: Comment;
  floor: number;
  currentUserId: number;
  isPostOwner: boolean;
  onReply: (comment: Comment) => void;
  onDelete: (id: number) => void;
}

export default function CommentItem({ comment, floor, currentUserId, isPostOwner, onReply, onDelete }: CommentItemProps) {
  const isOwner = currentUserId === comment.user_id;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [pinned, setPinned] = useState(comment.is_pinned === 1);
  const { showToast } = useToast();

  const handlePin = async () => {
    try {
      const data = await pinComment(comment.id, comment.post_id);
      setPinned(data.is_pinned === 1);
      showToast(data.is_pinned === 1 ? '置顶成功' : '取消置顶', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '操作失败', 'error');
    }
  };

  const handleLike = async () => {
    try {
      const data = await likeComment(comment.id);
      setLiked(data.liked);
      setLikeCount(data.like_count);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '操作失败', 'error');
    }
  };

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--color-border-lighter)' }}>
      {/* 顶级评论 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 14 }}>
            {comment.user?.nickname || '匿名'}
          </span>
          <span style={{ color: 'var(--color-text-disabled)', fontSize: 12 }}>
            {formatRelativeTime(comment.create_time)}
          </span>
          <span style={{ color: 'var(--color-text-disabled)', fontSize: 12 }}>{floor}楼</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={handleLike}
            style={{
              color: liked ? 'var(--color-primary)' : 'var(--color-text-hint)',
              fontSize: 12, background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            👍 {likeCount}
          </button>
          {isPostOwner && (
            <button
              onClick={handlePin}
              style={{
                color: pinned ? 'var(--color-warning)' : 'var(--color-text-hint)',
                fontSize: 12, background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              📌 {pinned ? '取消置顶' : '置顶'}
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              style={{ color: 'var(--color-error)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              删除
            </button>
          )}
        </div>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--color-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {comment.content}
      </div>

      {/* 楼中楼 */}
      <ReplyBox
        parentID={comment.id}
        replies={comment.replies}
        replyCount={comment.reply_count}
        hasMore={comment.has_more_replies}
        onReplyClick={() => onReply(comment)}
      />
    </div>
  );
}
