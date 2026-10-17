import * as React from 'react'
import {
  GIF_PICKER_REDUCED_MOTION_QUERY,
  GIF_PICKER_SKELETON_ROWS,
  clampGifIndex,
  createGifSearchDebouncer,
  getGifAspectRatio,
  getGifEmptyMessage,
  getGifImageSources,
  getGifItemLabel,
  getGifPickerStatusText,
  getNextGifIndex,
  resolveGifColumns,
  resolveGifItems,
  resolveGifPickerLabels,
  resolveGifPickerTab,
  resolveGifPickerTabs,
  resolveGifPickerView,
  gifPickerAttributionClass,
  gifPickerBadgeClass,
  gifPickerFooterClass,
  gifPickerGridClass,
  gifPickerImageClass,
  gifPickerInlineStatusClass,
  gifPickerItemClass,
  gifPickerMessageVariants,
  gifPickerPanelClass,
  gifPickerSearchClass,
  gifPickerSkeletonClass,
  gifPickerSrOnlyClass,
  gifPickerTabClass,
  gifPickerTabListClass,
  gifPickerVariants,
  type GifPickerItem,
  type GifPickerLabelOverrides,
  type GifPickerLabels,
  type GifPickerStatus,
  type GifPickerTab,
  type GifSearchDebouncer,
} from '@refraction-ui/gif-picker'
import { inputVariants } from '@refraction-ui/input'
import { buttonVariants } from '@refraction-ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@refraction-ui/react-tabs'
import { cn } from '@refraction-ui/shared'

export type {
  GifPickerItem,
  GifPickerLabelOverrides,
  GifPickerLabels,
  GifPickerStatus,
  GifPickerTab,
}

/** Visual width of the picker panel. */
export type GifPickerSize = 'sm' | 'md' | 'lg'

/** Retry / load-more buttons share the library's outline button. */
const ACTION_BUTTON_CLASS = cn(
  buttonVariants({ variant: 'outline', size: 'sm' }),
  'min-h-11 focus-visible:ring-ring focus-visible:ring-offset-background',
)

export interface GifPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'results'> {
  /** GIFs for the active tab and query, as returned by the caller's provider. */
  results: readonly GifPickerItem[]
  /** Called when the user picks a GIF. */
  onSelect: (item: GifPickerItem) => void
  /**
   * Loader: called with the normalised query and tab after typing settles
   * (`debounceMs`), on Enter, and immediately when the tab changes.
   */
  onSearch?: (query: string, tab: GifPickerTab) => void
  /** Called when the user asks for the next page. Shown only with `hasMore`. */
  onLoadMore?: () => void
  /** Whether another page exists (shows the load-more button). */
  hasMore?: boolean
  /** State of the caller's loader. */
  status?: GifPickerStatus
  /** Called from the error state's retry button. */
  onRetry?: () => void
  /** Active tab (controlled). */
  tab?: GifPickerTab
  /** Initial tab (uncontrolled). */
  defaultTab?: GifPickerTab
  /** Called when the active tab changes. */
  onTabChange?: (tab: GifPickerTab) => void
  /** Which tabs to show, in order. */
  tabs?: readonly GifPickerTab[]
  /** Initial search text. */
  defaultQuery?: string
  /** Settle delay before `onSearch`, in ms. */
  debounceMs?: number
  /** Grid columns (keyboard navigation follows the same layout). */
  columns?: number
  /** Force still images; defaults to the user's `prefers-reduced-motion`. */
  reducedMotion?: boolean
  /** Override any user-visible text. */
  labels?: GifPickerLabelOverrides
  /** Custom content for the empty state (replaces the default message). */
  emptyState?: React.ReactNode
  /** Provider attribution, e.g. "Powered by …", shown in the footer. */
  attribution?: React.ReactNode
  /** Panel width. */
  size?: GifPickerSize
}

/** Tracks `prefers-reduced-motion`; false on the server and before mount. */
function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(GIF_PICKER_REDUCED_MOTION_QUERY)
    const update = () => setPrefers(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])
  return prefers
}

/** Keeps a callback's latest identity without re-creating dependents. */
function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value)
  ref.current = value
  return ref
}

/**
 * GifPicker — a searchable, provider-agnostic GIF grid with Popular / Recent /
 * Yours tabs.
 *
 * The component never fetches: pass `results` and a `status`, and load in
 * `onSearch(query, tab)` / `onLoadMore`. Search is debounced (`debounceMs`),
 * images are lazy and keep their aspect ratio, and under reduced motion the
 * still frame is shown. The grid uses a roving tab stop with arrow / Home /
 * End navigation; every item is a button named by its alt text and badge.
 */
export const GifPicker = React.forwardRef<HTMLDivElement, GifPickerProps>(function GifPicker(
  {
    results,
    onSelect,
    onSearch,
    onLoadMore,
    hasMore = false,
    status = 'ready',
    onRetry,
    tab: tabProp,
    defaultTab,
    onTabChange,
    tabs: tabsProp,
    defaultQuery = '',
    debounceMs,
    columns: columnsProp,
    reducedMotion: reducedMotionProp,
    labels: labelsProp,
    emptyState,
    attribution,
    size = 'md',
    className,
    ...props
  },
  ref,
) {
  const labels = React.useMemo(() => resolveGifPickerLabels(labelsProp), [labelsProp])
  const tabs = React.useMemo(() => resolveGifPickerTabs(tabsProp), [tabsProp])
  const columns = resolveGifColumns(columnsProp)
  const items = React.useMemo(() => resolveGifItems(results), [results])

  const [internalTab, setInternalTab] = React.useState(() => resolveGifPickerTab(defaultTab, tabs))
  const tab = resolveGifPickerTab(tabProp ?? internalTab, tabs)
  const [query, setQuery] = React.useState(defaultQuery)

  const prefersReducedMotion = usePrefersReducedMotion()
  const reducedMotion = reducedMotionProp ?? prefersReducedMotion

  // The debouncer outlives renders; it reads the latest onSearch through a ref.
  // `emittedRef` is the search the caller last received (initially the one its
  // `results` already reflect), so a recreated debouncer never repeats it.
  const onSearchRef = useLatest(onSearch)
  const searchStateRef = useLatest({ query, tab })
  const emittedRef = React.useRef({ query: defaultQuery, tab })
  const debouncerRef = React.useRef<GifSearchDebouncer | null>(null)
  const carryPendingRef = React.useRef(false)
  React.useEffect(() => {
    const debouncer = createGifSearchDebouncer({
      delayMs: debounceMs,
      onSearch: (q, t) => {
        emittedRef.current = { query: q, tab: t }
        onSearchRef.current?.(q, t)
      },
      initial: emittedRef.current,
    })
    // Carry an in-flight search across a delay change instead of dropping it.
    if (carryPendingRef.current) {
      debouncer.schedule(searchStateRef.current.query, searchStateRef.current.tab)
    }
    debouncerRef.current = debouncer
    return () => {
      carryPendingRef.current = debouncer.isPending()
      debouncer.cancel()
    }
  }, [debounceMs, onSearchRef, searchStateRef])

  const [activeIndex, setActiveIndex] = React.useState(0)
  const focusIndex = clampGifIndex(activeIndex, items.length)
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    setQuery(next)
    setActiveIndex(0)
    debouncerRef.current?.schedule(next, tab)
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    // Enter searches now and must not submit a surrounding composer form.
    event.preventDefault()
    debouncerRef.current?.flush()
  }

  const handleTabChange = (value: string) => {
    const next = resolveGifPickerTab(value, tabs)
    if (next === tab) return
    if (tabProp === undefined) setInternalTab(next)
    setActiveIndex(0)
    onTabChange?.(next)
    debouncerRef.current?.searchNow(query, next)
  }

  const handleItemKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const target = getNextGifIndex(index, event.key, items.length, columns, {
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
    })
    if (target === null) return
    event.preventDefault()
    setActiveIndex(target)
    itemRefs.current[target]?.focus()
  }

  const view = resolveGifPickerView(status, items.length)
  const statusText = getGifPickerStatusText({ status, count: items.length, tab, query, labels })
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  }

  const renderRetry = () =>
    onRetry ? (
      <button type="button" className={ACTION_BUTTON_CLASS} onClick={onRetry}>
        {labels.retry}
      </button>
    ) : null

  const renderResults = () => (
    <>
      <ul className={gifPickerGridClass} style={gridStyle} aria-label={labels.results}>
        {items.map((item, index) => {
          const sources = getGifImageSources(item, reducedMotion)
          return (
            <li key={item.id}>
              <button
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                type="button"
                className={gifPickerItemClass}
                style={{ aspectRatio: getGifAspectRatio(item) }}
                aria-label={getGifItemLabel(item, labels.untitled)}
                title={item.title}
                tabIndex={index === focusIndex ? 0 : -1}
                data-gif-id={item.id}
                onClick={() => onSelect(item)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => handleItemKeyDown(event, index)}
              >
                <picture>
                  {!reducedMotion && (
                    <source media={GIF_PICKER_REDUCED_MOTION_QUERY} srcSet={sources.stillSrc} />
                  )}
                  <img
                    src={sources.src}
                    alt=""
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className={gifPickerImageClass}
                  />
                </picture>
                {item.badge?.trim() ? (
                  <span className={gifPickerBadgeClass} aria-hidden="true">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
      {status === 'loading' && <p className={gifPickerInlineStatusClass}>{labels.loadingMore}</p>}
      {status === 'error' && (
        <div className={gifPickerInlineStatusClass}>
          <p>{labels.error}</p>
          {renderRetry()}
        </div>
      )}
      {hasMore && onLoadMore && status !== 'error' && (
        <div className={gifPickerInlineStatusClass}>
          <button
            type="button"
            className={ACTION_BUTTON_CLASS}
            onClick={onLoadMore}
            disabled={status === 'loading'}
          >
            {labels.loadMore}
          </button>
        </div>
      )}
    </>
  )

  const renderBody = () => {
    switch (view) {
      case 'results':
        return renderResults()
      case 'loading':
        return (
          <div className={gifPickerGridClass} style={gridStyle} aria-hidden="true" data-gif-skeleton="">
            {Array.from({ length: columns * GIF_PICKER_SKELETON_ROWS }, (_, i) => (
              <div key={i} className={gifPickerSkeletonClass} />
            ))}
          </div>
        )
      case 'error':
        return (
          <div className={gifPickerMessageVariants({ tone: 'error' })}>
            <p>{labels.error}</p>
            {renderRetry()}
          </div>
        )
      case 'empty':
        return (
          <div className={gifPickerMessageVariants({ tone: 'neutral' })}>
            {emptyState ?? <p>{getGifEmptyMessage(tab, query, labels)}</p>}
          </div>
        )
    }
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label={labels.picker}
      data-tab={tab}
      data-status={status}
      className={cn(gifPickerVariants({ size }), className)}
      {...props}
    >
      <input
        type="search"
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleSearchKeyDown}
        aria-label={labels.search}
        placeholder={labels.searchPlaceholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(inputVariants({ size: 'lg' }), gifPickerSearchClass)}
      />
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className={gifPickerTabListClass}>
          {tabs.map((value) => (
            <TabsTrigger key={value} value={value} className={gifPickerTabClass}>
              {labels.tabs[value]}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((value) => (
          <TabsContent
            key={value}
            value={value}
            className={cn('mt-2', gifPickerPanelClass)}
            aria-busy={status === 'loading' || undefined}
          >
            {renderBody()}
          </TabsContent>
        ))}
      </Tabs>
      <div role="status" aria-live="polite" aria-atomic="true" className={gifPickerSrOnlyClass}>
        {statusText}
      </div>
      {attribution != null && (
        <div className={gifPickerFooterClass}>
          <div className={gifPickerAttributionClass}>{attribution}</div>
        </div>
      )}
    </div>
  )
})
