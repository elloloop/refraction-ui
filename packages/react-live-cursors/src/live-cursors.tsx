import * as React from 'react'
import {
  createLiveCursors,
  assignCursorColor,
  liveCursorsVariants,
  cursorWrapperClass,
  cursorArrowClass,
  cursorLabelClass,
  type CursorData,
} from '@refraction-ui/live-cursors'
import { cn } from '@refraction-ui/shared'

export type { CursorData }

export interface CursorProps {
  /** Collaborator display name shown in the label chip. */
  name: string
  /** Horizontal position in pixels from the left of the container. */
  x: number
  /** Vertical position in pixels from the top of the container. */
  y: number
  /** Hex color applied to both the SVG arrow and the label chip. */
  color: string
}

/**
 * Cursor — a single labeled collaborator cursor (SVG arrow + name chip).
 *
 * Positioned absolutely via inline `left`/`top` style so it can be placed
 * anywhere within its containing overlay. Color is applied via inline style
 * (not a utility class) so each collaborator gets a unique hue without
 * generating a CSS class per color.
 */
export const Cursor = React.memo(function Cursor({
  name,
  x,
  y,
  color,
}: CursorProps) {
  return (
    <div
      className={cursorWrapperClass}
      style={{ left: `${x}px`, top: `${y}px` }}
      data-cursor-name={name}
    >
      {/* SVG cursor arrow — fill via inline style for per-user color */}
      <svg
        className={cursorArrowClass}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ fill: color }}
      >
        <path
          d="M3 2L17 9.5L10.5 11.5L8 18L3 2Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {/* Name label chip */}
      <span
        className={cursorLabelClass}
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  )
})

export interface LiveCursorsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** Array of collaborator cursor data to render. */
  cursors: CursorData[]
}

/**
 * LiveCursors — an absolutely-positioned overlay that renders one `<Cursor>`
 * per collaborator.
 *
 * Drop this as a direct child of a `position: relative` container (e.g. a
 * canvas or whiteboard surface). It fills the container via `absolute inset-0`
 * and is `pointer-events-none` so it never blocks interaction.
 *
 * Colors are resolved via `assignCursorColor` when a cursor entry has no
 * explicit `color`. The overlay is marked `aria-hidden` — cursors are
 * decorative presence indicators, not interactive elements.
 */
export const LiveCursors = React.forwardRef<HTMLDivElement, LiveCursorsProps>(
  ({ cursors, className, ...props }, ref) => {
    const api = createLiveCursors()

    return (
      <div
        ref={ref}
        className={cn(liveCursorsVariants(), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {cursors.map((cursor, index) => (
          <Cursor
            key={cursor.id}
            name={cursor.name}
            x={cursor.x}
            y={cursor.y}
            color={cursor.color ?? assignCursorColor(cursor.id, index)}
          />
        ))}
      </div>
    )
  },
)

LiveCursors.displayName = 'LiveCursors'
