import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/admin', label: '管理首页' },
  { path: '/admin/invite', label: '邀请码管理' },
  { path: '/admin/users', label: '用户管理' },
  { path: '/admin/posts', label: '内容管理' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={{
      width: 200, minHeight: 'calc(100vh - 56px)', background: 'var(--color-bg-white)',
      borderRight: '1px solid var(--color-border-light)', paddingTop: 16,
    }}>
      {menuItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            display: 'block', padding: '12px 24px', fontSize: 14,
            color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text)',
            background: location.pathname === item.path ? 'var(--color-primary-bg)' : 'transparent',
            borderRight: location.pathname === item.path ? '3px solid var(--color-primary)' : '3px solid transparent',
            textDecoration: 'none',
          }}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
