// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  IMAGE_VIEWER_IDENTITY,
  IMAGE_VIEWER_KEYBOARD_PAN_STEP_PX,
  IMAGE_VIEWER_ZOOM_STEP_FACTOR,
  getImageViewerWheelScale,
  zoomImageViewerAt,
  type ImageViewerLayout,
} from '@refraction-ui/image-viewer'
import { ImageViewer, type ImageViewerImage } from '../src/index.js'

// Interaction suite (jsdom, no Testing Library). jsdom has no layout engine,
// so the stage size and its client rect are stubbed (800×600 at the origin)
// and each image declares its intrinsic size (400×300, so it is not
// upscaled). This proves the wiring of keys, wheel, pointers and focus to the
// core maths; the maths itself is unit-tested in @refraction-ui/image-viewer.
// Real rendering, pixels, inertia and the visual transition are NOT covered.

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const STAGE = { width: 800, height: 600 }
const layout: ImageViewerLayout = { container: STAGE, image: { width: 400, height: 300 } }

const images: ImageViewerImage[] = [
  { src: '/one.png', alt: 'First', caption: 'One', width: 400, height: 300 },
  { src: '/two.png', alt: 'Second', width: 400, height: 300 },
  { src: '/three.png', alt: 'Third', width: 400, height: 300 },
]

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(STAGE.width)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(STAGE.height)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    right: STAGE.width,
    bottom: STAGE.height,
    width: STAGE.width,
    height: STAGE.height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect)
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  document.body.replaceChildren()
  vi.restoreAllMocks()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).matchMedia
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function query<T extends Element = HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`Missing ${selector}`)
  return found
}

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')
const img = () => query<HTMLImageElement>('[role="dialog"] img')
const stage = () => query<HTMLElement>('[data-image-viewer-stage]')
const button = (label: string) => query<HTMLButtonElement>(`button[aria-label="${label}"]`)
const liveRegion = () => query<HTMLElement>('[role="status"][aria-live="polite"]')

/** Parse `translate(xpx, ypx) scale(s)` from the image's inline style. */
function transform() {
  const match = /translate\((-?[\d.e+-]+)px, (-?[\d.e+-]+)px\) scale\(([\d.e+-]+)\)/.exec(img().style.transform)
  if (!match) throw new Error(`Unexpected transform: ${img().style.transform}`)
  return { x: Number(match[1]), y: Number(match[2]), scale: Number(match[3]) }
}

function press(key: string, init: KeyboardEventInit = {}, target: Element | null = document.activeElement) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  act(() => {
    target!.dispatchEvent(event)
  })
  return event
}

function click(el: HTMLElement) {
  act(() => {
    el.click()
  })
}

function pointer(type: string, pointerId: number, clientX: number, clientY: number) {
  act(() => {
    stage().dispatchEvent(
      new PointerEvent(type, { pointerId, clientX, clientY, bubbles: true, pointerType: 'touch', isPrimary: pointerId === 1 }),
    )
  })
}

function wheel(init: WheelEventInit) {
  const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init })
  act(() => {
    stage().dispatchEvent(event)
  })
  return event
}

function stubReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  })
}

describe('opening, focus and Esc', () => {
  it('opens from the trigger, focuses Close, traps Tab, and Esc returns focus to the opener', () => {
    const onOpenChange = vi.fn()
    render(<ImageViewer images={images} onOpenChange={onOpenChange} trigger={<button type="button">Open</button>} />)
    const trigger = query<HTMLButtonElement>('[aria-haspopup="dialog"]')
    trigger.focus()
    click(trigger)
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(dialog()).not.toBeNull()
    expect(document.activeElement).toBe(button('Close'))

    // Shift+Tab from the first control wraps to the last one, inside the modal.
    expect(press('Tab', { shiftKey: true }).defaultPrevented).toBe(true)
    expect(dialog()!.contains(document.activeElement)).toBe(true)
    expect(document.activeElement).toBe(button('Next image'))

    press('Escape')
    expect(dialog()).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('the Close button closes a controlled viewer', () => {
    const onOpenChange = vi.fn()
    render(<ImageViewer images={images} open onOpenChange={onOpenChange} />)
    click(button('Close'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('announces the position once open', () => {
    render(<ImageViewer images={images} defaultOpen defaultIndex={1} />)
    expect(liveRegion().textContent).toBe('Image 2 of 3')
  })
})

describe('keyboard zoom', () => {
  beforeEach(() => {
    render(<ImageViewer images={images} defaultOpen />)
  })

  it('+ and = zoom in by the step, - zooms out, 0 resets', () => {
    press('+')
    expect(transform().scale).toBeCloseTo(IMAGE_VIEWER_ZOOM_STEP_FACTOR, 9)
    press('=')
    expect(transform().scale).toBeCloseTo(IMAGE_VIEWER_ZOOM_STEP_FACTOR ** 2, 9)
    press('-')
    expect(transform().scale).toBeCloseTo(IMAGE_VIEWER_ZOOM_STEP_FACTOR, 9)
    press('0')
    expect(transform()).toEqual(IMAGE_VIEWER_IDENTITY)
  })

  it('announces the zoom level and updates the readout', () => {
    press('+')
    expect(liveRegion().textContent).toBe('Zoom 150%')
    expect(dialog()!.textContent).toContain('150%')
    expect(query('[data-zoomed]').getAttribute('data-zoomed')).toBe('true')
  })

  it('clamps at 8× and marks Zoom in aria-disabled without losing focus', () => {
    const zoomIn = button('Zoom in')
    zoomIn.focus()
    for (let i = 0; i < 10; i += 1) press('+')
    expect(transform().scale).toBe(8)
    expect(zoomIn.getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement).toBe(zoomIn)
    click(zoomIn)
    expect(transform().scale).toBe(8)
    expect(liveRegion().textContent).toBe('Zoom 800%')
  })

  it('works when the dialog element itself has focus (after clicking the stage)', () => {
    dialog()!.focus()
    press('+')
    expect(transform().scale).toBeCloseTo(IMAGE_VIEWER_ZOOM_STEP_FACTOR, 9)
  })

  it('ignores modified keys (browser zoom shortcuts stay with the browser)', () => {
    const event = press('+', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(transform().scale).toBe(1)
  })
})

describe('zoom buttons', () => {
  it('zoom in, zoom out and reset; zoom out and reset start aria-disabled', () => {
    render(<ImageViewer images={images} defaultOpen />)
    expect(button('Zoom out').getAttribute('aria-disabled')).toBe('true')
    expect(button('Reset zoom').getAttribute('aria-disabled')).toBe('true')
    click(button('Zoom out'))
    expect(transform().scale).toBe(1)
    click(button('Zoom in'))
    expect(transform().scale).toBeCloseTo(IMAGE_VIEWER_ZOOM_STEP_FACTOR, 9)
    expect(button('Zoom out').hasAttribute('aria-disabled')).toBe(false)
    click(button('Zoom out'))
    expect(transform().scale).toBe(1)
    click(button('Zoom in'))
    click(button('Reset zoom'))
    expect(transform()).toEqual(IMAGE_VIEWER_IDENTITY)
  })
})

describe('arrow keys', () => {
  it('switch images when not zoomed (clamped at the ends)', () => {
    const onIndexChange = vi.fn()
    render(<ImageViewer images={images} defaultOpen onIndexChange={onIndexChange} />)
    press('ArrowLeft')
    expect(onIndexChange).not.toHaveBeenCalled()
    press('ArrowRight')
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    expect(img().alt).toBe('Second')
    expect(liveRegion().textContent).toBe('Image 2 of 3')
    press('ArrowRight')
    press('ArrowRight')
    expect(img().alt).toBe('Third')
    expect(onIndexChange).toHaveBeenCalledTimes(2)
    press('ArrowLeft')
    expect(img().alt).toBe('Second')
  })

  it('wrap with loop', () => {
    render(<ImageViewer images={images} defaultOpen loop />)
    press('ArrowLeft')
    expect(img().alt).toBe('Third')
    press('ArrowRight')
    expect(img().alt).toBe('First')
  })

  it('pan by the keyboard step when zoomed, and do not switch images', () => {
    render(<ImageViewer images={images} defaultOpen />)
    for (let i = 0; i < 4; i += 1) press('+')
    press('ArrowLeft')
    expect(transform().x).toBe(IMAGE_VIEWER_KEYBOARD_PAN_STEP_PX)
    press('ArrowUp')
    expect(transform().y).toBe(IMAGE_VIEWER_KEYBOARD_PAN_STEP_PX)
    press('ArrowRight')
    press('ArrowRight')
    expect(transform().x).toBe(-IMAGE_VIEWER_KEYBOARD_PAN_STEP_PX)
    expect(img().alt).toBe('First')
  })

  it('a controlled index follows the parent', () => {
    function Controlled() {
      const [index, setIndex] = React.useState(2)
      return <ImageViewer images={images} open index={index} onIndexChange={setIndex} />
    }
    render(<Controlled />)
    expect(img().alt).toBe('Third')
    press('ArrowLeft')
    expect(img().alt).toBe('Second')
  })
})

describe('previous / next buttons', () => {
  it('navigate, reset the zoom, and disable at the ends', () => {
    render(<ImageViewer images={images} defaultOpen />)
    expect(button('Previous image').getAttribute('aria-disabled')).toBe('true')
    press('+')
    click(button('Next image'))
    expect(img().alt).toBe('Second')
    expect(transform()).toEqual(IMAGE_VIEWER_IDENTITY)
    click(button('Next image'))
    expect(button('Next image').getAttribute('aria-disabled')).toBe('true')
    click(button('Next image'))
    expect(img().alt).toBe('Third')
    click(button('Previous image'))
    expect(img().alt).toBe('Second')
  })
})

describe('wheel', () => {
  beforeEach(() => {
    render(<ImageViewer images={images} defaultOpen />)
  })

  it('zooms around the cursor and prevents the page from scrolling', () => {
    const event = wheel({ deltaY: -300, clientX: 600, clientY: 450 })
    expect(event.defaultPrevented).toBe(true)
    const expected = zoomImageViewerAt(
      IMAGE_VIEWER_IDENTITY,
      getImageViewerWheelScale(1, { deltaY: -300 }),
      { x: 200, y: 150 },
      layout,
    )
    const actual = transform()
    expect(actual.scale).toBeCloseTo(expected.scale, 9)
    expect(actual.x).toBeCloseTo(expected.x, 6)
    expect(actual.y).toBeCloseTo(expected.y, 6)
  })

  it('treats ctrl+wheel (trackpad pinch) with the pinch sensitivity', () => {
    wheel({ deltaY: -20, ctrlKey: true, clientX: 400, clientY: 300 })
    expect(transform().scale).toBeCloseTo(getImageViewerWheelScale(1, { deltaY: -20, ctrlKey: true }), 9)
  })

  it('scrolling down at 1× stays at 1×', () => {
    wheel({ deltaY: 500, clientX: 400, clientY: 300 })
    expect(transform()).toEqual(IMAGE_VIEWER_IDENTITY)
  })
})

describe('double-click', () => {
  it('toggles zoom at the cursor', () => {
    render(<ImageViewer images={images} defaultOpen />)
    act(() => {
      stage().dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: 400, clientY: 300 }))
    })
    expect(transform()).toEqual({ scale: 2, x: 0, y: 0 })
    act(() => {
      stage().dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: 400, clientY: 300 }))
    })
    expect(transform()).toEqual(IMAGE_VIEWER_IDENTITY)
  })
})

describe('pointer drag and pinch', () => {
  beforeEach(() => {
    render(<ImageViewer images={images} defaultOpen />)
  })

  it('drag pans when zoomed and is clamped to the image edges', () => {
    for (let i = 0; i < 4; i += 1) press('+')
    pointer('pointerdown', 1, 400, 300)
    expect(stage().className).toContain('cursor-grabbing')
    pointer('pointermove', 1, 430, 280)
    expect(transform()).toMatchObject({ x: 30, y: -20 })
    pointer('pointermove', 1, 5000, 280)
    const bound = (400 * transform().scale - STAGE.width) / 2
    expect(transform().x).toBeCloseTo(bound, 6)
    pointer('pointerup', 1, 5000, 280)
    expect(stage().className).not.toContain('cursor-grabbing')
    // Moves after release are ignored.
    pointer('pointermove', 1, 0, 0)
    expect(transform().x).toBeCloseTo(bound, 6)
  })

  it('drag does nothing at 1×', () => {
    pointer('pointerdown', 1, 400, 300)
    pointer('pointermove', 1, 500, 400)
    expect(transform()).toEqual(IMAGE_VIEWER_IDENTITY)
  })

  it('two-finger spread zooms by the distance ratio around the midpoint', () => {
    pointer('pointerdown', 1, 300, 300)
    pointer('pointerdown', 2, 500, 300)
    pointer('pointermove', 2, 700, 300)
    // Spread 200 → 400 doubles the zoom.
    expect(transform().scale).toBeCloseTo(2, 9)
    pointer('pointermove', 1, 100, 300)
    // Spread 400 → 600: 3×.
    expect(transform().scale).toBeCloseTo(3, 9)
    pointer('pointerup', 1, 100, 300)
    pointer('pointerup', 2, 700, 300)
  })

  it('pinch zoom is clamped to 8×', () => {
    pointer('pointerdown', 1, 390, 300)
    pointer('pointerdown', 2, 410, 300)
    pointer('pointermove', 2, 800, 300)
    expect(transform().scale).toBe(8)
  })
})

describe('reduced motion', () => {
  it('animates discrete zooms normally', () => {
    stubReducedMotion(false)
    render(<ImageViewer images={images} defaultOpen />)
    press('+')
    expect(img().className).toContain('transition-transform')
  })

  it('turns the transition off under prefers-reduced-motion', () => {
    stubReducedMotion(true)
    render(<ImageViewer images={images} defaultOpen />)
    press('+')
    expect(img().className).not.toContain('transition-transform')
    expect(img().className).toContain('transition-none')
  })

  it('never animates wheel zoom (it follows the input directly)', () => {
    stubReducedMotion(false)
    render(<ImageViewer images={images} defaultOpen />)
    wheel({ deltaY: -100, clientX: 400, clientY: 300 })
    expect(img().className).toContain('transition-none')
  })
})

describe('actions slot', () => {
  it('re-renders for the current image', () => {
    const onDownload = vi.fn()
    render(
      <ImageViewer
        images={images}
        defaultOpen
        actions={(image) => (
          <button type="button" onClick={() => onDownload(image.src)}>
            Download
          </button>
        )}
      />,
    )
    press('ArrowRight')
    const download = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Download')!
    click(download)
    expect(onDownload).toHaveBeenCalledWith('/two.png')
  })

  it('does not hijack keys typed into an input in the slot', () => {
    render(<ImageViewer images={images} defaultOpen actions={<input aria-label="Rename" />} />)
    const input = query<HTMLInputElement>('input[aria-label="Rename"]')
    input.focus()
    const event = press('+', {}, input)
    expect(event.defaultPrevented).toBe(false)
    expect(transform().scale).toBe(1)
  })
})

describe('intrinsic size from the loaded image', () => {
  it('reads naturalWidth/Height on load when no size is declared', () => {
    render(<ImageViewer images={[{ src: '/x.png', alt: 'Undeclared' }]} defaultOpen />)
    expect(img().style.width).toBe('')
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1600)
    vi.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(1200)
    act(() => {
      img().dispatchEvent(new Event('load'))
    })
    // 1600×1200 contained in 800×600.
    expect(img().style.width).toBe('800px')
    expect(img().style.height).toBe('600px')
  })
})
