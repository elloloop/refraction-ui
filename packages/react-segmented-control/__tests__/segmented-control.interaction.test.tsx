// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '../src/segmented-control.js'

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

const VALUES = ['day', 'week', 'month'] as const

function BasicControl(
  props: React.ComponentProps<typeof SegmentedControl> & {
    itemProps?: Record<string, unknown>
  },
) {
  const { itemProps, ...groupProps } = props
  return (
    <SegmentedControl {...groupProps}>
      {VALUES.map((v) => (
        <SegmentedControlItem key={v} value={v} {...itemProps}>
          {v}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}

function item(value: string): HTMLButtonElement {
  const el = Array.from(container.querySelectorAll('button')).find(
    (b) => b.textContent === value,
  )
  if (!el) throw new Error(`item "${value}" not rendered`)
  return el
}

function checkedValue(): string | undefined {
  const el = container.querySelector('button[aria-checked="true"]')
  return el?.textContent ?? undefined
}

function click(el: HTMLElement, init: MouseEventInit = {}) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
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
function ControlledControl({
  initial = 'day',
  onValueChange,
}: {
  initial?: string
  onValueChange?: (value: string) => void
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <BasicControl
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange?.(next)
      }}
    />
  )
}

describe('SegmentedControl (React) interaction - click selection', () => {
  it('click selects an item in uncontrolled mode', () => {
    render(<BasicControl defaultValue="day" />)
    expect(checkedValue()).toBe('day')
    click(item('week'))
    expect(checkedValue()).toBe('week')
    expect(item('week').getAttribute('data-state')).toBe('checked')
    expect(item('day').getAttribute('data-state')).toBe('unchecked')
  })

  it('click fires onValueChange with the item value', () => {
    const onValueChange = vi.fn()
    render(<BasicControl defaultValue="day" onValueChange={onValueChange} />)
    click(item('month'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('month')
  })

  it('roving tabindex follows the selection', () => {
    render(<BasicControl defaultValue="day" />)
    expect(item('day').tabIndex).toBe(0)
    click(item('month'))
    expect(item('month').tabIndex).toBe(0)
    expect(item('day').tabIndex).toBe(-1)
    expect(item('week').tabIndex).toBe(-1)
  })

  it('group data-value tracks the uncontrolled selection', () => {
    render(<BasicControl defaultValue="day" />)
    const group = container.querySelector('[role="radiogroup"]')!
    expect(group.getAttribute('data-value')).toBe('day')
    click(item('week'))
    expect(group.getAttribute('data-value')).toBe('week')
  })

  it('does not throw when clicked without onValueChange', () => {
    render(<BasicControl defaultValue="day" />)
    expect(() => click(item('week'))).not.toThrow()
    expect(checkedValue()).toBe('week')
  })
})

describe('SegmentedControl (React) interaction - controlled vs uncontrolled', () => {
  it('controlled without a parent update snaps back to the rendered value', () => {
    const onValueChange = vi.fn()
    render(<BasicControl value="day" onValueChange={onValueChange} />)
    click(item('week'))
    // The callback fired, but with no parent re-render the selection snaps back.
    expect(onValueChange).toHaveBeenCalledWith('week')
    expect(checkedValue()).toBe('day')
    expect(item('day').tabIndex).toBe(0)
    expect(item('week').tabIndex).toBe(-1)
  })

  it('controlled parent updates the selection on click', () => {
    const onValueChange = vi.fn()
    render(<ControlledControl onValueChange={onValueChange} />)
    click(item('week'))
    expect(onValueChange).toHaveBeenCalledWith('week')
    expect(checkedValue()).toBe('week')
    click(item('month'))
    expect(checkedValue()).toBe('month')
  })

  it('selection updates when the controlled value prop changes', () => {
    render(<BasicControl value="day" />)
    expect(checkedValue()).toBe('day')
    act(() => {
      root.render(<BasicControl value="month" />)
    })
    expect(checkedValue()).toBe('month')
    expect(item('month').tabIndex).toBe(0)
  })
})

describe('SegmentedControl (React) interaction - keyboard navigation', () => {
  it('ArrowRight selects the next item and moves focus', () => {
    const onValueChange = vi.fn()
    render(<BasicControl defaultValue="day" onValueChange={onValueChange} />)
    const event = keyDown(item('day'), 'ArrowRight')
    expect(onValueChange).toHaveBeenCalledWith('week')
    expect(checkedValue()).toBe('week')
    expect(document.activeElement).toBe(item('week'))
    expect(event.defaultPrevented).toBe(true)
  })

  it('ArrowDown behaves like ArrowRight', () => {
    render(<BasicControl defaultValue="day" />)
    keyDown(item('day'), 'ArrowDown')
    expect(checkedValue()).toBe('week')
    expect(document.activeElement).toBe(item('week'))
  })

  it('ArrowLeft selects the previous item', () => {
    render(<BasicControl defaultValue="week" />)
    keyDown(item('week'), 'ArrowLeft')
    expect(checkedValue()).toBe('day')
    expect(document.activeElement).toBe(item('day'))
  })

  it('ArrowUp behaves like ArrowLeft', () => {
    render(<BasicControl defaultValue="month" />)
    keyDown(item('month'), 'ArrowUp')
    expect(checkedValue()).toBe('week')
    expect(document.activeElement).toBe(item('week'))
  })

  it('ArrowRight wraps from the last item to the first', () => {
    render(<BasicControl defaultValue="month" />)
    keyDown(item('month'), 'ArrowRight')
    expect(checkedValue()).toBe('day')
    expect(document.activeElement).toBe(item('day'))
  })

  it('ArrowLeft wraps from the first item to the last', () => {
    render(<BasicControl defaultValue="day" />)
    keyDown(item('day'), 'ArrowLeft')
    expect(checkedValue()).toBe('month')
    expect(document.activeElement).toBe(item('month'))
  })

  it('Home jumps to the first item', () => {
    render(<BasicControl defaultValue="month" />)
    keyDown(item('month'), 'Home')
    expect(checkedValue()).toBe('day')
    expect(document.activeElement).toBe(item('day'))
  })

  it('End jumps to the last item', () => {
    render(<BasicControl defaultValue="day" />)
    keyDown(item('day'), 'End')
    expect(checkedValue()).toBe('month')
    expect(document.activeElement).toBe(item('month'))
  })

  it('Space selects the focused item without moving', () => {
    const onValueChange = vi.fn()
    render(<BasicControl defaultValue="day" onValueChange={onValueChange} />)
    const event = keyDown(item('week'), ' ')
    expect(onValueChange).toHaveBeenCalledWith('week')
    expect(checkedValue()).toBe('week')
    expect(event.defaultPrevented).toBe(true)
  })

  it('Enter selects the focused item without moving', () => {
    const onValueChange = vi.fn()
    render(<BasicControl defaultValue="day" onValueChange={onValueChange} />)
    const event = keyDown(item('month'), 'Enter')
    expect(onValueChange).toHaveBeenCalledWith('month')
    expect(checkedValue()).toBe('month')
    expect(event.defaultPrevented).toBe(true)
  })

  it('unhandled keys are ignored and not prevented', () => {
    render(<BasicControl defaultValue="day" />)
    const event = keyDown(item('day'), 'a')
    expect(checkedValue()).toBe('day')
    expect(event.defaultPrevented).toBe(false)
  })

  it('arrow navigation in controlled mode snaps back without a parent update', () => {
    const onValueChange = vi.fn()
    render(<BasicControl value="day" onValueChange={onValueChange} />)
    keyDown(item('day'), 'ArrowRight')
    expect(onValueChange).toHaveBeenCalledWith('week')
    expect(checkedValue()).toBe('day')
  })
})

describe('SegmentedControl (React) interaction - event handler composition', () => {
  it('calls a user onClick before selecting', () => {
    const calls: string[] = []
    render(
      <SegmentedControl defaultValue="day" onValueChange={() => calls.push('select')}>
        <SegmentedControlItem value="day">day</SegmentedControlItem>
        <SegmentedControlItem value="week" onClick={() => calls.push('user')}>
          week
        </SegmentedControlItem>
      </SegmentedControl>,
    )
    click(item('week'))
    expect(calls).toEqual(['user', 'select'])
  })

  it('a preventDefaulted user onClick blocks the selection', () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl defaultValue="day" onValueChange={onValueChange}>
        <SegmentedControlItem value="day">day</SegmentedControlItem>
        <SegmentedControlItem
          value="week"
          onClick={(e: React.MouseEvent) => e.preventDefault()}
        >
          week
        </SegmentedControlItem>
      </SegmentedControl>,
    )
    click(item('week'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(checkedValue()).toBe('day')
  })

  it('a preventDefaulted user onKeyDown blocks keyboard navigation', () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl defaultValue="day" onValueChange={onValueChange}>
        <SegmentedControlItem
          value="day"
          onKeyDown={(e: React.KeyboardEvent) => e.preventDefault()}
        >
          day
        </SegmentedControlItem>
        <SegmentedControlItem value="week">week</SegmentedControlItem>
      </SegmentedControl>,
    )
    keyDown(item('day'), 'ArrowRight')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(checkedValue()).toBe('day')
  })
})

describe('SegmentedControl (React) interaction - DOM contract', () => {
  it('forwards the group ref to the radiogroup div', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<BasicControl ref={ref} defaultValue="day" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current!.getAttribute('role')).toBe('radiogroup')
  })

  it('forwards the item ref to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <SegmentedControl defaultValue="day">
        <SegmentedControlItem ref={ref} value="day">
          day
        </SegmentedControlItem>
      </SegmentedControl>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current!.getAttribute('role')).toBe('radio')
  })
})
