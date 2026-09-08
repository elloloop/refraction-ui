import * as React from 'react'
import { loaderStyles } from '@refraction-ui/loader'

/** Identity React 19 uses to hoist and de-duplicate the sheet in `<head>`. */
export const LOADER_STYLE_HREF = 'refraction-ui/loader'

/**
 * The loader keyframes and geometry, rendered as a hoistable stylesheet.
 *
 * Every loader component renders this. React 19 hoists a `<style>` with
 * `href` + `precedence` into the document head exactly once; React 18 simply
 * renders the tag in place, which is harmless (duplicate identical rules).
 * No CSS-in-JS runtime, no global side effects at import time.
 */
export function LoaderStyleSheet() {
  return React.createElement(
    'style',
    { href: LOADER_STYLE_HREF, precedence: 'refraction-ui', 'data-rfr-loader-styles': '' },
    loaderStyles,
  )
}
