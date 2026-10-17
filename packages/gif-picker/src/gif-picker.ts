/**
 * Headless logic for a provider-agnostic GIF picker: tabs, debounced search,
 * a keyboard-navigable grid of GIFs, and empty / loading / error states.
 *
 * The library never fetches. Callers pass the results they already have and a
 * loader callback (`onSearch(query, tab)`); everything here is pure and
 * deterministic so every adapter behaves identically and tests need no clock.
 */

/** The picker's built-in tabs. */
export type GifPickerTab = 'popular' | 'recent' | 'yours'

/** Tab order used when the caller does not choose a subset. */
export const GIF_PICKER_TABS: readonly GifPickerTab[] = ['popular', 'recent', 'yours']

/** Tab selected when nothing else is specified. */
export const GIF_PICKER_DEFAULT_TAB: GifPickerTab = 'popular'

/**
 * Delay between the last keystroke and the `onSearch` call. Long enough to
 * coalesce normal typing into one provider request, short enough to feel live.
 */
export const GIF_PICKER_DEFAULT_DEBOUNCE_MS = 300

/** Number of grid columns when the caller does not choose one. */
export const GIF_PICKER_DEFAULT_COLUMNS = 3

/** Rows of placeholder cells shown while the first page loads. */
export const GIF_PICKER_SKELETON_ROWS = 2

/** Media query adapters use to swap animated GIFs for their still frame. */
export const GIF_PICKER_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** A single GIF as supplied by the caller's provider. */
export interface GifPickerItem {
  /** Stable provider id; used as the React key and to de-duplicate pages. */
  id: string
  /** Still (first-frame) image URL, shown under reduced motion. */
  previewUrl: string
  /** Animated image URL (GIF / WebP / MP4 poster-compatible image). */
  animatedUrl: string
  /** Intrinsic width in pixels; with `height`, sets the cell's aspect ratio. */
  width: number
  /** Intrinsic height in pixels. */
  height: number
  /** Accessible description of the GIF; becomes the item button's name. */
  alt: string
  /** Optional provider title, used as a fallback name and tooltip. */
  title?: string
  /** Optional status text shown on the item, e.g. "In review". */
  badge?: string
}

/**
 * Where the caller's loader is: `ready` (idle, results are current),
 * `loading` (a request is in flight) or `error` (the last request failed).
 */
export type GifPickerStatus = 'ready' | 'loading' | 'error'

/** What the picker's body should show. */
export type GifPickerView = 'results' | 'loading' | 'error' | 'empty'

/** Every user-visible string, so adapters never inline copy and callers can localise. */
export interface GifPickerLabels {
  /** Accessible name of the whole picker. */
  picker: string
  /** Accessible name of the search box. */
  search: string
  /** Placeholder of the search box. */
  searchPlaceholder: string
  /** Tab captions. */
  tabs: Record<GifPickerTab, string>
  /** Accessible name of the results grid. */
  results: string
  /** Shown (and announced) while the first page loads. */
  loading: string
  /** Shown (and announced) while a further page loads. */
  loadingMore: string
  /** Shown when the loader failed. */
  error: string
  /** Caption of the retry button in the error state. */
  retry: string
  /** Caption of the load-more button. */
  loadMore: string
  /** Empty-state text per tab when there is no query. */
  empty: Record<GifPickerTab, string>
  /** Empty-state text when a query matched nothing. */
  noMatches: (query: string) => string
  /** Announced result count. */
  resultCount: (count: number) => string
  /** Accessible name for an item with no alt text or title. */
  untitled: string
}

export const GIF_PICKER_DEFAULT_LABELS: GifPickerLabels = {
  picker: 'GIF picker',
  search: 'Search GIFs',
  searchPlaceholder: 'Search GIFs…',
  tabs: { popular: 'Popular', recent: 'Recent', yours: 'Yours' },
  results: 'GIF results',
  loading: 'Loading GIFs…',
  loadingMore: 'Loading more GIFs…',
  error: 'GIFs could not be loaded.',
  retry: 'Try again',
  loadMore: 'Load more',
  empty: {
    popular: 'No GIFs to show right now.',
    recent: 'GIFs you send will appear here.',
    yours: 'GIFs you add will appear here.',
  },
  noMatches: (query) => `No GIFs match “${query}”.`,
  resultCount: (count) => (count === 1 ? '1 GIF' : `${count} GIFs`),
  untitled: 'GIF',
}

/** Caller overrides for {@link GifPickerLabels}; the tab and empty maps may be partial too. */
export type GifPickerLabelOverrides = Partial<Omit<GifPickerLabels, 'tabs' | 'empty'>> & {
  tabs?: Partial<Record<GifPickerTab, string>>
  empty?: Partial<Record<GifPickerTab, string>>
}

/** Merge partial caller labels over the defaults (tab/empty maps merge per key). */
export function resolveGifPickerLabels(labels: GifPickerLabelOverrides = {}): GifPickerLabels {
  return {
    ...GIF_PICKER_DEFAULT_LABELS,
    ...labels,
    tabs: { ...GIF_PICKER_DEFAULT_LABELS.tabs, ...labels.tabs },
    empty: { ...GIF_PICKER_DEFAULT_LABELS.empty, ...labels.empty },
  }
}

// ---------------------------------------------------------------------------
// Tabs and query
// ---------------------------------------------------------------------------

function isGifPickerTab(value: unknown): value is GifPickerTab {
  return typeof value === 'string' && (GIF_PICKER_TABS as readonly string[]).includes(value)
}

/**
 * The tabs to render: the caller's subset in their order, minus unknown and
 * duplicate entries; the full set when the subset ends up empty.
 */
export function resolveGifPickerTabs(tabs?: readonly string[]): GifPickerTab[] {
  const resolved: GifPickerTab[] = []
  for (const tab of tabs ?? []) {
    if (isGifPickerTab(tab) && !resolved.includes(tab)) resolved.push(tab)
  }
  return resolved.length > 0 ? resolved : [...GIF_PICKER_TABS]
}

/** `tab` when it is one of `tabs`, otherwise the first available tab. */
export function resolveGifPickerTab(tab: string | undefined, tabs: readonly GifPickerTab[]): GifPickerTab {
  if (isGifPickerTab(tab) && tabs.includes(tab)) return tab
  return tabs[0] ?? GIF_PICKER_DEFAULT_TAB
}

/** Trim and collapse internal whitespace so "  cat   gif " and "cat gif" are one search. */
export function normalizeGifQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ')
}

// ---------------------------------------------------------------------------
// Debounced search
// ---------------------------------------------------------------------------

/** Timer seam so the debouncer can be driven deterministically in tests. */
export interface GifPickerTimer {
  set(callback: () => void, delayMs: number): unknown
  clear(handle: unknown): void
}

/** The platform timer (`setTimeout` / `clearTimeout`). */
export const GIF_PICKER_SYSTEM_TIMER: GifPickerTimer = {
  set: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clear: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof globalThis.setTimeout>),
}

export interface GifSearchDebouncerOptions {
  /** Called with the normalised query and the tab once input settles. */
  onSearch: (query: string, tab: GifPickerTab) => void
  /** Settle delay in ms; invalid or negative values fall back to 0 / the default. */
  delayMs?: number
  /** Injectable timer; defaults to {@link GIF_PICKER_SYSTEM_TIMER}. */
  timer?: GifPickerTimer
  /**
   * The search the caller's current results already reflect, so the first
   * settle on an unchanged query does not re-request it.
   */
  initial?: { query: string; tab: GifPickerTab }
}

export interface GifSearchDebouncer {
  /** (Re)start the settle delay for this query/tab; the latest call wins. */
  schedule(query: string, tab: GifPickerTab): void
  /** Run the pending search now (e.g. on Enter). No-op when nothing is pending. */
  flush(): void
  /** Drop the pending search (e.g. on unmount). */
  cancel(): void
  /** Cancel anything pending and search immediately (e.g. on tab change). */
  searchNow(query: string, tab: GifPickerTab): void
  /** Whether a search is waiting for its delay to elapse. */
  isPending(): boolean
}

/** A finite, non-negative delay; `undefined`/NaN fall back to the default. */
export function resolveGifDebounceDelay(delayMs: number | undefined): number {
  if (delayMs === undefined || Number.isNaN(delayMs)) return GIF_PICKER_DEFAULT_DEBOUNCE_MS
  if (!Number.isFinite(delayMs)) return GIF_PICKER_DEFAULT_DEBOUNCE_MS
  return Math.max(0, delayMs)
}

/**
 * Debounce search requests. Queries are normalised, and a request identical to
 * the last one emitted (same query and tab) is skipped, so a trailing space or
 * an undo back to the previous text does not hit the provider again.
 */
export function createGifSearchDebouncer(options: GifSearchDebouncerOptions): GifSearchDebouncer {
  const { onSearch, timer = GIF_PICKER_SYSTEM_TIMER } = options
  const delayMs = resolveGifDebounceDelay(options.delayMs)

  let handle: unknown
  let pending: { query: string; tab: GifPickerTab } | null = null
  let last: { query: string; tab: GifPickerTab } | null = options.initial
    ? { query: normalizeGifQuery(options.initial.query), tab: options.initial.tab }
    : null

  function clearTimer(): void {
    if (handle !== undefined) timer.clear(handle)
    handle = undefined
  }

  function emit(query: string, tab: GifPickerTab): void {
    if (last && last.query === query && last.tab === tab) return
    last = { query, tab }
    onSearch(query, tab)
  }

  function flush(): void {
    clearTimer()
    if (!pending) return
    const request = pending
    pending = null
    emit(request.query, request.tab)
  }

  function schedule(query: string, tab: GifPickerTab): void {
    clearTimer()
    pending = { query: normalizeGifQuery(query), tab }
    handle = timer.set(flush, delayMs)
  }

  function cancel(): void {
    clearTimer()
    pending = null
  }

  function searchNow(query: string, tab: GifPickerTab): void {
    cancel()
    emit(normalizeGifQuery(query), tab)
  }

  return { schedule, flush, cancel, searchNow, isPending: () => pending !== null }
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

/** Schemes an image source may use. Anything else (e.g. `javascript:`) is dropped. */
const SAFE_GIF_URL_SCHEMES = ['http:', 'https:', 'blob:']
const SAFE_GIF_DATA_URL_PREFIX = 'data:image/'
const URL_SCHEME_PATTERN = /^([a-z][a-z0-9+.-]*):/i

/**
 * Whether `url` is safe to use as an image source: http(s), blob, inline
 * `data:image/…`, or a scheme-less (relative) path.
 */
export function isSafeGifUrl(url: string | undefined): boolean {
  if (typeof url !== 'string') return false
  // Browsers ignore embedded whitespace/control chars when parsing schemes.
  // eslint-disable-next-line no-control-regex
  const compact = url.replace(/[\u0000- ]/g, '')
  if (compact === '') return false
  const scheme = URL_SCHEME_PATTERN.exec(compact)
  if (!scheme) return true
  if (compact.toLowerCase().startsWith(SAFE_GIF_DATA_URL_PREFIX)) return true
  return SAFE_GIF_URL_SCHEMES.includes(scheme[1].toLowerCase() + ':')
}

/**
 * The items to render: drops items with no safe image source and later
 * duplicates of an id (paginated providers often repeat an item across pages).
 */
export function resolveGifItems(items: readonly GifPickerItem[] | undefined): GifPickerItem[] {
  const seen = new Set<string>()
  const resolved: GifPickerItem[] = []
  for (const item of items ?? []) {
    if (seen.has(item.id)) continue
    if (!isSafeGifUrl(item.previewUrl) && !isSafeGifUrl(item.animatedUrl)) continue
    seen.add(item.id)
    resolved.push(item)
  }
  return resolved
}

export interface GifImageSources {
  /** The `src` to render now. */
  src: string
  /** The still frame, for a `prefers-reduced-motion` `<source>`. */
  stillSrc: string
}

/**
 * Pick image sources for an item. Under reduced motion `src` is the still
 * frame; otherwise the animated URL. Each side falls back to the other when it
 * is missing or unsafe, so an item never renders a blocked URL.
 */
export function getGifImageSources(item: GifPickerItem, reducedMotion: boolean): GifImageSources {
  const still = isSafeGifUrl(item.previewUrl) ? item.previewUrl : item.animatedUrl
  const animated = isSafeGifUrl(item.animatedUrl) ? item.animatedUrl : still
  return { src: reducedMotion ? still : animated, stillSrc: still }
}

/** Ratio used when an item's dimensions are missing or invalid. */
const FALLBACK_ASPECT_RATIO = '1 / 1'

/** CSS `aspect-ratio` for an item's cell, so cells keep the GIF's shape. */
export function getGifAspectRatio(item: Pick<GifPickerItem, 'width' | 'height'>): string {
  const { width, height } = item
  if (!(Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0)) {
    return FALLBACK_ASPECT_RATIO
  }
  return `${width} / ${height}`
}

/**
 * Accessible name of an item's button: the alt text (else the title, else a
 * generic fallback) plus the badge, so status is never conveyed visually only.
 */
export function getGifItemLabel(item: GifPickerItem, untitled = GIF_PICKER_DEFAULT_LABELS.untitled): string {
  const name = item.alt?.trim() || item.title?.trim() || untitled
  const badge = item.badge?.trim()
  return badge ? `${name} (${badge})` : name
}

// ---------------------------------------------------------------------------
// View state
// ---------------------------------------------------------------------------

/**
 * What the body shows. Results always win, so a failed or in-flight "load
 * more" keeps the GIFs already on screen (adapters show the status inline).
 */
export function resolveGifPickerView(status: GifPickerStatus, count: number): GifPickerView {
  if (count > 0) return 'results'
  if (status === 'loading') return 'loading'
  if (status === 'error') return 'error'
  return 'empty'
}

/** Empty-state copy: a no-match message when searching, else the tab's message. */
export function getGifEmptyMessage(
  tab: GifPickerTab,
  query: string,
  labels: GifPickerLabels = GIF_PICKER_DEFAULT_LABELS,
): string {
  const normalized = normalizeGifQuery(query)
  return normalized ? labels.noMatches(normalized) : labels.empty[tab]
}

export interface GifPickerStatusInput {
  status: GifPickerStatus
  count: number
  tab: GifPickerTab
  query: string
  labels?: GifPickerLabels
}

/** Text for the polite live region that announces what the grid now shows. */
export function getGifPickerStatusText(input: GifPickerStatusInput): string {
  const { status, count, tab, query, labels = GIF_PICKER_DEFAULT_LABELS } = input
  const view = resolveGifPickerView(status, count)
  if (view === 'loading') return labels.loading
  if (view === 'error') return labels.error
  if (view === 'empty') return getGifEmptyMessage(tab, query, labels)
  if (status === 'loading') return `${labels.resultCount(count)}. ${labels.loadingMore}`
  if (status === 'error') return `${labels.resultCount(count)}. ${labels.error}`
  return labels.resultCount(count)
}

// ---------------------------------------------------------------------------
// Grid keyboard navigation
// ---------------------------------------------------------------------------

/** A usable column count: a whole number of at least 1. */
export function resolveGifColumns(columns: number | undefined): number {
  if (columns === undefined || !Number.isFinite(columns)) return GIF_PICKER_DEFAULT_COLUMNS
  return Math.max(1, Math.floor(columns))
}

/** Clamp an index into `[0, count - 1]` (0 when the grid is empty). */
export function clampGifIndex(index: number, count: number): number {
  if (count <= 0 || !Number.isFinite(index)) return 0
  return Math.min(Math.max(0, Math.floor(index)), count - 1)
}

export interface GifGridKeyModifiers {
  /** Ctrl (or ⌘) held: Home/End jump to the whole grid's ends. */
  ctrlKey?: boolean
  metaKey?: boolean
}

/**
 * Roving-focus target for a key press in the GIF grid (WAI-ARIA grid
 * conventions over a row-major layout of `columns` columns).
 *
 * - ArrowRight / ArrowLeft → next / previous item, clamped at the ends
 * - ArrowDown / ArrowUp    → same column in the next / previous row; stays put
 *                            when that row has no item in this column
 * - Home / End             → first / last item of the current row
 * - Ctrl+Home / Ctrl+End   → first / last item of the grid
 *
 * Returns the target index (possibly unchanged, meaning "handled, nowhere to
 * go", so adapters still prevent page scroll), or `null` for keys the grid
 * does not handle.
 */
export function getNextGifIndex(
  current: number,
  key: string,
  count: number,
  columns: number,
  modifiers: GifGridKeyModifiers = {},
): number | null {
  if (count <= 0) return null
  const cols = resolveGifColumns(columns)
  const index = clampGifIndex(current, count)
  const rowStart = index - (index % cols)
  const toGridEnd = Boolean(modifiers.ctrlKey || modifiers.metaKey)

  switch (key) {
    case 'ArrowRight':
      return Math.min(index + 1, count - 1)
    case 'ArrowLeft':
      return Math.max(index - 1, 0)
    case 'ArrowDown':
      return index + cols < count ? index + cols : index
    case 'ArrowUp':
      return index - cols >= 0 ? index - cols : index
    case 'Home':
      return toGridEnd ? 0 : rowStart
    case 'End':
      return toGridEnd ? count - 1 : Math.min(rowStart + cols - 1, count - 1)
    default:
      return null
  }
}
