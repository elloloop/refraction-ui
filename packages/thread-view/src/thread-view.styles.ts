import { cva } from '@refraction-ui/shared'

/**
 * Keyboard focus indicator for the thread's own controls. Every focusable
 * element the thread renders carries it, so keyboard users can see where they
 * are without relying on a global `:focus-visible` rule in the host app.
 */
const threadFocusRingStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const threadContainerStyles =
  'flex flex-col gap-1'

export const threadMessageStyles =
  'flex gap-3 px-4 py-2 hover:bg-accent/50 rounded-md transition-colors group'

export const threadAvatarStyles =
  'h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium overflow-hidden flex-shrink-0'

export const threadContentStyles =
  'flex-1 min-w-0'

export const threadAuthorStyles =
  'font-semibold text-sm'

export const threadTimestampStyles =
  'text-xs text-muted-foreground ml-2'

export const threadBodyStyles =
  'text-sm mt-0.5 whitespace-pre-wrap break-words'

export const threadReactionsStyles =
  'flex flex-wrap gap-1 mt-1'

/** A reaction pill; `reacted` marks the reactions the current user added. */
export const threadReactionVariants = cva({
  base: `inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs cursor-pointer ${threadFocusRingStyles}`,
  variants: {
    reacted: {
      true: 'border-primary bg-primary/10',
      false: 'border-border',
    },
  },
  defaultVariants: {
    reacted: 'false',
  },
})

export const threadReplyIndicatorStyles =
  'flex items-center gap-1 mt-1 text-xs text-primary cursor-pointer hover:underline'

/**
 * The message actions are revealed on hover; `focus-within` reveals them for
 * keyboard users too, so a focused action is never invisible.
 */
export const threadActionsStyles =
  'flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'

export const threadReplyButtonStyles =
  `rounded-sm text-xs text-muted-foreground hover:text-foreground cursor-pointer ${threadFocusRingStyles}`

export const threadAttachmentStyles =
  'flex items-center gap-2 mt-1 p-2 rounded border text-xs bg-muted/50'

export const threadEditedStyles =
  'text-xs text-muted-foreground ml-1'
