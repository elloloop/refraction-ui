// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { StepCard, type StepCardProps } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

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

const BASE: StepCardProps = { title: 'Microphone' }

function render(props: Partial<StepCardProps> = {}) {
  act(() => {
    root.render(<StepCard {...BASE} {...props} />)
  })
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function announcer(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-slot="step-card-announcer"]')
  if (!el) throw new Error('announcer not rendered')
  return el
}

function pillText(): string {
  return container.querySelector('[data-slot="step-card-status"]')?.textContent ?? ''
}

function button(name: string): HTMLButtonElement {
  const match = Array.from(container.querySelectorAll('button')).find((b) =>
    b.textContent?.includes(name),
  )
  if (!match) throw new Error(`button "${name}" not rendered`)
  return match
}

describe('StepCard status announcements (jsdom)', () => {
  it('stays silent on first render', () => {
    render({ status: 'needed' })
    expect(announcer().getAttribute('aria-live')).toBe('polite')
    expect(announcer().textContent).toBe('')
  })

  it('announces a status change politely, with the title', () => {
    render({ status: 'needed' })
    render({ status: 'granted' })
    expect(announcer().textContent).toBe('Microphone: Granted')
    expect(pillText()).toBe('Granted')
  })

  it('includes the live hint when the step starts checking', () => {
    const liveHint = 'Turn on Refraction in System Settings.'
    render({ status: 'needed', liveHint })
    expect(container.querySelector('[data-slot="step-card-live-hint"]')).toBeNull()
    render({ status: 'checking', liveHint })
    expect(announcer().textContent).toBe(`Microphone: Checking…. ${liveHint}`)
    expect(container.querySelector('[data-slot="step-card-live-hint"]')?.textContent).toBe(liveHint)
    render({ status: 'granted', liveHint })
    expect(container.querySelector('[data-slot="step-card-live-hint"]')).toBeNull()
    expect(announcer().textContent).toBe('Microphone: Granted')
  })

  it('does not re-announce when only the label changes', () => {
    render({ status: 'checking', statusLabel: 'Checking… 1s' })
    render({ status: 'checking', statusLabel: 'Checking… 2s' })
    expect(announcer().textContent).toBe('')
    expect(pillText()).toBe('Checking… 2s')
  })

  it('announces the custom label of the new status', () => {
    render({ status: 'checking' })
    render({ status: 'failed', statusLabel: 'Denied' })
    expect(announcer().textContent).toBe('Microphone: Denied')
  })
})

describe('StepCard controls (jsdom)', () => {
  it('pressing the action calls onAction', () => {
    const onAction = vi.fn()
    render({ actionLabel: 'Open Settings', onAction })
    click(button('Open Settings'))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('action and troubleshooting trigger are keyboard-reachable native buttons', () => {
    render({ actionLabel: 'Open Settings', troubleshooting: 'Restart.' })
    for (const name of ['Open Settings', 'Having trouble?']) {
      const b = button(name)
      expect(b.tabIndex).toBe(0)
      act(() => b.focus())
      expect(document.activeElement).toBe(b)
    }
  })

  it('troubleshooting opens and closes from its trigger', () => {
    render({ troubleshooting: ['Restart the app.', 'Remove and re-add **Refraction**.'] })
    const trigger = button('Having trouble?')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(container.textContent).not.toContain('Restart the app.')

    click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const region = container.querySelector('[role="region"]')
    expect(region?.id).toBe(trigger.getAttribute('aria-controls'))
    expect(region?.getAttribute('aria-label')).toBe('Having trouble?')
    expect(region?.querySelectorAll('li').length).toBe(2)
    expect(region?.querySelector('strong')?.textContent).toBe('Refraction')

    click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('[role="region"]')).toBeNull()
  })

  it('expanded follows the parent', () => {
    const props = { instructions: ['Open Settings'], actionLabel: 'Open' }
    render({ ...props, expanded: true })
    expect(container.querySelector('ol')).not.toBeNull()
    render({ ...props, expanded: false })
    expect(container.querySelector('ol')).toBeNull()
    expect(container.querySelector('button')).toBeNull()
    render({ ...props, expanded: true })
    expect(container.querySelector('ol')).not.toBeNull()
  })
})
