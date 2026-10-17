import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { FloatingPanel } from '../src/index.js'

// Node env (no DOM): assert on the markup string, reading attributes off the
// first tag that matches a pattern.
function html(ui: React.ReactElement): string {
  return renderToString(ui)
}

function attr(markup: string, tagStart: RegExp, name: string): string | null {
  const tag = markup.match(tagStart)?.[0]
  if (!tag) return null
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`))
  return m ? m[1] : null
}

const ROOT = /<div[^>]*role="region"[^>]*>/
const HANDLE = /<button[^>]*data-floating-panel-handle[^>]*>/
const TOGGLE = /<button[^>]*aria-expanded[^>]*>/

describe('FloatingPanel (SSR)', () => {
  it('renders a named, non-modal region', () => {
    const out = html(<FloatingPanel label="Call with Ada">Video</FloatingPanel>)
    expect(attr(out, ROOT, 'aria-label')).toBe('Call with Ada')
    expect(out).not.toContain('aria-modal')
    expect(out).not.toContain('role="dialog"')
    expect(out).not.toContain('inert')
    expect(out).toContain('Video')
  })

  it('anchors to the default bottom-right corner by the default margin before measuring', () => {
    const out = html(<FloatingPanel label="Call">x</FloatingPanel>)
    expect(attr(out, ROOT, 'data-corner')).toBe('bottom-right')
    const style = attr(out, ROOT, 'style') ?? ''
    expect(style).toContain('bottom:16px')
    expect(style).toContain('right:16px')
    expect(style).not.toContain('transform')
  })

  it('anchors to a given corner and margin', () => {
    const out = html(
      <FloatingPanel label="Call" corner="top-left" margin={24}>
        x
      </FloatingPanel>,
    )
    expect(attr(out, ROOT, 'data-corner')).toBe('top-left')
    const style = attr(out, ROOT, 'style') ?? ''
    expect(style).toContain('top:24px')
    expect(style).toContain('left:24px')
  })

  it('renders a labelled, described, focusable drag handle', () => {
    const out = html(<FloatingPanel label="Call">x</FloatingPanel>)
    expect(attr(out, HANDLE, 'aria-label')).toBe('Move panel')
    expect(attr(out, HANDLE, 'type')).toBe('button')
    expect(attr(out, HANDLE, 'tabindex')).toBeNull()
    const hintId = attr(out, HANDLE, 'aria-describedby')
    expect(hintId).toBeTruthy()
    expect(out).toContain(
      `id="${hintId}" class="sr-only">Use the arrow keys to move the panel to another corner.</span>`,
    )
    const cls = attr(out, HANDLE, 'class') ?? ''
    expect(cls).toContain('size-11')
    expect(cls).toContain('touch-none')
    expect(cls).toContain('focus-visible:ring-2')
  })

  it('renders an expanded collapse control wired to the body', () => {
    const out = html(<FloatingPanel label="Call">Body</FloatingPanel>)
    expect(attr(out, TOGGLE, 'aria-expanded')).toBe('true')
    expect(attr(out, TOGGLE, 'aria-label')).toBe('Collapse panel')
    const bodyId = attr(out, TOGGLE, 'aria-controls')
    expect(bodyId).toBeTruthy()
    const body = out.match(new RegExp(`<div[^>]*id="${bodyId}"[^>]*>`))?.[0] ?? ''
    expect(body).not.toContain('hidden')
    expect(attr(out, ROOT, 'data-state')).toBe('expanded')
  })

  it('hides the body (kept mounted) when collapsed', () => {
    const out = html(
      <FloatingPanel label="Call" defaultCollapsed>
        Body
      </FloatingPanel>,
    )
    expect(attr(out, TOGGLE, 'aria-expanded')).toBe('false')
    expect(attr(out, TOGGLE, 'aria-label')).toBe('Expand panel')
    const bodyId = attr(out, TOGGLE, 'aria-controls')
    const body = out.match(new RegExp(`<div[^>]*id="${bodyId}"[^>]*>`))?.[0] ?? ''
    expect(body).toContain('hidden')
    expect(out).toContain('Body')
    expect(attr(out, ROOT, 'data-state')).toBe('collapsed')
  })

  it('renders header content and an empty polite status region', () => {
    const out = html(
      <FloatingPanel label="Call" header={<span>Ada · 04:12</span>}>
        x
      </FloatingPanel>,
    )
    expect(out).toContain('Ada · 04:12')
    expect(out).toMatch(/<span role="status" aria-live="polite" class="sr-only"><\/span>/)
  })

  it('uses custom labels', () => {
    const out = html(
      <FloatingPanel
        label="Appel"
        handleLabel="Déplacer"
        handleDescription="Flèches pour changer de coin."
        collapseLabel="Réduire"
      >
        x
      </FloatingPanel>,
    )
    expect(attr(out, HANDLE, 'aria-label')).toBe('Déplacer')
    expect(out).toContain('Flèches pour changer de coin.')
    expect(attr(out, TOGGLE, 'aria-label')).toBe('Réduire')
  })

  it('merges className and themes with tokens', () => {
    const out = html(
      <FloatingPanel label="Call" className="w-72">
        x
      </FloatingPanel>,
    )
    const cls = attr(out, ROOT, 'class') ?? ''
    expect(cls).toContain('w-72')
    expect(cls).toContain('fixed')
    expect(cls).toContain('bg-card')
    expect(cls).toContain('border-border')
    expect(attr(out, ROOT, 'data-dragging')).toBe('false')
    expect(attr(out, ROOT, 'data-motion')).toBe('instant')
  })

  it('keeps its positioning over a consumer style', () => {
    const out = html(
      <FloatingPanel label="Call" style={{ bottom: 999, opacity: 0.9 }}>
        x
      </FloatingPanel>,
    )
    const style = attr(out, ROOT, 'style') ?? ''
    expect(style).toContain('opacity:0.9')
    expect(style).toContain('bottom:16px')
  })
})
