import * as React from 'react'
import {
  contentBounds,
  miniScale,
  worldToMini,
  viewportRectInMini,
  createMiniMap,
  miniMapVariants,
  miniMapDotClass,
  miniMapViewportClass,
  type MiniMapItem,
  type Rect,
} from '@refraction-ui/mini-map'
import { cn } from '@refraction-ui/shared'

export type { MiniMapItem, Rect }

export interface MiniMapProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onSelect' | 'results' | 'color' | 'content'
  > {
  /** Items to render as dots on the minimap. */
  items: MiniMapItem[]
  /** Current viewport in world coordinates. Renders a viewport indicator rect. */
  viewport?: Rect
  /** Width of the minimap box in px. */
  width?: number
  /** Height of the minimap box in px. */
  height?: number
  /** Padding inset in px (applied to all sides). */
  padding?: number
  /**
   * Called when the user clicks or drags in the minimap, with the new
   * world-space viewport center `{ x, y }`.
   */
  onViewportChange?: (center: { x: number; y: number }) => void
}

/**
 * MiniMap — a canvas/editor overview map.
 *
 * Renders each `MiniMapItem` as a positioned dot and an optional `viewport`
 * as a draggable indicator rectangle. All scale math lives in the headless
 * `@refraction-ui/mini-map` core; the React layer only handles event binding
 * and rendering. SSR-safe (no `Math.random` or `Date.now`).
 */
export const MiniMap = React.forwardRef<HTMLDivElement, MiniMapProps>(
  (
    {
      items,
      viewport,
      width = 200,
      height = 140,
      padding = 8,
      onViewportChange,
      className,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null)
    const isDragging = React.useRef(false)

    const bounds = React.useMemo(() => contentBounds(items), [items])
    const scale = React.useMemo(
      () => miniScale(bounds, width, height, padding),
      [bounds, width, height, padding],
    )

    const viewportRect = React.useMemo(
      () =>
        viewport != null
          ? viewportRectInMini(viewport, bounds, scale, padding)
          : null,
      [viewport, bounds, scale, padding],
    )

    const { ariaProps, dataAttributes } = createMiniMap()

    const miniToWorld = React.useCallback(
      (miniX: number, miniY: number): { x: number; y: number } => {
        return {
          x: (miniX - padding) / scale + bounds.x,
          y: (miniY - padding) / scale + bounds.y,
        }
      },
      [scale, bounds, padding],
    )

    const handlePointerEvent = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!onViewportChange) return
        const el = containerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const miniX = e.clientX - rect.left
        const miniY = e.clientY - rect.top
        onViewportChange(miniToWorld(miniX, miniY))
      },
      [onViewportChange, miniToWorld],
    )

    const handlePointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!onViewportChange) return
        isDragging.current = true
        ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
        handlePointerEvent(e)
      },
      [onViewportChange, handlePointerEvent],
    )

    const handlePointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current) return
        handlePointerEvent(e)
      },
      [handlePointerEvent],
    )

    const handlePointerUp = React.useCallback(() => {
      isDragging.current = false
    }, [])

    return (
      <div
        ref={(node) => {
          containerRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={cn(
          miniMapVariants({ interactive: onViewportChange ? 'true' : 'false' }),
          className,
        )}
        style={{ width, height, position: 'relative' }}
        {...ariaProps}
        {...dataAttributes}
        onPointerDown={onViewportChange ? handlePointerDown : undefined}
        onPointerMove={onViewportChange ? handlePointerMove : undefined}
        onPointerUp={onViewportChange ? handlePointerUp : undefined}
        {...props}
      >
        {items.map((item) => {
          const pos = worldToMini(item, bounds, scale, padding)
          const w = (item.width ?? 8) * scale
          const h = (item.height ?? 8) * scale
          return (
            <span
              key={item.id}
              className={miniMapDotClass}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${Math.max(4, w)}px`,
                height: `${Math.max(4, h)}px`,
              }}
              aria-hidden="true"
            />
          )
        })}
        {viewportRect != null && (
          <span
            className={miniMapViewportClass}
            style={{
              position: 'absolute',
              left: `${viewportRect.x}px`,
              top: `${viewportRect.y}px`,
              width: `${viewportRect.width}px`,
              height: `${viewportRect.height}px`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
    )
  },
)

MiniMap.displayName = 'MiniMap'
