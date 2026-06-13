import { cva } from '@refraction-ui/shared'

/**
 * Note container with color variant.
 *
 * Sticky notes are intrinsically colorful — an approved exception to the
 * semantic-token-only rule. Each color maps to a soft tint background with a
 * readable dark text.
 */
export const stickyNoteVariants = cva({
  base: [
    'relative inline-flex flex-col gap-2 rounded-md p-4',
    'shadow-md',
    'min-w-[160px] min-h-[120px]',
  ].join(' '),
  variants: {
    color: {
      yellow: 'bg-yellow-100 text-yellow-900',
      pink: 'bg-pink-100 text-pink-900',
      blue: 'bg-blue-100 text-blue-900',
      green: 'bg-green-100 text-green-900',
      purple: 'bg-purple-100 text-purple-900',
      orange: 'bg-orange-100 text-orange-900',
    },
  },
  defaultVariants: {
    color: 'yellow',
  },
})

/** Class for the editable/static text area inside the note. */
export const stickyNoteTextClass =
  'flex-1 w-full resize-none bg-transparent text-sm leading-relaxed placeholder:opacity-60 outline-none'

/** Class for the author chip rendered in the note footer. */
export const stickyNoteAuthorClass =
  'mt-auto text-xs font-medium opacity-70 truncate'
