import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';

interface PostDetailProps {
  post: Post;
  isOwner: boolean;
  onDelete: () => void;
}

export default function PostDetail({ post, isOwner, onDelete }: PostDetailProps) {
  return (
    <div style={{ background: 'var(--color-bg-white)', borderRadius: 8, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow-card)' }}>
      <h1 style={{ fontSize: 22, marginBottom: 12, lineHeight: 1.4 }}>{post.title}</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--color-border-lighter)' }}>
        <div style={{ color: 'var(--color-text-hint)', fontSize: 13 }}>
          <span style={{ marginRight: 16 }}>作者: {post.author?.nickname || '未知'}</span>
          <span>发布于 {new Date(post.create_time).toLocaleString('zh-CN')}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isOwner && (
            <>
              <Link to={`/post/${post.id}/edit`} style={{ color: 'var(--color-primary)', fontSize: 13 }}>编辑</Link>
              <button onClick={onDelete} style={{ color: 'var(--color-error)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>
                删除
              </button>
            </>
          )}
        </div>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {post.content}
      </div>
    </div>
  );
}
