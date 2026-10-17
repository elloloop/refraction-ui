import { cva } from '@refraction-ui/shared'
import type { StepStatusIcon } from './step-card.js'

/** Card root. Collapsed cards tighten their padding: only the header shows. */
export const stepCardVariants = cva({
  base: 'flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm',
  variants: {
    expanded: {
      true: 'gap-4 p-5',
      false: 'gap-2 px-5 py-4',
    },
  },
  defaultVariants: {
    expanded: 'true',
  },
})

/** Icon, title/reason and status pill on one row. */
export const stepCardHeaderClass = 'flex items-start gap-3'

/** Square well behind the caller's icon; the icon itself is decorative. */
export const stepCardIconClass =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg]:size-5'

/** Column holding the title and reason; `min-w-0` lets long text wrap. */
export const stepCardHeadingClass = 'flex min-w-0 flex-1 flex-col gap-1'

export const stepCardTitleClass = 'text-base font-semibold leading-snug text-foreground'

export const stepCardReasonClass = 'text-sm leading-relaxed text-muted-foreground'

/** Body below the header: instructions, action and troubleshooting. */
export const stepCardBodyClass = 'flex flex-col items-start gap-4'

/** Hint shown while checking (e.g. "Waiting for System Settings…"). */
export const stepCardLiveHintClass =
  'flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground'

/**
 * Status pill. Each tone uses a background/foreground token pair the theme
 * contrast checks cover; the icon and text carry the meaning, colour only
 * reinforces it.
 */
export const stepStatusPillVariants = cva({
  base: 'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3.5',
  variants: {
    tone: {
      neutral: 'border-border bg-muted text-muted-foreground',
      attention: 'border-transparent bg-warning text-warning-foreground',
      progress: 'border-transparent bg-info text-info-foreground',
      success: 'border-transparent bg-success text-success-foreground',
      danger: 'border-transparent bg-destructive text-destructive-foreground',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

/** Status icon. The checking spinner stands still under reduced motion. */
export const stepStatusIconVariants = cva({
  base: 'shrink-0',
  variants: {
    spinning: {
      true: 'animate-spin motion-reduce:animate-none',
      false: '',
    },
  },
  defaultVariants: {
    spinning: 'false',
  },
})

/** Disclosure button for the troubleshooting section. */
export const stepCardTroubleshootingTriggerClass = [
  'inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-foreground',
  'underline-offset-4 hover:underline',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  '[&>svg]:size-4 [&>svg]:transition-transform motion-reduce:[&>svg]:transition-none',
  '[&[data-state=open]>svg]:rotate-180',
].join(' ')

/** Troubleshooting content; the open animation stops under reduced motion. */
export const stepCardTroubleshootingContentClass =
  'w-full text-sm leading-relaxed text-muted-foreground motion-reduce:animate-none'

export const stepCardTroubleshootingListClass = 'list-disc space-y-1.5 pl-5'

/** InstructionList root: a muted well. */
export const instructionListClass = 'flex w-full flex-col gap-2 rounded-lg bg-muted p-4'

export const instructionListTitleClass = 'text-sm font-medium text-foreground'

/**
 * Native decimal markers keep the list semantics (and "1 of 3") that a
 * `list-none` list loses in some screen readers.
 */
export const instructionListItemsClass =
  'list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground marker:font-medium marker:text-muted-foreground'

export const instructionListItemClass = 'pl-1'

/** SVG viewBox every status/chevron path below is drawn in. */
export const STEP_CARD_ICON_VIEWBOX = '0 0 24 24'

/** Stroke paths for each status icon (24×24, round caps). */
export const stepStatusIconPaths: Readonly<Record<StepStatusIcon, readonly string[]>> = {
  pending: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z', 'M12 7v5l3 2'],
  alert: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z', 'M12 8v4', 'M12 16h.01'],
  spinner: ['M21 12a9 9 0 1 1-6.219-8.56'],
  check: ['M20 6 9 17l-5-5'],
  cross: ['M18 6 6 18', 'm6 6 12 12'],
}

/** Chevron on the troubleshooting trigger. */
export const stepCardChevronPath = 'm6 9 6 6 6-6'
