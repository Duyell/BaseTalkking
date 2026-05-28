import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const preview = post.content.length > 200
    ? post.content.slice(0, 200) + '...'
    : post.content;

  return (
    <div style={{
      background: 'var(--color-bg-white)', borderRadius: 8, padding: '16px 20px',
      marginBottom: 12, boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {post.is_top === 1 && (
          <span style={{ background: 'var(--color-error)', color: 'var(--color-text-inverse)', padding: '1px 6px', borderRadius: 2, fontSize: 12 }}>
            置顶
          </span>
        )}
        <Link to={`/post/${post.id}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none' }}>
          {post.title}
        </Link>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>{preview}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-hint)', fontSize: 12 }}>
        <span>{post.author?.nickname || '未知用户'}</span>
        <span>{formatDate(post.create_time)}</span>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return d.toLocaleDateString('zh-CN');
}
