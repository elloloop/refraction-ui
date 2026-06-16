import type { AccessibilityProps } from '@refraction-ui/shared'

export type MascotMood = 'happy' | 'think' | 'wave'
export type MascotAnimation = 'none' | 'bounce' | 'float'
export type MascotSize = 'sm' | 'md' | 'lg' | 'xl'

export interface MascotProps {
  mood?: MascotMood
  animation?: MascotAnimation
  size?: MascotSize
  animate?: boolean
}

export interface MascotAPI {
  /** ARIA attributes to spread on the root element */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for CSS styling hooks and states */
  dataAttributes: Record<string, string>
  /** Active mascot state configuration */
  state: {
    mood: MascotMood
    animation: MascotAnimation
    size: MascotSize
    animate: boolean
  }
  /** Mood styles mapping moods to CSS custom properties */
  style: Record<string, string>
}

/**
 * Maps mascot moods ('happy', 'think', 'wave') to CSS custom properties (variables).
 */
export function getMascotMoodStyles(mood: MascotMood): Record<string, string> {
  switch (mood) {
    case 'happy':
      return {
        '--rfr-mascot-shell': 'var(--primary, 138 60% 51%)',
        '--rfr-mascot-shell-rim': 'var(--primary-700, 138 58% 36%)',
        '--rfr-mascot-belly': 'var(--primary-200, 138 60% 83%)',
        '--rfr-mascot-skin': 'var(--primary-400, 138 59% 63%)',
        '--rfr-mascot-skin-d': 'var(--primary-600, 138 58% 43%)',
        '--rfr-mascot-scute': 'var(--sunshine, 42 100% 62%)',
        '--rfr-mascot-scute-alt': 'var(--primary-300, 138 59% 74%)',
        '--rfr-mascot-cheek': 'var(--accent-solid, 26 100% 67%)',
      }
    case 'think':
      return {
        // Indigo / purple tones
        '--rfr-mascot-shell': '250 65% 55%',
        '--rfr-mascot-shell-rim': '250 65% 40%',
        '--rfr-mascot-belly': '250 65% 85%',
        '--rfr-mascot-skin': '250 65% 72%',
        '--rfr-mascot-skin-d': '250 65% 62%',
        '--rfr-mascot-scute': '280 65% 60%',
        '--rfr-mascot-scute-alt': '280 65% 50%',
        '--rfr-mascot-cheek': '320 80% 65%',
      }
    case 'wave':
      return {
        // Orange / warm tones
        '--rfr-mascot-shell': '24 85% 50%',
        '--rfr-mascot-shell-rim': '24 85% 40%',
        '--rfr-mascot-belly': '24 85% 85%',
        '--rfr-mascot-skin': '24 85% 68%',
        '--rfr-mascot-skin-d': '24 85% 58%',
        '--rfr-mascot-scute': '160 60% 45%',
        '--rfr-mascot-scute-alt': '160 60% 35%',
        '--rfr-mascot-cheek': '15 90% 65%',
      }
  }
}

/**
 * Creates a cleanup-enabled interval timer for Tobi's blinking state.
 * Blinks for 150ms every 4000ms.
 */
export function startMascotBlinkInterval(
  onBlinkChange: (isBlinking: boolean) => void,
  intervalMs = 4000,
  durationMs = 150,
): () => void {
  const timer = setInterval(() => {
    onBlinkChange(true)
    setTimeout(() => {
      onBlinkChange(false)
    }, durationMs)
  }, intervalMs)

  return () => {
    clearInterval(timer)
  }
}

export function createMascot(props: MascotProps = {}): MascotAPI {
  const { mood = 'happy', animation = 'none', size = 'md', animate = true } = props

  const ariaProps: Record<string, string | number | boolean> = {
    role: 'img',
    'aria-label': `Tobi the Tortoise feeling ${mood}`,
  }

  const dataAttributes: Record<string, string> = {
    'data-slot': 'mascot',
    'data-mood': mood,
    'data-animation': animation,
    'data-size': size,
    'data-animate': animate ? 'true' : 'false',
  }

  return {
    ariaProps,
    dataAttributes,
    state: {
      mood,
      animation,
      size,
      animate,
    },
    style: getMascotMoodStyles(mood),
  }
}
