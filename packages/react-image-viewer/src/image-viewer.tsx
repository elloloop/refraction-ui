import * as React from 'react'
import {
  IMAGE_VIEWER_IDENTITY,
  applyImageViewerPinch,
  clampImageViewerIndex,
  clampImageViewerTransform,
  createImageViewer,
  fitImageViewerImage,
  getImageViewerFocalPoint,
  getImageViewerKeyAction,
  getImageViewerNavIndex,
  getImageViewerWheelScale,
  panImageViewer,
  resolveImageViewerLabels,
  stepImageViewerZoom,
  toggleImageViewerZoom,
  zoomImageViewerAt,
  imageViewerActionsClass,
  imageViewerBodyClass,
  imageViewerCaptionClass,
  imageViewerContentClass,
  imageViewerControlClass,
  imageViewerFigureClass,
  imageViewerFrameClass,
  imageViewerImageVariants,
  imageViewerLiveRegionClass,
  imageViewerNavVariants,
  imageViewerPositionClass,
  imageViewerStageVariants,
  imageViewerToolbarClass,
  imageViewerZoomLabelClass,
  type ImageViewerLabels,
  type ImageViewerLayout,
  type ImageViewerPoint,
  type ImageViewerPointerPair,
  type ImageViewerSize,
  type ImageViewerTransform,
} from '@refraction-ui/image-viewer'
import { Dialog, DialogContent, DialogTrigger } from '@refraction-ui/react-dialog'
import { IconButton } from '@refraction-ui/react-icon-button'
import { cn } from '@refraction-ui/shared'

export type { ImageViewerLabels }

/** One image in the viewer's set. */
export interface ImageViewerImage {
  /** Image URL. */
  src: string
  /** Alternative text — required; it is the image's accessible name. */
  alt: string
  /** Optional caption shown under the image (`<figcaption>`). */
  caption?: React.ReactNode
  /** Intrinsic width in px, if known (otherwise read when the image loads). */
  width?: number
  /** Intrinsic height in px, if known. */
  height?: number
}

export interface ImageViewerProps
  // `children` is not rendered: the viewer's content is `images`.
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The images to show. */
  images: ImageViewerImage[]
  /** Controlled current image (0-based). */
  index?: number
  /** Initial image for uncontrolled usage. */
  defaultIndex?: number
  /** Called when previous / next (buttons or arrow keys) changes the image. */
  onIndexChange?: (index: number) => void
  /** Controlled open state. */
  open?: boolean
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean
  /** Called when the viewer opens or closes (Esc, close button, trigger). */
  onOpenChange?: (open: boolean) => void
  /** Optional element that opens the viewer (rendered as the dialog trigger). */
  trigger?: React.ReactElement
  /** Wrap previous / next at the ends of the set (default: clamp). */
  loop?: boolean
  /** Toolbar actions (download, open original…), or a render function for the current image. */
  actions?: React.ReactNode | ((image: ImageViewerImage, index: number) => React.ReactNode)
  /** Override any visible or announced string (localisation). */
  labels?: Partial<ImageViewerLabels>
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const PRIMARY_MOUSE_BUTTON = 0
const NO_SIZE: ImageViewerSize = Object.freeze({ width: 0, height: 0 })
const ICON_STROKE_WIDTH = 2

function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: ((next: T) => void) | undefined,
): [T, (next: T) => void] {
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [isControlled ? value : internal, set]
}

/** Live `prefers-reduced-motion`; false where `matchMedia` is unavailable (SSR, jsdom). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    setReduced(query.matches)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

/** The element's content box, kept current with ResizeObserver (or window resize). */
function useElementSize(ref: React.RefObject<HTMLElement | null>): ImageViewerSize {
  const [size, setSize] = React.useState<ImageViewerSize>(NO_SIZE)
  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () =>
      setSize((previous) =>
        previous.width === element.clientWidth && previous.height === element.clientHeight
          ? previous
          : { width: element.clientWidth, height: element.clientHeight },
      )
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure)
      observer.observe(element)
      return () => observer.disconnect()
    }
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ref])
  return size
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function clientPoint(event: { clientX: number; clientY: number }): ImageViewerPoint {
  return { x: event.clientX, y: event.clientY }
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="100%"
      height="100%"
    >
      {children}
    </svg>
  )
}
const CloseIcon = () => <Icon><path d="M18 6 6 18M6 6l12 12" /></Icon>
const ZoomInIcon = () => <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></Icon>
const ZoomOutIcon = () => <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M8 11h6" /></Icon>
const ResetIcon = () => <Icon><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>
const PreviousIcon = () => <Icon><path d="m15 18-6-6 6-6" /></Icon>
const NextIcon = () => <Icon><path d="m9 18 6-6-6-6" /></Icon>

type KeyHandler = (event: React.KeyboardEvent<HTMLElement>) => void

interface ImageViewerBodyProps {
  images: ImageViewerImage[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
  loop: boolean
  actions: ImageViewerProps['actions']
  labels: ImageViewerLabels
  /** Lets the dialog element forward keys pressed anywhere inside it. */
  keyHandlerRef: React.MutableRefObject<KeyHandler | null>
}

/**
 * The viewer's content. Mounted only while the dialog is open, so zoom, pan
 * and measurements start fresh every time it opens.
 */
function ImageViewerBody({
  images,
  index,
  onIndexChange,
  onClose,
  loop,
  actions,
  labels,
  keyHandlerRef,
}: ImageViewerBodyProps) {
  const image = images[index]
  const stageRef = React.useRef<HTMLDivElement>(null)
  const stageSize = useElementSize(stageRef)
  const reducedMotion = usePrefersReducedMotion()

  const [view, setView] = React.useState<ImageViewerTransform>(IMAGE_VIEWER_IDENTITY)
  const [animate, setAnimate] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [loadedSize, setLoadedSize] = React.useState<ImageViewerSize>(NO_SIZE)
  const [announcement, setAnnouncement] = React.useState('')

  // A new image starts at the fitted view (adjusting state during render
  // avoids painting one frame of the old zoom on the new image).
  const [viewIndex, setViewIndex] = React.useState(index)
  if (viewIndex !== index) {
    setViewIndex(index)
    setView(IMAGE_VIEWER_IDENTITY)
    setLoadedSize(NO_SIZE)
  }

  // Declared intrinsic sizes win: they are known before the image loads.
  const declared = Boolean(image?.width && image?.height)
  const naturalWidth = declared ? (image?.width ?? 0) : loadedSize.width
  const naturalHeight = declared ? (image?.height ?? 0) : loadedSize.height
  const layout = React.useMemo<ImageViewerLayout>(
    () => ({
      container: stageSize,
      image: fitImageViewerImage({ width: naturalWidth, height: naturalHeight }, stageSize),
    }),
    [stageSize, naturalWidth, naturalHeight],
  )
  const layoutRef = React.useRef(layout)
  layoutRef.current = layout

  // The stored view is re-clamped on every read, so a resize never leaves the
  // image out of view and the next gesture starts from what is on screen.
  const shown = clampImageViewerTransform(view, layout)
  const update = React.useCallback(
    (next: (current: ImageViewerTransform, layout: ImageViewerLayout) => ImageViewerTransform, animated: boolean) => {
      setAnimate(animated)
      setView((current) => next(clampImageViewerTransform(current, layoutRef.current), layoutRef.current))
    },
    [],
  )

  const api = createImageViewer({ index, count: images.length, transform: shown, loop, labels })

  // Announce "Image 2 of 5" on open and on navigation, and the zoom level
  // when it changes (a navigation's reset to 100% is not announced over it).
  const announcedRef = React.useRef<{ index: number; percent: number } | null>(null)
  React.useEffect(() => {
    const previous = announcedRef.current
    announcedRef.current = { index, percent: api.zoomPercent }
    if (!previous || previous.index !== index) {
      if (api.positionText) setAnnouncement(api.positionText)
      return
    }
    if (previous.percent !== api.zoomPercent) setAnnouncement(api.zoomText)
  }, [index, api.zoomPercent, api.positionText, api.zoomText])

  const navigate = React.useCallback(
    (direction: 1 | -1) => {
      const next = getImageViewerNavIndex(index, direction, images.length, loop)
      if (next !== index) onIndexChange(next)
    },
    [index, images.length, loop, onIndexChange],
  )

  const zoomed = api.zoomed
  keyHandlerRef.current = (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    if (isEditableTarget(event.target)) return
    const action = getImageViewerKeyAction(event.key, { zoomed })
    if (!action) return
    event.preventDefault()
    switch (action.type) {
      case 'zoom-in':
        update((current, l) => stepImageViewerZoom(current, 1, l), true)
        break
      case 'zoom-out':
        update((current, l) => stepImageViewerZoom(current, -1, l), true)
        break
      case 'reset':
        update(() => IMAGE_VIEWER_IDENTITY, true)
        break
      case 'pan':
        update((current, l) => panImageViewer(current, action.dx, action.dy, l), true)
        break
      case 'navigate':
        navigate(action.direction)
        break
    }
  }
  React.useEffect(() => () => {
    keyHandlerRef.current = null
  }, [keyHandlerRef])

  // React's onWheel is passive, so preventing the page scroll / browser zoom
  // needs a native, non-passive listener.
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = stage.getBoundingClientRect()
      const focal = getImageViewerFocalPoint(clientPoint(event), rect)
      update(
        (current, l) =>
          zoomImageViewerAt(
            current,
            getImageViewerWheelScale(current.scale, {
              deltaY: event.deltaY,
              deltaMode: event.deltaMode,
              ctrlKey: event.ctrlKey,
              pageHeight: rect.height,
            }),
            focal,
            l,
          ),
        false,
      )
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [update])

  // Active pointers in client coordinates: one drags, two pinch.
  const pointersRef = React.useRef(new Map<number, ImageViewerPoint>())

  const toStage = (point: ImageViewerPoint): ImageViewerPoint => {
    const stage = stageRef.current
    return stage ? getImageViewerFocalPoint(point, stage.getBoundingClientRect()) : point
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== PRIMARY_MOUSE_BUTTON) return
    // Capture keeps the drag alive when the pointer leaves the stage.
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointersRef.current.set(event.pointerId, clientPoint(event))
    setDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    const pairBefore = [...pointers.values()].slice(0, 2)
    pointers.set(event.pointerId, clientPoint(event))
    const pairAfter = [...pointers.values()].slice(0, 2)

    if (pairBefore.length === 2 && pairAfter.length === 2) {
      const before: ImageViewerPointerPair = [toStage(pairBefore[0]), toStage(pairBefore[1])]
      const after: ImageViewerPointerPair = [toStage(pairAfter[0]), toStage(pairAfter[1])]
      update((current, l) => applyImageViewerPinch(current, before, after, l), false)
      return
    }
    const dx = event.clientX - previous.x
    const dy = event.clientY - previous.y
    update((current, l) => panImageViewer(current, dx, dy, l), false)
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current
    if (!pointers.delete(event.pointerId)) return
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (pointers.size === 0) setDragging(false)
  }

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const focal = toStage(clientPoint(event))
    update((current, l) => toggleImageViewerZoom(current, focal, l), true)
  }

  const zoomBy = (direction: 1 | -1) => update((current, l) => stepImageViewerZoom(current, direction, l), true)
  const guarded = (enabled: boolean, run: () => void) => () => {
    if (enabled) run()
  }

  const imageStyle: React.CSSProperties = {
    transform: `translate(${shown.x}px, ${shown.y}px) scale(${shown.scale})`,
    ...(layout.image.width > 0 ? { width: layout.image.width, height: layout.image.height } : {}),
  }
  const renderedActions =
    typeof actions === 'function' ? (image ? actions(image, index) : null) : actions
  const showNavigation = images.length > 1

  return (
    <div className={imageViewerBodyClass} {...api.dataAttributes}>
      <div className={imageViewerToolbarClass}>
        <IconButton variant="ghost" icon={<CloseIcon />} label={labels.close} onClick={onClose} />
        {api.positionText ? <span className={imageViewerPositionClass}>{api.positionText}</span> : null}
        <div className={imageViewerActionsClass}>
          <IconButton
            variant="ghost"
            icon={<ZoomOutIcon />}
            label={labels.zoomOut}
            aria-disabled={!api.canZoomOut || undefined}
            className={imageViewerControlClass}
            onClick={guarded(api.canZoomOut, () => zoomBy(-1))}
          />
          {/* The live region announces the zoom; this is the visual readout. */}
          <span aria-hidden="true" className={imageViewerZoomLabelClass}>{`${api.zoomPercent}%`}</span>
          <IconButton
            variant="ghost"
            icon={<ZoomInIcon />}
            label={labels.zoomIn}
            aria-disabled={!api.canZoomIn || undefined}
            className={imageViewerControlClass}
            onClick={guarded(api.canZoomIn, () => zoomBy(1))}
          />
          <IconButton
            variant="ghost"
            icon={<ResetIcon />}
            label={labels.resetZoom}
            aria-disabled={!api.zoomed || undefined}
            className={imageViewerControlClass}
            onClick={guarded(api.zoomed, () => update(() => IMAGE_VIEWER_IDENTITY, true))}
          />
          {renderedActions}
        </div>
      </div>

      <figure className={imageViewerFigureClass}>
        <div className={imageViewerFrameClass}>
          <div
            ref={stageRef}
            data-image-viewer-stage=""
            className={imageViewerStageVariants({
              zoomed: api.zoomed ? 'true' : 'false',
              dragging: dragging && api.zoomed ? 'true' : 'false',
            })}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onDoubleClick={handleDoubleClick}
          >
            {image ? (
              <img
                key={`${index}:${image.src}`}
                src={image.src}
                alt={image.alt}
                draggable={false}
                decoding="async"
                className={imageViewerImageVariants({ animate: animate && !reducedMotion ? 'true' : 'false' })}
                style={imageStyle}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget
                  setLoadedSize({ width: naturalWidth, height: naturalHeight })
                }}
              />
            ) : null}
          </div>
          {showNavigation ? (
            <>
              <div className={imageViewerNavVariants({ side: 'start' })}>
                <IconButton
                  variant="ghost"
                  icon={<PreviousIcon />}
                  label={labels.previous}
                  aria-disabled={!api.canPrevious || undefined}
                  className={imageViewerControlClass}
                  onClick={guarded(api.canPrevious, () => navigate(-1))}
                />
              </div>
              <div className={imageViewerNavVariants({ side: 'end' })}>
                <IconButton
                  variant="ghost"
                  icon={<NextIcon />}
                  label={labels.next}
                  aria-disabled={!api.canNext || undefined}
                  className={imageViewerControlClass}
                  onClick={guarded(api.canNext, () => navigate(1))}
                />
              </div>
            </>
          ) : null}
        </div>
        {image?.caption != null ? <figcaption className={imageViewerCaptionClass}>{image.caption}</figcaption> : null}
      </figure>

      <div role="status" aria-live="polite" aria-atomic="true" className={imageViewerLiveRegionClass}>
        {announcement}
      </div>
    </div>
  )
}

/**
 * ImageViewer — a modal lightbox with zoom and pan.
 *
 * Built on `Dialog` (focus containment, Esc, focus returned to the opener) and
 * `IconButton` (named 44 px controls). Zoom 1×–8× by wheel (ctrl+wheel for a
 * trackpad pinch), two-finger pinch, `+` / `−`, the buttons, or double-click;
 * `0` resets. Drag pans when zoomed. Arrow keys pan when zoomed and switch
 * images when not. A polite live region announces "Image 2 of 5" and the zoom
 * level. All zoom / pan / clamp maths lives in `@refraction-ui/image-viewer`.
 */
export const ImageViewer = React.forwardRef<HTMLDivElement, ImageViewerProps>(function ImageViewer(
  {
    images,
    index: indexProp,
    defaultIndex = 0,
    onIndexChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    trigger,
    loop = false,
    actions,
    labels: labelOverrides,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  const [rawIndex, setIndex] = useControllableState(indexProp, defaultIndex, onIndexChange)
  const index = clampImageViewerIndex(rawIndex, images.length)
  const labels = React.useMemo(() => resolveImageViewerLabels(labelOverrides), [labelOverrides])
  const keyHandlerRef = React.useRef<KeyHandler | null>(null)
  const close = React.useCallback(() => setOpen(false), [setOpen])

  // Keys are handled on the dialog element, not the body: clicking the stage
  // focuses the dialog itself (tabIndex -1), and keys must still work then.
  // Dialog runs this before its own Esc handling.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    keyHandlerRef.current?.(event)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        ref={ref}
        aria-label={labels.dialog}
        className={cn(imageViewerContentClass, className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <ImageViewerBody
          images={images}
          index={index}
          onIndexChange={setIndex}
          onClose={close}
          loop={loop}
          actions={actions}
          labels={labels}
          keyHandlerRef={keyHandlerRef}
        />
      </DialogContent>
    </Dialog>
  )
})
