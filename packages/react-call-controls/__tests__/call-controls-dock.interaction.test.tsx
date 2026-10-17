// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createPortal } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { CallControls, CallControlButton, type CallControlsProps } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.restoreAllMocks()
})

function mount(element: React.ReactElement) {
  act(() => {
    root.render(element)
  })
}

const toolbar = () => container.querySelector<HTMLElement>('[role="toolbar"]')!
/** A control in the bar itself (not its row in "More controls"). */
const bar = (id: string) =>
  container.querySelector<HTMLButtonElement>(`[role="toolbar"] > [role="group"] [data-control="${id}"], [role="toolbar"] > div > [data-control="${id}"]`)!
const more = () => container.querySelector<HTMLButtonElement>('[data-call-controls-more] > button')!
const panel = () => container.querySelector<HTMLElement>('[data-call-controls-panel]')!
const row = (id: string) => panel().querySelector<HTMLButtonElement>(`[data-control="${id}"]`)!

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function key(element: Element, value: string) {
  act(() => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }))
  })
}

/** A dock whose state lives in the test, like a call app's would. */
function Dock(overrides: Partial<CallControlsProps> & { onReactions?: (anchor: HTMLElement) => void }) {
  const [mic, setMic] = React.useState(true)
  const [camera, setCamera] = React.useState(true)
  const [sharing, setSharing] = React.useState(false)
  const [hand, setHand] = React.useState(false)
  const [captions, setCaptions] = React.useState(false)
  const [chat, setChat] = React.useState(false)
  const { onReactions = () => {}, ...rest } = overrides
  return (
    <CallControls
      mic={{ active: mic, onToggle: () => setMic((v) => !v) }}
      camera={{ active: camera, onToggle: () => setCamera((v) => !v) }}
      screenShare={{ active: sharing, onToggle: () => setSharing((v) => !v) }}
      hand={{ active: hand, onToggle: () => setHand((v) => !v) }}
      reactions={{ onOpen: onReactions }}
      captions={{ active: captions, onToggle: () => setCaptions((v) => !v) }}
      chat={{ active: chat, onToggle: () => setChat((v) => !v), count: 2 }}
      onLeave={() => {}}
      {...rest}
    />
  )
}

describe('dock toggles', () => {
  it('flips aria-pressed through the handlers and keeps the names', () => {
    mount(<Dock />)
    expect(bar('mic').getAttribute('aria-pressed')).toBe('true')
    click(bar('mic'))
    expect(bar('mic').getAttribute('aria-pressed')).toBe('false')
    expect(bar('mic').getAttribute('aria-label')).toBe('Microphone')
    click(bar('screenShare'))
    expect(bar('screenShare').getAttribute('aria-pressed')).toBe('true')
    click(bar('hand'))
    expect(bar('hand').getAttribute('aria-pressed')).toBe('true')
    click(bar('captions'))
    expect(bar('captions').getAttribute('aria-pressed')).toBe('true')
  })

  it('swaps to a struck-through icon and a destructive tone when the camera is off', () => {
    mount(<Dock />)
    const before = bar('camera').querySelector('svg')!.innerHTML
    click(bar('camera'))
    expect(bar('camera').querySelector('svg')!.innerHTML).not.toBe(before)
    expect(bar('camera').className).toContain('bg-destructive')
  })

  it('ignores presses on a pending control', () => {
    const onToggle = vi.fn()
    mount(<CallControls record={{ active: false, pending: true, onToggle }} />)
    click(bar('record'))
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('opens reactions against the button and reflects expanded', () => {
    const onOpen = vi.fn()
    mount(<CallControls reactions={{ onOpen, expanded: true }} />)
    click(bar('reactions'))
    expect(onOpen).toHaveBeenCalledWith(bar('reactions'))
    expect(bar('reactions').getAttribute('aria-expanded')).toBe('true')
  })

  it('leaves the call', () => {
    const onLeave = vi.fn()
    mount(<CallControls mic={{ active: true, onToggle: () => {} }} onLeave={onLeave} />)
    click(container.querySelector('[data-control="leave"]')!)
    expect(onLeave).toHaveBeenCalledTimes(1)
  })

  it('keeps the device menu slot a separate control', () => {
    const onToggle = vi.fn()
    const onMenu = vi.fn()
    mount(
      <CallControls
        mic={{
          active: true,
          onToggle,
          menu: (
            <button type="button" aria-label="Microphone options" onClick={onMenu}>
              v
            </button>
          ),
        }}
      />,
    )
    click(container.querySelector('[aria-label="Microphone options"]')!)
    expect(onMenu).toHaveBeenCalledTimes(1)
    expect(onToggle).not.toHaveBeenCalled()
  })
})

describe('More controls', () => {
  it('opens the panel, moves focus into it and closes on Escape back to the trigger', () => {
    mount(<Dock />)
    expect(panel().hidden).toBe(true)
    click(more())
    expect(more().getAttribute('aria-expanded')).toBe('true')
    expect(panel().hidden).toBe(false)
    expect(document.activeElement).toBe(row('screenShare'))
    key(document.activeElement!, 'Escape')
    expect(more().getAttribute('aria-expanded')).toBe('false')
    expect(panel().hidden).toBe(true)
    expect(document.activeElement).toBe(more())
  })

  it('runs a row, closes the panel and returns focus to the trigger', () => {
    mount(<Dock />)
    click(more())
    expect(row('captions').getAttribute('aria-pressed')).toBe('false')
    click(row('captions'))
    expect(panel().hidden).toBe(true)
    expect(document.activeElement).toBe(more())
    expect(bar('captions').getAttribute('aria-pressed')).toBe('true')
    expect(row('captions').getAttribute('aria-pressed')).toBe('true')
  })

  it('names rows with their counts and anchors reactions to the trigger', () => {
    const onReactions = vi.fn()
    mount(<Dock onReactions={onReactions} />)
    click(more())
    expect(row('chat').getAttribute('aria-label')).toBe('Chat (2)')
    click(row('reactions'))
    expect(onReactions).toHaveBeenCalledWith(more())
  })

  it('shows a dot on the trigger when a collapsed control has a count', () => {
    mount(<Dock />)
    expect(more().querySelector('span[aria-hidden="true"]')).not.toBeNull()
    act(() => {
      root.render(<Dock chat={{ active: false, onToggle: () => {} }} />)
    })
    expect(more().querySelector('span[aria-hidden="true"]')).toBeNull()
  })

  it('moves between rows with the arrow keys, Home and End', () => {
    mount(<Dock />)
    click(more())
    key(document.activeElement!, 'ArrowDown')
    expect(document.activeElement).toBe(row('hand'))
    key(document.activeElement!, 'End')
    expect(document.activeElement).toBe(row('chat'))
    key(document.activeElement!, 'ArrowDown')
    expect(document.activeElement).toBe(row('screenShare'))
    key(document.activeElement!, 'ArrowUp')
    expect(document.activeElement).toBe(row('chat'))
    key(document.activeElement!, 'Home')
    expect(document.activeElement).toBe(row('screenShare'))
  })

  it('closes on a press outside', () => {
    mount(<Dock />)
    click(more())
    act(() => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    })
    expect(panel().hidden).toBe(true)
  })

  it('closes when focus moves out of it', () => {
    mount(<Dock />)
    click(more())
    const leave = container.querySelector<HTMLButtonElement>('[data-control="leave"]')!
    act(() => {
      leave.focus()
    })
    expect(panel().hidden).toBe(true)
  })

  it('does not run a pending row', () => {
    const onToggle = vi.fn()
    mount(<CallControls chat={{ active: false, pending: true, onToggle }} />)
    click(more())
    click(row('chat'))
    expect(onToggle).not.toHaveBeenCalled()
  })
})

describe('toolbar arrow keys', () => {
  it('moves between the dock buttons, skipping the panel rows, and wraps', () => {
    mount(<Dock />)
    act(() => {
      bar('mic').focus()
    })
    key(bar('mic'), 'ArrowRight')
    expect(document.activeElement).toBe(bar('camera'))
    key(bar('camera'), 'End')
    expect(document.activeElement).toBe(container.querySelector('[data-control="leave"]'))
    key(document.activeElement!, 'ArrowRight')
    expect(document.activeElement).toBe(bar('mic'))
    key(bar('mic'), 'ArrowLeft')
    expect(document.activeElement).toBe(container.querySelector('[data-control="leave"]'))
    key(document.activeElement!, 'ArrowLeft')
    expect(document.activeElement).toBe(more())
    key(more(), 'Home')
    expect(document.activeElement).toBe(bar('mic'))
  })

  it('moves between composed buttons too, and still calls your onKeyDown', () => {
    const onKeyDown = vi.fn()
    mount(
      <CallControls onKeyDown={onKeyDown}>
        <CallControlButton label="Mute" />
        <CallControlButton label="Leave" tone="destructive" />
      </CallControls>,
    )
    const [mute, leave] = Array.from(toolbar().querySelectorAll('button'))
    act(() => {
      mute!.focus()
    })
    key(mute!, 'ArrowRight')
    expect(document.activeElement).toBe(leave)
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it('leaves keys alone when your onKeyDown prevents them', () => {
    mount(
      <CallControls onKeyDown={(event) => event.preventDefault()}>
        <CallControlButton label="Mute" />
        <CallControlButton label="Leave" tone="destructive" />
      </CallControls>,
    )
    const [mute] = Array.from(toolbar().querySelectorAll('button'))
    act(() => {
      mute!.focus()
    })
    key(mute!, 'ArrowRight')
    expect(document.activeElement).toBe(mute)
  })

  it('ignores keys from portalled content, such as an open device menu', () => {
    function Portalled() {
      return createPortal(<button type="button">Default microphone</button>, document.body)
    }
    mount(
      <CallControls mic={{ active: true, onToggle: () => {}, menu: <Portalled /> }} onLeave={() => {}} />,
    )
    const item = Array.from(document.body.querySelectorAll('button')).find(
      (button) => button.textContent === 'Default microphone',
    )!
    act(() => {
      item.focus()
    })
    key(item, 'ArrowRight')
    expect(document.activeElement).toBe(item)
  })

  it('ignores keys from text fields inside the toolbar', () => {
    mount(
      <CallControls>
        <input aria-label="Note" />
        <CallControlButton label="Leave" tone="destructive" />
      </CallControls>,
    )
    const input = toolbar().querySelector('input')!
    act(() => {
      input.focus()
    })
    key(input, 'ArrowRight')
    expect(document.activeElement).toBe(input)
  })
})
