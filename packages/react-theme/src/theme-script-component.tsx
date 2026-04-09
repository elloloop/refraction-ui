import * as React from 'react'
import { getThemeScript } from '@elloloop/theme'

export interface ThemeScriptProps {
  storageKey?: string
  attribute?: 'class' | 'data-theme'
}

/**
 * Renders an inline <script> that prevents theme flash on SSR pages.
 * Place this in the <head> of your document (in Next.js layout.tsx, Remix root, etc.)
 */
export function ThemeScript({
  storageKey = 'rfr-theme',
  attribute = 'class',
}: ThemeScriptProps) {
  return React.createElement('script', {
    dangerouslySetInnerHTML: {
      __html: getThemeScript(storageKey, attribute),
    },
  })
}
