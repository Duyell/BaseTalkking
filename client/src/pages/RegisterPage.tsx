import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, LockKey, Ticket, CheckCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import AtmosphereContainer from '../components/Atmosphere/AtmosphereContainer';
import GlassPanel from '../components/Atmosphere/GlassPanel';
import StaggerReveal, { StaggerItem } from '../components/Atmosphere/StaggerReveal';

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

  return (
    <AtmosphereContainer>
      {/* Background glows */}
      <div
        className="atmo-glow"
        style={{ width: 350, height: 350, top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}
        aria-hidden="true"
      />
      <div
        className="atmo-glow"
        style={{ width: 200, height: 200, bottom: '15%', right: '20%', animationDelay: '4s' }}
        aria-hidden="true"
      />

      <div className="atmo-page">
        {success ? (
          /* ---- Success State ---- */
          <GlassPanel delay={0.3} style={{ maxWidth: 400, width: '100%', padding: '48px 36px', textAlign: 'center' }}>
            <CheckCircle
              size={48}
              weight="light"
              style={{ color: 'var(--color-success)', marginBottom: 20 }}
            />
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 300,
                letterSpacing: '0.05em',
                color: 'var(--atmo-text-primary)',
                marginBottom: 8,
              }}
            >
              登録完了
            </h2>
            <p
              style={{
                color: 'var(--atmo-text-secondary)',
                fontSize: '0.92rem',
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              BaseTalkking へようこそ。
              <br />
              静かな場所で、思いを綴ってください。
            </p>
            <button
              onClick={() => navigate('/login')}
              className="atmo-btn"
              style={{ width: '100%' }}
            >
              前往登录
            </button>
          </GlassPanel>
        ) : (
          <>
            {/* Header */}
            <div style={{ maxWidth: 420, width: '100%', textAlign: 'center', marginBottom: 28 }}>
              <StaggerReveal delay={0.2}>
                <StaggerItem>
                  <div className="atmo-line" style={{ marginBottom: 20 }} />
                </StaggerItem>
                <StaggerItem>
                  <h1 className="atmo-title" style={{ marginBottom: 6 }}>
                    はじめまして
                  </h1>
                </StaggerItem>
                <StaggerItem>
                  <p className="atmo-subtitle">ようこそ、静かな場所へ</p>
                </StaggerItem>
              </StaggerReveal>
            </div>

            {/* Form Panel */}
            <GlassPanel delay={0.7} style={{ maxWidth: 420, width: '100%', padding: '36px 32px' }}>
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
                <div style={{ marginBottom: 18 }}>
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
                    <User
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
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      minLength={3}
                      maxLength={20}
                      placeholder="3-20位字母数字"
                      className="atmo-input"
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 18 }}>
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
                    <LockKey
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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="至少8位，包含字母和数字"
                      className="atmo-input"
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                </div>

                {/* Invite Code */}
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
                    邀请码
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Ticket
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
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      minLength={16}
                      maxLength={16}
                      placeholder="请输入16位邀请码"
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
                      注册中...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} weight="light" />
                      注 册
                    </>
                  )}
                </button>
              </form>

              {/* Login link */}
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 24,
                  fontSize: '0.88rem',
                  color: 'var(--atmo-text-secondary)',
                }}
              >
                已有账号？
                <br />
                <Link
                  to="/login"
                  style={{
                    color: 'var(--atmo-accent)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    marginTop: 4,
                    display: 'inline-block',
                  }}
                >
                  立即登录
                </Link>
              </div>
            </GlassPanel>
          </>
        )}
      </div>
    </AtmosphereContainer>
  );
}
