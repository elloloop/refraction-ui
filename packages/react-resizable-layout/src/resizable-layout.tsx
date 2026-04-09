import * as React from 'react'
import {
  createResizableLayout,
  resizableLayoutVariants,
  resizableDividerVariants,
  resizablePaneVariants,
  type ResizableLayoutProps as CoreProps,
  type ResizableLayoutAPI,
} from '@refraction-ui/resizable-layout'
import { cn } from '@refraction-ui/shared'
import type { Orientation } from '@refraction-ui/shared'

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface ResizableLayoutContextValue {
  api: ResizableLayoutAPI
  orientation: Orientation
  sizes: number[]
  setSizes: (sizes: number[]) => void
}

const ResizableLayoutContext = React.createContext<ResizableLayoutContextValue | null>(null)

function useResizableLayoutContext(): ResizableLayoutContextValue {
  const ctx = React.useContext(ResizableLayoutContext)
  if (!ctx) {
    throw new Error('Resizable compound components must be used within <ResizableLayout>')
  }
  return ctx
}

/* ------------------------------------------------------------------ */
/*  ResizableLayout (root)                                             */
/* ------------------------------------------------------------------ */

export interface ResizableLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  orientation?: Orientation
  defaultSizes?: number[]
  minSizes?: number[]
  maxSizes?: number[]
  persistKey?: string
  onSizesChange?: (sizes: number[]) => void
}

/**
 * ResizableLayout — flex container with resizable panes separated by draggable dividers.
 * Uses pointer events for cross-platform drag support.
 */
export const ResizableLayout = React.forwardRef<HTMLDivElement, ResizableLayoutProps>(
  (
    {
      orientation = 'horizontal',
      defaultSizes = [50, 50],
      minSizes,
      maxSizes,
      persistKey,
      onSizesChange,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const apiRef = React.useRef<ResizableLayoutAPI | null>(null)

    if (!apiRef.current) {
      apiRef.current = createResizableLayout({
        orientation,
        defaultSizes,
        minSizes,
        maxSizes,
        persistKey,
      })
    }

    const api = apiRef.current
    const [sizes, setSizesState] = React.useState<number[]>(api.sizes)

    const setSizes = React.useCallback(
      (newSizes: number[]) => {
        setSizesState([...newSizes])
        onSizesChange?.(newSizes)
      },
      [onSizesChange],
    )

    const cssVars = React.useMemo(() => {
      const vars: Record<string, string> = {}
      for (let i = 0; i < sizes.length; i++) {
        vars[`--rfr-pane-${i}-size`] = `${sizes[i]}%`
      }
      return vars
    }, [sizes])

    const contextValue = React.useMemo<ResizableLayoutContextValue>(
      () => ({ api, orientation, sizes, setSizes }),
      [api, orientation, sizes, setSizes],
    )

    return (
      <ResizableLayoutContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(resizableLayoutVariants({ orientation }), className)}
          style={{ ...cssVars, ...style }}
          data-orientation={orientation}
          {...props}
        >
          {children}
        </div>
      </ResizableLayoutContext.Provider>
    )
  },
)

ResizableLayout.displayName = 'ResizableLayout'

/* ------------------------------------------------------------------ */
/*  ResizablePane                                                      */
/* ------------------------------------------------------------------ */

export interface ResizablePaneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Zero-based index of this pane (order in the layout) */
  index: number
}

/**
 * ResizablePane — a single pane whose size is driven by CSS custom properties.
 */
export const ResizablePane = React.forwardRef<HTMLDivElement, ResizablePaneProps>(
  ({ index, className, style, children, ...props }, ref) => {
    const { orientation, sizes } = useResizableLayoutContext()
    const size = sizes[index] ?? 50

    const paneStyle: React.CSSProperties = {
      flexBasis: `${size}%`,
      flexGrow: 0,
      flexShrink: 0,
      ...style,
    }

    return (
      <div
        ref={ref}
        className={cn(resizablePaneVariants({ orientation }), className)}
        style={paneStyle}
        data-pane-index={index}
        {...props}
      >
        {children}
      </div>
    )
  },
)

ResizablePane.displayName = 'ResizablePane'

/* ------------------------------------------------------------------ */
/*  ResizableDivider                                                   */
/* ------------------------------------------------------------------ */

export interface ResizableDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Index of the divider (between pane[index] and pane[index+1]) */
  index: number
}

/**
 * ResizableDivider — draggable handle between two panes.
 * Uses pointer events for cross-platform drag support (mouse + touch).
 */
export const ResizableDivider = React.forwardRef<HTMLDivElement, ResizableDividerProps>(
  ({ index, className, ...props }, ref) => {
    const { api, orientation, setSizes } = useResizableLayoutContext()
    const startPosRef = React.useRef<number>(0)
    const containerSizeRef = React.useRef<number>(0)

    const onPointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault()
        const target = e.currentTarget
        target.setPointerCapture(e.pointerId)

        // Get the container size to convert px delta to percentage
        const container = target.parentElement
        if (!container) return

        const rect = container.getBoundingClientRect()
        containerSizeRef.current =
          orientation === 'horizontal' ? rect.width : rect.height
        startPosRef.current =
          orientation === 'horizontal' ? e.clientX : e.clientY

        api.startResize(index)
      },
      [api, index, orientation],
    )

    const onPointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (containerSizeRef.current === 0) return

        const currentPos =
          orientation === 'horizontal' ? e.clientX : e.clientY
        const pxDelta = currentPos - startPosRef.current
        const pctDelta = (pxDelta / containerSizeRef.current) * 100

        api.onResize(pctDelta)
        setSizes([...api.sizes])
      },
      [api, orientation, setSizes],
    )

    const onPointerUp = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        containerSizeRef.current = 0
        api.endResize()
      },
      [api],
    )

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        tabIndex={0}
        className={cn(resizableDividerVariants({ orientation }), className)}
        data-divider-index={index}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        {...props}
      />
    )
  },
)

ResizableDivider.displayName = 'ResizableDivider'
