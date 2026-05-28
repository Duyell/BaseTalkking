import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api/user';

export default function ProfileEditPage() {
  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then(data => {
      setNickname(data.user.nickname || '');
      setIntro(data.user.intro || '');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await updateProfile({ nickname, intro });
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '24px 16px', maxWidth: 500 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>编辑个人资料</h2>
      <form onSubmit={handleSubmit} style={{ background: 'var(--color-bg-white)', padding: 24, borderRadius: 8, boxShadow: 'var(--shadow-card)' }}>
        {error && <div style={{ color: 'var(--color-error)', marginBottom: 16, padding: '8px 12px', background: 'var(--color-error-bg)', borderRadius: 4 }}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>昵称</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={50}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 14, background: 'var(--color-bg-white)', color: 'var(--color-text)' }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>个人简介</label>
          <textarea
            value={intro}
            onChange={e => setIntro(e.target.value)}
            maxLength={255}
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 14, resize: 'vertical', background: 'var(--color-bg-white)', color: 'var(--color-text)' }}
          />
        </div>
        <button type="submit" disabled={submitting} style={{
          width: '100%', padding: '10px 0', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', border: 'none', borderRadius: 4, fontSize: 16, cursor: submitting ? 'not-allowed' : 'pointer',
        }}>
          {submitting ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}
