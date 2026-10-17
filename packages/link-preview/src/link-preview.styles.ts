import { cva } from '@refraction-ui/shared'

/**
 * Root wrapper. `relative` anchors the dismiss button, which is a sibling of
 * the link (never inside it) positioned over the card's top-end corner.
 * Override the width cap with an important modifier (`!max-w-lg`): `cn` does
 * not resolve Tailwind conflicts.
 */
export const linkPreviewVariants = cva({
  base: 'relative w-full max-w-md',
  variants: {
    variant: {
      compact: '',
      full: '',
    },
  },
  defaultVariants: {
    variant: 'full',
  },
})

/**
 * The card itself: one `<a>`. Hover adds an underline to the title as well
 * as the tint, so the affordance is not carried by colour alone.
 */
export const linkPreviewCardVariants = cva({
  base: [
    'group flex overflow-hidden rounded-lg border border-border bg-card text-card-foreground no-underline',
    'transition-colors hover:bg-accent/50 motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  variants: {
    variant: {
      compact: 'flex-row items-start',
      full: 'flex-col',
    },
  },
  defaultVariants: {
    variant: 'full',
  },
})

/**
 * The fixed aspect box the image loads into. The adapter sets
 * `aspect-ratio` inline, so the box has its final size before the lazy image
 * arrives. `bg-muted` shows while loading and if the image fails.
 */
export const linkPreviewMediaVariants = cva({
  base: 'relative shrink-0 overflow-hidden bg-muted',
  variants: {
    variant: {
      compact: 'my-3 ms-3 w-16 rounded-md',
      full: 'w-full border-b border-border',
    },
  },
  defaultVariants: {
    variant: 'full',
  },
})

/** The image fills (and is cropped to) its aspect box. */
export const linkPreviewImageClass = 'absolute inset-0 h-full w-full object-cover'

/**
 * Text column. Padding lives only in the compound variants so the
 * dismiss-space end padding never fights a base `p-*` utility.
 */
export const linkPreviewBodyVariants = cva({
  base: 'flex min-w-0 flex-1 flex-col gap-1',
  variants: {
    variant: {
      compact: '',
      full: '',
    },
    reserveDismissSpace: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'compact', reserveDismissSpace: 'false', class: 'p-3' },
    { variant: 'compact', reserveDismissSpace: 'true', class: 'py-3 ps-3 pe-12' },
    { variant: 'full', reserveDismissSpace: 'false', class: 'p-4' },
    { variant: 'full', reserveDismissSpace: 'true', class: 'py-4 ps-4 pe-12' },
  ],
  defaultVariants: {
    variant: 'full',
    reserveDismissSpace: 'false',
  },
})

/** Site icon + site name (+ host) row. */
export const linkPreviewSiteClass =
  'flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground'

/** The site icon is decorative and sized in rem so it follows the text. */
export const linkPreviewSiteIconClass = 'size-4 shrink-0 rounded-sm object-contain'

/** Site name / host text; truncates rather than wrapping the row. */
export const linkPreviewSiteTextClass = 'truncate'

/** Dot between the site name and the host. Decorative. */
export const linkPreviewSeparatorClass = 'shrink-0'

export const linkPreviewTitleVariants = cva({
  base: 'font-semibold text-foreground group-hover:underline',
  variants: {
    variant: {
      compact: 'line-clamp-1 text-sm',
      full: 'line-clamp-2 text-base',
    },
  },
  defaultVariants: {
    variant: 'full',
  },
})

export const linkPreviewDescriptionVariants = cva({
  base: 'text-sm text-muted-foreground',
  variants: {
    variant: {
      compact: 'line-clamp-1',
      full: 'line-clamp-3',
    },
  },
  defaultVariants: {
    variant: 'full',
  },
})

/** Dismiss button position: over the card's top-end corner, above the link. */
export const linkPreviewDismissClass = 'absolute end-2 top-2 z-10'
