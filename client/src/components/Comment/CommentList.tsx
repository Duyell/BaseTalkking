import { useState, useEffect, useCallback } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import Pagination from '../Common/Pagination';
import { getComments, createComment, deleteComment } from '../../api/comment';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import type { Comment } from '../../types/comment';

interface CommentListProps {
  postId: number;
  currentUserId: number;
  postOwnerId: number;
}

export default function CommentList({ postId, currentUserId, postOwnerId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const pageSize = 20;

  const fetchComments = useCallback(() => {
    setLoading(true);
    getComments(postId, page, pageSize)
      .then(data => {
        setComments(data.list);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [postId, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async (content: string) => {
    await createComment(postId, { content });
    setReplyTarget(null);
    fetchComments();
  };

  const handleReplySubmit = async (content: string) => {
    if (!replyTarget) return;
    await createComment(postId, {
      content,
      parent_id: replyTarget.id,
      reply_to_user_id: replyTarget.user_id,
    });
    setReplyTarget(null);
    fetchComments();
  };

  const handleDelete = async (id: number) => {
    if (!(await showConfirm('确定删除这条评论吗？'))) return;
    try {
      await deleteComment(id);
      fetchComments();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除失败', 'error');
    }
  };

  return (
    <div style={{ background: 'var(--color-bg-white)', borderRadius: 8, padding: '0 20px 20px', boxShadow: 'var(--shadow-card)' }}>
      <h3 style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border-lighter)', fontSize: 16, fontWeight: 600 }}>
        评论 ({total})
      </h3>

      {/* 顶级评论输入框 */}
      <div style={{ padding: '16px 0' }}>
        <CommentForm
          placeholder="写下你的评论..."
          onSubmit={handleCommentSubmit}
        />
      </div>

      {/* 回复浮层 */}
      {replyTarget && (
        <div style={{
          marginBottom: 12, padding: 12, background: 'var(--color-bg-elevated)', borderRadius: 4,
          border: '1px solid var(--color-border-light)',
        }}>
          <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--color-text-hint)', display: 'flex', justifyContent: 'space-between' }}>
            <span>回复 @{replyTarget.user?.nickname || '匿名'}</span>
            <button
              onClick={() => setReplyTarget(null)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-hint)', cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          </div>
          <CommentForm
            placeholder={`回复 @${replyTarget.user?.nickname || '匿名'}...`}
            onSubmit={handleReplySubmit}
            autoFocus
          />
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-hint)' }}>加载评论中...</div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-disabled)' }}>暂无评论，来抢沙发吧</div>
      ) : (
        comments.map((c, idx) => (
          <CommentItem
            key={c.id}
            comment={c}
            floor={(page - 1) * pageSize + idx + 1}
            currentUserId={currentUserId}
            isPostOwner={currentUserId === postOwnerId}
            onReply={setReplyTarget}
            onDelete={handleDelete}
          />
        ))
      )}

      <Pagination current={page} total={total} pageSize={pageSize} onChange={setPage} />
    </div>
  );
}
