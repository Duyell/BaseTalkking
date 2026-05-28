import { Link } from 'react-router-dom';
import PostList from '../components/Post/PostList';

export default function HomePage() {

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>帖子列表</h2>
        <Link
          to="/post/create"
          style={{
            padding: '8px 20px', background: 'var(--color-primary)', color: 'var(--color-text-inverse)',
            borderRadius: 4, textDecoration: 'none', fontSize: 14,
          }}
        >
          发布帖子
        </Link>
      </div>
      <PostList />
    </div>
  );
}
