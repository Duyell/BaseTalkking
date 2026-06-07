import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignIn, User, LockKey } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import AtmosphereContainer from '../components/Atmosphere/AtmosphereContainer';
import GlassPanel from '../components/Atmosphere/GlassPanel';
import StaggerReveal, { StaggerItem } from '../components/Atmosphere/StaggerReveal';

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
    <AtmosphereContainer>
      {/* Background glows */}
      <div
        className="atmo-glow"
        style={{ width: 400, height: 400, top: '35%', left: '50%', transform: 'translate(-50%, -50%)' }}
        aria-hidden="true"
      />

      <div className="atmo-page">
        {/* Header */}
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center', marginBottom: 32 }}>
          <StaggerReveal delay={0.2}>
            <StaggerItem>
              <div className="atmo-line" style={{ marginBottom: 24 }} />
            </StaggerItem>
            <StaggerItem>
              <h1 className="atmo-title" style={{ marginBottom: 8 }}>
                おかえりなさい
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="atmo-subtitle">また会えて嬉しいです</p>
            </StaggerItem>
          </StaggerReveal>
        </div>

        {/* Form Panel */}
        <GlassPanel delay={0.8} style={{ maxWidth: 400, width: '100%', padding: '36px 32px' }}>
          <form onSubmit={handleSubmit}>
            {/* Error state */}
            {error && (
              <div
                style={{
                  color: 'var(--color-error)',
                  marginBottom: 20,
                  padding: '10px 14px',
                  background: 'var(--color-error-bg)',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {/* Username */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  fontSize: '0.82rem',
                  letterSpacing: '0.05em',
                  color: 'var(--atmo-text-secondary)',
                  fontWeight: 500,
                }}
              >
                用户名
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--atmo-text-muted)',
                    pointerEvents: 'none',
                    display: 'flex',
                  }}
                >
                  <User size={16} weight="light" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="请输入用户名"
                  className="atmo-input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  fontSize: '0.82rem',
                  letterSpacing: '0.05em',
                  color: 'var(--atmo-text-secondary)',
                  fontWeight: 500,
                }}
              >
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--atmo-text-muted)',
                    pointerEvents: 'none',
                    display: 'flex',
                  }}
                >
                  <LockKey size={16} weight="light" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="请输入密码"
                  className="atmo-input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="atmo-btn"
              style={{ width: '100%' }}
            >
              {submitting ? (
                <>
                  <span className="atmo-shimmer" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                  登录中...
                </>
              ) : (
                <>
                  <SignIn size={18} weight="light" />
                  登 录
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
              fontSize: '0.88rem',
              color: 'var(--atmo-text-secondary)',
            }}
          >
            还没有账号？
            <br />
            <Link
              to="/register"
              style={{
                color: 'var(--atmo-accent)',
                textDecoration: 'none',
                fontWeight: 500,
                marginTop: 4,
                display: 'inline-block',
              }}
            >
              使用邀请码注册
            </Link>
          </div>
        </GlassPanel>
      </div>
    </AtmosphereContainer>
  );
}
