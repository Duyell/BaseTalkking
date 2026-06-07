import { memo, useMemo } from 'react';

/**
 * Floating light particles — isolated in its own memoized component
 * to prevent re-renders of the parent layout.
 *
 * Uses pure CSS animations (no Framer Motion) for 60fps performance
 * with minimal DOM overhead.
 */
interface Particle {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  bright: boolean;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 5,
    duration: 8 + Math.random() * 18,
    delay: Math.random() * 15,
    bright: Math.random() > 0.7,
  }));
}

const FloatingParticles = memo(function FloatingParticles() {
  const particles = useMemo(() => generateParticles(35), []);

  return (
    <div className="atmo-particles" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`atmo-particle${p.bright ? ' atmo-particle-bright' : ''}`}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

export default FloatingParticles;
