import * as React from 'react'
import {
  clampZoom,
  fitTransform,
  transformToCss,
  createInfiniteCanvas,
  infiniteCanvasVariants,
  canvasContentClass,
  canvasControlsClass,
  canvasZoomButtonVariants,
  type CanvasTransform,
  type Bounds,
} from '@refraction-ui/infinite-canvas'
import { cn } from '@refraction-ui/shared'

export type { CanvasTransform, Bounds }

export interface InfiniteCanvasProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** Controlled zoom level. */
  zoom?: number
  /** Controlled pan offset (x). */
  x?: number
  /** Controlled pan offset (y). */
  y?: number
  /** Whether pointer-drag-to-pan is enabled (uncontrolled mode). */
  pan?: boolean
  /** Minimum zoom level (default 0.25). */
  minZoom?: number
  /** Maximum zoom level (default 4). */
  maxZoom?: number
  /** Show a dot-grid background. */
  showGrid?: boolean
  /** Show the zoom-controls overlay (+, −, fit). */
  showControls?: boolean
  /** Called when the transform changes (wheel or drag in uncontrolled mode). */
  onTransformChange?: (transform: CanvasTransform) => void
  /** Content bounds used by the fit/reset control. */
  contentBounds?: Bounds
}

/**
 * InfiniteCanvas — a pan/zoom viewport foundation.
 *
 * Renders a `role="group"` container that clips children and applies a CSS
 * transform to a content layer, enabling infinite-canvas interactions
 * (whiteboard, system-design diagram, goal-graph).
 *
 * Supports controlled (`zoom`/`x`/`y`) and uncontrolled usage. Wheel-to-zoom
 * and pointer-drag-to-pan are enabled by default in uncontrolled mode. All
 * pointer handlers are registered after mount so they are SSR-safe.
 */
export const InfiniteCanvas = React.forwardRef<HTMLDivElement, InfiniteCanvasProps>(
  (
    {
      zoom: zoomProp,
      x: xProp,
      y: yProp,
      pan = true,
      minZoom = 0.25,
      maxZoom = 4,
      showGrid = false,
      showControls = false,
      onTransformChange,
      contentBounds,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isControlled =
      zoomProp !== undefined || xProp !== undefined || yProp !== undefined

    const [internal, setInternal] = React.useState<CanvasTransform>({
      zoom: 1,
      x: 0,
      y: 0,
    })

    const transform: CanvasTransform = isControlled
      ? { zoom: zoomProp ?? 1, x: xProp ?? 0, y: yProp ?? 0 }
      : internal

    const containerRef = React.useRef<HTMLDivElement | null>(null)
    // Dragging state kept in a ref so event handlers don't capture stale values.
    const dragging = React.useRef(false)
    const dragStart = React.useRef({ px: 0, py: 0, tx: 0, ty: 0 })

    const applyTransform = React.useCallback(
      (next: CanvasTransform) => {
        if (!isControlled) setInternal(next)
        onTransformChange?.(next)
      },
      [isControlled, onTransformChange],
    )

    // Register wheel and pointer handlers after mount (SSR-safe).
    React.useEffect(() => {
      const el = containerRef.current
      if (!el) return

      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        setInternal((prev) => {
          const delta = -e.deltaY * 0.001
          const next: CanvasTransform = {
            ...prev,
            zoom: clampZoom(prev.zoom + prev.zoom * delta, minZoom, maxZoom),
          }
          onTransformChange?.(next)
          return next
        })
      }

      el.addEventListener('wheel', onWheel, { passive: false })
      return () => el.removeEventListener('wheel', onWheel)
    }, [minZoom, maxZoom, onTransformChange])

    React.useEffect(() => {
      if (!pan || isControlled) return
      const el = containerRef.current
      if (!el) return

      const onPointerDown = (e: PointerEvent) => {
        dragging.current = true
        dragStart.current = {
          px: e.clientX,
          py: e.clientY,
          tx: internal.x,
          ty: internal.y,
        }
        el.setPointerCapture(e.pointerId)
      }

      const onPointerMove = (e: PointerEvent) => {
        if (!dragging.current) return
        const dx = e.clientX - dragStart.current.px
        const dy = e.clientY - dragStart.current.py
        setInternal((prev) => {
          const next: CanvasTransform = {
            ...prev,
            x: dragStart.current.tx + dx,
            y: dragStart.current.ty + dy,
          }
          onTransformChange?.(next)
          return next
        })
      }

      const onPointerUp = () => {
        dragging.current = false
      }

      el.addEventListener('pointerdown', onPointerDown)
      el.addEventListener('pointermove', onPointerMove)
      el.addEventListener('pointerup', onPointerUp)
      el.addEventListener('pointercancel', onPointerUp)

      return () => {
        el.removeEventListener('pointerdown', onPointerDown)
        el.removeEventListener('pointermove', onPointerMove)
        el.removeEventListener('pointerup', onPointerUp)
        el.removeEventListener('pointercancel', onPointerUp)
      }
    }, [pan, isControlled, onTransformChange, internal.x, internal.y])

    const handleZoomIn = () => {
      const next = { ...transform, zoom: clampZoom(transform.zoom * 1.25, minZoom, maxZoom) }
      applyTransform(next)
    }

    const handleZoomOut = () => {
      const next = { ...transform, zoom: clampZoom(transform.zoom / 1.25, minZoom, maxZoom) }
      applyTransform(next)
    }

    const handleFit = () => {
      const el = containerRef.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      const bounds = contentBounds ?? { minX: 0, minY: 0, maxX: width, maxY: height }
      applyTransform(fitTransform(bounds, width, height))
    }

    const api = createInfiniteCanvas({ zoom: transform.zoom })

    const setRefs = (node: HTMLDivElement | null) => {
      containerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    return (
      <div
        ref={setRefs}
        className={cn(
          infiniteCanvasVariants({ grid: showGrid ? 'true' : 'false' }),
          className,
        )}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        <div
          className={canvasContentClass}
          style={{ transform: transformToCss(transform), transformOrigin: '0 0' }}
        >
          {children}
        </div>

        {showControls && (
          <div className={canvasControlsClass} aria-label="Zoom controls">
            <button
              type="button"
              className={canvasZoomButtonVariants()}
              aria-label="Zoom in"
              onClick={handleZoomIn}
            >
              +
            </button>
            <button
              type="button"
              className={canvasZoomButtonVariants()}
              aria-label="Zoom out"
              onClick={handleZoomOut}
            >
              −
            </button>
            <button
              type="button"
              className={canvasZoomButtonVariants()}
              aria-label="Fit to content"
              onClick={handleFit}
            >
              ⊞
            </button>
          </div>
        )}
      </div>
    )
  },
)

InfiniteCanvas.displayName = 'InfiniteCanvas'
