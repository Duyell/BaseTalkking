export default function AdminDashboard() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>管理后台</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: '邀请码管理', desc: '生成和管理邀请码', path: '/admin/invite' },
          { label: '用户管理', desc: '查看用户、封禁/解封', path: '/admin/users' },
          { label: '内容管理', desc: '管理帖子和评论', path: '/admin/posts' },
        ].map(item => (
          <a key={item.path} href={item.path} style={{
            background: 'var(--color-bg-white)', padding: 24, borderRadius: 8, boxShadow: 'var(--shadow-card)',
            textDecoration: 'none', color: 'var(--color-text)',
          }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>{item.label}</h3>
            <p style={{ color: 'var(--color-text-hint)', fontSize: 13 }}>{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
