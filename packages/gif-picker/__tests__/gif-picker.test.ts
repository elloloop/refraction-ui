import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  GIF_PICKER_TABS,
  GIF_PICKER_DEFAULT_DEBOUNCE_MS,
  GIF_PICKER_DEFAULT_COLUMNS,
  GIF_PICKER_DEFAULT_LABELS,
  resolveGifPickerLabels,
  resolveGifPickerTabs,
  resolveGifPickerTab,
  normalizeGifQuery,
  resolveGifDebounceDelay,
  createGifSearchDebouncer,
  isSafeGifUrl,
  resolveGifItems,
  getGifImageSources,
  getGifAspectRatio,
  getGifItemLabel,
  resolveGifPickerView,
  getGifEmptyMessage,
  getGifPickerStatusText,
  resolveGifColumns,
  clampGifIndex,
  getNextGifIndex,
  gifPickerItemClass,
  gifPickerVariants,
  type GifPickerItem,
  type GifPickerTimer,
} from '../src/index.js'

function gif(id: string, overrides: Partial<GifPickerItem> = {}): GifPickerItem {
  return {
    id,
    previewUrl: `https://media.example/${id}/still.png`,
    animatedUrl: `https://media.example/${id}/anim.gif`,
    width: 200,
    height: 100,
    alt: `GIF ${id}`,
    ...overrides,
  }
}

/** Manual timer: tests advance it explicitly, so nothing depends on a clock. */
function manualTimer() {
  let next = 0
  const timers = new Map<number, { callback: () => void; delayMs: number }>()
  const timer: GifPickerTimer = {
    set(callback, delayMs) {
      next += 1
      timers.set(next, { callback, delayMs })
      return next
    },
    clear(handle) {
      timers.delete(handle as number)
    },
  }
  return {
    timer,
    pendingCount: () => timers.size,
    lastDelay: () => Array.from(timers.values()).at(-1)?.delayMs,
    fireAll() {
      const due = Array.from(timers.values())
      timers.clear()
      for (const t of due) t.callback()
    },
  }
}

describe('labels', () => {
  it('merges partial labels over the defaults, per key for tab and empty maps', () => {
    const labels = resolveGifPickerLabels({ search: 'Find', tabs: { recent: 'Latest' } })
    expect(labels.search).toBe('Find')
    expect(labels.tabs).toEqual({ popular: 'Popular', recent: 'Latest', yours: 'Yours' })
    expect(labels.empty).toEqual(GIF_PICKER_DEFAULT_LABELS.empty)
    expect(resolveGifPickerLabels()).toEqual(GIF_PICKER_DEFAULT_LABELS)
  })

  it('pluralises the result count', () => {
    expect(GIF_PICKER_DEFAULT_LABELS.resultCount(1)).toBe('1 GIF')
    expect(GIF_PICKER_DEFAULT_LABELS.resultCount(0)).toBe('0 GIFs')
    expect(GIF_PICKER_DEFAULT_LABELS.resultCount(12)).toBe('12 GIFs')
  })
})

describe('tabs', () => {
  it('defaults to Popular, Recent, Yours', () => {
    expect(resolveGifPickerTabs()).toEqual(['popular', 'recent', 'yours'])
    expect(GIF_PICKER_TABS).toEqual(['popular', 'recent', 'yours'])
  })

  it('keeps a valid subset in caller order, dropping unknown and duplicate tabs', () => {
    expect(resolveGifPickerTabs(['yours', 'bogus', 'popular', 'yours'])).toEqual(['yours', 'popular'])
  })

  it('falls back to every tab when the subset is empty or all invalid', () => {
    expect(resolveGifPickerTabs([])).toEqual([...GIF_PICKER_TABS])
    expect(resolveGifPickerTabs(['nope'])).toEqual([...GIF_PICKER_TABS])
  })

  it('resolves the active tab to an available one', () => {
    expect(resolveGifPickerTab('recent', ['popular', 'recent'])).toBe('recent')
    expect(resolveGifPickerTab('yours', ['popular', 'recent'])).toBe('popular')
    expect(resolveGifPickerTab(undefined, ['recent'])).toBe('recent')
    expect(resolveGifPickerTab('nonsense', [])).toBe('popular')
  })
})

describe('normalizeGifQuery', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeGifQuery('  happy   dance \n')).toBe('happy dance')
    expect(normalizeGifQuery('   ')).toBe('')
  })
})

describe('resolveGifDebounceDelay', () => {
  it('uses the named default for missing or non-finite values', () => {
    expect(resolveGifDebounceDelay(undefined)).toBe(GIF_PICKER_DEFAULT_DEBOUNCE_MS)
    expect(resolveGifDebounceDelay(Number.NaN)).toBe(GIF_PICKER_DEFAULT_DEBOUNCE_MS)
    expect(resolveGifDebounceDelay(Number.POSITIVE_INFINITY)).toBe(GIF_PICKER_DEFAULT_DEBOUNCE_MS)
  })

  it('clamps negatives to zero and keeps valid delays', () => {
    expect(resolveGifDebounceDelay(-50)).toBe(0)
    expect(resolveGifDebounceDelay(0)).toBe(0)
    expect(resolveGifDebounceDelay(450)).toBe(450)
  })
})

describe('createGifSearchDebouncer (injected timer)', () => {
  it('waits for the configured delay and emits only the latest query', () => {
    const clock = manualTimer()
    const onSearch = vi.fn()
    const debouncer = createGifSearchDebouncer({ onSearch, delayMs: 500, timer: clock.timer })

    debouncer.schedule('c', 'popular')
    debouncer.schedule('ca', 'popular')
    debouncer.schedule('  cat ', 'popular')
    expect(onSearch).not.toHaveBeenCalled()
    expect(clock.pendingCount()).toBe(1)
    expect(clock.lastDelay()).toBe(500)
    expect(debouncer.isPending()).toBe(true)

    clock.fireAll()
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('cat', 'popular')
    expect(debouncer.isPending()).toBe(false)
  })

  it('uses the default delay when none is given', () => {
    const clock = manualTimer()
    const debouncer = createGifSearchDebouncer({ onSearch: vi.fn(), timer: clock.timer })
    debouncer.schedule('x', 'popular')
    expect(clock.lastDelay()).toBe(GIF_PICKER_DEFAULT_DEBOUNCE_MS)
  })

  it('skips a request identical to the last one emitted', () => {
    const clock = manualTimer()
    const onSearch = vi.fn()
    const debouncer = createGifSearchDebouncer({ onSearch, timer: clock.timer })
    debouncer.schedule('cat', 'popular')
    clock.fireAll()
    debouncer.schedule('cat ', 'popular')
    clock.fireAll()
    expect(onSearch).toHaveBeenCalledTimes(1)
    debouncer.schedule('cat', 'recent')
    clock.fireAll()
    expect(onSearch).toHaveBeenLastCalledWith('cat', 'recent')
    expect(onSearch).toHaveBeenCalledTimes(2)
  })

  it('treats the initial search as already emitted', () => {
    const clock = manualTimer()
    const onSearch = vi.fn()
    const debouncer = createGifSearchDebouncer({
      onSearch,
      timer: clock.timer,
      initial: { query: ' dog ', tab: 'popular' },
    })
    debouncer.schedule('dog', 'popular')
    clock.fireAll()
    expect(onSearch).not.toHaveBeenCalled()
    debouncer.schedule('', 'popular')
    clock.fireAll()
    expect(onSearch).toHaveBeenCalledWith('', 'popular')
  })

  it('flush runs the pending search immediately and clears the timer', () => {
    const clock = manualTimer()
    const onSearch = vi.fn()
    const debouncer = createGifSearchDebouncer({ onSearch, timer: clock.timer })
    debouncer.flush()
    expect(onSearch).not.toHaveBeenCalled()
    debouncer.schedule('wave', 'yours')
    debouncer.flush()
    expect(onSearch).toHaveBeenCalledWith('wave', 'yours')
    expect(clock.pendingCount()).toBe(0)
  })

  it('cancel drops the pending search', () => {
    const clock = manualTimer()
    const onSearch = vi.fn()
    const debouncer = createGifSearchDebouncer({ onSearch, timer: clock.timer })
    debouncer.schedule('wave', 'yours')
    debouncer.cancel()
    expect(clock.pendingCount()).toBe(0)
    clock.fireAll()
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('searchNow cancels the pending search and emits at once', () => {
    const clock = manualTimer()
    const onSearch = vi.fn()
    const debouncer = createGifSearchDebouncer({ onSearch, timer: clock.timer })
    debouncer.schedule('wav', 'popular')
    debouncer.searchNow('wave ', 'recent')
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('wave', 'recent')
    expect(clock.pendingCount()).toBe(0)
  })
})

describe('createGifSearchDebouncer (default system timer)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('works with fake timers through setTimeout', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const debouncer = createGifSearchDebouncer({ onSearch, delayMs: 200 })
    debouncer.schedule('hi', 'popular')
    vi.advanceTimersByTime(199)
    expect(onSearch).not.toHaveBeenCalled()
    debouncer.schedule('hello', 'popular')
    vi.advanceTimersByTime(199)
    expect(onSearch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onSearch).toHaveBeenCalledWith('hello', 'popular')
  })
})

describe('isSafeGifUrl', () => {
  it('accepts http(s), blob, data:image and relative URLs', () => {
    expect(isSafeGifUrl('https://media.example/a.gif')).toBe(true)
    expect(isSafeGifUrl('http://media.example/a.gif')).toBe(true)
    expect(isSafeGifUrl('blob:https://app.example/1234')).toBe(true)
    expect(isSafeGifUrl('data:image/gif;base64,R0lGOD')).toBe(true)
    expect(isSafeGifUrl('/gifs/a.gif')).toBe(true)
    expect(isSafeGifUrl('gifs/a.gif')).toBe(true)
  })

  it('rejects script and non-image data URLs, including obfuscated schemes', () => {
    expect(isSafeGifUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeGifUrl('JaVaScRiPt:alert(1)')).toBe(false)
    expect(isSafeGifUrl(' java\tscript:alert(1)')).toBe(false)
    expect(isSafeGifUrl('data:text/html,<script>')).toBe(false)
    expect(isSafeGifUrl('vbscript:x')).toBe(false)
  })

  it('rejects empty and non-string values', () => {
    expect(isSafeGifUrl('')).toBe(false)
    expect(isSafeGifUrl('   ')).toBe(false)
    expect(isSafeGifUrl(undefined)).toBe(false)
  })
})

describe('resolveGifItems', () => {
  it('drops later duplicates by id, keeping order', () => {
    const items = resolveGifItems([gif('a'), gif('b'), gif('a', { alt: 'dupe' })])
    expect(items.map((i) => i.id)).toEqual(['a', 'b'])
    expect(items[0].alt).toBe('GIF a')
  })

  it('drops items with no safe source but keeps those with one', () => {
    const items = resolveGifItems([
      gif('bad', { previewUrl: 'javascript:1', animatedUrl: 'javascript:2' }),
      gif('half', { previewUrl: 'javascript:1' }),
    ])
    expect(items.map((i) => i.id)).toEqual(['half'])
  })

  it('handles undefined', () => {
    expect(resolveGifItems(undefined)).toEqual([])
  })
})

describe('getGifImageSources', () => {
  it('uses the animated URL normally and the still under reduced motion', () => {
    const item = gif('a')
    expect(getGifImageSources(item, false)).toEqual({
      src: item.animatedUrl,
      stillSrc: item.previewUrl,
    })
    expect(getGifImageSources(item, true)).toEqual({
      src: item.previewUrl,
      stillSrc: item.previewUrl,
    })
  })

  it('falls back to whichever source is safe', () => {
    const noStill = gif('a', { previewUrl: 'javascript:x' })
    expect(getGifImageSources(noStill, true).src).toBe(noStill.animatedUrl)
    const noAnim = gif('b', { animatedUrl: '' })
    expect(getGifImageSources(noAnim, false).src).toBe(noAnim.previewUrl)
  })
})

describe('getGifAspectRatio', () => {
  it('preserves the intrinsic ratio', () => {
    expect(getGifAspectRatio({ width: 480, height: 270 })).toBe('480 / 270')
  })

  it('falls back to square for missing or invalid dimensions', () => {
    expect(getGifAspectRatio({ width: 0, height: 100 })).toBe('1 / 1')
    expect(getGifAspectRatio({ width: 100, height: -1 })).toBe('1 / 1')
    expect(getGifAspectRatio({ width: Number.NaN, height: 100 })).toBe('1 / 1')
  })
})

describe('getGifItemLabel', () => {
  it('uses alt text, then title, then the fallback', () => {
    expect(getGifItemLabel(gif('a', { alt: ' Cat waving ' }))).toBe('Cat waving')
    expect(getGifItemLabel(gif('a', { alt: '', title: 'Wave' }))).toBe('Wave')
    expect(getGifItemLabel(gif('a', { alt: '' }))).toBe('GIF')
    expect(getGifItemLabel(gif('a', { alt: '' }), 'Animation')).toBe('Animation')
  })

  it('appends the badge so status is announced, not just shown', () => {
    expect(getGifItemLabel(gif('a', { alt: 'Party', badge: 'In review' }))).toBe('Party (In review)')
    expect(getGifItemLabel(gif('a', { alt: 'Party', badge: '  ' }))).toBe('Party')
  })
})

describe('view state', () => {
  it('shows results whenever there are items', () => {
    expect(resolveGifPickerView('ready', 3)).toBe('results')
    expect(resolveGifPickerView('loading', 3)).toBe('results')
    expect(resolveGifPickerView('error', 3)).toBe('results')
  })

  it('distinguishes loading, error and empty with no items', () => {
    expect(resolveGifPickerView('loading', 0)).toBe('loading')
    expect(resolveGifPickerView('error', 0)).toBe('error')
    expect(resolveGifPickerView('ready', 0)).toBe('empty')
  })

  it('empty copy depends on the query, else the tab', () => {
    expect(getGifEmptyMessage('recent', '')).toBe(GIF_PICKER_DEFAULT_LABELS.empty.recent)
    expect(getGifEmptyMessage('yours', '  ')).toBe(GIF_PICKER_DEFAULT_LABELS.empty.yours)
    expect(getGifEmptyMessage('popular', ' zebra  ')).toBe('No GIFs match “zebra”.')
  })

  it('status text covers every view and inline states', () => {
    const base = { tab: 'popular' as const, query: '' }
    expect(getGifPickerStatusText({ ...base, status: 'loading', count: 0 })).toBe('Loading GIFs…')
    expect(getGifPickerStatusText({ ...base, status: 'error', count: 0 })).toBe('GIFs could not be loaded.')
    expect(getGifPickerStatusText({ ...base, status: 'ready', count: 0 })).toBe('No GIFs to show right now.')
    expect(getGifPickerStatusText({ ...base, status: 'ready', count: 4 })).toBe('4 GIFs')
    expect(getGifPickerStatusText({ ...base, status: 'loading', count: 4 })).toBe('4 GIFs. Loading more GIFs…')
    expect(getGifPickerStatusText({ ...base, status: 'error', count: 1 })).toBe('1 GIF. GIFs could not be loaded.')
  })
})

describe('resolveGifColumns / clampGifIndex', () => {
  it('normalises columns to a whole number >= 1', () => {
    expect(resolveGifColumns(undefined)).toBe(GIF_PICKER_DEFAULT_COLUMNS)
    expect(resolveGifColumns(Number.NaN)).toBe(GIF_PICKER_DEFAULT_COLUMNS)
    expect(resolveGifColumns(0)).toBe(1)
    expect(resolveGifColumns(4.7)).toBe(4)
  })

  it('clamps indices into range', () => {
    expect(clampGifIndex(-3, 5)).toBe(0)
    expect(clampGifIndex(9, 5)).toBe(4)
    expect(clampGifIndex(2, 5)).toBe(2)
    expect(clampGifIndex(2, 0)).toBe(0)
    expect(clampGifIndex(Number.NaN, 5)).toBe(0)
  })
})

describe('getNextGifIndex (3 columns, 8 items)', () => {
  // 0 1 2
  // 3 4 5
  // 6 7
  const COUNT = 8
  const COLS = 3
  const next = (current: number, key: string, mods = {}) => getNextGifIndex(current, key, COUNT, COLS, mods)

  it('moves horizontally, clamped at the grid ends', () => {
    expect(next(0, 'ArrowRight')).toBe(1)
    expect(next(2, 'ArrowRight')).toBe(3)
    expect(next(7, 'ArrowRight')).toBe(7)
    expect(next(3, 'ArrowLeft')).toBe(2)
    expect(next(0, 'ArrowLeft')).toBe(0)
  })

  it('moves vertically within a column and stays put when no cell exists', () => {
    expect(next(1, 'ArrowDown')).toBe(4)
    expect(next(4, 'ArrowDown')).toBe(7)
    expect(next(5, 'ArrowDown')).toBe(5)
    expect(next(7, 'ArrowUp')).toBe(4)
    expect(next(1, 'ArrowUp')).toBe(1)
  })

  it('Home/End go to the row ends; with Ctrl or Meta to the grid ends', () => {
    expect(next(4, 'Home')).toBe(3)
    expect(next(4, 'End')).toBe(5)
    expect(next(6, 'End')).toBe(7)
    expect(next(4, 'Home', { ctrlKey: true })).toBe(0)
    expect(next(4, 'End', { ctrlKey: true })).toBe(7)
    expect(next(4, 'End', { metaKey: true })).toBe(7)
  })

  it('returns null for keys the grid does not handle', () => {
    expect(next(0, 'Enter')).toBeNull()
    expect(next(0, 'a')).toBeNull()
  })

  it('clamps an out-of-range current index first', () => {
    expect(next(-1, 'ArrowRight')).toBe(1)
    expect(next(42, 'ArrowLeft')).toBe(6)
  })

  it('returns null for an empty grid and works with one column', () => {
    expect(getNextGifIndex(0, 'ArrowDown', 0, 3)).toBeNull()
    expect(getNextGifIndex(0, 'ArrowDown', 3, 1)).toBe(1)
    expect(getNextGifIndex(1, 'End', 3, 1)).toBe(1)
    expect(getNextGifIndex(1, 'ArrowDown', 3, 0)).toBe(2)
  })
})

describe('styles', () => {
  it('item and root classes carry the focus ring, motion-reduce and token classes', () => {
    expect(gifPickerItemClass).toContain('focus-visible:ring-2')
    expect(gifPickerItemClass).toContain('focus-visible:ring-ring')
    expect(gifPickerItemClass).toContain('motion-reduce:transition-none')
    expect(gifPickerItemClass).toContain('min-h-11')
    expect(gifPickerVariants()).toContain('bg-popover')
    expect(gifPickerVariants({ size: 'lg' })).toContain('max-w-md')
  })
})
