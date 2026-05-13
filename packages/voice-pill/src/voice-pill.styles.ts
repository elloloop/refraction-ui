import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const voicePillTokens: TokenContract = {
  name: 'voice-pill',
  tokens: {
    bg: { variable: '--rfr-voice-pill-bg', fallback: 'hsl(var(--background))' },
    fg: { variable: '--rfr-voice-pill-fg', fallback: 'hsl(var(--foreground))' },
    border: { variable: '--rfr-voice-pill-border', fallback: 'hsl(var(--border))' },
    accent: { variable: '--rfr-voice-pill-accent', fallback: 'hsl(var(--primary))' },
    accentFg: {
      variable: '--rfr-voice-pill-accent-foreground',
      fallback: 'hsl(var(--primary-foreground))',
    },
  },
}

export const voicePillRootStyles =
  'inline-flex min-w-0 max-w-[min(calc(100vw-2rem),22rem)] items-center gap-3 rounded-full border border-border bg-background px-3 py-2 text-foreground shadow-lg ring-1 ring-border/50 transition-opacity data-[muted=true]:opacity-80'

export const voicePillSpeakerStyles =
  '[--rfr-voice-pill-accent:hsl(var(--primary))] [--rfr-voice-pill-accent-foreground:hsl(var(--primary-foreground))] data-[speaker=user]:[--rfr-voice-pill-accent:hsl(var(--accent-foreground))] data-[speaker=user]:[--rfr-voice-pill-accent-foreground:hsl(var(--accent))] data-[muted=true]:[--rfr-voice-pill-accent:hsl(var(--muted-foreground))]'

export const voicePillPositionVariants = cva({
  base: 'z-50',
  variants: {
    position: {
      inline: 'relative',
      'top-start':
        'fixed top-[calc(env(safe-area-inset-top)+1rem)] left-[calc(env(safe-area-inset-left)+1rem)]',
      'top-center':
        'fixed top-[calc(env(safe-area-inset-top)+1rem)] left-1/2 -translate-x-1/2',
      'top-end':
        'fixed top-[calc(env(safe-area-inset-top)+1rem)] right-[calc(env(safe-area-inset-right)+1rem)]',
      'bottom-start':
        'fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-[calc(env(safe-area-inset-left)+1rem)]',
      'bottom-center':
        'fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 -translate-x-1/2',
      'bottom-end':
        'fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-[calc(env(safe-area-inset-right)+1rem)]',
      'left-start':
        'fixed left-[calc(env(safe-area-inset-left)+1rem)] top-[calc(env(safe-area-inset-top)+1rem)]',
      'left-center':
        'fixed left-[calc(env(safe-area-inset-left)+1rem)] top-1/2 -translate-y-1/2',
      'left-end':
        'fixed left-[calc(env(safe-area-inset-left)+1rem)] bottom-[calc(env(safe-area-inset-bottom)+1rem)]',
      'right-start':
        'fixed right-[calc(env(safe-area-inset-right)+1rem)] top-[calc(env(safe-area-inset-top)+1rem)]',
      'right-center':
        'fixed right-[calc(env(safe-area-inset-right)+1rem)] top-1/2 -translate-y-1/2',
      'right-end':
        'fixed right-[calc(env(safe-area-inset-right)+1rem)] bottom-[calc(env(safe-area-inset-bottom)+1rem)]',
    },
  },
  defaultVariants: {
    position: 'bottom-center',
  },
})

export const voicePillAvatarWrapStyles =
  'relative flex h-10 w-10 shrink-0 items-center justify-center'

export const voicePillPulseRingStyles =
  'pointer-events-none absolute inset-0 rounded-full border border-[var(--rfr-voice-pill-accent)] opacity-[var(--rfr-voice-pill-ring-opacity)] motion-safe:animate-ping motion-reduce:animate-none'

export const voicePillAvatarStyles =
  'relative z-10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--rfr-voice-pill-accent)] text-[var(--rfr-voice-pill-accent-foreground)] text-xs font-semibold uppercase'

export const voicePillTextStyles = 'min-w-0 flex-1'

export const voicePillLabelStyles =
  'block truncate text-sm font-medium leading-tight'

export const voicePillSubStyles =
  'block truncate text-xs leading-tight text-muted-foreground'

export const voicePillMuteButtonStyles =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
