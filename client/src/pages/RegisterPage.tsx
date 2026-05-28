import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 前端初步校验
    if (password.length < 8) {
      setError('密码至少需要8位');
      return;
    }
    if (inviteCode.length !== 16) {
      setError('邀请码必须为16位');
      return;
    }

    setSubmitting(true);
    try {
      await register({ username, password, invite_code: inviteCode });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="auth-bg">
      <div style={{ maxWidth: 400, width: '100%', margin: '80px auto', padding: '0 16px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ color: 'var(--color-success)', marginBottom: 16 }}>注册成功!</h1>
        <p style={{ marginBottom: 24, color: 'var(--color-text-inverse)' }}>您已成功加入交流基地</p>
        <button
          onClick={() => navigate('/login')}
          className="btn-ripple"
          style={{ padding: '10px 40px', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', border: 'none', borderRadius: 4, fontSize: 16, cursor: 'pointer' }}
        >
          前往登录
        </button>
      </div>
      </div>
    );
  }

  return (
    <div className="auth-bg">
    <div style={{ maxWidth: 400, width: '100%', position: 'relative', zIndex: 1 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 32, color: 'var(--color-text-inverse)' }}>邀请码注册</h1>
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
            minLength={3}
            maxLength={20}
            placeholder="3-20位字母数字下划线"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 14, background: 'var(--color-bg-white)', color: 'var(--color-text)' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="至少8位，包含字母和数字"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 14, background: 'var(--color-bg-white)', color: 'var(--color-text)' }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>邀请码</label>
          <input
            type="text"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            required
            minLength={16}
            maxLength={16}
            placeholder="请输入16位邀请码"
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
          {submitting ? '注册中...' : '注 册'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </form>
    </div>
    </div>
  );
}
