/**
 * Shared animation variants for Framer Motion.
 */
import type { Variants, Transition } from 'framer-motion';

// ============================================================================
// Easing Curves
// ============================================================================

export const easings = {
  out: [0.22, 1, 0.36, 1] as const,
  spring: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

// ============================================================================
// Spring Configs
// ============================================================================

export const springs = {
  sheet: { type: 'spring' as const, damping: 28, stiffness: 300 },
  snappy: { type: 'spring' as const, damping: 30, stiffness: 400 },
  bouncy: { type: 'spring' as const, damping: 15, stiffness: 200 },
  gentle: { type: 'spring' as const, damping: 25, stiffness: 150 },
};

// ============================================================================
// Page Transitions
// ============================================================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransitionConfig: Transition = {
  duration: 0.3,
  ease: easings.out,
};

// ============================================================================
// Stagger Container
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.out,
    },
  },
};

// ============================================================================
// Fade Up (for scroll reveals)
// ============================================================================

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easings.out },
  },
};

// ============================================================================
// Scale In
// ============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: easings.out },
  },
};

// ============================================================================
// Sheet (bottom sheet / modal)
// ============================================================================

export const sheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
};

export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};
