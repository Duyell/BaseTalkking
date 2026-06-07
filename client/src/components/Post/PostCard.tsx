import { Link } from 'react-router-dom';
import { PushPin } from '@phosphor-icons/react';
import type { Post } from '../../types/post';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const preview =
    post.content.length > 200
      ? post.content.slice(0, 200) + '...'
      : post.content;

  return (
    <div
      className="post-card-inner"
      style={{
        background: 'var(--atmo-glass-bg)',
        backdropFilter: 'blur(12px) saturate(120%)',
        WebkitBackdropFilter: 'blur(12px) saturate(120%)',
        border: '1px solid var(--atmo-glass-border)',
        borderRadius: 16,
        padding: '18px 22px',
        marginBottom: 12,
        boxShadow: '0 2px 12px var(--atmo-glass-shadow)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 24px var(--atmo-glass-shadow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px var(--atmo-glass-shadow)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {post.is_top === 1 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              background: 'var(--atmo-accent)',
              color: 'var(--color-text-inverse)',
              padding: '2px 8px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.03em',
            }}
          >
            <PushPin size={10} weight="fill" />
            TOP
          </span>
        )}
        <Link
          to={`/post/${post.id}`}
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--atmo-text-primary)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--atmo-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--atmo-text-primary)';
          }}
        >
          {post.title}
        </Link>
      </div>
      <p
        style={{
          color: 'var(--atmo-text-secondary)',
          fontSize: 13,
          lineHeight: 1.7,
          margin: '0 0 14px',
        }}
      >
        {preview}
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--atmo-text-muted)',
          fontSize: 12,
          letterSpacing: '0.03em',
        }}
      >
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
