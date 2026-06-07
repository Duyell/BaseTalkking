import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StaggerRevealProps {
  children: ReactNode;
  /** Delay before the stagger sequence starts */
  delay?: number;
  /** Stagger delay between children in seconds */
  staggerDelay?: number;
  className?: string;
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 80,
      damping: 18,
    },
  },
};

export default function StaggerReveal({
  children,
  delay = 0,
  staggerDelay = 0.08,
  className = '',
}: StaggerRevealProps) {
  const variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

/**
 * A single item in a stagger reveal sequence.
 * Use as a direct child of StaggerReveal.
 */
export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
