import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { IncomingCallCard, type IncomingCallCardProps } from '../src/index.js'

const noop = () => {}

function render(props: Partial<IncomingCallCardProps> = {}) {
  return renderToString(
    <IncomingCallCard callerName="Ada Lovelace" onAccept={noop} onDecline={noop} {...props} />,
  )
}

function attr(html: string, name: string): string | undefined {
  return new RegExp(`${name}="([^"]*)"`).exec(html)?.[1]
}

describe('IncomingCallCard (SSR)', () => {
  it('renders an alertdialog labelled by the caller and described by the kind', () => {
    const html = render()
    expect(html).toContain('role="alertdialog"')
    const labelledBy = attr(html, 'aria-labelledby')
    const describedBy = attr(html, 'aria-describedby')
    expect(labelledBy).toBeTruthy()
    expect(describedBy).toBeTruthy()
    expect(html).toMatch(new RegExp(`<h2 id="${labelledBy}"[^>]*>Ada Lovelace</h2>`))
    expect(html).toMatch(new RegExp(`id="${describedBy}"[^>]*>.*Incoming audio call`))
  })

  it('is programmatically focusable but not in the tab order, and not modal', () => {
    const html = render()
    expect(html).toContain('tabindex="-1"')
    expect(html).not.toContain('aria-modal')
  })

  it('renders real Decline then Accept buttons with visible text and icons', () => {
    const html = render()
    const buttons = html.match(/<button[^>]*>.*?<\/button>/g) ?? []
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toContain('data-action="decline"')
    expect(buttons[0]).toContain('<span>Decline</span>')
    expect(buttons[0]).toContain('data-icon="hang-up"')
    expect(buttons[1]).toContain('data-action="accept"')
    expect(buttons[1]).toContain('<span>Accept</span>')
    expect(buttons[1]).toContain('data-icon="phone"')
    for (const b of buttons) {
      expect(b).toContain('type="button"')
      expect(b).toContain('min-h-11')
    }
  })

  it('uses custom labels and the video icon for video calls', () => {
    const html = render({ kind: 'video', acceptLabel: 'Answer', declineLabel: 'Reject' })
    expect(html).toContain('data-kind="video"')
    expect(html).toContain('Incoming video call')
    expect(html).toContain('<span>Answer</span>')
    expect(html).toContain('<span>Reject</span>')
    expect((html.match(/data-icon="video"/g) ?? []).length).toBe(2)
  })

  it('renders context and a custom kind label inside the description', () => {
    const html = render({ context: 'Design review', kindLabel: 'Appel entrant' })
    const describedBy = attr(html, 'aria-describedby')
    expect(html).toMatch(new RegExp(`id="${describedBy}".*Appel entrant.*Design review`))
    expect(html).not.toContain('Incoming audio call')
  })

  it('hides the decorative avatar and ring from assistive tech', () => {
    const html = render()
    expect(html).toMatch(/<span class="[^"]*ring-4[^"]*" aria-hidden="true">/)
    expect(html).toContain('data-slot="ring-pulse"')
    expect(html).toContain('motion-reduce:animate-none')
    expect(html).toContain('>AL<')
  })

  it('renders the avatar image when a source is given', () => {
    const html = render({ avatarSrc: '/ada.png' })
    expect(html).toContain('src="/ada.png"')
    expect(html).toContain('alt=""')
  })

  it('renders no countdown by default', () => {
    expect(render()).not.toContain('role="timer"')
  })

  it('renders the countdown text and a decorative progress bar', () => {
    const html = render({ timeoutSeconds: 30, remaining: 15 })
    expect(html).toContain('role="timer"')
    expect(html).toContain('Ends in 0:15')
    expect(html).toContain('width:50%')
    expect(html).toMatch(/<div class="[^"]*bg-muted[^"]*" aria-hidden="true">/)
  })

  it('accepts a custom countdown label', () => {
    const html = render({ timeoutSeconds: 20, countdownLabel: (s) => `${s}s left` })
    expect(html).toContain('20s left')
  })

  it('stops ringing once the countdown has expired', () => {
    const html = render({ timeoutSeconds: 30, remaining: 0 })
    expect(html).toContain('data-ringing="false"')
    expect(html).not.toContain('data-slot="ring-pulse"')
  })

  it('applies the overlay and window layouts', () => {
    expect(render()).toContain('data-layout="overlay"')
    expect(render()).toContain('fixed')
    const windowHtml = render({ layout: 'window' })
    expect(windowHtml).toContain('data-layout="window"')
    expect(windowHtml).not.toMatch(/class="[^"]*\bfixed\b/)
  })

  it('merges className and passes through DOM props', () => {
    const html = render({ className: 'custom-x', id: 'call-1' })
    expect(html).toContain('custom-x')
    expect(html).toContain('id="call-1"')
  })
})
