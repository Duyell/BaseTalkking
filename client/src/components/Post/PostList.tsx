import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import Pagination from '../Common/Pagination';
import Loading from '../Common/Loading';
import Empty from '../Common/Empty';
import { getPostList } from '../../api/post';
import type { Post } from '../../types/post';

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    getPostList({ page, page_size: pageSize, keyword })
      .then(data => {
        setPosts(data.list);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [page, keyword]);

  const handleSearch = () => {
    setPage(1);
    setKeyword(searchInput);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="搜索帖子标题..."
          style={{
            flex: 1, padding: '8px 12px', border: '1px solid var(--color-border)',
            borderRadius: 4, fontSize: 14, background: 'var(--color-bg-white)', color: 'var(--color-text)',
          }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '8px 20px', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          搜索
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : posts.length === 0 ? (
        <Empty message={keyword ? '没有搜索到相关帖子' : '还没有帖子，来发布第一个吧'} />
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} />)
      )}

      <Pagination current={page} total={total} pageSize={pageSize} onChange={setPage} />
    </div>
  );
}
