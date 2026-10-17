// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { VideoStage, type VideoStageParticipant, type VideoStageProps } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root
let reducedMotion = false

beforeEach(() => {
  reducedMotion = false
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') && reducedMotion,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  )
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

const PEOPLE: VideoStageParticipant[] = [
  { id: 'a', name: 'Ada' },
  { id: 'b', name: 'Ben' },
  { id: 'c', name: 'Cy' },
]

const stage = () => container.querySelector<HTMLElement>('[role="group"][data-mode]')!
const regionOf = (name: string) =>
  container.querySelector<HTMLElement>(`[data-video-stage-region="${name}"]`)
const byLabel = (label: string) =>
  container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
const click = (el: Element | null) => {
  expect(el).not.toBeNull()
  act(() => {
    ;(el as HTMLElement).click()
  })
}
const press = (key: string, target: EventTarget = document.activeElement ?? document.body) => {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  })
}
const pointerDown = (target: EventTarget) => {
  act(() => {
    // jsdom has no PointerEvent; the listener only reads `target`.
    target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
  })
}

function openOptions(name: string) {
  click(byLabel(`Options for ${name}`))
}

describe('VideoStage tile options', () => {
  it('opens inline actions named for the participant and wires the trigger to them', () => {
    render(<VideoStage participants={PEOPLE} />)
    const trigger = byLabel('Options for Ada')!
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    openOptions('Ada')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const actions = document.getElementById(trigger.getAttribute('aria-controls')!)!
    expect(actions.getAttribute('role')).toBe('group')
    expect(actions.querySelector('[aria-label="Spotlight Ada"]')).not.toBeNull()
    expect(actions.querySelector('[aria-label="Maximize Ada"]')).not.toBeNull()
    // Only one tile's options are open at a time.
    expect(container.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1)
  })

  it('pins with "Spotlight", unpins with "Unpin", and keeps focus on the participant', () => {
    render(<VideoStage participants={PEOPLE} />)
    openOptions('Ben')
    click(byLabel('Spotlight Ben'))

    expect(stage().dataset.mode).toBe('spotlight')
    expect(stage().dataset.focusReason).toBe('pinned')
    expect(regionOf('stage')!.dataset.participantId).toBe('b')
    expect(document.activeElement).toBe(regionOf('stage')!.querySelector('[data-video-stage-trigger]'))
    // The pinned cue is not colour-only: a labelled pin badge.
    expect(regionOf('stage')!.querySelector('[aria-label="Pinned"]')).not.toBeNull()

    openOptions('Ben')
    expect(byLabel('Spotlight Ben')).toBeNull()
    click(byLabel('Unpin Ben'))
    expect(stage().dataset.mode).toBe('grid')
    expect((document.activeElement as HTMLElement).dataset.participantId).toBe('b')
  })

  it('does not offer pinning in the grid layout', () => {
    render(<VideoStage participants={PEOPLE} layout="grid" />)
    openOptions('Ada')
    expect(byLabel('Spotlight Ada')).toBeNull()
    expect(byLabel('Maximize Ada')).not.toBeNull()
  })

  it('closes on Escape and returns focus to the trigger', () => {
    render(<VideoStage participants={PEOPLE} />)
    openOptions('Cy')
    byLabel('Maximize Cy')!.focus()
    press('Escape')
    expect(byLabel('Options for Cy')!.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(byLabel('Options for Cy'))
  })

  it('leaves Escape alone when it is pressed outside the stage', () => {
    const outside = document.createElement('input')
    document.body.appendChild(outside)
    render(<VideoStage participants={PEOPLE} />)
    openOptions('Ada')
    press('Escape', outside)
    expect(byLabel('Options for Ada')!.getAttribute('aria-expanded')).toBe('true')
    outside.remove()
  })

  it('closes on a pointer down outside the options, not inside them', () => {
    render(<VideoStage participants={PEOPLE} />)
    openOptions('Ada')
    pointerDown(byLabel('Spotlight Ada')!)
    expect(byLabel('Options for Ada')!.getAttribute('aria-expanded')).toBe('true')

    pointerDown(regionOf('grid')!)
    expect(byLabel('Options for Ada')!.getAttribute('aria-expanded')).toBe('false')
  })

  it('toggles closed from its own trigger', () => {
    render(<VideoStage participants={PEOPLE} />)
    openOptions('Ada')
    pointerDown(byLabel('Options for Ada')!)
    openOptions('Ada')
    expect(byLabel('Options for Ada')!.getAttribute('aria-expanded')).toBe('false')
  })

  it('adds your actions with a context that can close the options', () => {
    const contexts: string[] = []
    render(
      <VideoStage
        participants={PEOPLE}
        defaultPinnedId="a"
        renderTileActions={(p, ctx) => {
          contexts.push(`${p.id}:${ctx.region}:${ctx.pinned}:${ctx.zoomed}`)
          return (
            <button type="button" aria-label={`Mute ${p.name} for me`} onClick={ctx.closeOptions}>
              M
            </button>
          )
        }}
      />,
    )
    // Not rendered while the options are closed.
    expect(contexts).toEqual([])
    openOptions('Ada')
    expect(contexts.at(-1)).toBe('a:stage:true:false')
    click(byLabel('Mute Ada for me'))
    expect(byLabel('Mute Ada for me')).toBeNull()
  })
})

describe('VideoStage zoom', () => {
  it('maximizes over the stage, moves focus to Minimize and makes the layout inert', () => {
    render(<VideoStage participants={PEOPLE} />)
    openOptions('Ben')
    click(byLabel('Maximize Ben'))

    expect(stage().dataset.zoomed).toBe('true')
    const zoom = regionOf('zoom')!
    expect(zoom.querySelector('[aria-label="Options for Ben"]')).not.toBeNull()
    const exit = zoom.querySelector<HTMLButtonElement>('[data-video-stage-zoom-exit]')!
    expect(exit.textContent).toBe('Minimize')
    expect(document.activeElement).toBe(exit)
    expect(regionOf('grid')!.closest('[inert]')).not.toBeNull()
  })

  it('leaves the zoom with Escape and returns focus to the participant in the layout', () => {
    render(<VideoStage participants={PEOPLE} />)
    openOptions('Ben')
    click(byLabel('Maximize Ben'))
    press('Escape')

    expect(stage().dataset.zoomed).toBe('false')
    expect(regionOf('zoom')).toBeNull()
    expect(regionOf('grid')!.closest('[inert]')).toBeNull()
    expect(document.activeElement).toBe(byLabel('Options for Ben'))
  })

  it('closes options inside the zoom before leaving it', () => {
    render(<VideoStage participants={PEOPLE} defaultZoomedId="a" />)
    const zoomTrigger = regionOf('zoom')!.querySelector<HTMLButtonElement>('[data-video-stage-trigger]')!
    click(zoomTrigger)
    press('Escape')
    expect(stage().dataset.zoomed).toBe('true')
    expect(document.activeElement).toBe(zoomTrigger)
    press('Escape')
    expect(stage().dataset.zoomed).toBe('false')
  })

  it('leaves the zoom from the Minimize button', () => {
    render(<VideoStage participants={PEOPLE} defaultZoomedId="c" />)
    click(container.querySelector('[data-video-stage-zoom-exit]'))
    expect(stage().dataset.zoomed).toBe('false')
    expect(document.activeElement).toBe(byLabel('Options for Cy'))
  })
})

describe('VideoStage controlled state', () => {
  it('reports pin changes and follows the parent', () => {
    const onPinnedIdChange = vi.fn()
    const props: VideoStageProps = { participants: PEOPLE, pinnedId: null, onPinnedIdChange }
    render(<VideoStage {...props} />)
    openOptions('Ada')
    click(byLabel('Spotlight Ada'))
    expect(onPinnedIdChange).toHaveBeenCalledWith('a')
    // Controlled: nothing changes until the parent passes the new id.
    expect(stage().dataset.mode).toBe('grid')

    render(<VideoStage {...props} pinnedId="a" />)
    expect(regionOf('stage')!.dataset.participantId).toBe('a')
  })

  it('reports zoom changes and follows the parent', () => {
    const onZoomedIdChange = vi.fn()
    render(<VideoStage participants={PEOPLE} zoomedId={null} onZoomedIdChange={onZoomedIdChange} />)
    openOptions('Cy')
    click(byLabel('Maximize Cy'))
    expect(onZoomedIdChange).toHaveBeenCalledWith('c')
    expect(stage().dataset.zoomed).toBe('false')

    render(<VideoStage participants={PEOPLE} zoomedId="c" onZoomedIdChange={onZoomedIdChange} />)
    expect(stage().dataset.zoomed).toBe('true')
    press('Escape', stage())
    expect(onZoomedIdChange).toHaveBeenLastCalledWith(null)
  })

  it('drops a pin and a zoom when their participant leaves', () => {
    const onPinnedIdChange = vi.fn()
    const onZoomedIdChange = vi.fn()
    const props = { onPinnedIdChange, onZoomedIdChange, defaultPinnedId: 'b', defaultZoomedId: 'b' }
    render(<VideoStage participants={PEOPLE} {...props} />)
    expect(onPinnedIdChange).not.toHaveBeenCalled()

    render(<VideoStage participants={PEOPLE.filter((p) => p.id !== 'b')} {...props} />)
    expect(onPinnedIdChange).toHaveBeenCalledWith(null)
    expect(onZoomedIdChange).toHaveBeenCalledWith(null)
    expect(stage().dataset.mode).toBe('grid')
    expect(stage().dataset.zoomed).toBe('false')
  })
})

describe('VideoStage screen shares and the active speaker', () => {
  const share = { id: 'b-screen', name: 'Ben', screenShare: true }

  it('pins a share that starts during the call, even over an existing pin', () => {
    const onPinnedIdChange = vi.fn()
    render(<VideoStage participants={PEOPLE} defaultPinnedId="a" onPinnedIdChange={onPinnedIdChange} />)
    render(
      <VideoStage participants={[...PEOPLE, share]} defaultPinnedId="a" onPinnedIdChange={onPinnedIdChange} />,
    )
    expect(onPinnedIdChange).toHaveBeenCalledWith('b-screen')
    expect(regionOf('stage')!.dataset.participantId).toBe('b-screen')
  })

  it('does not pin a share that was already live when the stage mounted', () => {
    const onPinnedIdChange = vi.fn()
    render(<VideoStage participants={[...PEOPLE, share]} onPinnedIdChange={onPinnedIdChange} />)
    render(<VideoStage participants={[...PEOPLE, share]} onPinnedIdChange={onPinnedIdChange} />)
    expect(onPinnedIdChange).not.toHaveBeenCalled()
    // It is still on the stage, as the presenter rather than as a pin.
    expect(stage().dataset.focusReason).toBe('screen-share')
  })

  it('leaves the pin alone when auto-pinning is off', () => {
    const onPinnedIdChange = vi.fn()
    const props = { defaultPinnedId: 'a', onPinnedIdChange, autoPinScreenShare: false }
    render(<VideoStage participants={PEOPLE} {...props} />)
    render(<VideoStage participants={[...PEOPLE, share]} {...props} />)
    expect(onPinnedIdChange).not.toHaveBeenCalled()
    expect(regionOf('stage')!.dataset.participantId).toBe('a')
  })

  it('keeps the last active speaker on the stage through a pause', () => {
    const speaking = (id: string | null) => PEOPLE.map((p) => ({ ...p, speaking: p.id === id }))
    render(<VideoStage participants={speaking('b')} autoSpotlightSpeaker />)
    expect(regionOf('stage')!.dataset.participantId).toBe('b')
    expect(stage().dataset.focusReason).toBe('active-speaker')

    render(<VideoStage participants={speaking(null)} autoSpotlightSpeaker />)
    expect(regionOf('stage')!.dataset.participantId).toBe('b')

    render(<VideoStage participants={speaking('c')} autoSpotlightSpeaker />)
    expect(regionOf('stage')!.dataset.participantId).toBe('c')
    // The speaking cue is not colour-only: a labelled sound-wave icon.
    expect(regionOf('stage')!.querySelector('[aria-label="Speaking"]')).not.toBeNull()
  })
})

describe('VideoStage scroll control', () => {
  /** Give the paged grid a scroll size twice its client size. */
  function stubOverflow() {
    const sizes = (el: HTMLElement) =>
      el.dataset.videoStageRegion === 'grid' ? { client: 600, scroll: 1200 } : { client: 0, scroll: 0 }
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return sizes(this).client
    })
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return sizes(this).scroll
    })
  }
  const many = Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, name: `Person ${i}` }))

  it('stays hidden while everything fits', () => {
    render(<VideoStage participants={many} />)
    expect(container.querySelector('[data-video-stage-scroller]')).toBeNull()
  })

  it('pages the grid with labelled buttons that disable at either end', () => {
    stubOverflow()
    const scrollBy = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
      this.scrollLeft += options.left ?? 0
    })
    ;(HTMLElement.prototype as unknown as { scrollBy: typeof scrollBy }).scrollBy = scrollBy
    try {
      render(<VideoStage participants={many} />)
      const scroller = container.querySelector('[data-video-stage-scroller]')!
      expect(scroller.getAttribute('aria-label')).toBe('Scroll participants')
      const previous = byLabel('Previous participants')!
      const next = byLabel('More participants')!
      expect(previous.disabled).toBe(true)
      expect(next.disabled).toBe(false)
      expect(next.getAttribute('aria-controls')).toBe(regionOf('grid')!.id)

      click(next)
      expect(scrollBy).toHaveBeenCalledWith({ left: 600, behavior: 'smooth' })
      act(() => {
        regionOf('grid')!.dispatchEvent(new Event('scroll'))
      })
      expect(previous.disabled).toBe(false)
      expect(next.disabled).toBe(true)
    } finally {
      delete (HTMLElement.prototype as unknown as { scrollBy?: unknown }).scrollBy
    }
  })

  it('jumps instead of gliding under reduced motion', () => {
    stubOverflow()
    reducedMotion = true
    const scrollBy = vi.fn()
    ;(HTMLElement.prototype as unknown as { scrollBy: typeof scrollBy }).scrollBy = scrollBy
    try {
      render(<VideoStage participants={many} />)
      click(byLabel('More participants'))
      expect(scrollBy).toHaveBeenCalledWith({ left: 600, behavior: 'auto' })
    } finally {
      delete (HTMLElement.prototype as unknown as { scrollBy?: unknown }).scrollBy
    }
  })

  it('falls back to setting the scroll position without scrollBy', () => {
    stubOverflow()
    render(<VideoStage participants={many} />)
    click(byLabel('More participants'))
    expect(regionOf('grid')!.scrollLeft).toBe(600)
  })
})

describe('VideoStage ref and media', () => {
  it('forwards its ref to the root', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<VideoStage ref={ref} participants={PEOPLE} />)
    expect(ref.current).toBe(stage())
  })

  it('keeps a participant’s <video> mounted while others join', () => {
    const mounted = new Map<string, HTMLVideoElement>()
    const renderMedia = (p: VideoStageParticipant) => (
      <video ref={(el) => void (el && !mounted.has(p.id) && mounted.set(p.id, el))} muted />
    )
    render(<VideoStage participants={PEOPLE.slice(0, 2)} layout="grid" renderMedia={renderMedia} />)
    const first = mounted.get('a')!
    render(<VideoStage participants={[...PEOPLE, { id: 'd', name: 'Dee' }]} layout="grid" renderMedia={renderMedia} />)
    expect(first.isConnected).toBe(true)
    expect(regionOf('grid')!.querySelector('video')).toBe(first)
  })
})
