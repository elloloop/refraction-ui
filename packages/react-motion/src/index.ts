export { Reveal, type RevealProps, type MotionPattern } from './reveal.js'
export {
  PageTransition,
  type PageTransitionProps,
  type MotionAxis,
  type MotionDirection,
} from './page-transition.js'
export {
  Stagger,
  type StaggerProps,
  type StaggerLayout,
  type StaggerPattern,
} from './stagger.js'
export { CheckDraw, type CheckDrawProps } from './check-draw.js'
export { useReducedMotion } from './use-reduced-motion.js'
export { MotionStyleSheet, MOTION_STYLE_HREF } from './motion-style-sheet.js'

// Re-export headless helpers for consumers who need the pure logic.
export {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_PATTERNS,
  STAGGER_CAP,
  createMotion,
  resolveMotionSpeed,
  MOTION_SPEEDS,
  MOTION_SPEED_NAMES,
  resolveDirection,
  patternForDirection,
  resolvePageDirection,
  staggerDelay,
  staggerVariants,
  motionStyles,
  type MotionProps,
  type MotionAPI,
  type MotionSpeed,
  type MotionSpeedName,
} from '@refraction-ui/motion'
