import * as React from 'react'
import {
  createStickyNote,
  stickyNoteVariants,
  stickyNoteTextClass,
  stickyNoteAuthorClass,
  type StickyNoteColor,
} from '@refraction-ui/sticky-note'
import { cn } from '@refraction-ui/shared'

export type { StickyNoteColor }

export interface StickyNoteProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content' | 'onSelect'> {
  /** Color of the sticky note. */
  color?: StickyNoteColor
  /** Text content of the note. */
  text?: string
  /** Called when the text changes (makes text editable via a textarea). */
  onTextChange?: (value: string) => void
  /** Optional author name shown in the note footer. */
  author?: string
  /** Absolute x position in pixels (for board/canvas placement). */
  x?: number
  /** Absolute y position in pixels (for board/canvas placement). */
  y?: number
  /** Whether the note can be dragged. Requires `onMove` to receive updates. */
  draggable?: boolean
  /** Called with the new `{ x, y }` position after a drag completes. */
  onMove?: (position: { x: number; y: number }) => void
}

/**
 * StickyNote — a draggable colored note for whiteboard / canvas surfaces.
 *
 * - `color` selects the soft-tint palette (yellow, pink, blue, green, purple, orange).
 * - `text` + `onTextChange` switch to an editable textarea; without `onTextChange` the
 *   text is static.
 * - `x` / `y` absolutely position the note; pair with `draggable` + `onMove` for
 *   drag-to-reposition. Drag is implemented via pointer events and is SSR-safe (no
 *   handlers attach until the component mounts on the client).
 * - Forwards the ref to the outer `<div>`.
 */
export const StickyNote = React.forwardRef<HTMLDivElement, StickyNoteProps>(
  (
    {
      color = 'yellow',
      text,
      onTextChange,
      author,
      x,
      y,
      draggable = false,
      onMove,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { ariaProps, dataAttributes } = createStickyNote({ color })

    // Drag state — kept in refs to avoid re-renders during drag.
    const dragOrigin = React.useRef<{ pointerX: number; pointerY: number; noteX: number; noteY: number } | null>(null)

    const positionStyle: React.CSSProperties =
      x !== undefined && y !== undefined
        ? { position: 'absolute', left: x, top: y }
        : {}

    const handlePointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggable || !onMove) return
        // Only primary button.
        if (e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        dragOrigin.current = {
          pointerX: e.clientX,
          pointerY: e.clientY,
          noteX: x ?? 0,
          noteY: y ?? 0,
        }
      },
      [draggable, onMove, x, y],
    )

    const handlePointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragOrigin.current || !onMove) return
        const dx = e.clientX - dragOrigin.current.pointerX
        const dy = e.clientY - dragOrigin.current.pointerY
        onMove({ x: dragOrigin.current.noteX + dx, y: dragOrigin.current.noteY + dy })
      },
      [onMove],
    )

    const handlePointerUp = React.useCallback(() => {
      dragOrigin.current = null
    }, [])

    return (
      <div
        ref={ref}
        className={cn(stickyNoteVariants({ color }), className)}
        style={{ ...positionStyle, ...style }}
        {...ariaProps}
        {...dataAttributes}
        onPointerDown={draggable && onMove ? handlePointerDown : undefined}
        onPointerMove={draggable && onMove ? handlePointerMove : undefined}
        onPointerUp={draggable && onMove ? handlePointerUp : undefined}
        {...props}
      >
        {onTextChange != null ? (
          <textarea
            className={stickyNoteTextClass}
            value={text ?? ''}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type a note…"
          />
        ) : (
          <p className={`${stickyNoteTextClass} whitespace-pre-wrap`}>{text ?? children}</p>
        )}
        {author != null && (
          <span className={stickyNoteAuthorClass}>{author}</span>
        )}
      </div>
    )
  },
)

StickyNote.displayName = 'StickyNote'
