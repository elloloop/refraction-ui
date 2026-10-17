import * as React from 'react'
import {
  createPinnedBar,
  createPinnedBarAnchor,
  clampPinnedBarIndex,
  locatePinnedBarIndex,
  pinnedBarRootClass,
  pinnedBarPinIconClass,
  pinnedBarContentVariants,
  pinnedBarSnippetVariants,
  pinnedBarAuthorClass,
  pinnedBarSnippetTextClass,
  pinnedBarPositionClass,
  pinnedBarSummaryClass,
  pinnedBarControlsClass,
  pinnedBarLiveRegionClass,
  type PinnedBarItem,
  type PinnedBarLabels,
  type PinnedBarAnchor,
} from '@refraction-ui/pinned-bar'
import { IconButton } from '@refraction-ui/react-icon-button'
import { cn } from '@refraction-ui/shared'
import {
  PinGlyph,
  PreviousGlyph,
  NextGlyph,
  ListGlyph,
  UnpinGlyph,
  CollapseGlyph,
  ExpandGlyph,
} from './pinned-bar-icons.js'

export type { PinnedBarItem, PinnedBarLabels }

export interface PinnedBarProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    // The bar owns its content, its landmark role and its name (`labels.region`).
    'children' | 'role' | 'aria-label'
  > {
  /** The pinned messages, in display order. Renders nothing when empty. */
  items: readonly PinnedBarItem[]
  /** Controlled index of the pin being shown. Out-of-range values are clamped. */
  index?: number
  /** Initial index for uncontrolled usage. */
  defaultIndex?: number
  /** Called with the new index when the user presses previous / next. */
  onIndexChange?: (index: number) => void
  /** Clicking the author + snippet jumps to that message. Without it the snippet is plain text. */
  onOpen?: (item: PinnedBarItem) => void
  /** Shows the "all pinned messages" button. */
  onOpenList?: () => void
  /** Shows the unpin button for the current pin. */
  onUnpin?: (item: PinnedBarItem) => void
  /** Controlled collapsed state. */
  collapsed?: boolean
  /** Initial collapsed state for uncontrolled usage. */
  defaultCollapsed?: boolean
  /** Called when the collapse toggle is pressed. */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Override any visible or accessible string, including the "2 of 5" format. */
  labels?: Partial<PinnedBarLabels>
}

/**
 * Which pin is showing. Controlled: the parent's index, clamped. Uncontrolled:
 * an anchor (pin id + index) so the bar keeps showing the same pin when pins
 * are added/removed around it, and falls back to its old slot when that pin
 * itself is removed — resolved during render, so there is no stale frame.
 */
function usePinnedBarIndex(
  items: readonly PinnedBarItem[],
  indexProp: number | undefined,
  defaultIndex: number | undefined,
  onIndexChange: ((index: number) => void) | undefined,
) {
  const isControlled = indexProp !== undefined
  const [anchor, setAnchor] = React.useState<PinnedBarAnchor>(() =>
    createPinnedBarAnchor(items, defaultIndex),
  )
  const index = isControlled
    ? clampPinnedBarIndex(indexProp, items.length)
    : locatePinnedBarIndex(items, anchor)

  const setIndex = (next: number) => {
    if (!isControlled) setAnchor(createPinnedBarAnchor(items, next))
    onIndexChange?.(next)
  }

  return [index, setIndex] as const
}

function usePinnedBarCollapsed(
  collapsedProp: boolean | undefined,
  defaultCollapsed: boolean,
  onCollapsedChange: ((collapsed: boolean) => void) | undefined,
) {
  const isControlled = collapsedProp !== undefined
  const [internal, setInternal] = React.useState(defaultCollapsed)
  const collapsed = isControlled ? collapsedProp : internal

  const toggle = () => {
    const next = !collapsed
    if (!isControlled) setInternal(next)
    onCollapsedChange?.(next)
  }

  return [collapsed, toggle] as const
}

/**
 * Live-region text: empty on first render (nothing is "new" yet), then the
 * announcement whenever the pin being shown changes to a different pin.
 */
function usePinnedBarAnnouncement(currentId: string | undefined, announcement: string) {
  const [text, setText] = React.useState('')
  const lastIdRef = React.useRef(currentId)

  React.useEffect(() => {
    if (lastIdRef.current === currentId) return
    lastIdRef.current = currentId
    setText(announcement)
  }, [currentId, announcement])

  return text
}

/**
 * PinnedBar — the pinned-items strip above a conversation.
 *
 * A `role="region"` landmark showing the current pin's author and a one-line
 * snippet with its position ("2 of 5"), previous/next (wrapping, so the
 * pressed control never disables under keyboard focus), and optional
 * open-list and unpin controls. Collapsible via a disclosure toggle
 * (`aria-expanded`). Changes of the current pin are announced through a polite
 * live region, never on first render. Logic and styles come from the headless
 * `@refraction-ui/pinned-bar` core; icon controls are `IconButton`s.
 */
export const PinnedBar = React.forwardRef<HTMLDivElement, PinnedBarProps>(function PinnedBar(
  {
    items,
    index: indexProp,
    defaultIndex,
    onIndexChange,
    onOpen,
    onOpenList,
    onUnpin,
    collapsed: collapsedProp,
    defaultCollapsed = false,
    onCollapsedChange,
    labels,
    className,
    ...props
  },
  ref,
) {
  const [index, setIndex] = usePinnedBarIndex(items, indexProp, defaultIndex, onIndexChange)
  const [collapsed, toggleCollapsed] = usePinnedBarCollapsed(
    collapsedProp,
    defaultCollapsed,
    onCollapsedChange,
  )
  const api = createPinnedBar({ items, index, collapsed, labels })
  const liveText = usePinnedBarAnnouncement(api.currentItem?.id, api.announcement)

  const baseId = React.useId()
  const contentId = `${baseId}-content`
  const positionId = `${baseId}-position`

  const item = api.currentItem
  if (!item) return null

  const snippetBody = (
    <>
      <span className={pinnedBarAuthorClass}>{item.author}</span>
      <span className={pinnedBarSnippetTextClass}>{item.snippet}</span>
    </>
  )

  return (
    <div
      ref={ref}
      className={cn(pinnedBarRootClass, className)}
      {...api.dataAttributes}
      {...props}
      {...api.ariaProps}
    >
      <span className={pinnedBarPinIconClass} aria-hidden="true">
        <PinGlyph />
      </span>

      <div
        id={contentId}
        className={pinnedBarContentVariants({ collapsed: collapsed ? 'true' : 'false' })}
        hidden={collapsed}
      >
        {onOpen ? (
          <button
            type="button"
            className={pinnedBarSnippetVariants({ interactive: 'true' })}
            aria-describedby={positionId}
            onClick={() => onOpen(item)}
          >
            {snippetBody}
          </button>
        ) : (
          <div className={pinnedBarSnippetVariants({ interactive: 'false' })}>{snippetBody}</div>
        )}

        <span id={positionId} className={pinnedBarPositionClass}>
          {api.positionText}
        </span>

        <div className={pinnedBarControlsClass}>
          {api.canNavigate && (
            <>
              <IconButton
                size="sm"
                icon={<PreviousGlyph />}
                label={api.labels.previous}
                onClick={() => setIndex(api.previousIndex)}
              />
              <IconButton
                size="sm"
                icon={<NextGlyph />}
                label={api.labels.next}
                onClick={() => setIndex(api.nextIndex)}
              />
            </>
          )}
          {onOpenList && (
            <IconButton
              size="sm"
              icon={<ListGlyph />}
              label={api.labels.openList}
              onClick={onOpenList}
            />
          )}
          {onUnpin && (
            <IconButton
              size="sm"
              icon={<UnpinGlyph />}
              label={api.labels.unpin}
              onClick={() => onUnpin(item)}
            />
          )}
        </div>
      </div>

      {collapsed && (
        <span className={pinnedBarSummaryClass}>{api.labels.collapsedSummary(api.total)}</span>
      )}

      <IconButton
        size="sm"
        icon={collapsed ? <ExpandGlyph /> : <CollapseGlyph />}
        label={api.toggleLabel}
        aria-controls={contentId}
        {...api.toggleAriaProps}
        onClick={toggleCollapsed}
      />

      <div className={pinnedBarLiveRegionClass} role="status" aria-live="polite" aria-atomic="true">
        {liveText}
      </div>
    </div>
  )
})
