import { Link } from 'react-router-dom';
import { Plus, Sparkle } from '@phosphor-icons/react';
import PostList from '../components/Post/PostList';
import FloatingParticles from '../components/Atmosphere/FloatingParticles';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  // Greeting varies by time of day
  const hour = new Date().getHours();
  const greeting = hour < 6 ? '夜深了' : hour < 12 ? 'おはよう' : hour < 18 ? 'こんにちは' : 'こんばんは';

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Subtle floating particles */}
      <FloatingParticles />

      {/* Atmospheric glows — kept within viewport bounds */}
      <div
        className="atmo-glow"
        style={{ width: 300, height: 300, top: '0%', right: '0%', opacity: 0.3 }}
        aria-hidden="true"
      />
      <div
        className="atmo-glow"
        style={{ width: 180, height: 180, bottom: '5%', left: '0%', opacity: 0.2, animationDelay: '4s' }}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="container" style={{ width: '100%', maxWidth: 960, padding: '32px 16px', position: 'relative', zIndex: 2 }}>
        {/* Welcome banner */}
        <div
          className="home-welcome"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                color: 'var(--atmo-text-muted)',
                marginBottom: 6,
                textTransform: 'uppercase',
              }}
            >
              {greeting}
            </p>
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 300,
                letterSpacing: '0.04em',
                color: 'var(--atmo-text-primary)',
                marginBottom: 2,
              }}
            >
              {user?.nickname || 'ようこそ'}
            </h2>
            <div className="atmo-line" style={{ margin: 0 }} />
          </div>

          <Link
            to="/post/create"
            className="atmo-btn"
            style={{ textDecoration: 'none', fontSize: '0.88rem', padding: '10px 22px', marginTop: 8 }}
          >
            <Plus size={16} weight="light" />
            发布帖子
          </Link>
        </div>

        {/* Section label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <Sparkle size={14} weight="light" color="var(--atmo-accent-soft)" />
          <span
            style={{
              fontSize: '0.78rem',
              letterSpacing: '0.07em',
              color: 'var(--atmo-text-muted)',
              textTransform: 'uppercase',
            }}
          >
            最新の投稿
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--atmo-decorative-line)' }} />
        </div>

        {/* Post list */}
        <PostList />
      </div>

      {/* Noise overlay */}
      <div className="atmo-noise" aria-hidden="true" />
    </div>
  );
}
