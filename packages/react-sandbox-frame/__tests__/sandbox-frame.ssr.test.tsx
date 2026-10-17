import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { SandboxFrame, SandboxFrameConfigError, SANDBOX_FRAME_DEFAULT_MAX_HEIGHT } from '../src/index.js'

const UNTRUSTED = '<b id="secret">untrusted</b><script>alert(1)</script>'

function render(ui: React.ReactElement) {
  return renderToString(ui)
}

describe('SandboxFrame (SSR)', () => {
  it('renders the loading shell with an accessible busy state', () => {
    const html = render(<SandboxFrame html={UNTRUSTED} title="Email preview" id="f1" />)
    expect(html).toContain('id="f1"')
    expect(html).toContain('data-state="loading"')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('role="status"')
    expect(html).toContain('Loading preview…')
    expect(html).toContain('aria-hidden="true"')
  })

  it('never puts the untrusted markup (or an iframe) in server HTML', () => {
    const html = render(<SandboxFrame html={UNTRUSTED} title="Email preview" />)
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('secret')
    expect(html).not.toContain('alert(1)')
  })

  it('applies the collapsed height to the viewport', () => {
    expect(render(<SandboxFrame html="" title="t" id="f" />)).toContain(
      `id="f-viewport" class="relative w-full transition-[height] duration-200 motion-reduce:transition-none" style="height:${SANDBOX_FRAME_DEFAULT_MAX_HEIGHT}px"`,
    )
    expect(render(<SandboxFrame html="" title="t" maxHeight={240} />)).toContain('style="height:240px"')
  })

  it('offers the expand control when scripts are off (height is unknowable)', () => {
    const html = render(<SandboxFrame html="" title="t" id="f" />)
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls="f-viewport"')
    expect(html).toContain('Show more')
    expect(html).toContain('data-scripts="off"')
  })

  it('waits for a height report before offering the control when scripts are on', () => {
    const html = render(<SandboxFrame html="" title="t" allowScripts />)
    expect(html).not.toContain('aria-expanded')
    expect(html).toContain('data-scripts="on"')
  })

  it('uses custom labels', () => {
    const html = render(
      <SandboxFrame html="" title="t" labels={{ loading: 'Lädt…', expand: 'Mehr anzeigen' }} />,
    )
    expect(html).toContain('Lädt…')
    expect(html).toContain('Mehr anzeigen')
  })

  it('merges className and passes through other attributes', () => {
    const html = render(<SandboxFrame html="" title="t" className="my-frame" data-testid="x" />)
    expect(html).toMatch(/class="relative w-full overflow-hidden[^"]* my-frame"/)
    expect(html).toContain('data-testid="x"')
  })

  it('refuses scripts together with same-origin', () => {
    expect(() =>
      render(<SandboxFrame html="" title="t" allowScripts permissions={['allow-same-origin']} />),
    ).toThrow(SandboxFrameConfigError)
  })

  it('refuses an empty title', () => {
    expect(() => render(<SandboxFrame html="" title="  " />)).toThrow(SandboxFrameConfigError)
  })

  it('refuses a CSP source that could inject a directive', () => {
    expect(() =>
      render(<SandboxFrame html="" title="t" csp={{ imgSrc: ['https:; script-src *'] }} />),
    ).toThrow(SandboxFrameConfigError)
  })

  it('refuses a non-positive maxHeight', () => {
    expect(() => render(<SandboxFrame html="" title="t" maxHeight={0} />)).toThrow(SandboxFrameConfigError)
  })
})
