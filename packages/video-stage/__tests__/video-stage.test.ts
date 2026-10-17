import { describe, it, expect } from 'vitest'
import {
  VIDEO_STAGE_MIN_ROW_HEIGHT,
  VIDEO_STAGE_GAP,
  VIDEO_STAGE_NARROW_WIDTH,
  VIDEO_STAGE_SCROLL_THUMB_MIN_PCT,
  getVideoStageOrientation,
  isVideoStageNarrow,
  getVideoStageDensity,
  getVideoStageRailPlacement,
  getVideoStageGridShape,
  getVideoStageGridScrollAxis,
  getVideoStageRailScrollAxis,
  resolveVideoStageId,
  getVideoStageScreenShareIds,
  findNewScreenShare,
  nextActiveSpeakerId,
  selectVideoStageFocus,
  getVideoStageScrollMetrics,
  videoStageDefaultLabels,
  createVideoStage,
  videoStageGridVariants,
  videoStageRailVariants,
  videoStageRailTileVariants,
  videoStageSpotlightVariants,
  videoStageScrollAreaVariants,
  videoStageScrollThumbVariants,
  videoStageScrollButtonClass,
  videoStageTileButtonClass,
  videoStageTileOptionsClass,
  videoStageTileActionsClass,
  videoStageZoomExitClass,
  type VideoStageItem,
} from '../src/index.js'

const DESKTOP = { width: 1280, height: 720 }
const PHONE_PORTRAIT = { width: 390, height: 700 }
const PHONE_LANDSCAPE = { width: 800, height: 300 }
const NARROW_LANDSCAPE = { width: 560, height: 400 }

const people = (n: number): VideoStageItem[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}` }))

describe('orientation and size', () => {
  it('is landscape when at least as wide as tall, portrait otherwise', () => {
    expect(getVideoStageOrientation(DESKTOP)).toBe('landscape')
    expect(getVideoStageOrientation({ width: 500, height: 500 })).toBe('landscape')
    expect(getVideoStageOrientation(PHONE_PORTRAIT)).toBe('portrait')
  })

  it('treats an unmeasured stage (server render, hidden) as wide landscape', () => {
    expect(getVideoStageOrientation()).toBe('landscape')
    expect(getVideoStageOrientation({ width: 0, height: 0 })).toBe('landscape')
    expect(isVideoStageNarrow()).toBe(false)
    expect(isVideoStageNarrow({ width: 0, height: 0 })).toBe(false)
  })

  it('is narrow below 600px, compact there, regular otherwise', () => {
    expect(VIDEO_STAGE_NARROW_WIDTH).toBe(600)
    expect(isVideoStageNarrow({ width: 599, height: 400 })).toBe(true)
    expect(isVideoStageNarrow({ width: 600, height: 400 })).toBe(false)
    expect(getVideoStageDensity(PHONE_PORTRAIT)).toBe('compact')
    expect(getVideoStageDensity(DESKTOP)).toBe('regular')
  })

  it('puts the rail beside a wide landscape stage and below a portrait or narrow one', () => {
    expect(getVideoStageRailPlacement(DESKTOP)).toBe('side')
    expect(getVideoStageRailPlacement(PHONE_LANDSCAPE)).toBe('side')
    expect(getVideoStageRailPlacement(PHONE_PORTRAIT)).toBe('bottom')
    expect(getVideoStageRailPlacement(NARROW_LANDSCAPE)).toBe('bottom')
    expect(getVideoStageRailPlacement()).toBe('side')
  })

  it('scrolls a side rail vertically and a bottom rail horizontally', () => {
    expect(getVideoStageRailScrollAxis('side')).toBe('vertical')
    expect(getVideoStageRailScrollAxis('bottom')).toBe('horizontal')
  })
})

describe('getVideoStageGridShape', () => {
  it('fills the stage with one tile', () => {
    expect(getVideoStageGridShape(0, DESKTOP)).toBe('single')
    expect(getVideoStageGridShape(1, PHONE_PORTRAIT)).toBe('single')
  })

  it('stacks two in portrait and sets them side by side in landscape', () => {
    expect(getVideoStageGridShape(2, PHONE_PORTRAIT)).toBe('pair-stacked')
    expect(getVideoStageGridShape(2, DESKTOP)).toBe('pair-side')
  })

  it('uses a 2×2 grid for three and four in either orientation', () => {
    for (const size of [DESKTOP, PHONE_PORTRAIT]) {
      expect(getVideoStageGridShape(3, size)).toBe('quad')
      expect(getVideoStageGridShape(4, size)).toBe('quad')
    }
  })

  it('pages from five: down in portrait, across in landscape', () => {
    expect(getVideoStageGridShape(5, PHONE_PORTRAIT)).toBe('paged-vertical')
    expect(getVideoStageGridShape(12, DESKTOP)).toBe('paged-horizontal')
  })

  it('pages one row at a time when a landscape stage is too short for two rows', () => {
    const twoRows = 2 * VIDEO_STAGE_MIN_ROW_HEIGHT + VIDEO_STAGE_GAP
    expect(getVideoStageGridShape(6, { width: 900, height: twoRows - 1 })).toBe('paged-strip')
    expect(getVideoStageGridShape(6, { width: 900, height: twoRows })).toBe('paged-horizontal')
    expect(getVideoStageGridShape(6, PHONE_LANDSCAPE)).toBe('paged-strip')
  })

  it('assumes two rows before the stage is measured', () => {
    expect(getVideoStageGridShape(8)).toBe('paged-horizontal')
  })

  it('maps each shape to its scroll axis', () => {
    expect(getVideoStageGridScrollAxis('single')).toBe('none')
    expect(getVideoStageGridScrollAxis('quad')).toBe('none')
    expect(getVideoStageGridScrollAxis('paged-vertical')).toBe('vertical')
    expect(getVideoStageGridScrollAxis('paged-horizontal')).toBe('horizontal')
    expect(getVideoStageGridScrollAxis('paged-strip')).toBe('horizontal')
  })
})

describe('participant selection helpers', () => {
  it('drops an id that is no longer in the call', () => {
    expect(resolveVideoStageId('p2', people(3))).toBe('p2')
    expect(resolveVideoStageId('gone', people(3))).toBeNull()
    expect(resolveVideoStageId(null, people(3))).toBeNull()
    expect(resolveVideoStageId(undefined, people(3))).toBeNull()
  })

  it('lists shared screens in participant order', () => {
    const list = [{ id: 'a' }, { id: 's2', screenShare: true }, { id: 's1', screenShare: true }]
    expect(getVideoStageScreenShareIds(list)).toEqual(['s2', 's1'])
  })

  it('finds a screen share that was not live before', () => {
    const list = [{ id: 'a' }, { id: 's1', screenShare: true }, { id: 's2', screenShare: true }]
    expect(findNewScreenShare([], list)).toBe('s1')
    expect(findNewScreenShare(['s1'], list)).toBe('s2')
    expect(findNewScreenShare(['s1', 's2'], list)).toBeNull()
  })
})

describe('nextActiveSpeakerId', () => {
  it('picks the first remote participant speaking now', () => {
    const list = [{ id: 'a' }, { id: 'b', speaking: true }, { id: 'c', speaking: true }]
    expect(nextActiveSpeakerId(null, list)).toBe('b')
    expect(nextActiveSpeakerId('c', list)).toBe('b')
  })

  it('keeps the previous speaker through a silence', () => {
    const list = [{ id: 'a' }, { id: 'b' }]
    expect(nextActiveSpeakerId('b', list)).toBe('b')
  })

  it('forgets a speaker who left', () => {
    expect(nextActiveSpeakerId('gone', [{ id: 'a' }])).toBeNull()
  })

  it('never picks the viewer or a shared screen', () => {
    const list = [
      { id: 'me', local: true, speaking: true },
      { id: 'screen', screenShare: true, speaking: true },
      { id: 'b' },
    ]
    expect(nextActiveSpeakerId(null, list)).toBeNull()
    expect(nextActiveSpeakerId('me', list)).toBeNull()
    expect(nextActiveSpeakerId('screen', list)).toBeNull()
  })
})

describe('selectVideoStageFocus', () => {
  const list: VideoStageItem[] = [
    { id: 'me', local: true },
    { id: 'ada' },
    { id: 'ben' },
    { id: 'screen', screenShare: true },
  ]

  it('shows the grid when nobody is pinned, presenting or auto-spotlighted', () => {
    expect(selectVideoStageFocus({ participants: people(4), layout: 'auto' })).toEqual({
      mode: 'grid',
      focusId: null,
      reason: null,
    })
    expect(
      selectVideoStageFocus({ participants: people(4), layout: 'auto', activeSpeakerId: 'p2' }),
    ).toMatchObject({ mode: 'grid' })
  })

  it('ranks a pin above a shared screen above the active speaker', () => {
    const base = { participants: list, layout: 'auto' as const, autoSpotlightSpeaker: true }
    expect(selectVideoStageFocus({ ...base, pinnedId: 'ben', activeSpeakerId: 'ada' })).toEqual({
      mode: 'spotlight',
      focusId: 'ben',
      reason: 'pinned',
    })
    expect(selectVideoStageFocus({ ...base, activeSpeakerId: 'ada' })).toEqual({
      mode: 'spotlight',
      focusId: 'screen',
      reason: 'screen-share',
    })
    const noShare = list.filter((p) => !p.screenShare)
    expect(
      selectVideoStageFocus({ ...base, participants: noShare, activeSpeakerId: 'ada' }),
    ).toEqual({ mode: 'spotlight', focusId: 'ada', reason: 'active-speaker' })
  })

  it('ignores a stale pin and falls back to the next rule', () => {
    expect(
      selectVideoStageFocus({ participants: list, layout: 'auto', pinnedId: 'gone' }),
    ).toMatchObject({ focusId: 'screen', reason: 'screen-share' })
  })

  it('always shows the grid in the grid layout, even with a pin or a share', () => {
    expect(
      selectVideoStageFocus({ participants: list, layout: 'grid', pinnedId: 'ada' }),
    ).toMatchObject({ mode: 'grid', focusId: null })
  })

  it('always shows the presentation layout in the spotlight layout', () => {
    const noShare = list.filter((p) => !p.screenShare)
    expect(
      selectVideoStageFocus({ participants: noShare, layout: 'spotlight', activeSpeakerId: 'ben' }),
    ).toEqual({ mode: 'spotlight', focusId: 'ben', reason: 'active-speaker' })
    expect(selectVideoStageFocus({ participants: noShare, layout: 'spotlight' })).toEqual({
      mode: 'spotlight',
      focusId: 'ada',
      reason: 'layout',
    })
    expect(
      selectVideoStageFocus({ participants: [{ id: 'me', local: true }], layout: 'spotlight' }),
    ).toMatchObject({ focusId: 'me', reason: 'layout' })
  })

  it('shows the grid for an empty call', () => {
    expect(selectVideoStageFocus({ participants: [], layout: 'spotlight' })).toMatchObject({
      mode: 'grid',
    })
  })
})

describe('getVideoStageScrollMetrics', () => {
  it('gives a full thumb and no scrolling when the content fits', () => {
    expect(getVideoStageScrollMetrics(0, 400, 400)).toEqual({
      offsetPct: 0,
      sizePct: 100,
      canScrollBack: false,
      canScrollForward: false,
    })
    expect(getVideoStageScrollMetrics(0, 0, 0).sizePct).toBe(100)
  })

  it('sizes the thumb to the visible share and places it along the track', () => {
    const start = getVideoStageScrollMetrics(0, 400, 1000)
    expect(start).toMatchObject({ offsetPct: 0, sizePct: 40, canScrollBack: false, canScrollForward: true })
    const end = getVideoStageScrollMetrics(600, 400, 1000)
    expect(end).toMatchObject({ offsetPct: 60, canScrollBack: true, canScrollForward: false })
    const middle = getVideoStageScrollMetrics(300, 400, 1000)
    expect(middle.offsetPct).toBeCloseTo(30)
    expect(middle).toMatchObject({ canScrollBack: true, canScrollForward: true })
  })

  it('keeps the thumb at least the minimum length', () => {
    expect(getVideoStageScrollMetrics(0, 100, 5000).sizePct).toBe(VIDEO_STAGE_SCROLL_THUMB_MIN_PCT)
  })

  it('clamps an overscrolled position', () => {
    expect(getVideoStageScrollMetrics(-50, 400, 1000).offsetPct).toBe(0)
    expect(getVideoStageScrollMetrics(900, 400, 1000).offsetPct).toBe(60)
  })
})

describe('labels', () => {
  it('names each tile action after its participant', () => {
    expect(videoStageDefaultLabels.spotlight('Ada')).toBe('Spotlight Ada')
    expect(videoStageDefaultLabels.unpin('Ada')).toBe('Unpin Ada')
    expect(videoStageDefaultLabels.maximize('Ada')).toBe('Maximize Ada')
    expect(videoStageDefaultLabels.tileOptions('Ada')).toBe('Options for Ada')
  })
})

describe('createVideoStage', () => {
  it('exposes mode, orientation, narrowness, zoom and focus reason', () => {
    const api = createVideoStage({
      mode: 'spotlight',
      size: PHONE_PORTRAIT,
      focusReason: 'screen-share',
      zoomed: true,
    })
    expect(api.ariaProps).toEqual({ role: 'group' })
    expect(api.dataAttributes).toEqual({
      'data-mode': 'spotlight',
      'data-orientation': 'portrait',
      'data-narrow': 'true',
      'data-zoomed': 'true',
      'data-focus-reason': 'screen-share',
    })
  })

  it('omits the focus reason in the grid', () => {
    const api = createVideoStage({ mode: 'grid' })
    expect(api.dataAttributes).not.toHaveProperty('data-focus-reason')
    expect(api.dataAttributes['data-orientation']).toBe('landscape')
    expect(api.dataAttributes['data-zoomed']).toBe('false')
  })
})

describe('styles', () => {
  it('fills the stage up to four tiles and pages with snap and a hidden scrollbar from five', () => {
    expect(videoStageGridVariants({ shape: 'quad' })).toContain('grid-rows-2')
    expect(videoStageGridVariants({ shape: 'quad' })).not.toContain('overflow')
    const vertical = videoStageGridVariants({ shape: 'paged-vertical' })
    expect(vertical).toContain('grid-cols-2')
    expect(vertical).toContain('auto-rows-[calc((100%_-_0.5rem)/2)]')
    expect(vertical).toContain('overflow-y-auto')
    expect(vertical).toContain('snap-y')
    expect(vertical).toContain('[scrollbar-width:none]')
    const horizontal = videoStageGridVariants({ shape: 'paged-horizontal' })
    expect(horizontal).toContain('grid-flow-col')
    expect(horizontal).toContain('grid-rows-2')
    expect(horizontal).toContain('overflow-x-auto')
    expect(videoStageGridVariants({ shape: 'paged-strip' })).toContain('grid-rows-1')
  })

  it('places the stage beside or above the rail', () => {
    expect(videoStageSpotlightVariants({ placement: 'side' })).toContain('flex-row')
    expect(videoStageSpotlightVariants({ placement: 'bottom' })).toContain('flex-col')
  })

  it('sizes a bottom rail by density and a side rail by width', () => {
    expect(videoStageRailVariants({ placement: 'bottom', density: 'compact' })).toContain('h-20')
    expect(videoStageRailVariants({ placement: 'bottom', density: 'regular' })).toContain('h-24')
    const side = videoStageRailVariants({ placement: 'side', density: 'regular' })
    expect(side).toContain('w-48')
    expect(side).not.toMatch(/\bh-2[04]\b/)
    expect(videoStageRailTileVariants({ placement: 'side' })).toContain('w-full')
    expect(videoStageRailTileVariants({ placement: 'bottom' })).toContain('h-full')
    expect(videoStageRailTileVariants()).toContain('aspect-video')
  })

  it('puts the scroll control below a horizontal scroller and beside a vertical one', () => {
    expect(videoStageScrollAreaVariants({ axis: 'horizontal' })).toContain('flex-col')
    expect(videoStageScrollAreaVariants({ axis: 'vertical' })).toContain('flex-row')
  })

  it('shows keyboard focus on every control and stops transitions under reduced motion', () => {
    for (const cls of [videoStageScrollButtonClass, videoStageTileButtonClass, videoStageZoomExitClass]) {
      expect(cls).toContain('focus-visible:ring-2')
      expect(cls).toContain('focus-visible:ring-ring')
      expect(cls).toContain('motion-reduce:transition-none')
    }
    expect(videoStageScrollThumbVariants({ axis: 'vertical' })).toContain('motion-reduce:transition-none')
  })

  it('styles an open options trigger from its aria-expanded state', () => {
    expect(videoStageTileButtonClass).toContain('aria-expanded:bg-accent')
  })

  it('lets tile actions wrap on a small tile instead of overflowing it', () => {
    expect(videoStageTileActionsClass).toContain('flex-wrap')
    expect(videoStageTileOptionsClass).toContain('flex-row-reverse')
  })
})
