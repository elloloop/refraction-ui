/** Horizontal alignment of the section head cluster. */
export type SectionHeadAlign = 'center' | 'left'

export interface SectionHeadProps {
  /** Alignment of the kicker, title, and lede. */
  align?: SectionHeadAlign
}

export interface SectionHeadAPI {
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic data attributes for a SectionHead.
 *
 * Returns data-align so adapters can apply styles via CSS or Tailwind
 * variants. All visual logic (classes, cva) lives in `section-head.styles.ts`.
 */
export function createSectionHead(props: SectionHeadProps = {}): SectionHeadAPI {
  const { align = 'center' } = props

  const dataAttributes: Record<string, string> = {
    'data-align': align,
  }

  return { dataAttributes }
}
