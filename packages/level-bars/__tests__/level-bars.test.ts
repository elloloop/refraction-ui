import { describe, it, expect } from 'vitest'
import {
  DEFAULT_LEVEL_BARS_BAR_WIDTH,
  DEFAULT_LEVEL_BARS_GAP,
  DEFAULT_LEVEL_BARS_HEIGHT,
  DEFAULT_LIVE_LEVEL_BARS_COUNT,
  DEFAULT_LIVE_LEVEL_BARS_INTERVAL_MS,
  LEVEL_BARS_COLORS,
  LEVEL_BARS_TAPER_FLOOR,
  MIN_LIVE_LEVEL_BARS_INTERVAL_MS,
  clampLevelBarsValue,
  clampLevelBarsValues,
  createLevelHistory,
  getLevelBarsAccessibility,
  getLevelBarsGeometry,
  getLevelBarsPeak,
  getLevelBarsTaper,
  getLevelBarsWidth,
  levelBarsBarVariants,
  levelBarsColorClasses,
  levelHistoryReducer,
  normalizeLevelBarsDimensions,
  normalizeLiveLevelBarsCount,
  normalizeLiveLevelBarsInterval,
  pushLevelHistory,
  resizeLevelHistory,
  toLevelBarsPercent,
} from '../src/index.js'

describe('clampLevelBarsValue', () => {
  it('keeps values inside 0..1 unchanged', () => {
    expect(clampLevelBarsValue(0)).toBe(0)
    expect(clampLevelBarsValue(0.42)).toBe(0.42)
    expect(clampLevelBarsValue(1)).toBe(1)
  })

  it('clamps out-of-range values to the ends', () => {
    expect(clampLevelBarsValue(-0.5)).toBe(0)
    expect(clampLevelBarsValue(3)).toBe(1)
  })

  it('treats a missing reading as silence, not a full bar', () => {
    expect(clampLevelBarsValue(Number.NaN)).toBe(0)
    expect(clampLevelBarsValue(Number.POSITIVE_INFINITY)).toBe(0)
    expect(clampLevelBarsValue(Number.NEGATIVE_INFINITY)).toBe(0)
  })
})

describe('clampLevelBarsValues', () => {
  it('clamps every entry and keeps order and count', () => {
    expect(clampLevelBarsValues([0.2, -1, 2, Number.NaN])).toEqual([0.2, 0, 1, 0])
  })

  it('accepts a Float32Array', () => {
    expect(clampLevelBarsValues(new Float32Array([0.5, 1.5]))).toEqual([0.5, 1])
  })

  it('returns an empty list for missing levels', () => {
    expect(clampLevelBarsValues(undefined)).toEqual([])
    expect(clampLevelBarsValues([])).toEqual([])
  })
})

describe('getLevelBarsTaper', () => {
  it('is 1 for a single bar', () => {
    expect(getLevelBarsTaper(0, 1)).toBe(1)
  })

  it('falls to the floor at both ends and peaks in the middle', () => {
    expect(getLevelBarsTaper(0, 5)).toBeCloseTo(LEVEL_BARS_TAPER_FLOOR)
    expect(getLevelBarsTaper(4, 5)).toBeCloseTo(LEVEL_BARS_TAPER_FLOOR)
    expect(getLevelBarsTaper(2, 5)).toBeCloseTo(1)
  })

  it('is symmetric', () => {
    for (let i = 0; i < 7; i += 1) {
      expect(getLevelBarsTaper(i, 7)).toBeCloseTo(getLevelBarsTaper(6 - i, 7))
    }
  })
})

describe('normalizeLevelBarsDimensions', () => {
  it('fills in defaults', () => {
    expect(normalizeLevelBarsDimensions()).toEqual({
      height: DEFAULT_LEVEL_BARS_HEIGHT,
      barWidth: DEFAULT_LEVEL_BARS_BAR_WIDTH,
      gap: DEFAULT_LEVEL_BARS_GAP,
    })
  })

  it('keeps valid sizes and allows a zero gap', () => {
    expect(normalizeLevelBarsDimensions({ height: 40, barWidth: 4, gap: 0 })).toEqual({
      height: 40,
      barWidth: 4,
      gap: 0,
    })
  })

  it('rejects sizes that cannot be drawn', () => {
    expect(
      normalizeLevelBarsDimensions({ height: 0, barWidth: -2, gap: Number.NaN }),
    ).toEqual({
      height: DEFAULT_LEVEL_BARS_HEIGHT,
      barWidth: DEFAULT_LEVEL_BARS_BAR_WIDTH,
      gap: DEFAULT_LEVEL_BARS_GAP,
    })
  })
})

describe('getLevelBarsWidth', () => {
  it('is bars plus the gaps between them', () => {
    expect(getLevelBarsWidth(4, 3, 2)).toBe(18)
    expect(getLevelBarsWidth(1, 3, 2)).toBe(3)
  })

  it('is 0 with no bars', () => {
    expect(getLevelBarsWidth(0, 3, 2)).toBe(0)
  })
})

describe('getLevelBarsGeometry', () => {
  it('draws each level exactly, centred vertically', () => {
    const geometry = getLevelBarsGeometry([0, 0.5, 1], { height: 20, barWidth: 4, gap: 2 })
    expect(geometry).toEqual({
      width: 16,
      height: 20,
      rects: [
        { x: 0, y: 10, width: 4, height: 0 },
        { x: 6, y: 5, width: 4, height: 10 },
        { x: 12, y: 0, width: 4, height: 20 },
      ],
    })
  })

  it('clamps levels before drawing', () => {
    const { rects } = getLevelBarsGeometry([-1, 5], { height: 10 })
    expect(rects.map((r) => r.height)).toEqual([0, 10])
  })

  it('applies the taper envelope when asked', () => {
    const { rects } = getLevelBarsGeometry([1, 1, 1], { height: 20, taper: true })
    expect(rects[0].height).toBeCloseTo(20 * LEVEL_BARS_TAPER_FLOOR)
    expect(rects[1].height).toBe(20)
    expect(rects[2].height).toBeCloseTo(20 * LEVEL_BARS_TAPER_FLOOR)
    expect(rects[0].y).toBeCloseTo((20 - rects[0].height) / 2)
  })

  it('rounds geometry so repeated runs produce identical text', () => {
    const a = getLevelBarsGeometry([1 / 3, 2 / 3], { height: 10, taper: true })
    const b = getLevelBarsGeometry([1 / 3, 2 / 3], { height: 10, taper: true })
    expect(a).toEqual(b)
    for (const rect of a.rects) {
      expect(rect.height).toBe(Math.round(rect.height * 1000) / 1000)
    }
  })

  it('returns an empty row for no levels', () => {
    expect(getLevelBarsGeometry(undefined)).toEqual({
      width: 0,
      height: DEFAULT_LEVEL_BARS_HEIGHT,
      rects: [],
    })
  })
})

describe('getLevelBarsPeak', () => {
  it('reports the loudest clamped level', () => {
    expect(getLevelBarsPeak([0.1, 0.7, 0.3])).toBe(0.7)
    expect(getLevelBarsPeak([0.2, 4])).toBe(1)
    expect(getLevelBarsPeak([])).toBe(0)
  })
})

describe('toLevelBarsPercent', () => {
  it('maps 0..1 to a whole percent', () => {
    expect(toLevelBarsPercent(0)).toBe(0)
    expect(toLevelBarsPercent(0.424)).toBe(42)
    expect(toLevelBarsPercent(1)).toBe(100)
    expect(toLevelBarsPercent(2)).toBe(100)
    expect(toLevelBarsPercent(Number.NaN)).toBe(0)
  })
})

describe('getLevelBarsAccessibility', () => {
  it('is decorative without a label', () => {
    expect(getLevelBarsAccessibility({ value: 0.5 })).toEqual({ 'aria-hidden': true })
  })

  it('treats a blank label as no label', () => {
    expect(getLevelBarsAccessibility({ label: '  ', value: 0.5 })).toEqual({
      'aria-hidden': true,
    })
  })

  it('is a meter with a label', () => {
    expect(getLevelBarsAccessibility({ label: 'Microphone level', value: 0.5 })).toEqual({
      role: 'meter',
      'aria-label': 'Microphone level',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': 50,
      'aria-valuetext': '50%',
    })
  })
})

describe('normalizeLiveLevelBarsCount', () => {
  it('defaults when missing or not finite', () => {
    expect(normalizeLiveLevelBarsCount(undefined)).toBe(DEFAULT_LIVE_LEVEL_BARS_COUNT)
    expect(normalizeLiveLevelBarsCount(Number.NaN)).toBe(DEFAULT_LIVE_LEVEL_BARS_COUNT)
  })

  it('rounds and keeps at least one bar', () => {
    expect(normalizeLiveLevelBarsCount(7.6)).toBe(8)
    expect(normalizeLiveLevelBarsCount(0)).toBe(1)
    expect(normalizeLiveLevelBarsCount(-3)).toBe(1)
  })
})

describe('normalizeLiveLevelBarsInterval', () => {
  it('defaults when missing, not finite or not positive', () => {
    expect(normalizeLiveLevelBarsInterval(undefined)).toBe(DEFAULT_LIVE_LEVEL_BARS_INTERVAL_MS)
    expect(normalizeLiveLevelBarsInterval(Number.NaN)).toBe(DEFAULT_LIVE_LEVEL_BARS_INTERVAL_MS)
    expect(normalizeLiveLevelBarsInterval(0)).toBe(DEFAULT_LIVE_LEVEL_BARS_INTERVAL_MS)
  })

  it('keeps a valid interval and never goes below one frame', () => {
    expect(normalizeLiveLevelBarsInterval(250)).toBe(250)
    expect(normalizeLiveLevelBarsInterval(1)).toBe(MIN_LIVE_LEVEL_BARS_INTERVAL_MS)
  })
})

describe('level history', () => {
  it('starts silent with `bars` entries', () => {
    expect(createLevelHistory(4)).toEqual({ bars: 4, levels: [0, 0, 0, 0] })
  })

  it('can start with a first reading at the right edge', () => {
    expect(createLevelHistory(3, 0.6).levels).toEqual([0, 0, 0.6])
  })

  it('pushes the newest reading on the right and scrolls the oldest off', () => {
    let state = createLevelHistory(3)
    state = pushLevelHistory(state, 0.1)
    state = pushLevelHistory(state, 0.2)
    state = pushLevelHistory(state, 0.3)
    expect(state.levels).toEqual([0.1, 0.2, 0.3])
    state = pushLevelHistory(state, 0.4)
    expect(state.levels).toEqual([0.2, 0.3, 0.4])
  })

  it('clamps pushed readings', () => {
    const state = pushLevelHistory(createLevelHistory(2), 9)
    expect(state.levels).toEqual([0, 1])
  })

  it('scrolls a repeated reading too, so silence clears old sound', () => {
    let state = createLevelHistory(2, 0.8)
    state = pushLevelHistory(state, 0)
    state = pushLevelHistory(state, 0)
    expect(state.levels).toEqual([0, 0])
  })

  it('does not mutate the previous state', () => {
    const before = createLevelHistory(2)
    const after = pushLevelHistory(before, 0.5)
    expect(before.levels).toEqual([0, 0])
    expect(after).not.toBe(before)
  })

  it('resizes keeping the newest readings', () => {
    const state = { bars: 4, levels: [0.1, 0.2, 0.3, 0.4] }
    expect(resizeLevelHistory(state, 2)).toEqual({ bars: 2, levels: [0.3, 0.4] })
    expect(resizeLevelHistory(state, 6)).toEqual({
      bars: 6,
      levels: [0, 0, 0.1, 0.2, 0.3, 0.4],
    })
  })

  it('returns the same state when the size does not change', () => {
    const state = createLevelHistory(3)
    expect(resizeLevelHistory(state, 3)).toBe(state)
  })

  it('reduces push, resize and reset actions', () => {
    let state = createLevelHistory(2)
    state = levelHistoryReducer(state, { type: 'push', level: 0.5 })
    expect(state.levels).toEqual([0, 0.5])
    state = levelHistoryReducer(state, { type: 'resize', bars: 3 })
    expect(state.levels).toEqual([0, 0, 0.5])
    state = levelHistoryReducer(state, { type: 'reset' })
    expect(state).toEqual({ bars: 3, levels: [0, 0, 0] })
  })
})

describe('styles', () => {
  it('maps every colour token to a semantic background class', () => {
    for (const color of LEVEL_BARS_COLORS) {
      expect(levelBarsColorClasses[color]).toMatch(/^bg-[a-z-]+$/)
    }
  })

  it('only eases live bars, and never under reduced motion', () => {
    expect(levelBarsBarVariants({ animated: 'false' })).not.toContain('transition')
    const animated = levelBarsBarVariants({ animated: 'true' })
    expect(animated).toContain('transition-[height,top]')
    expect(animated).toContain('motion-reduce:transition-none')
  })

  it('applies the colour class', () => {
    expect(levelBarsBarVariants({ color: 'success' })).toContain('bg-success')
    expect(levelBarsBarVariants()).toContain('bg-primary')
  })
})
