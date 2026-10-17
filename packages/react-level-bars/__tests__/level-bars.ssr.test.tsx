import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LevelBars, LiveLevelBars } from '../src/index.js'

const bars = (html: string) => (html.match(/data-level-bar=""/g) ?? []).length

describe('LevelBars (SSR)', () => {
  it('draws one bar per level with exact geometry', () => {
    const html = renderToString(
      <LevelBars levels={[0, 0.5, 1]} height={20} barWidth={4} gap={2} />,
    )
    expect(bars(html)).toBe(3)
    expect(html).toContain('style="width:16px;height:20px"')
    expect(html).toContain('left:0px;top:10px;width:4px;height:0px')
    expect(html).toContain('left:6px;top:5px;width:4px;height:10px')
    expect(html).toContain('left:12px;top:0px;width:4px;height:20px')
  })

  it('renders identically on every run', () => {
    const element = <LevelBars levels={[0.13, 0.77, 0.42]} taper />
    expect(renderToString(element)).toBe(renderToString(element))
  })

  it('is decorative by default', () => {
    const html = renderToString(<LevelBars levels={[0.5]} />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('data-mode="decorative"')
    expect(html).not.toContain('role="meter"')
  })

  it('is a meter reporting its peak when labelled', () => {
    const html = renderToString(
      <LevelBars levels={[0.2, 0.64, 0.3]} label="Microphone level" />,
    )
    expect(html).toContain('role="meter"')
    expect(html).toContain('aria-label="Microphone level"')
    expect(html).toContain('aria-valuemin="0"')
    expect(html).toContain('aria-valuemax="100"')
    expect(html).toContain('aria-valuenow="64"')
    expect(html).toContain('aria-valuetext="64%"')
    expect(html).not.toContain('aria-hidden')
  })

  it('uses the semantic colour token class and no raw colour', () => {
    const html = renderToString(<LevelBars levels={[0.5]} color="success" />)
    expect(html).toContain('bg-success')
    expect(html).toContain('data-color="success"')
    expect(html).not.toMatch(/#[0-9a-f]{3,6}|rgb\(/i)
  })

  it('tapers the ends of the row', () => {
    const html = renderToString(<LevelBars levels={[1, 1, 1]} height={20} taper />)
    expect(html).toContain('top:6.5px;width:3px;height:7px')
    expect(html).toContain('top:0px;width:3px;height:20px')
  })

  it('does not ease static bars', () => {
    const html = renderToString(<LevelBars levels={[0.5]} />)
    expect(html).toContain('data-live="false"')
    expect(html).not.toContain('transition')
  })

  it('merges className and style and forwards DOM props', () => {
    const html = renderToString(
      <LevelBars levels={[0.5]} className="ml-2" style={{ opacity: 0.5 }} id="lvl" />,
    )
    expect(html).toContain('ml-2')
    expect(html).toContain('opacity:0.5')
    expect(html).toContain('id="lvl"')
  })
})

describe('LiveLevelBars (SSR)', () => {
  it('keeps `bars` entries with the current level at the right edge', () => {
    const html = renderToString(
      <LiveLevelBars level={0.5} bars={4} height={20} barWidth={2} gap={1} />,
    )
    expect(bars(html)).toBe(4)
    expect(html).toContain('style="width:11px;height:20px"')
    expect(html).toContain('left:9px;top:5px;width:2px;height:10px')
    expect((html.match(/height:0px/g) ?? []).length).toBe(3)
  })

  it('defaults to 16 bars', () => {
    expect(bars(renderToString(<LiveLevelBars level={0} />))).toBe(16)
  })

  it('is a meter reporting the current level when labelled', () => {
    const html = renderToString(<LiveLevelBars level={0.31} label="Microphone level" />)
    expect(html).toContain('role="meter"')
    expect(html).toContain('aria-valuenow="31"')
    expect(html).toContain('data-mode="meter"')
  })

  it('is decorative by default', () => {
    expect(renderToString(<LiveLevelBars level={0.5} />)).toContain('aria-hidden="true"')
  })

  it('eases live bars except under reduced motion', () => {
    const html = renderToString(<LiveLevelBars level={0.5} />)
    expect(html).toContain('data-live="true"')
    expect(html).toContain('transition-[height,top]')
    expect(html).toContain('motion-reduce:transition-none')
  })
})
