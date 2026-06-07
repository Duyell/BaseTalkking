import { Link, useLocation } from 'react-router-dom';
import { House, Ticket, Users, FileText } from '@phosphor-icons/react';

const menuItems = [
  { path: '/admin', label: '管理首页', icon: House },
  { path: '/admin/invite', label: '邀请码管理', icon: Ticket },
  { path: '/admin/users', label: '用户管理', icon: Users },
  { path: '/admin/posts', label: '内容管理', icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      style={{
        width: 210,
        minHeight: 'calc(100vh - 56px)',
        background: 'var(--atmo-glass-bg)',
        backdropFilter: 'blur(14px) saturate(130%)',
        WebkitBackdropFilter: 'blur(14px) saturate(130%)',
        borderRight: '1px solid var(--atmo-glass-border)',
        paddingTop: 16,
      }}
    >
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 24px',
              fontSize: 14,
              color: isActive ? 'var(--atmo-accent)' : 'var(--atmo-text-secondary)',
              background: isActive ? 'var(--atmo-accent-glow)' : 'transparent',
              borderRight: isActive ? '2px solid var(--atmo-accent)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Icon size={16} weight={isActive ? 'regular' : 'light'} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
