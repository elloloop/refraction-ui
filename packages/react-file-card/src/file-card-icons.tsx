import * as React from 'react'
import type { FileKind } from '@refraction-ui/file-card'

/* Inline 24×24 stroke glyphs (stroke = currentColor), so the card has no icon-library dependency. */
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

/** Folded-corner page outline every document-like glyph starts from. */
const PAGE = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'
const FOLD = 'M14 2v6h6'

const KIND_GLYPHS: Record<FileKind, React.ReactNode> = {
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m22 8-6 4 6 4z" />
    </>
  ),
  audio: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  pdf: (
    <>
      <path d={PAGE} />
      <path d={FOLD} />
      <path d="M8 13h2a1.5 1.5 0 0 1 0 3H8v-3zM8 16v2" />
    </>
  ),
  archive: (
    <>
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4" />
    </>
  ),
  code: (
    <>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </>
  ),
  spreadsheet: (
    <>
      <path d={PAGE} />
      <path d={FOLD} />
      <path d="M8 13h8M8 17h8M12 11v8" />
    </>
  ),
  document: (
    <>
      <path d={PAGE} />
      <path d={FOLD} />
      <path d="M8 13h8M8 17h5" />
    </>
  ),
  presentation: (
    <>
      <path d="M2 3h20M4 3v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3M12 16v5M8 21h8" />
    </>
  ),
  text: (
    <>
      <path d={PAGE} />
      <path d={FOLD} />
      <path d="M8 12h8M8 15h8M8 18h4" />
    </>
  ),
  other: (
    <>
      <path d={PAGE} />
      <path d={FOLD} />
    </>
  ),
}

/** Decorative glyph for a file kind. The kind's name is always shown as text too. */
export function FileCardKindIcon({ kind }: { kind: FileKind }) {
  return <Glyph>{KIND_GLYPHS[kind]}</Glyph>
}

export const FileCardCancelIcon = () => (
  <Glyph>
    <path d="M18 6 6 18M6 6l12 12" />
  </Glyph>
)

export const FileCardRetryIcon = () => (
  <Glyph>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M8 16H3v5" />
  </Glyph>
)

export const FileCardDownloadIcon = () => (
  <Glyph>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </Glyph>
)

export const FileCardAlertIcon = () => (
  <Glyph>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </Glyph>
)
