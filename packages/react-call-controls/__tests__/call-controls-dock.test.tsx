// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { CallControls, CallControlButton, type CallControlsProps } from '../src/index.js'

const noop = () => {}

const render = (props: CallControlsProps) => renderToString(React.createElement(CallControls, props))

/** Parses SSR markup so the tests can query it like a page. */
function dom(html: string): Document {
  return new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html')
}

describe('CallControls composable mode (SSR)', () => {
  it('keeps the toolbar markup when no dock props are passed', () => {
    const html = renderToString(
      React.createElement(
        CallControls,
        { className: 'extra', size: 'sm' },
        React.createElement(CallControlButton, { label: 'Mute' }),
      ),
    )
    const doc = dom(html)
    const toolbar = doc.body.firstElementChild as HTMLElement
    expect(toolbar.getAttribute('role')).toBe('toolbar')
    expect(toolbar.getAttribute('aria-label')).toBe('Call controls')
    expect(toolbar.getAttribute('data-component')).toBe('call-controls')
    expect(toolbar.hasAttribute('data-variant')).toBe(false)
    expect(toolbar.className).toContain('extra')
    expect(toolbar.querySelectorAll('button')).toHaveLength(1)
    expect(doc.querySelector('[data-call-controls-dock]')).toBeNull()
  })
})

describe('CallControls dock mode (SSR)', () => {
  const full: CallControlsProps = {
    mic: { active: true, onToggle: noop },
    camera: { active: false, onToggle: noop },
    screenShare: { active: true, onToggle: noop },
    hand: { active: false, onToggle: noop },
    reactions: { onOpen: noop },
    captions: { active: true, onToggle: noop },
    pip: { active: false, onToggle: noop },
    record: { active: true, onToggle: noop },
    chat: { active: false, onToggle: noop, count: 3 },
    people: { active: true, onToggle: noop, count: 8 },
    onLeave: noop,
  }

  it('wraps the toolbar in a width container', () => {
    const doc = dom(render(full))
    const wrapper = doc.querySelector('[data-call-controls-dock]') as HTMLElement
    expect(wrapper.className).toContain('@container/call-controls')
    const toolbar = wrapper.querySelector('[role="toolbar"]') as HTMLElement
    expect(toolbar.getAttribute('aria-label')).toBe('Call controls')
    expect(toolbar.getAttribute('data-variant')).toBe('dock')
  })

  it('renders named groups in dock order', () => {
    const doc = dom(render(full))
    const groups = Array.from(doc.querySelectorAll('[role="toolbar"] > [role="group"]'))
    expect(groups.map((group) => group.getAttribute('aria-label'))).toEqual([
      'Audio and video',
      'Call actions',
      'Panels',
    ])
    expect(Array.from(groups[1]!.querySelectorAll('button')).map((b) => b.getAttribute('data-control'))).toEqual([
      'screenShare',
      'hand',
      'reactions',
      'captions',
      'pip',
      'record',
    ])
  })

  it('names toggles by what they control and carries the state in aria-pressed', () => {
    const doc = dom(render(full))
    const pressed = (id: string) =>
      doc.querySelector(`[role="toolbar"] [data-control="${id}"]`)?.getAttribute('aria-pressed')
    const name = (id: string) =>
      doc.querySelector(`[role="toolbar"] [data-control="${id}"]`)?.getAttribute('aria-label')
    expect([name('mic'), pressed('mic')]).toEqual(['Microphone', 'true'])
    expect([name('camera'), pressed('camera')]).toEqual(['Camera', 'false'])
    expect([name('screenShare'), pressed('screenShare')]).toEqual(['Share screen', 'true'])
    expect([name('hand'), pressed('hand')]).toEqual(['Raise hand', 'false'])
    expect([name('captions'), pressed('captions')]).toEqual(['Captions', 'true'])
    expect([name('record'), pressed('record')]).toEqual(['Record', 'true'])
    expect(name('reactions')).toBe('Reactions')
    expect(pressed('reactions')).toBeNull()
  })

  it('reads counts with the name and shows them as hidden badges', () => {
    const doc = dom(render(full))
    const chat = doc.querySelector('[role="toolbar"] > [role="group"] [data-control="chat"]') as HTMLElement
    expect(chat.getAttribute('aria-label')).toBe('Chat (3)')
    expect(chat.getAttribute('title')).toBe('Chat (3)')
    const badge = chat.querySelector('[data-call-controls-badge]') as HTMLElement
    expect(badge.textContent).toBe('3')
    expect(badge.getAttribute('aria-hidden')).toBe('true')
  })

  it('pairs an off mic or camera with a destructive tone', () => {
    const doc = dom(render(full))
    const camera = doc.querySelector('[data-control="camera"]') as HTMLElement
    const mic = doc.querySelector('[data-control="mic"]') as HTMLElement
    expect(camera.className).toContain('bg-destructive')
    expect(mic.className).toContain('bg-muted')
  })

  it('renders the leave button only when onLeave is given', () => {
    expect(dom(render(full)).querySelector('[data-control="leave"]')?.getAttribute('aria-label')).toBe('Leave call')
    const { onLeave: _unused, ...withoutLeave } = full
    expect(dom(render(withoutLeave)).querySelector('[data-control="leave"]')).toBeNull()
  })

  it('collapses the actions and panel toggles behind a closed "More controls"', () => {
    const doc = dom(render(full))
    const actions = doc.querySelector('[data-call-controls-group="actions"]') as HTMLElement
    const media = doc.querySelector('[data-call-controls-group="media"]') as HTMLElement
    expect(actions.className).toContain('@max-[600px]/call-controls:hidden')
    expect(media.className).not.toContain('@max-[600px]/call-controls:hidden')
    const more = doc.querySelector('[data-call-controls-more] > button') as HTMLElement
    expect(more.getAttribute('aria-label')).toBe('More controls')
    expect(more.getAttribute('aria-expanded')).toBe('false')
    const panel = doc.getElementById(more.getAttribute('aria-controls') ?? '') as HTMLElement
    expect(panel.hasAttribute('hidden')).toBe(true)
    expect(panel.getAttribute('role')).toBe('group')
    expect(Array.from(panel.querySelectorAll('button')).map((b) => b.getAttribute('data-control'))).toEqual([
      'screenShare',
      'hand',
      'reactions',
      'captions',
      'pip',
      'record',
      'chat',
      'people',
    ])
    expect(panel.querySelector('[data-control="people"]')?.getAttribute('aria-pressed')).toBe('true')
  })

  it('omits "More controls" when nothing collapses', () => {
    const doc = dom(render({ mic: { active: true, onToggle: noop }, onLeave: noop }))
    expect(doc.querySelector('[data-call-controls-more]')).toBeNull()
  })

  it('joins a device menu slot to the mic in one capsule', () => {
    const menu = React.createElement('button', { type: 'button', 'aria-label': 'Microphone options' })
    const doc = dom(render({ mic: { active: false, onToggle: noop, menu } }))
    const capsule = doc.querySelector('[data-call-controls-capsule]') as HTMLElement
    expect(capsule.className).toContain('bg-destructive')
    const buttons = Array.from(capsule.querySelectorAll('button'))
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Microphone', 'Microphone options'])
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('false')
  })

  it('reports a pending control with aria-disabled and keeps it focusable', () => {
    const doc = dom(render({ record: { active: false, pending: true, onToggle: noop } }))
    const record = doc.querySelector('[role="toolbar"] > [role="group"] [data-control="record"]') as HTMLElement
    expect(record.getAttribute('aria-disabled')).toBe('true')
    expect(record.hasAttribute('disabled')).toBe(false)
  })

  it('takes label overrides', () => {
    const doc = dom(
      render({
        mic: { active: true, onToggle: noop },
        onLeave: noop,
        labels: { toolbar: 'Commandes', mic: 'Micro', leave: 'Quitter' },
      }),
    )
    expect(doc.querySelector('[role="toolbar"]')?.getAttribute('aria-label')).toBe('Commandes')
    expect(doc.querySelector('[data-control="mic"]')?.getAttribute('aria-label')).toBe('Micro')
    expect(doc.querySelector('[data-control="leave"]')?.getAttribute('aria-label')).toBe('Quitter')
  })

  it('takes icon overrides', () => {
    const icon = React.createElement('i', { 'data-testid': 'custom-leave' })
    const doc = dom(render({ onLeave: noop, icons: { leave: icon } }))
    expect(doc.querySelector('[data-control="leave"] [data-testid="custom-leave"]')).not.toBeNull()
  })

  it('places children after the panel toggles', () => {
    const extra = React.createElement(CallControlButton, { label: 'Effects' })
    const doc = dom(
      renderToString(
        React.createElement(CallControls, { chat: { active: false, onToggle: noop }, onLeave: noop }, extra),
      ),
    )
    const groups = Array.from(doc.querySelectorAll('[role="toolbar"] > *')).map(
      (node) => node.getAttribute('data-call-controls-group') ?? node.getAttribute('data-call-controls-more'),
    )
    expect(groups).toEqual(['panels', 'custom', '', 'leave'])
  })
})
