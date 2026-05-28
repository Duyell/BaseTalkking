import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../components/Post/PostForm';
import { getPostDetail, updatePost } from '../api/post';
import type { Post } from '../types/post';

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getPostDetail(Number(id))
      .then(setPost)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: { title: string; content: string }) => {
    if (!id) return;
    await updatePost(Number(id), data);
    navigate(`/post/${id}`, { replace: true });
  };

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-hint)' }}>加载中...</div>;
  if (!post) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--color-error)' }}>帖子不存在</div>;

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <button
        onClick={() => navigate(`/post/${id}`)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-hint)', fontSize: 14,
          padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        ← 返回帖子
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>编辑帖子</h2>
      <div style={{ background: 'var(--color-bg-white)', borderRadius: 8, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <PostForm
          initialTitle={post.title}
          initialContent={post.content}
          onSubmit={handleSubmit}
          submitLabel="保存修改"
        />
      </div>
    </div>
  );
}
