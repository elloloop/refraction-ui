// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Switch } from '../src/switch.js'

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
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function button(): HTMLButtonElement {
  const el = container.querySelector('button')
  if (!el) throw new Error('switch button not rendered')
  return el
}

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function keyDown(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

/** Stateful wrapper that plays the role of a controlled parent. */
function ControlledSwitch({
  initial = false,
  onCheckedChange,
}: {
  initial?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  const [checked, setChecked] = React.useState(initial)
  return (
    <Switch
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next)
        onCheckedChange?.(next)
      }}
    />
  )
}

describe('Switch (React) interaction - click toggling', () => {
  it('click fires onCheckedChange with true when unchecked', () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={onCheckedChange} />)
    click(button())
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('click fires onCheckedChange with false when checked', () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked={true} onCheckedChange={onCheckedChange} />)
    click(button())
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  it('controlled without a parent update snaps back to the rendered state', () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={onCheckedChange} />)
    click(button())
    // The callback fired, but the component is fully controlled: with no
    // parent re-render the DOM state must snap back to `checked={false}`.
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(button().getAttribute('aria-checked')).toBe('false')
    expect(button().getAttribute('data-state')).toBe('unchecked')
  })

  it('controlled parent updates the rendered state on click', () => {
    render(<ControlledSwitch />)
    expect(button().getAttribute('aria-checked')).toBe('false')
    click(button())
    expect(button().getAttribute('aria-checked')).toBe('true')
    expect(button().getAttribute('data-state')).toBe('checked')
    click(button())
    expect(button().getAttribute('aria-checked')).toBe('false')
    expect(button().getAttribute('data-state')).toBe('unchecked')
  })

  it('does not throw when clicked without an onCheckedChange handler', () => {
    render(<Switch checked={false} />)
    expect(() => click(button())).not.toThrow()
    expect(button().getAttribute('aria-checked')).toBe('false')
  })
})

describe('Switch (React) interaction - keyboard toggling', () => {
  it('Space fires onCheckedChange with the toggled value', () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={onCheckedChange} />)
    const event = keyDown(button(), ' ')
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    // Space is preventDefaulted so the page does not scroll.
    expect(event.defaultPrevented).toBe(true)
  })

  it('Space on a checked switch fires onCheckedChange with false', () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked={true} onCheckedChange={onCheckedChange} />)
    keyDown(button(), ' ')
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  it('Space does not change DOM state without a parent update (snap-back)', () => {
    render(<Switch checked={false} onCheckedChange={() => {}} />)
    keyDown(button(), ' ')
    expect(button().getAttribute('aria-checked')).toBe('false')
  })

  it('Space toggles a stateful controlled parent', () => {
    render(<ControlledSwitch />)
    keyDown(button(), ' ')
    expect(button().getAttribute('aria-checked')).toBe('true')
  })

  it('Enter is left to native button behavior (not handled, not prevented)', () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={onCheckedChange} />)
    const event = keyDown(button(), 'Enter')
    // The component's keydown handler only handles Space; Enter activation
    // comes from the browser's native button click behavior.
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })
})

describe('Switch (React) interaction - disabled state', () => {
  it('click on a disabled switch does not fire onCheckedChange', () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked={false} disabled onCheckedChange={onCheckedChange} />)
    click(button())
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(button().getAttribute('aria-checked')).toBe('false')
  })

  it('Space on a disabled switch does not fire onCheckedChange', () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked={false} disabled onCheckedChange={onCheckedChange} />)
    keyDown(button(), ' ')
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('disabled switch exposes disabled, aria-disabled and data-disabled', () => {
    render(<Switch disabled />)
    expect(button().disabled).toBe(true)
    expect(button().getAttribute('aria-disabled')).toBe('true')
    expect(button().hasAttribute('data-disabled')).toBe(true)
  })
})

describe('Switch (React) interaction - DOM contract', () => {
  it('forwards the ref to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Switch ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current).toBe(button())
  })

  it('updates aria and data attributes when the checked prop changes', () => {
    render(<Switch checked={false} />)
    expect(button().getAttribute('aria-checked')).toBe('false')
    act(() => {
      root.render(<Switch checked={true} />)
    })
    expect(button().getAttribute('aria-checked')).toBe('true')
    expect(button().getAttribute('data-state')).toBe('checked')
  })
})
