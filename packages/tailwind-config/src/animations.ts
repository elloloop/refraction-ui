/**
 * Keyframe definitions consolidated from all elloloop projects.
 *
 * Accessibility: Users who prefer reduced motion should see instant transitions.
 * Apply the `.motion-reduce` utility (from utilities.ts) to animated elements,
 * or use Tailwind's built-in `motion-reduce:` variant on individual elements.
 * The `.motion-safe` / `.motion-reduce` utilities in utilities.ts provide
 * global prefers-reduced-motion support via CSS media queries.
 */
export const keyframes = {
  'fade-in': {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  'fade-in-up': {
    from: { opacity: '0', transform: 'translateY(8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  'fade-in-scale': {
    from: { opacity: '0', transform: 'scale(0.95)' },
    to: { opacity: '1', transform: 'scale(1)' },
  },
  'slide-up': {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' },
  },
  'slide-in-right': {
    from: { opacity: '0', transform: 'translateX(20px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'toast-in': {
    from: { opacity: '0', transform: 'translateY(16px) scale(0.95)' },
    to: { opacity: '1', transform: 'translateY(0) scale(1)' },
  },
  'toast-out': {
    from: { opacity: '1', transform: 'translateY(0) scale(1)' },
    to: { opacity: '0', transform: 'translateY(16px) scale(0.95)' },
  },
  'accordion-down': {
    from: { height: '0' },
    to: { height: 'var(--radix-accordion-content-height)' },
  },
  'accordion-up': {
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: '0' },
  },
  'scale-in': {
    from: { opacity: '0', transform: 'scale(0.9)' },
    to: { opacity: '1', transform: 'scale(1)' },
  },
}

/** Animation utility classes */
export const animation = {
  'fade-in': 'fade-in 0.4s ease-out',
  'fade-in-up': 'fade-in-up 0.4s ease-out',
  'fade-in-scale': 'fade-in-scale 0.3s ease-out',
  'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-in-right': 'slide-in-right 0.3s ease-out',
  'toast-in': 'toast-in 0.3s ease-out',
  'toast-out': 'toast-out 0.2s ease-in',
  'accordion-down': 'accordion-down 0.2s ease-out',
  'accordion-up': 'accordion-up 0.2s ease-out',
  'scale-in': 'scale-in 0.2s ease-out',
}
