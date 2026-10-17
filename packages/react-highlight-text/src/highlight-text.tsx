import * as React from 'react'
import {
  getHighlightSegments,
  highlightTextMarkClass,
  type HighlightQuery,
  type HighlightRange,
} from '@refraction-ui/highlight-text'
import { cn } from '@refraction-ui/shared'

export interface HighlightTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The full text to display. It is always rendered unchanged, only wrapped. */
  text: string
  /** A phrase, or an array of terms each highlighted on its own. */
  query?: HighlightQuery
  /** Explicit `[start, end)` UTF-16 spans to highlight, combined with `query` matches. */
  ranges?: readonly HighlightRange[]
  /** Match letter case exactly. */
  caseSensitive?: boolean
  /** Treat "e" and "é" as different letters. */
  diacriticSensitive?: boolean
  /** Only match whole tokens (not "cat" inside "concat"). */
  wholeWord?: boolean
  /** Extra classes appended to every `<mark>`. */
  markClassName?: string
}

/**
 * HighlightText — renders `text` with the parts that match `query` (or fall in
 * `ranges`) wrapped in `<mark>`. Matching, offset mapping and range merging
 * all come from the headless `@refraction-ui/highlight-text` core; this
 * adapter only memoises the segments and renders them.
 */
export const HighlightText = React.forwardRef<HTMLSpanElement, HighlightTextProps>(
  function HighlightText(
    {
      text,
      query,
      ranges,
      caseSensitive = false,
      diacriticSensitive = false,
      wholeWord = false,
      markClassName,
      ...props
    },
    ref,
  ) {
    const segments = React.useMemo(
      () =>
        getHighlightSegments(text, {
          query,
          ranges,
          caseSensitive,
          diacriticSensitive,
          wholeWord,
        }),
      [text, query, ranges, caseSensitive, diacriticSensitive, wholeWord],
    )

    return (
      <span ref={ref} {...props}>
        {segments.map((segment) =>
          segment.highlighted ? (
            <mark key={segment.start} className={cn(highlightTextMarkClass, markClassName)}>
              {segment.text}
            </mark>
          ) : (
            <React.Fragment key={segment.start}>{segment.text}</React.Fragment>
          ),
        )}
      </span>
    )
  },
)
