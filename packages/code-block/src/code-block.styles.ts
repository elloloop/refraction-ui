import { cva } from '@refraction-ui/shared'

export const codeBlockVariants = cva({
  base: 'relative overflow-hidden rounded-lg border bg-zinc-950 text-zinc-50 dark:bg-zinc-900',
})

export const codeBlockHeaderVariants = cva({
  base: 'flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs text-zinc-400',
})

export const codeBlockContentVariants = cva({
  base: 'overflow-x-auto p-4 text-sm font-mono leading-relaxed',
})
