import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostDetail from '../components/Post/PostDetail';
import CommentList from '../components/Comment/CommentList';
import { getPostDetail, deletePost } from '../api/post';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import type { Post } from '../types/post';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPostDetail(Number(id))
      .then(setPost)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!post || !(await showConfirm('确定要删除这个帖子吗？'))) return;
    try {
      await deletePost(post.id);
      navigate('/', { replace: true });
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除失败', 'error');
    }
  };

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-hint)' }}>加载中...</div>;
  if (error) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--color-error)' }}>{error}</div>;
  if (!post) return null;

  const isOwner = user?.id === post.user_id;

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-hint)', fontSize: 14,
          padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        ← 返回首页
      </button>
      <PostDetail post={post} isOwner={isOwner} onDelete={handleDelete} />
      <CommentList postId={post.id} currentUserId={user?.id || 0} postOwnerId={post.user_id} />
    </div>
  );
}
