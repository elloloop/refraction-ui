// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  RefractionComposer,
  type ComposerAPI,
  type ComposerDraft,
  type ComposerDraftStore,
  type ComposerSubmission,
  type ComposerTrigger,
} from '../src/index.js'

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
  vi.useRealTimers()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function textarea(): HTMLTextAreaElement {
  const el = container.querySelector('textarea')
  if (!el) throw new Error('textarea not rendered')
  return el
}

const nativeValueSetter = Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype,
  'value',
)!.set!

/** Simulate a user edit: native value + caret + a bubbling input event. */
function setValue(el: HTMLTextAreaElement, next: string, caret: number = next.length) {
  act(() => {
    nativeValueSetter.call(el, next)
    el.setSelectionRange(caret, caret)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

/** Append text one character at a time (one input event per character). */
function typeText(el: HTMLTextAreaElement, text: string) {
  for (const ch of text) setValue(el, el.value + ch)
}

function keyDown(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function fireComposition(el: HTMLElement, type: 'compositionstart' | 'compositionend') {
  act(() => {
    el.dispatchEvent(new Event(type, { bubbles: true }))
  })
}

function firePaste(el: HTMLElement, data: { text?: string; files?: File[] }): Event {
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', {
    value: {
      files: data.files ?? [],
      getData: (type: string) => (type === 'text/plain' ? (data.text ?? '') : ''),
      setData: () => undefined,
    },
  })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function fireDrag(
  el: HTMLElement,
  type: 'dragover' | 'dragleave' | 'drop',
  data: { text?: string; files?: File[] } = {},
): Event {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      files: data.files ?? [],
      types: data.files?.length ? ['Files'] : data.text !== undefined ? ['text/plain'] : [],
      getData: (t: string) => (t === 'text/plain' ? (data.text ?? '') : ''),
    },
  })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

const PEOPLE = [
  { id: 'u1', display: 'Alice Chen', subtitle: 'Design' },
  { id: 'u2', display: 'Alan Turing', subtitle: 'Engineering' },
  { id: 'u3', display: 'Bob Marley', subtitle: 'Support' },
]

const mentionTrigger: ComposerTrigger = {
  id: 'mention',
  symbol: '@',
  resolve: (query) =>
    PEOPLE.filter((p) => p.display.toLowerCase().startsWith(query.toLowerCase())),
}

const options = () => Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'))

describe('RefractionComposer (interaction, jsdom)', () => {
  it('H1 typing updates the value and fires onChange once per input event', () => {
    const onChange = vi.fn()
    render(<RefractionComposer onChange={onChange} />)
    typeText(textarea(), 'ab')
    expect(textarea().value).toBe('ab')
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenNthCalledWith(1, 'a')
    expect(onChange).toHaveBeenNthCalledWith(2, 'ab')
  })

  it('H2 Enter submits (payload + clear); Shift+Enter stays a newline; whitespace-only is a guarded no-op', () => {
    const onSubmit = vi.fn<(s: ComposerSubmission) => void>()
    render(<RefractionComposer onSubmit={onSubmit} />)
    const el = textarea()

    typeText(el, 'hi')
    const enter = keyDown(el, 'Enter')
    expect(enter.defaultPrevented).toBe(true)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0].plainText).toBe('hi')
    expect(el.value).toBe('')

    typeText(el, 'line one')
    const shiftEnter = keyDown(el, 'Enter', { shiftKey: true })
    expect(shiftEnter.defaultPrevented).toBe(false)
    expect(onSubmit).toHaveBeenCalledTimes(1)

    setValue(el, '   ')
    const blankEnter = keyDown(el, 'Enter')
    expect(blankEnter.defaultPrevented).toBe(true)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(el.value).toBe('   ')
  })

  it('H3 Enter during IME composition never submits; compositionend restores it', () => {
    const onSubmit = vi.fn()
    render(<RefractionComposer onSubmit={onSubmit} />)
    const el = textarea()

    typeText(el, 'nihao')
    fireComposition(el, 'compositionstart')
    const composedEnter = keyDown(el, 'Enter')
    expect(composedEnter.defaultPrevented).toBe(false)
    expect(onSubmit).not.toHaveBeenCalled()

    fireComposition(el, 'compositionend')
    keyDown(el, 'Enter')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('H4 "@" opens the listbox, arrows track aria-activedescendant, Enter commits a token without submitting', () => {
    const onSubmit = vi.fn()
    render(<RefractionComposer id="cmp" triggers={[mentionTrigger]} onSubmit={onSubmit} />)
    const el = textarea()

    setValue(el, '@')
    expect(container.querySelector('[role="listbox"]')).not.toBeNull()
    expect(options().length).toBe(3)
    expect(el.getAttribute('aria-expanded')).toBe('true')
    expect(el.getAttribute('aria-activedescendant')).toBe('cmp-option-0')

    keyDown(el, 'ArrowDown')
    expect(el.getAttribute('aria-activedescendant')).toBe('cmp-option-1')
    keyDown(el, 'ArrowUp')
    expect(el.getAttribute('aria-activedescendant')).toBe('cmp-option-0')

    keyDown(el, 'ArrowDown')
    keyDown(el, 'Enter')
    expect(el.value).toBe('@Alan Turing')
    expect(container.querySelector('[data-token]')?.textContent).toBe('@Alan Turing')
    expect(container.querySelector('[role="listbox"]')).toBeNull()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('H5 Escape closes the menu keeping text; further typing does not reopen the occurrence', () => {
    render(<RefractionComposer triggers={[mentionTrigger]} />)
    const el = textarea()

    setValue(el, '@a')
    expect(container.querySelector('[role="listbox"]')).not.toBeNull()
    keyDown(el, 'Escape')
    expect(container.querySelector('[role="listbox"]')).toBeNull()
    expect(el.value).toBe('@a')

    typeText(el, 'l')
    expect(el.value).toBe('@al')
    expect(container.querySelector('[role="listbox"]')).toBeNull()
  })

  it('H5b suggestion menu flips to the side of the pill with more viewport space', () => {
    render(<RefractionComposer triggers={[mentionTrigger]} />)
    const form = container.querySelector('[role="form"]') as HTMLElement
    const rectFor = (top: number, bottom: number) =>
      ({
        top,
        bottom,
        left: 0,
        right: 320,
        width: 320,
        height: bottom - top,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect
    const spy = vi.spyOn(form, 'getBoundingClientRect')
    const el = textarea()

    // jsdom viewport is 768px tall: little room above → menu opens below.
    spy.mockReturnValue(rectFor(20, 60))
    setValue(el, '@')
    const below = container.querySelector('[role="listbox"]') as HTMLElement
    expect(below.className).toContain('top-full')
    expect(below.className).not.toContain('bottom-full')
    expect(below.style.maxHeight).not.toBe('')

    // Plenty of room above → menu opens above (fresh occurrence).
    keyDown(el, 'Escape')
    spy.mockReturnValue(rectFor(700, 740))
    setValue(el, '')
    setValue(el, '@a')
    const above = container.querySelector('[role="listbox"]') as HTMLElement
    expect(above.className).toContain('bottom-full')
    expect(above.className).not.toContain('top-full')

    spy.mockRestore()
  })

  it('H6 clicking an option commits it; row mousedown is prevented so the textarea keeps focus', () => {
    render(<RefractionComposer triggers={[mentionTrigger]} />)
    const el = textarea()
    act(() => el.focus())

    setValue(el, '@')
    const row = options()[0]
    const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    act(() => {
      row.dispatchEvent(mouseDown)
    })
    expect(mouseDown.defaultPrevented).toBe(true)

    act(() => {
      row.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(el.value).toBe('@Alice Chen')
    expect(container.querySelector('[role="listbox"]')).toBeNull()
    expect(document.activeElement).toBe(el)
  })

  it('H7 backspace after a committed token removes the whole token atomically', () => {
    render(<RefractionComposer triggers={[mentionTrigger]} />)
    const el = textarea()

    setValue(el, '@')
    keyDown(el, 'Enter')
    expect(el.value).toBe('@Alice Chen')

    // A single backspace reports value minus one char; the core expands the
    // deletion over the whole token.
    setValue(el, '@Alice Che', 10)
    expect(el.value).toBe('')
    expect(container.querySelector('[data-token]')).toBeNull()
  })

  it('H8 over-limit paste clamps with a trimmed notice; pasted image files become attachments', () => {
    const onAttachmentAdd = vi.fn()
    render(<RefractionComposer maxLength={10} onAttachmentAdd={onAttachmentAdd} />)
    const el = textarea()

    firePaste(el, { text: 'this is far too long to fit' })
    expect(el.value).toBe('this is fa')
    expect(container.querySelector('[role="status"]')?.textContent).toContain('trimmed')

    const file = new File(['x'], 'pic.png', { type: 'image/png' })
    firePaste(el, { files: [file] })
    expect(onAttachmentAdd).toHaveBeenCalledTimes(1)
    expect(onAttachmentAdd.mock.calls[0][0]).toMatchObject({ kind: 'image', name: 'pic.png' })
    expect(container.textContent).toContain('pic.png')
    // File paste wins over text: the value is unchanged.
    expect(el.value).toBe('this is fa')
  })

  it('H9 drop adds an attachment chip; drag-over sets the highlight and drag-leave clears it', () => {
    render(<RefractionComposer />)
    const surface = () => container.querySelector<HTMLElement>('[role="form"] > div:last-of-type')
    const rootEl = container.querySelector<HTMLElement>('[role="form"]')!
    const file = new File(['x'], 'notes.txt', { type: 'text/plain' })

    const over = fireDrag(rootEl, 'dragover', { files: [file] })
    expect(over.defaultPrevented).toBe(true)
    expect(container.querySelector('[data-dragover]')).not.toBeNull()

    fireDrag(rootEl, 'dragleave')
    expect(container.querySelector('[data-dragover]')).toBeNull()

    fireDrag(rootEl, 'drop', { files: [file] })
    expect(container.querySelector('[data-dragover]')).toBeNull()
    expect(container.textContent).toContain('notes.txt')
    expect(surface()).not.toBeNull()
  })

  it('H10 auto-grow contract: rows=minLines, capped max-height, internal scroll (style-level — jsdom cannot measure)', () => {
    render(<RefractionComposer minLines={2} maxLines={5} />)
    const el = textarea()
    expect(el.rows).toBe(2)
    expect(el.style.maxHeight).toBe('calc(7.5em + 1.5rem)')
    expect(el.className).toContain('overflow-y-auto')

    const mirror = container.querySelector<HTMLElement>('[aria-hidden="true"].pointer-events-none')
    expect(mirror).not.toBeNull()
    expect(mirror!.style.minHeight).toBe('calc(3em + 1.5rem)')
    expect(mirror!.style.maxHeight).toBe('calc(7.5em + 1.5rem)')
  })

  it('H11 busy swaps send for stop, click fires onStop, and Enter does not submit', () => {
    const onStop = vi.fn()
    const onSubmit = vi.fn()
    render(<RefractionComposer busy onStop={onStop} onSubmit={onSubmit} />)
    const el = textarea()

    const stop = container.querySelector<HTMLButtonElement>('button[aria-label="Stop"]')
    expect(stop).not.toBeNull()
    expect(container.querySelector('button[aria-label="Send"]')).toBeNull()

    act(() => {
      stop!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(onStop).toHaveBeenCalledTimes(1)

    typeText(el, 'hello')
    const enter = keyDown(el, 'Enter')
    expect(enter.defaultPrevented).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(el.value).toBe('hello')
  })

  it('H12 ArrowUp on empty requests edit-last; beginEdit populates and Escape cancels via onEditCancel', () => {
    const onEditLastRequested = vi.fn()
    const onEditCancel = vi.fn()
    const apiRef = React.createRef<ComposerAPI>()
    render(
      <RefractionComposer
        apiRef={apiRef}
        onEditLastRequested={onEditLastRequested}
        onEditCancel={onEditCancel}
      />,
    )
    const el = textarea()

    keyDown(el, 'ArrowUp')
    expect(onEditLastRequested).toHaveBeenCalledTimes(1)

    act(() => {
      apiRef.current!.beginEdit({ value: 'original message', messageId: 'm1' })
    })
    expect(el.value).toBe('original message')
    expect(container.textContent).toContain('Editing message')

    keyDown(el, 'Escape')
    expect(onEditCancel).toHaveBeenCalledTimes(1)
    expect(el.value).toBe('')
    expect(container.textContent).not.toContain('Editing message')
  })

  it('H13 focus stays in the field after send and after a menu commit', () => {
    render(<RefractionComposer triggers={[mentionTrigger]} onSubmit={() => undefined} />)
    const el = textarea()
    act(() => el.focus())

    typeText(el, 'hi')
    keyDown(el, 'Enter')
    expect(document.activeElement).toBe(el)

    setValue(el, '@')
    keyDown(el, 'Enter')
    expect(el.value).toBe('@Alice Chen')
    expect(document.activeElement).toBe(el)
  })

  it('H14 counter appears at ≤20% remaining, flags over-limit, and over-budget disables send', () => {
    render(<RefractionComposer maxLength={10} />)
    const el = textarea()
    const counter = () => container.querySelector<HTMLElement>('[class*="tabular-nums"]')

    typeText(el, 'abcdefg')
    expect(counter()).toBeNull()

    typeText(el, 'h')
    expect(counter()).not.toBeNull()
    expect(counter()!.textContent).toBe('2 characters remaining')

    typeText(el, 'ij')
    expect(counter()!.textContent).toBe('0 characters remaining')
    expect(counter()!.className).toContain('text-destructive')

    // A prefilled value over the budget disables send outright.
    act(() => {
      root.unmount()
    })
    root = createRoot(container)
    render(<RefractionComposer maxLength={10} defaultValue="123456789012" />)
    const send = container.querySelector<HTMLButtonElement>('button[aria-label="Send"]')
    expect(send!.disabled).toBe(true)
    expect(container.querySelector('[class*="tabular-nums"]')!.textContent).toBe(
      '-2 characters remaining',
    )
  })

  it('H15 drafts: unmount/remount with the same store and key restores the text', () => {
    vi.useFakeTimers()
    const backing = new Map<string, ComposerDraft>()
    const draftStore: ComposerDraftStore = {
      read: (key) => backing.get(key) ?? null,
      write: (key, draft) => backing.set(key, draft),
      clear: (key) => backing.delete(key),
    }

    render(<RefractionComposer draftStore={draftStore} draftKey="room-1" />)
    typeText(textarea(), 'draft text')
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(backing.get('room-1')?.value).toBe('draft text')

    act(() => {
      root.unmount()
    })
    root = createRoot(container)
    render(<RefractionComposer draftStore={draftStore} draftKey="room-1" />)
    expect(textarea().value).toBe('draft text')
  })

  it('H16 controlled value wins (snap-back when the parent ignores edits); uncontrolled defaultValue works', () => {
    // Echoing controlled parent
    const spy = vi.fn()
    function Controlled() {
      const [value, setValueState] = React.useState('start')
      return (
        <RefractionComposer
          value={value}
          onChange={(next) => {
            spy(next)
            setValueState(next)
          }}
        />
      )
    }
    render(<Controlled />)
    expect(textarea().value).toBe('start')
    setValue(textarea(), 'start!')
    expect(spy).toHaveBeenCalledWith('start!')
    expect(textarea().value).toBe('start!')

    // Fixed controlled value: edits are reported, then snapped back.
    act(() => {
      root.unmount()
    })
    root = createRoot(container)
    const fixedSpy = vi.fn()
    render(<RefractionComposer value="fixed" onChange={fixedSpy} />)
    setValue(textarea(), 'fixedX')
    expect(fixedSpy).toHaveBeenCalledWith('fixedX')
    expect(textarea().value).toBe('fixed')

    // Uncontrolled defaultValue
    act(() => {
      root.unmount()
    })
    root = createRoot(container)
    render(<RefractionComposer defaultValue="hello" />)
    expect(textarea().value).toBe('hello')
  })
})
