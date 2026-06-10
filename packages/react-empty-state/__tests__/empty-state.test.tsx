import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { EmptyState, ConfirmationCard } from '../src/empty-state.js'

describe('EmptyState (React)', () => {
  it('renders title and description', () => {
    const html = renderToString(
      React.createElement(EmptyState, {
        title: 'No results',
        description: 'Try a different search',
      }),
    )
    expect(html).toContain('No results')
    expect(html).toContain('Try a different search')
  })

  it('renders the icon', () => {
    const html = renderToString(
      React.createElement(EmptyState, {
        title: 'Empty',
        icon: React.createElement('svg', { 'data-testid': 'icon' }),
      }),
    )
    expect(html).toContain('data-testid="icon"')
  })

  it('applies neutral tone chip classes by default', () => {
    const html = renderToString(
      React.createElement(EmptyState, {
        title: 'Empty',
        icon: React.createElement('span', null, 'i'),
      }),
    )
    expect(html).toContain('bg-muted')
    expect(html).toContain('data-tone="neutral"')
  })

  it.each([
    ['success', 'bg-green-500/10'],
    ['warning', 'bg-yellow-500/10'],
    ['danger', 'bg-destructive/10'],
  ] as const)('applies %s tone chip class', (tone, klass) => {
    const html = renderToString(
      React.createElement(EmptyState, {
        title: 'Empty',
        tone,
        icon: React.createElement('span', null, 'i'),
      }),
    )
    expect(html).toContain(klass)
  })

  it('renders actions', () => {
    const html = renderToString(
      React.createElement(EmptyState, {
        title: 'Empty',
        actions: React.createElement('button', null, 'Retry'),
      }),
    )
    expect(html).toContain('Retry')
  })

  it('adds border class when bordered', () => {
    const html = renderToString(
      React.createElement(EmptyState, { title: 'Empty', bordered: true }),
    )
    expect(html).toContain('border-border')
  })

  it('is not bordered by default', () => {
    const html = renderToString(
      React.createElement(EmptyState, { title: 'Empty' }),
    )
    expect(html).not.toContain('border-border')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(EmptyState, {
        title: 'Empty',
        className: 'my-empty',
      }),
    )
    expect(html).toContain('my-empty')
  })
})

describe('ConfirmationCard (React)', () => {
  it('renders bordered by default', () => {
    const html = renderToString(
      React.createElement(ConfirmationCard, { title: 'Check your email' }),
    )
    expect(html).toContain('border-border')
    expect(html).toContain('Check your email')
  })

  it('can opt out of bordered', () => {
    const html = renderToString(
      React.createElement(ConfirmationCard, {
        title: 'Plain',
        bordered: false,
      }),
    )
    expect(html).not.toContain('border-border')
  })
})
