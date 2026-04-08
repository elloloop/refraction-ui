import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StatsGrid, ProgressBar, BadgeDisplay } from '../src/progress-display.js'

describe('StatsGrid (React)', () => {
  const stats = [
    { label: 'Score', value: 95 },
    { label: 'Streak', value: 7, icon: 'fire', color: 'success' },
  ]

  it('renders a div with grid classes', () => {
    const html = renderToString(React.createElement(StatsGrid, { stats }))
    expect(html).toContain('<div')
    expect(html).toContain('grid')
  })

  it('renders stat values', () => {
    const html = renderToString(React.createElement(StatsGrid, { stats }))
    expect(html).toContain('95')
    expect(html).toContain('Score')
  })

  it('renders stat labels', () => {
    const html = renderToString(React.createElement(StatsGrid, { stats }))
    expect(html).toContain('Streak')
    expect(html).toContain('7')
  })

  it('applies region role for accessibility', () => {
    const html = renderToString(React.createElement(StatsGrid, { stats }))
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="Progress statistics"')
  })

  it('renders stat icons when provided', () => {
    const html = renderToString(React.createElement(StatsGrid, { stats }))
    expect(html).toContain('fire')
  })

  it('applies color variant to stat cards', () => {
    const html = renderToString(React.createElement(StatsGrid, { stats }))
    expect(html).toContain('bg-green-500/10')
  })
})

describe('ProgressBar (React)', () => {
  it('renders a progress bar with correct role', () => {
    const html = renderToString(
      React.createElement(ProgressBar, { value: 50 }),
    )
    expect(html).toContain('role="progressbar"')
  })

  it('sets aria-valuenow', () => {
    const html = renderToString(
      React.createElement(ProgressBar, { value: 75 }),
    )
    expect(html).toContain('aria-valuenow="75"')
  })

  it('sets aria-valuemin and aria-valuemax', () => {
    const html = renderToString(
      React.createElement(ProgressBar, { value: 50 }),
    )
    expect(html).toContain('aria-valuemin="0"')
    expect(html).toContain('aria-valuemax="100"')
  })

  it('clamps percentage between 0 and 100', () => {
    const html = renderToString(
      React.createElement(ProgressBar, { value: 150 }),
    )
    expect(html).toContain('width:100%')
  })

  it('applies size variant', () => {
    const html = renderToString(
      React.createElement(ProgressBar, { value: 50, size: 'lg' }),
    )
    expect(html).toContain('h-3')
  })
})

describe('BadgeDisplay (React)', () => {
  const badges = [
    { name: 'First Win', description: 'Win your first game', icon: 'trophy', isUnlocked: true },
    { name: 'Perfect', description: 'Get a perfect score', icon: 'star', isUnlocked: false },
  ]

  it('renders badge names', () => {
    const html = renderToString(
      React.createElement(BadgeDisplay, { badges }),
    )
    expect(html).toContain('First Win')
    expect(html).toContain('Perfect')
  })

  it('renders badge icons', () => {
    const html = renderToString(
      React.createElement(BadgeDisplay, { badges }),
    )
    expect(html).toContain('trophy')
    expect(html).toContain('star')
  })

  it('applies unlocked variant to unlocked badges', () => {
    const html = renderToString(
      React.createElement(BadgeDisplay, { badges }),
    )
    expect(html).toContain('opacity-100')
  })

  it('applies locked variant to locked badges', () => {
    const html = renderToString(
      React.createElement(BadgeDisplay, { badges }),
    )
    expect(html).toContain('opacity-50')
    expect(html).toContain('grayscale')
  })

  it('shows Locked text for locked badges', () => {
    const html = renderToString(
      React.createElement(BadgeDisplay, { badges }),
    )
    expect(html).toContain('Locked')
  })

  it('sets aria-label on badges', () => {
    const html = renderToString(
      React.createElement(BadgeDisplay, { badges }),
    )
    expect(html).toContain('aria-label="First Win: Win your first game"')
    expect(html).toContain('aria-label="Perfect: Get a perfect score (locked)"')
  })
})
