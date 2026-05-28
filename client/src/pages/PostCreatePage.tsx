import { useNavigate } from 'react-router-dom';
import PostForm from '../components/Post/PostForm';
import { createPost } from '../api/post';

export default function PostCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: { title: string; content: string }) => {
    const post = await createPost(data);
    navigate(`/post/${post.id}`, { replace: true });
  };

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
        ← 返回
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>发布帖子</h2>
      <div style={{ background: 'var(--color-bg-white)', borderRadius: 8, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <PostForm onSubmit={handleSubmit} submitLabel="发布" />
      </div>
    </div>
  );
}
