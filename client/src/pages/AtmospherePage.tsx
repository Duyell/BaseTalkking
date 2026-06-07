import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Planet, ChatCircle, Users } from '@phosphor-icons/react';
import AtmosphereContainer from '../components/Atmosphere/AtmosphereContainer';
import GlassPanel from '../components/Atmosphere/GlassPanel';
import StaggerReveal, { StaggerItem } from '../components/Atmosphere/StaggerReveal';
import { useAuth } from '../context/AuthContext';

export default function AtmospherePage() {
  const { user } = useAuth();

  return (
    <AtmosphereContainer>
      {/* Background breathing glows */}
      <div
        className="atmo-glow"
        style={{ width: 420, height: 420, top: '45%', left: '50%', transform: 'translate(-50%, -50%)' }}
        aria-hidden="true"
      />
      <div
        className="atmo-glow"
        style={{ width: 200, height: 200, top: '25%', right: '20%', animationDelay: '3s' }}
        aria-hidden="true"
      />

      {/* Fixed viewport — no scroll */}
      <div className="atmo-page atmo-page-fixed">
        {/* Hero */}
        <div style={{ maxWidth: 500, width: '100%', textAlign: 'center', marginBottom: 24 }}>
          <StaggerReveal delay={0.3}>
            <StaggerItem>
              <div className="atmo-line" style={{ marginBottom: 18 }} />
            </StaggerItem>
            <StaggerItem>
              <h1 className="atmo-title" style={{ marginBottom: 6, fontSize: '2rem' }}>
                言葉の彼方に
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="atmo-subtitle" style={{ fontSize: '0.9rem' }}>
                静かな場所で、思いを綴る
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="atmo-line" style={{ marginTop: 18 }} />
            </StaggerItem>
          </StaggerReveal>
        </div>

        {/* Action panel */}
        <GlassPanel
          delay={1.0}
          style={{ maxWidth: 420, width: '100%', padding: '32px 30px', textAlign: 'center' }}
        >
          <p
            style={{
              color: 'var(--atmo-text-secondary)',
              fontSize: '0.88rem',
              lineHeight: 1.7,
              marginBottom: 24,
              letterSpacing: '0.03em',
            }}
          >
            言葉を交わす、静かなコミュニティ。
            <br />
            ここでは誰もが自分のペースで考えを紡げます。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {user ? (
              <Link to="/" style={{ textDecoration: 'none' }}>
                <button className="atmo-btn" style={{ width: '100%' }}>
                  <ChatCircle size={18} weight="light" />
                  掲示板へ
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button className="atmo-btn" style={{ width: '100%' }}>
                    <Planet size={18} weight="light" />
                    サインイン
                  </button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button className="atmo-btn atmo-btn-ghost" style={{ width: '100%' }}>
                    <Users size={18} weight="light" />
                    招待コードで登録
                  </button>
                </Link>
              </>
            )}
          </div>
        </GlassPanel>

        {/* Footer */}
        <motion.p
          className="atmo-caption"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 1 }}
          style={{ marginTop: 28 }}
        >
          静寂のコミュニティ · BaseTalkking
        </motion.p>
      </div>
    </AtmosphereContainer>
  );
}
