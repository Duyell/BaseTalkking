import { type ReactNode } from 'react';
import FloatingParticles from './FloatingParticles';

interface AtmosphereContainerProps {
  children: ReactNode;
  /** Show the noise texture overlay */
  showNoise?: boolean;
  /** Show floating particles */
  showParticles?: boolean;
}

/**
 * Full atmosphere wrapper providing:
 * - Gradient background with subtle drift animation
 * - Noise texture overlay (fixed, pointer-events-none)
 * - Floating light particles
 *
 * Use as the outermost wrapper for any page that needs the anime aesthetic.
 */
export default function AtmosphereContainer({
  children,
  showNoise = true,
  showParticles = true,
}: AtmosphereContainerProps) {
  return (
    <div className="atmo-bg">
      {showNoise && <div className="atmo-noise" aria-hidden="true" />}
      {showParticles && <FloatingParticles />}
      {children}
    </div>
  );
}
