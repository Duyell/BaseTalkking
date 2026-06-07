import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  /** Small variant uses smaller radius and lighter blur */
  variant?: 'default' | 'small';
  /** Delay in seconds before entrance animation */
  delay?: number;
  /** If true, hover lift effect is disabled */
  noHover?: boolean;
  style?: React.CSSProperties;
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
};

export default function GlassPanel({
  children,
  className = '',
  variant = 'default',
  delay = 0,
  noHover = false,
  style,
}: GlassPanelProps) {
  const baseClass = variant === 'small' ? 'glass-panel glass-panel-sm' : 'glass-panel';

  return (
    <motion.div
      className={`${baseClass} ${className}`}
      style={style}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springTransition, delay }}
      whileHover={noHover ? undefined : { y: -3 }}
    >
      <div className="atmo-corner atmo-corner-tl" />
      <div className="atmo-corner atmo-corner-tr" />
      <div className="atmo-corner atmo-corner-bl" />
      <div className="atmo-corner atmo-corner-br" />
      {children}
    </motion.div>
  );
}
