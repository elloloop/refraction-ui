import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { AvatarGroup } from '../src/avatar-group.js'
import type { AvatarUser } from '@refraction-ui/avatar-group'

const users: AvatarUser[] = [
  { id: '1', name: 'Ada Lovelace', src: 'https://example.com/ada.png', status: 'online' },
  { id: '2', name: 'Grace Hopper' },
  { id: '3', name: 'Alan Turing' },
  { id: '4', name: 'Edsger Dijkstra', status: 'busy' },
]

describe('AvatarGroup (React)', () => {
  it('renders a group container with role and user count label', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users }))
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="4 users"')
    expect(html).toContain('flex items-center -space-x-2')
  })

  it('renders each visible user with role="img" and an accessible name', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users, max: 2 }))
    expect(html).toContain('aria-label="Ada Lovelace (online)"')
    expect(html).toContain('aria-label="Grace Hopper"')
    expect(html.match(/role="img"/g)?.length).toBe(2)
  })

  it('includes the presence status in the avatar aria-label', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users }))
    expect(html).toContain('aria-label="Edsger Dijkstra (busy)"')
  })

  it('renders an img with alt text when the user has a src', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users, max: 1 }))
    expect(html).toContain('<img')
    expect(html).toContain('src="https://example.com/ada.png"')
    expect(html).toContain('alt="Ada Lovelace"')
  })

  it('renders initials when the user has no src', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users, max: 2 }))
    // Grace Hopper has no src — falls back to initials.
    expect(html).toContain('GH')
  })

  it('renders a presence dot with the status class when status is set', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users, max: 1 }))
    expect(html).toContain('bg-success')
  })

  it('caps visible avatars at max and renders an overflow badge', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users, max: 2 }))
    expect(html).toContain('+2')
    expect(html).toContain('aria-label="2 more users"')
    // Overflowed users are not rendered.
    expect(html).not.toContain('Alan Turing')
    expect(html).not.toContain('Edsger Dijkstra')
  })

  it('renders no overflow badge when users fit within max', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users, max: 10 }))
    expect(html).not.toContain('more users')
    expect(html.match(/role="img"/g)?.length).toBe(4)
  })

  it('applies size classes to avatars', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users, size: 'lg' }))
    expect(html).toContain('h-12 w-12')
  })

  it('appends a custom className to the group', () => {
    const html = renderToString(React.createElement(AvatarGroup, { users, className: 'my-group' }))
    expect(html).toContain('my-group')
    expect(html).toContain('-space-x-2')
  })
})
