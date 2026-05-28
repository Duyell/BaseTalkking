import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile } from '../api/user';
import type { User } from '../types/user';
import type { Post } from '../types/post';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(data => {
        setUser(data.user);
        setPosts(data.posts);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-hint)' }}>加载中...</div>;
  if (!user) return null;

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div style={{ background: 'var(--color-bg-white)', borderRadius: 8, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            {(user.nickname || user.username)[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{user.nickname}</h2>
            <p style={{ color: 'var(--color-text-hint)', fontSize: 13 }}>@{user.username} · {user.role === 'admin' ? '管理员' : '普通用户'}</p>
          </div>
          <Link to="/profile/edit" style={{ marginLeft: 'auto', padding: '6px 16px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13, color: 'var(--color-text)', textDecoration: 'none' }}>
            编辑资料
          </Link>
        </div>
        {user.intro && <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{user.intro}</p>}
        <div style={{ marginTop: 16, color: 'var(--color-text-hint)', fontSize: 12 }}>
          注册时间: {new Date(user.create_time).toLocaleDateString('zh-CN')}
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>我的帖子</h3>
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-disabled)' }}>还没有发布过帖子</div>
      ) : (
        posts.map(p => (
          <Link key={p.id} to={`/post/${p.id}`} style={{ display: 'block', background: 'var(--color-bg-white)', padding: '12px 16px', borderRadius: 4, marginBottom: 8, boxShadow: 'var(--shadow-card)', textDecoration: 'none', color: 'var(--color-text)' }}>
            {p.title}
            <span style={{ float: 'right', color: 'var(--color-text-hint)', fontSize: 12 }}>
              {new Date(p.create_time).toLocaleDateString('zh-CN')}
            </span>
          </Link>
        ))
      )}
    </div>
  );
}
