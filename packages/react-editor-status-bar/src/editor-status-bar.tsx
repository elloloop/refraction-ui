import * as React from 'react'
import {
  createEditorStatusBar,
  formatCursorPosition,
  partitionSegments,
  editorStatusBarVariants,
  statusBarGroupClass,
  statusBarSegmentVariants,
  type StatusSegment,
  type StatusSegmentTone,
} from '@refraction-ui/editor-status-bar'
import { cn } from '@refraction-ui/shared'

export type { StatusSegment, StatusSegmentTone }

/** Convenience props that map to common IDE status-bar segments. */
export interface EditorStatusBarConvenienceProps {
  /** Current line number (1-indexed). */
  line?: number
  /** Current column number (1-indexed). */
  col?: number
  /** Indentation descriptor, e.g. `'Spaces: 4'` or `'Tab Size: 2'`. */
  indentation?: string
  /** Language / runtime label, e.g. `'Python 3.11.4'`. */
  language?: string
  /** File encoding, e.g. `'UTF-8'`. */
  encoding?: string
  /** End-of-line sequence, e.g. `'LF'` or `'CRLF'`. */
  eol?: string
  /** Persistence status label, e.g. `'Auto-saved'` or `'Unsaved changes'`. */
  status?: string
}

export interface EditorStatusBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    EditorStatusBarConvenienceProps {
  /**
   * Explicit list of segments. When provided, the convenience props (`line`,
   * `col`, `language`, etc.) are ignored and you have full control over which
   * segments appear and where.
   */
  segments?: StatusSegment[]
}

/**
 * Build the default segment list from convenience props.
 *
 * Left group: cursor position (if line/col given), indentation.
 * Right group: language, encoding, eol, status.
 */
function buildSegmentsFromConvenienceProps(
  props: EditorStatusBarConvenienceProps,
): StatusSegment[] {
  const segs: StatusSegment[] = []

  if (props.line !== undefined && props.col !== undefined) {
    segs.push({
      id: 'cursor',
      label: formatCursorPosition(props.line, props.col),
      align: 'left',
      tone: 'default',
    })
  }

  if (props.indentation) {
    segs.push({ id: 'indentation', label: props.indentation, align: 'left', tone: 'muted' })
  }

  if (props.language) {
    segs.push({ id: 'language', label: props.language, align: 'right', tone: 'accent' })
  }

  if (props.encoding) {
    segs.push({ id: 'encoding', label: props.encoding, align: 'right', tone: 'muted' })
  }

  if (props.eol) {
    segs.push({ id: 'eol', label: props.eol, align: 'right', tone: 'muted' })
  }

  if (props.status) {
    segs.push({ id: 'status', label: props.status, align: 'right', tone: 'muted' })
  }

  return segs
}

/**
 * EditorStatusBar — an IDE-style bottom bar.
 *
 * Accepts either an explicit `segments` array for full control, or the
 * convenience props (`line`, `col`, `language`, `encoding`, `indentation`,
 * `eol`, `status`) which are assembled into a standard left/right layout
 * automatically.
 *
 * Uses `role="status"` with `aria-live="polite"` so cursor-position updates
 * are announced to screen readers without interrupting flow.
 */
export const EditorStatusBar = React.forwardRef<
  HTMLDivElement,
  EditorStatusBarProps
>(
  (
    {
      segments: segmentsProp,
      line,
      col,
      indentation,
      language,
      encoding,
      eol,
      status,
      className,
      ...props
    },
    ref,
  ) => {
    const segments = segmentsProp ?? buildSegmentsFromConvenienceProps({
      line,
      col,
      indentation,
      language,
      encoding,
      eol,
      status,
    })

    const { left, right } = partitionSegments(segments)
    const api = createEditorStatusBar()

    return (
      <div
        ref={ref}
        className={cn(editorStatusBarVariants(), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        <div className={statusBarGroupClass}>
          {left.map((seg) => (
            <span
              key={seg.id}
              className={statusBarSegmentVariants({ tone: seg.tone ?? 'default' })}
            >
              {seg.label}
            </span>
          ))}
        </div>
        <div className={statusBarGroupClass}>
          {right.map((seg) => (
            <span
              key={seg.id}
              className={statusBarSegmentVariants({ tone: seg.tone ?? 'default' })}
            >
              {seg.label}
            </span>
          ))}
        </div>
      </div>
    )
  },
)

EditorStatusBar.displayName = 'EditorStatusBar'
