import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { House, User, SignOut, ShieldWarning, Moon, Sun } from '@phosphor-icons/react';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        background: 'var(--atmo-glass-bg)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        borderBottom: '1px solid var(--atmo-glass-border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 12px var(--atmo-glass-shadow)',
      }}
    >
      {/* Left: logo + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Link
          to="/"
          className="header-logo-text"
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.03em',
            color: 'var(--atmo-accent)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          交流基地
        </Link>
        <Link
          to="/"
          style={{
            fontSize: 13,
            color: 'var(--atmo-text-secondary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'color 0.2s',
          }}
        >
          <House size={15} weight="light" />
          <span className="header-nav-label">首页</span>
        </Link>
      </div>

      {/* Right: user + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="header-admin-link"
            style={{
              fontSize: 13,
              color: 'var(--color-error)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'opacity 0.2s',
            }}
          >
            <ShieldWarning size={15} weight="light" />
            <span className="header-nav-label">管理后台</span>
          </Link>
        )}
        <Link
          to="/profile"
          style={{
            fontSize: 13,
            color: 'var(--atmo-text-primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'color 0.2s',
          }}
        >
          <User size={15} weight="light" />
          <span className="header-user-label">{user?.nickname || '个人中心'}</span>
        </Link>
        <button
          onClick={handleLogout}
          style={{
            fontSize: 13,
            color: 'var(--atmo-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: 0,
            transition: 'color 0.2s',
          }}
        >
          <SignOut size={15} weight="light" />
          <span className="header-nav-label">退出</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? '切换暗黑模式' : '切换白天模式'}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: '1px solid var(--atmo-glass-border)',
            background: 'var(--atmo-glass-bg)',
            color: 'var(--atmo-text-secondary)',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.4s, border-color 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotate(25deg)';
            e.currentTarget.style.borderColor = 'var(--atmo-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotate(0deg)';
            e.currentTarget.style.borderColor = 'var(--atmo-glass-border)';
          }}
        >
          {theme === 'light' ? <Moon size={16} weight="light" /> : <Sun size={16} weight="light" />}
        </button>
      </div>
    </header>
  );
}
