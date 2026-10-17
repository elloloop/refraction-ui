import * as React from 'react'
import {
  createVideoStage,
  findNewScreenShare,
  getVideoStageDensity,
  getVideoStageGridScrollAxis,
  getVideoStageGridShape,
  getVideoStageRailPlacement,
  getVideoStageRailScrollAxis,
  getVideoStageScreenShareIds,
  getVideoStageScrollMetrics,
  nextActiveSpeakerId,
  resolveVideoStageId,
  selectVideoStageFocus,
  videoStageCellClass,
  videoStageDefaultLabels,
  videoStageFrameClass,
  videoStageGridVariants,
  videoStageLayoutClass,
  videoStageRailSectionVariants,
  videoStageRailTileVariants,
  videoStageRailVariants,
  videoStageRootClass,
  videoStageScrollAreaVariants,
  videoStageScrollButtonClass,
  videoStageScrollerVariants,
  videoStageScrollThumbVariants,
  videoStageScrollTrackVariants,
  videoStageSpotlightVariants,
  videoStageTileActionsClass,
  videoStageTileButtonClass,
  videoStageTileOptionsClass,
  videoStageZoomClass,
  videoStageZoomExitClass,
  type VideoStageLabels,
  type VideoStageLayout,
  type VideoStageScrollMetrics,
  type VideoStageSize,
} from '@refraction-ui/video-stage'
import { getVideoTileLabel, videoTileDefaultLabels } from '@refraction-ui/video-tile'
import {
  VideoTile,
  type VideoTileData,
  type VideoTileLabels,
  type VideoTileProps,
} from '@refraction-ui/react-video-tile'
import { cn, prefersReducedMotion } from '@refraction-ui/shared'
import {
  ChevronIcon,
  MaximizeIcon,
  MinimizeIcon,
  PinIcon,
  PinOffIcon,
} from './icons.js'

/** Where VideoStage places a tile. */
export type VideoStageRegion = 'grid' | 'stage' | 'rail' | 'zoom'

/** A participant, or a shared screen, on the stage. */
export interface VideoStageParticipant extends VideoTileData {
  /**
   * Whether this tile is the viewer's own camera. The viewer never becomes the
   * active speaker, and the spotlight layout prefers someone else.
   */
  local?: boolean
}

/** What VideoStage knows about a tile whose options are open. */
export interface VideoStageTileActionsContext {
  region: VideoStageRegion
  /** Whether this participant is pinned to the stage. */
  pinned: boolean
  /** Whether this participant fills the whole stage. */
  zoomed: boolean
  /** Close the tile options, e.g. after your action ran. */
  closeOptions: () => void
}

/** What VideoStage knows about a tile it is about to render. */
export interface VideoStageTileContext {
  region: VideoStageRegion
  /**
   * The props VideoStage gives its own `<VideoTile>`: the participant's cues,
   * the media from `renderMedia`, the tile options as `menu`, and `fill`.
   * Spread them onto a custom tile to keep all of that.
   */
  tileProps: VideoTileProps
}

export interface VideoStageProps<T extends VideoStageParticipant = VideoStageParticipant>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content' | 'children'> {
  /**
   * Participants and shared screens, one tile each. Extra fields on your type
   * (a media track, say) reach the render callbacks typed.
   */
  participants: T[]
  /**
   * - `'auto'` (default): a grid, until someone is pinned or shares a screen
   *   (or speaks, with `autoSpotlightSpeaker`).
   * - `'grid'`: always the grid. Pinning is unavailable.
   * - `'spotlight'`: always one participant on the stage with the others in
   *   the rail.
   */
  layout?: VideoStageLayout
  /** Pinned participant (controlled). `null` pins nobody. */
  pinnedId?: string | null
  /** Initially pinned participant (uncontrolled). */
  defaultPinnedId?: string | null
  /** Called when the viewer pins or unpins, or a pin is dropped. */
  onPinnedIdChange?: (id: string | null) => void
  /** Participant filling the whole stage (controlled). `null` for none. */
  zoomedId?: string | null
  /** Initially maximized participant (uncontrolled). */
  defaultZoomedId?: string | null
  /** Called when the viewer maximizes or minimizes, or a zoom is dropped. */
  onZoomedIdChange?: (id: string | null) => void
  /**
   * In `'auto'`, put the active speaker on the stage when nobody is pinned or
   * presenting. Defaults to false: the grid stays put.
   */
  autoSpotlightSpeaker?: boolean
  /**
   * Pin a screen share when it starts, so the newest presenter takes the
   * stage even over an existing pin. Shares already live when the stage
   * mounts are not pinned. Defaults to true.
   */
  autoPinScreenShare?: boolean
  /**
   * Live media for a tile — typically a `<video>` with a ref that attaches the
   * participant's stream. Omit (or return `null`) for the avatar fallback.
   */
  renderMedia?: (participant: T, context: { region: VideoStageRegion }) => React.ReactNode
  /**
   * More actions in a tile's options, after pin and maximize — "mute for me",
   * say. Each should be a button with an accessible name.
   */
  renderTileActions?: (participant: T, context: VideoStageTileActionsContext) => React.ReactNode
  /** Replace or extend a whole tile. Spread `tileProps` to keep the stage's cues and options. */
  renderTile?: (participant: T, context: VideoStageTileContext) => React.ReactNode
  /** Override the stage's announced and visible text. */
  labels?: Partial<VideoStageLabels>
  /** Override the tiles' indicator text. */
  tileLabels?: Partial<VideoTileLabels>
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

/** A controlled value when `value` is defined, internal state otherwise. */
function useControllableState<V>(
  value: V | undefined,
  defaultValue: V,
  onChange: ((next: V) => void) | undefined,
): [V, (next: V) => void] {
  const [internal, setInternal] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal
  const currentRef = React.useRef(current)
  currentRef.current = current
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange

  const setValue = React.useCallback(
    (next: V) => {
      if (Object.is(next, currentRef.current)) return
      currentRef.current = next
      if (!controlled) setInternal(next)
      onChangeRef.current?.(next)
    },
    [controlled],
  )
  return [current, setValue]
}

/** The element's rounded size, or `undefined` before it is measured or while hidden. */
function useElementSize(ref: React.RefObject<HTMLElement | null>): VideoStageSize | undefined {
  const [size, setSize] = React.useState<VideoStageSize | undefined>(undefined)

  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      const width = Math.round(rect.width)
      const height = Math.round(rect.height)
      setSize((prev) => {
        if (width === 0 && height === 0) return undefined
        if (prev && prev.width === width && prev.height === height) return prev
        return { width, height }
      })
    }
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return size
}

function sameMetrics(a: VideoStageScrollMetrics | null, b: VideoStageScrollMetrics): boolean {
  return (
    a !== null &&
    a.offsetPct === b.offsetPct &&
    a.sizePct === b.sizePct &&
    a.canScrollBack === b.canScrollBack &&
    a.canScrollForward === b.canScrollForward
  )
}

type ScrollerAxis = 'horizontal' | 'vertical'

/** Live scroll metrics of `ref` along `axis`; re-measured when `contentKey` changes. */
function useScrollMetrics(
  ref: React.RefObject<HTMLElement | null>,
  axis: ScrollerAxis,
  contentKey: string,
): VideoStageScrollMetrics | null {
  const [metrics, setMetrics] = React.useState<VideoStageScrollMetrics | null>(null)

  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const next =
        axis === 'horizontal'
          ? getVideoStageScrollMetrics(el.scrollLeft, el.clientWidth, el.scrollWidth)
          : getVideoStageScrollMetrics(el.scrollTop, el.clientHeight, el.scrollHeight)
      setMetrics((prev) => (sameMetrics(prev, next) ? prev : next))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    observer?.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer?.disconnect()
    }
  }, [ref, axis, contentKey])

  return metrics
}

interface ScrollerProps {
  axis: ScrollerAxis
  targetRef: React.RefObject<HTMLElement | null>
  controlsId: string
  contentKey: string
  labels: VideoStageLabels
}

/**
 * Previous and next buttons around a thin track for a grid page or the rail.
 * Native scrollbars are hidden there, so this is what shows there is more —
 * and what reaches it without a wheel, trackpad or swipe. Renders nothing
 * while everything fits.
 */
function Scroller({ axis, targetRef, controlsId, contentKey, labels }: ScrollerProps) {
  const metrics = useScrollMetrics(targetRef, axis, contentKey)
  if (!metrics || (!metrics.canScrollBack && !metrics.canScrollForward)) return null

  const horizontal = axis === 'horizontal'
  const scrollPage = (direction: 1 | -1) => {
    const el = targetRef.current
    if (!el) return
    const delta = (horizontal ? el.clientWidth : el.clientHeight) * direction
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({
        [horizontal ? 'left' : 'top']: delta,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    } else if (horizontal) {
      el.scrollLeft += delta
    } else {
      el.scrollTop += delta
    }
  }
  const thumbStyle: React.CSSProperties = horizontal
    ? { left: `${metrics.offsetPct}%`, width: `${metrics.sizePct}%` }
    : { top: `${metrics.offsetPct}%`, height: `${metrics.sizePct}%` }

  return (
    <div
      role="group"
      aria-label={labels.scroller}
      className={videoStageScrollerVariants({ axis })}
      data-video-stage-scroller=""
    >
      <button
        type="button"
        className={videoStageScrollButtonClass}
        aria-label={labels.previous}
        title={labels.previous}
        aria-controls={controlsId}
        disabled={!metrics.canScrollBack}
        onClick={() => scrollPage(-1)}
      >
        <ChevronIcon direction={horizontal ? 'left' : 'up'} />
      </button>
      <div className={videoStageScrollTrackVariants({ axis })} aria-hidden="true">
        <div className={videoStageScrollThumbVariants({ axis })} style={thumbStyle} />
      </div>
      <button
        type="button"
        className={videoStageScrollButtonClass}
        aria-label={labels.next}
        title={labels.next}
        aria-controls={controlsId}
        disabled={!metrics.canScrollForward}
        onClick={() => scrollPage(1)}
      >
        <ChevronIcon direction={horizontal ? 'right' : 'down'} />
      </button>
    </div>
  )
}

interface TileOptionsProps {
  participantId: string
  /** The tile's accessible name, e.g. "Ada" or "Ada (Presenting)". */
  name: string
  open: boolean
  pinned: boolean
  canPin: boolean
  canMaximize: boolean
  actionsId: string
  labels: VideoStageLabels
  extraActions: React.ReactNode
  containerRef: React.Ref<HTMLDivElement>
  onToggle: () => void
  onTogglePin: () => void
  onMaximize: () => void
}

/**
 * A tile's options: a trigger at its top-right corner, and when open the
 * actions inline to its left. Inline rather than a popup, so nothing covers
 * the neighbouring tiles and the grid and rail still scroll.
 */
function TileOptions({
  participantId,
  name,
  open,
  pinned,
  canPin,
  canMaximize,
  actionsId,
  labels,
  extraActions,
  containerRef,
  onToggle,
  onTogglePin,
  onMaximize,
}: TileOptionsProps) {
  const pinLabel = pinned ? labels.unpin(name) : labels.spotlight(name)
  const maximizeLabel = labels.maximize(name)
  return (
    <div
      ref={open ? containerRef : undefined}
      className={videoStageTileOptionsClass}
      data-video-stage-options=""
    >
      <button
        type="button"
        className={videoStageTileButtonClass}
        aria-label={labels.tileOptions(name)}
        title={labels.tileOptions(name)}
        aria-expanded={open}
        aria-controls={open ? actionsId : undefined}
        data-video-stage-trigger=""
        data-participant-id={participantId}
        onClick={onToggle}
      >
        <ChevronIcon direction={open ? 'right' : 'left'} />
      </button>
      {open && (
        <div
          id={actionsId}
          role="group"
          aria-label={labels.tileOptions(name)}
          className={videoStageTileActionsClass}
        >
          {canPin && (
            <button
              type="button"
              className={videoStageTileButtonClass}
              aria-label={pinLabel}
              title={pinLabel}
              data-video-stage-action="pin"
              onClick={onTogglePin}
            >
              {pinned ? <PinOffIcon /> : <PinIcon />}
            </button>
          )}
          {canMaximize && (
            <button
              type="button"
              className={videoStageTileButtonClass}
              aria-label={maximizeLabel}
              title={maximizeLabel}
              data-video-stage-action="maximize"
              onClick={onMaximize}
            >
              <MaximizeIcon />
            </button>
          )}
          {extraActions}
        </div>
      )}
    </div>
  )
}

type PendingFocus =
  | { target: 'trigger'; id: string; scope: 'layout' | 'zoom' }
  | { target: 'zoom-exit' }

function setRef<V>(ref: React.ForwardedRef<V>, value: V | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

function VideoStageInner<T extends VideoStageParticipant>(
  {
    participants,
    layout = 'auto',
    pinnedId: pinnedIdProp,
    defaultPinnedId = null,
    onPinnedIdChange,
    zoomedId: zoomedIdProp,
    defaultZoomedId = null,
    onZoomedIdChange,
    autoSpotlightSpeaker = false,
    autoPinScreenShare = true,
    renderMedia,
    renderTileActions,
    renderTile,
    labels: labelOverrides,
    tileLabels,
    className,
    ...props
  }: VideoStageProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const labels: VideoStageLabels = { ...videoStageDefaultLabels, ...labelOverrides }
  const resolvedTileLabels: VideoTileLabels = { ...videoTileDefaultLabels, ...tileLabels }

  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const layoutRef = React.useRef<HTMLDivElement | null>(null)
  const gridRef = React.useRef<HTMLDivElement | null>(null)
  const railRef = React.useRef<HTMLDivElement | null>(null)
  const zoomRef = React.useRef<HTMLDivElement | null>(null)
  const zoomExitRef = React.useRef<HTMLButtonElement | null>(null)
  const openOptionsRef = React.useRef<HTMLDivElement | null>(null)
  const pendingFocusRef = React.useRef<PendingFocus | null>(null)

  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      setRef(forwardedRef, node)
    },
    [forwardedRef],
  )

  const baseId = React.useId()
  const gridId = `${baseId}-grid`
  const railId = `${baseId}-rail`
  const actionsId = `${baseId}-tile-actions`

  const size = useElementSize(rootRef)

  const [pinnedRaw, setPinnedId] = useControllableState(pinnedIdProp, defaultPinnedId, onPinnedIdChange)
  const [zoomedRaw, setZoomedId] = useControllableState(zoomedIdProp, defaultZoomedId, onZoomedIdChange)
  const [openOptions, setOpenOptions] = React.useState<{ id: string; region: VideoStageRegion } | null>(
    null,
  )

  // The active speaker stays on until someone else speaks — derived from the
  // previous render's speaker, so a pause does not empty the stage.
  const [speakerId, setSpeakerId] = React.useState<string | null>(() =>
    nextActiveSpeakerId(null, participants),
  )
  const activeSpeakerId = nextActiveSpeakerId(speakerId, participants)
  if (activeSpeakerId !== speakerId) setSpeakerId(activeSpeakerId)

  const canPin = layout !== 'grid'
  const pinnedId = canPin ? resolveVideoStageId(pinnedRaw, participants) : null
  const zoomedId = resolveVideoStageId(zoomedRaw, participants)
  const zoomed = zoomedId !== null

  const focus = selectVideoStageFocus({
    participants,
    layout,
    pinnedId,
    activeSpeakerId,
    autoSpotlightSpeaker,
  })
  const api = createVideoStage({ mode: focus.mode, size, focusReason: focus.reason, zoomed })

  const participantKey = participants.map((p) => p.id).join('\u0000')

  // Drop a pin or zoom once its participant leaves (or stops sharing).
  React.useEffect(() => {
    if (pinnedRaw != null && resolveVideoStageId(pinnedRaw, participants) === null) setPinnedId(null)
    if (zoomedRaw != null && resolveVideoStageId(zoomedRaw, participants) === null) setZoomedId(null)
    // Keyed on the ids, not the array, which a parent may rebuild every render.
  }, [participantKey, pinnedRaw, zoomedRaw])

  // A screen share that starts while the stage is up takes the stage. The
  // shares already live at mount are only remembered.
  const shareKey = getVideoStageScreenShareIds(participants).join('\u0000')
  const previousSharesRef = React.useRef<string[] | null>(null)
  React.useEffect(() => {
    const previous = previousSharesRef.current
    previousSharesRef.current = getVideoStageScreenShareIds(participants)
    if (previous === null || !autoPinScreenShare || layout === 'grid') return
    const fresh = findNewScreenShare(previous, participants)
    if (fresh) setPinnedId(fresh)
    // Runs when the set of shares changes, not on every participant update.
  }, [shareKey])

  // Close tile options whose participant left.
  if (openOptions && !participants.some((p) => p.id === openOptions.id)) setOpenOptions(null)

  const closeOptions = React.useCallback(() => setOpenOptions(null), [])

  const findTrigger = React.useCallback((id: string, scope: 'layout' | 'zoom') => {
    const container = scope === 'zoom' ? zoomRef.current : layoutRef.current
    if (!container) return null
    const triggers = container.querySelectorAll<HTMLElement>('[data-video-stage-trigger]')
    return Array.from(triggers).find((el) => el.dataset.participantId === id) ?? null
  }, [])

  const exitZoom = React.useCallback(() => {
    if (zoomedId === null) return
    pendingFocusRef.current = { target: 'trigger', id: zoomedId, scope: 'layout' }
    setOpenOptions(null)
    setZoomedId(null)
  }, [zoomedId, setZoomedId])

  // Escape closes open tile options first (back to their trigger), then
  // leaves the maximized view. Only for keys pressed inside the stage, or
  // with nothing focused, so it never steals Escape from another surface.
  React.useEffect(() => {
    if (!openOptions && !zoomed) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      const target = event.target
      const root = rootRef.current
      const inStage =
        target === document.body ||
        target === document.documentElement ||
        (target instanceof Node && root?.contains(target))
      if (!inStage) return
      if (openOptions) {
        event.preventDefault()
        pendingFocusRef.current = {
          target: 'trigger',
          id: openOptions.id,
          scope: openOptions.region === 'zoom' ? 'zoom' : 'layout',
        }
        setOpenOptions(null)
        return
      }
      event.preventDefault()
      exitZoom()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [openOptions, zoomed, exitZoom])

  // A pointer down outside the open options closes them. No backdrop: one
  // would swallow the wheel and touch scrolling of the grid and rail.
  React.useEffect(() => {
    if (!openOptions) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && openOptionsRef.current?.contains(target)) return
      setOpenOptions(null)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [openOptions])

  // While a tile is maximized, the layout under it leaves the tab order and
  // the accessibility tree.
  React.useEffect(() => {
    layoutRef.current?.toggleAttribute('inert', zoomed)
  }, [zoomed])

  // After an action re-renders the stage, put focus where the viewer can go on.
  React.useEffect(() => {
    const pending = pendingFocusRef.current
    if (!pending) return
    pendingFocusRef.current = null
    const el = pending.target === 'zoom-exit' ? zoomExitRef.current : findTrigger(pending.id, pending.scope)
    el?.focus()
  })

  const buildTile = (participant: T, region: VideoStageRegion): React.ReactNode => {
    const name = getVideoTileLabel(participant.name, { screenShare: participant.screenShare }, resolvedTileLabels)
    const isPinned = participant.id === pinnedId
    const isZoomed = participant.id === zoomedId
    const open = openOptions?.id === participant.id && openOptions.region === region
    const canMaximize = region !== 'zoom'
    const extraActions = open
      ? renderTileActions?.(participant, { region, pinned: isPinned, zoomed: isZoomed, closeOptions })
      : null
    const hasActions = canPin || canMaximize || renderTileActions != null

    const menu = hasActions ? (
      <TileOptions
        participantId={participant.id}
        name={name}
        open={open}
        pinned={isPinned}
        canPin={canPin}
        canMaximize={canMaximize}
        actionsId={actionsId}
        labels={labels}
        extraActions={extraActions}
        containerRef={openOptionsRef}
        onToggle={() => setOpenOptions(open ? null : { id: participant.id, region })}
        onTogglePin={() => {
          pendingFocusRef.current = {
            target: 'trigger',
            id: participant.id,
            scope: region === 'zoom' ? 'zoom' : 'layout',
          }
          setOpenOptions(null)
          setPinnedId(isPinned ? null : participant.id)
        }}
        onMaximize={() => {
          pendingFocusRef.current = { target: 'zoom-exit' }
          setOpenOptions(null)
          setZoomedId(participant.id)
        }}
      />
    ) : undefined

    const tileProps: VideoTileProps = {
      name: participant.name,
      micState: participant.micState ?? 'on',
      speaking: participant.speaking,
      pinned: isPinned,
      handRaised: participant.handRaised,
      screenShare: participant.screenShare,
      avatarUrl: participant.avatarUrl,
      mediaSlot: renderMedia?.(participant, { region }) ?? undefined,
      menu,
      fill: true,
      labels: tileLabels,
    }
    if (renderTile) return renderTile(participant, { region, tileProps })
    return <VideoTile {...tileProps} />
  }

  let content: React.ReactNode
  if (focus.mode === 'grid') {
    const shape = getVideoStageGridShape(participants.length, size)
    const axis = getVideoStageGridScrollAxis(shape)
    content = (
      <div className={videoStageScrollAreaVariants({ axis })}>
        <div
          id={gridId}
          ref={gridRef}
          className={videoStageGridVariants({ shape })}
          data-shape={shape}
          data-video-stage-region="grid"
        >
          {participants.map((p) => (
            <div key={p.id} className={videoStageCellClass} data-participant-id={p.id}>
              {buildTile(p, 'grid')}
            </div>
          ))}
        </div>
        {axis !== 'none' && (
          <Scroller
            axis={axis}
            targetRef={gridRef}
            controlsId={gridId}
            contentKey={`${participantKey}|${shape}`}
            labels={labels}
          />
        )}
      </div>
    )
  } else {
    const placement = getVideoStageRailPlacement(size)
    const density = getVideoStageDensity(size)
    const railAxis = getVideoStageRailScrollAxis(placement)
    const focused = participants.find((p) => p.id === focus.focusId)
    const others = participants.filter((p) => p.id !== focus.focusId)
    content = (
      <div className={videoStageSpotlightVariants({ placement })} data-placement={placement}>
        <div
          className={videoStageFrameClass}
          data-video-stage-region="stage"
          data-participant-id={focus.focusId ?? undefined}
        >
          {focused && buildTile(focused, 'stage')}
        </div>
        {others.length > 0 && (
          <div className={videoStageRailSectionVariants({ placement })}>
            <div
              id={railId}
              ref={railRef}
              className={videoStageRailVariants({ placement, density })}
              data-video-stage-region="rail"
            >
              {others.map((p) => (
                <div
                  key={p.id}
                  className={videoStageRailTileVariants({ placement })}
                  data-participant-id={p.id}
                >
                  {buildTile(p, 'rail')}
                </div>
              ))}
            </div>
            <Scroller
              axis={railAxis === 'vertical' ? 'vertical' : 'horizontal'}
              targetRef={railRef}
              controlsId={railId}
              contentKey={`${participantKey}|${placement}|${density}`}
              labels={labels}
            />
          </div>
        )}
      </div>
    )
  }

  const zoomedParticipant = zoomed ? participants.find((p) => p.id === zoomedId) : undefined

  return (
    <div
      ref={setRootRef}
      className={cn(videoStageRootClass, className)}
      aria-label={labels.stage}
      {...api.ariaProps}
      {...api.dataAttributes}
      {...props}
    >
      <div ref={layoutRef} className={videoStageLayoutClass}>
        {content}
      </div>
      {zoomedParticipant && (
        <div ref={zoomRef} className={videoStageZoomClass} data-video-stage-region="zoom">
          {buildTile(zoomedParticipant, 'zoom')}
          <button
            ref={zoomExitRef}
            type="button"
            className={videoStageZoomExitClass}
            data-video-stage-zoom-exit=""
            onClick={exitZoom}
          >
            <MinimizeIcon />
            {labels.minimize}
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * VideoStage — the stateful stage of a video call.
 *
 * A grid that pages past four tiles, and a presentation layout (one tile on
 * the stage, the rest in a rail) that takes over when someone is pinned or
 * shares a screen. Each tile has options to pin it to the stage or maximize
 * it over the whole stage, plus your own actions. The layout follows the
 * stage's own size: a portrait or narrow stage stacks the rail below.
 *
 * Media comes in through `renderMedia`, so the stage works with any call SDK.
 * Layout and selection are the headless `@refraction-ui/video-stage` core.
 */
export const VideoStage = React.forwardRef(VideoStageInner) as <
  T extends VideoStageParticipant = VideoStageParticipant,
>(
  props: VideoStageProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement | null
