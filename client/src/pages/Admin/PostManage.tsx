import { useState, useEffect } from 'react';
import { getAdminPostList, adminDeletePost, topPost } from '../../api/admin';
import { useConfirm } from '../../context/ConfirmContext';

interface Post {
  id: number;
  title: string;
  user_id: number;
  is_top: number;
  status: number;
  create_time: string;
  author?: { nickname: string };
}

export default function PostManage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { showConfirm } = useConfirm();

  const fetchPosts = () => {
    setLoading(true);
    getAdminPostList(page, 20, keyword)
      .then((data: any) => {
        setPosts(data.list);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, [page, keyword]);

  const handleSearch = () => {
    setPage(1);
    setKeyword(searchInput);
  };

  const handleDelete = async (id: number) => {
    if (!(await showConfirm('确定删除该帖子？'))) return;
    await adminDeletePost(id);
    fetchPosts();
  };

  const handleTop = async (post: Post) => {
    await topPost(post.id, post.is_top !== 1);
    fetchPosts();
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>内容管理</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="搜索帖子标题..."
          style={{
            width: 260, padding: '8px 12px', border: '1px solid var(--color-border)',
            borderRadius: 4, fontSize: 14, background: 'var(--color-bg-white)', color: 'var(--color-text)',
          }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '8px 20px', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}
        >
          搜索
        </button>
      </div>
      <div style={{ background: 'var(--color-bg-white)', borderRadius: 8, boxShadow: 'var(--shadow-card)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border-light)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>标题</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>作者</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>发布时间</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-hint)' }}>加载中...</td></tr>
            ) : posts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-lighter)' }}>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>
                  {p.title}
                  {p.is_top === 1 && <span style={{ color: 'var(--color-error)', marginLeft: 8, fontSize: 11 }}>[置顶]</span>}
                </td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{p.author?.nickname || '-'}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>
                  <span style={{ color: p.status === 1 ? 'var(--color-error)' : 'var(--color-success)' }}>
                    {p.status === 1 ? '已删除' : '正常'}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{new Date(p.create_time).toLocaleDateString('zh-CN')}</td>
                <td style={{ padding: '10px 16px', display: 'flex', gap: 8 }}>
                  <button onClick={() => handleTop(p)} style={{ color: 'var(--color-primary)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>
                    {p.is_top === 1 ? '取消置顶' : '置顶'}
                  </button>
                  {p.status === 0 && (
                    <button onClick={() => handleDelete(p.id)} style={{ color: 'var(--color-error)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>
                      删除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
