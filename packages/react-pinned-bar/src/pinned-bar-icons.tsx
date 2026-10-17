import * as React from 'react'

/*
 * Built-in glyphs (24×24, stroke = currentColor) so the bar has no
 * icon-library dependency. All are decorative: IconButton hides them and
 * names the control from its `label`.
 */
function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const PinGlyph = () => (
  <Glyph>
    <path d="M12 17v5M9 10.8V4h6v6.8l2.6 2.6c.3.3.4.6.4 1V16H6v-1.6c0-.4.1-.7.4-1z" />
  </Glyph>
)

export const PreviousGlyph = () => (
  <Glyph>
    <path d="m15 18-6-6 6-6" />
  </Glyph>
)

export const NextGlyph = () => (
  <Glyph>
    <path d="m9 18 6-6-6-6" />
  </Glyph>
)

export const ListGlyph = () => (
  <Glyph>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </Glyph>
)

export const UnpinGlyph = () => (
  <Glyph>
    <path d="M18 6 6 18M6 6l12 12" />
  </Glyph>
)

export const CollapseGlyph = () => (
  <Glyph>
    <path d="m18 15-6-6-6 6" />
  </Glyph>
)

export const ExpandGlyph = () => (
  <Glyph>
    <path d="m6 9 6 6 6-6" />
  </Glyph>
)
