import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ username, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-bg">
    <div style={{ maxWidth: 400, width: '100%', position: 'relative', zIndex: 1 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 32, color: 'var(--color-text-inverse)' }}>Welcome to BaseTalkking</h1>
      <form onSubmit={handleSubmit} style={{ background: 'var(--color-bg-white)', padding: 32, borderRadius: 8, boxShadow: 'var(--shadow-form)' }}>
        {error && (
          <div style={{ color: 'var(--color-error)', marginBottom: 16, padding: '8px 12px', background: 'var(--color-error-bg)', borderRadius: 4 }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>用户名</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="请输入用户名"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 14, background: 'var(--color-bg-white)', color: 'var(--color-text)' }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="请输入密码"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 14, background: 'var(--color-bg-white)', color: 'var(--color-text)' }}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-ripple"
          style={{
            width: '100%', padding: '10px 0', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', border: 'none',
            borderRadius: 4, fontSize: 16, cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? '登录中...' : '登 录'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          还没有账号？<Link to="/register">使用邀请码注册</Link>
        </div>
      </form>
    </div>
    </div>
  );
}
