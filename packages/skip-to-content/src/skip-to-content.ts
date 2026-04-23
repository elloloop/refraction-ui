import { cva } from '@refraction-ui/shared'

export interface SkipToContentAPI {
  dataAttributes: Record<string, string>
}

export function createSkipToContent(): SkipToContentAPI {
  return { dataAttributes: { 'data-slot': 'skip-to-content' } }
}

export const skipToContentVariants = cva({
  base: 'fixed left-4 top-4 z-[100] -translate-y-16 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-md transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
})
