// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MediaFrame } from '../src/index.js'

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
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

describe('MediaFrame (DOM)', () => {
  it('forwards its ref to the frame element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<MediaFrame ref={ref} ratio="16:9" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.dataset.slot).toBe('media-frame')
    expect(ref.current?.dataset.orientation).toBe('landscape')
  })

  it('keeps the media reachable by its accessible name and the caption as text', () => {
    render(
      <MediaFrame ratio="1:1" label="1080×1080 · PNG">
        <img alt="Generated artwork" src="art.png" />
      </MediaFrame>,
    )
    const img = container.querySelector('img[alt="Generated artwork"]')
    expect(img).not.toBeNull()
    expect(container.textContent).toContain('1080×1080 · PNG')
  })

  it('updates its orientation when the ratio changes', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<MediaFrame ref={ref} ratio="16:9" />)
    render(<MediaFrame ref={ref} ratio="9:16" />)
    expect(ref.current?.dataset.orientation).toBe('portrait')
  })
})
