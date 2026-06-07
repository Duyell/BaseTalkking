import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import Pagination from '../Common/Pagination';
import Loading from '../Common/Loading';
import Empty from '../Common/Empty';
import { getPostList } from '../../api/post';
import type { Post } from '../../types/post';
import { MagnifyingGlass } from '@phosphor-icons/react';

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
      .then((data) => {
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
      {/* Search bar */}
      <div className="search-row" style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <MagnifyingGlass
            size={16}
            weight="light"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--atmo-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索帖子标题..."
            className="atmo-input"
            style={{ paddingLeft: 40 }}
          />
        </div>
        <button onClick={handleSearch} className="atmo-btn" style={{ padding: '10px 22px' }}>
          <MagnifyingGlass size={16} weight="light" />
          搜索
        </button>
      </div>

      {/* Content states */}
      {loading ? (
        <Loading />
      ) : posts.length === 0 ? (
        <Empty message={keyword ? '没有搜索到相关帖子' : '还没有帖子，来发布第一个吧'} />
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}

      <Pagination current={page} total={total} pageSize={pageSize} onChange={setPage} />
    </div>
  );
}
