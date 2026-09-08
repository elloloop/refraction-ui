import * as React from 'react'
import { motionStyles } from '@refraction-ui/motion'

/** Identity React 19 uses to hoist and de-duplicate the sheet in `<head>`. */
export const MOTION_STYLE_HREF = 'refraction-ui/motion'

/**
 * The motion keyframes and pattern rules, rendered as a hoistable stylesheet.
 * React 19 hoists a `<style>` with `href` + `precedence` into the head exactly
 * once; React 18 renders the tag in place (harmless duplicate rules).
 */
export function MotionStyleSheet() {
  return React.createElement(
    'style',
    { href: MOTION_STYLE_HREF, precedence: 'refraction-ui', 'data-rfr-motion-styles': '' },
    motionStyles,
  )
}
