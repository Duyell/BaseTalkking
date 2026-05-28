import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      background: 'var(--color-bg-white)', borderBottom: '1px solid var(--color-border-light)',
      padding: '0 24px', height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/" style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
          交流基地
        </Link>
        <Link to="/" style={{ fontSize: 14, color: 'var(--color-text-secondary)', textDecoration: 'none' }}>首页</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user?.role === 'admin' && (
          <Link to="/admin" style={{ fontSize: 13, color: 'var(--color-error)', textDecoration: 'none' }}>
            管理后台
          </Link>
        )}
        <Link to="/profile" style={{ fontSize: 13, color: 'var(--color-text)', textDecoration: 'none' }}>
          {user?.nickname || '个人中心'}
        </Link>
        <button
          onClick={handleLogout}
          style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'none', border: 'none', cursor: 'pointer'}}
        >
          退出
        </button>
        <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? '切换暗黑模式' : '切换白天模式'}>
          {theme === 'light' ? '☽' : '☀'}
        </button>
      </div>
    </header>
  );
}
