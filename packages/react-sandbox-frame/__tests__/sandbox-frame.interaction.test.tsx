// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { SANDBOX_FRAME_MESSAGE_TYPE } from '@refraction-ui/sandbox-frame'
import { SandboxFrame, type SandboxFrameProps } from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const ID = 'frame-under-test'
/** jsdom fires the iframe's initial `load` asynchronously; this outlasts it. */
const LOAD_SETTLE_MS = 20

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  document.documentElement.className = ''
})

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, LOAD_SETTLE_MS))
  })
}

async function render(ui: React.ReactElement) {
  await act(async () => root.render(ui))
  await settle()
}

function frameRoot(): HTMLDivElement {
  return container.firstElementChild as HTMLDivElement
}

function iframe(): HTMLIFrameElement {
  const el = container.querySelector('iframe')
  if (!el) throw new Error('iframe not rendered')
  return el
}

function viewportHeight(): string {
  return container.querySelector<HTMLDivElement>(`#${ID}-viewport`)!.style.height
}

function expandButton(): HTMLButtonElement | null {
  return container.querySelector<HTMLButtonElement>('button[aria-expanded]')
}

function postFrom(source: Window | null, data: unknown, origin = 'null') {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, origin, source }))
  })
}

function report(height: number, id = ID) {
  return { type: SANDBOX_FRAME_MESSAGE_TYPE, id, height }
}

function parseSrcDoc(): Document {
  return new DOMParser().parseFromString(iframe().getAttribute('srcdoc') ?? '', 'text/html')
}

function Frame(props: Partial<SandboxFrameProps>) {
  return <SandboxFrame id={ID} html="<p>Hello</p>" title="Message preview" {...props} />
}

describe('SandboxFrame (interaction, jsdom)', () => {
  describe('sandbox and document', () => {
    it('renders a fully sandboxed srcdoc iframe with the required title', async () => {
      await render(<Frame />)
      const el = iframe()
      expect(el.getAttribute('sandbox')).toBe('')
      expect(el.getAttribute('title')).toBe('Message preview')
      expect(el.getAttribute('referrerpolicy')).toBe('no-referrer')
      expect(el.hasAttribute('src')).toBe(false)
    })

    it('adds only allow-scripts when scripts are opted in', async () => {
      await render(<Frame allowScripts />)
      expect(iframe().getAttribute('sandbox')).toBe('allow-scripts')
    })

    it('puts the CSP meta first in <head> and keeps hostile markup out of the injected parts', async () => {
      const hostile = '</script><script>alert(1)</script>"><meta http-equiv="refresh" content="0;url=https://evil.example">'
      await render(<Frame allowScripts html={hostile} />)
      const doc = parseSrcDoc()
      const first = doc.head.firstElementChild!
      expect(first.tagName).toBe('META')
      expect(first.getAttribute('http-equiv')).toBe('Content-Security-Policy')
      const policy = first.getAttribute('content')!
      expect(policy.startsWith("default-src 'none'; base-uri 'none'; form-action 'none'")).toBe(true)

      // One injected script, in <head>, carrying the nonce named by the policy.
      const nonce = /'nonce-([^']+)'/.exec(policy)![1]
      expect(nonce.length).toBeGreaterThanOrEqual(22)
      const headScripts = doc.head.querySelectorAll('script')
      expect(headScripts).toHaveLength(1)
      expect(headScripts[0].getAttribute('nonce')).toBe(nonce)
      // The hostile script landed in the body without the nonce, so CSP blocks it.
      const bodyScripts = Array.from(doc.body.querySelectorAll('script'))
      expect(bodyScripts.map((s) => s.textContent)).toEqual(['alert(1)'])
      expect(bodyScripts[0].hasAttribute('nonce')).toBe(false)
      // The untrusted HTML is the exact, unaltered suffix of the attribute.
      expect(iframe().getAttribute('srcdoc')!.endsWith(`<body>${hostile}`)).toBe(true)
    })

    it('injects no script and no script-src when scripts are off', async () => {
      await render(<Frame />)
      const doc = parseSrcDoc()
      expect(doc.head.querySelectorAll('script')).toHaveLength(0)
      expect(doc.head.firstElementChild!.getAttribute('content')).not.toContain('script-src')
    })

    it('forwards explicit theme tokens as custom properties', async () => {
      await render(<Frame themeTokens={{ background: '240 10% 4%', foreground: '0 0% 98%' }} />)
      expect(parseSrcDoc().head.querySelector('style')!.textContent).toContain(
        ':root{--background:240 10% 4%;--foreground:0 0% 98%}',
      )
    })

    it('reads host tokens and rebuilds the document when <html> changes theme', async () => {
      const Host = ({ bg }: { bg: string }) => (
        <Frame style={{ ['--background' as string]: bg } as React.CSSProperties} />
      )
      await render(<Host bg="0 0% 100%" />)
      expect(parseSrcDoc().head.querySelector('style')!.textContent).toContain('--background:0 0% 100%')

      await render(<Host bg="240 10% 4%" />)
      await act(async () => {
        document.documentElement.classList.add('dark')
      })
      await settle()
      expect(parseSrcDoc().head.querySelector('style')!.textContent).toContain('--background:240 10% 4%')
    })

    it('uses a fresh random nonce per instance', async () => {
      await render(
        <>
          <SandboxFrame html="" title="a" allowScripts />
          <SandboxFrame html="" title="b" allowScripts />
        </>,
      )
      const nonces = Array.from(container.querySelectorAll('iframe')).map(
        (el) => /nonce="([^"]+)"/.exec(el.getAttribute('srcdoc')!)![1],
      )
      expect(nonces[0]).not.toBe(nonces[1])
    })
  })

  describe('loading and error states', () => {
    it('moves from loading to ready on load and reports both', async () => {
      const onStatusChange = vi.fn()
      // Synchronous act: effects flush, but jsdom's async load has not fired yet.
      act(() => root.render(<Frame onStatusChange={onStatusChange} />))
      expect(frameRoot().getAttribute('data-state')).toBe('loading')
      expect(frameRoot().getAttribute('aria-busy')).toBe('true')
      expect(container.querySelector('[role="status"]')).not.toBeNull()

      await settle()
      expect(frameRoot().getAttribute('data-state')).toBe('ready')
      expect(frameRoot().hasAttribute('aria-busy')).toBe(false)
      expect(container.querySelector('[role="status"]')).toBeNull()
      expect(onStatusChange.mock.calls.map(([s]) => s)).toEqual(['loading', 'ready'])
    })

    it('treats a second load from the same element as navigation: removes the frame and offers reload', async () => {
      const onStatusChange = vi.fn()
      await render(<Frame onStatusChange={onStatusChange} />)
      act(() => {
        iframe().dispatchEvent(new Event('load'))
      })
      expect(container.querySelector('iframe')).toBeNull()
      const alert = container.querySelector('[role="alert"]')!
      expect(alert.textContent).toContain('tried to navigate away')
      expect(frameRoot().getAttribute('data-state')).toBe('error')
      expect(onStatusChange).toHaveBeenLastCalledWith('error')

      const reload = alert.querySelector('button')!
      expect(reload.textContent).toBe('Reload preview')
      act(() => reload.click())
      expect(container.querySelector('iframe')).not.toBeNull()
      expect(frameRoot().getAttribute('data-state')).toBe('loading')
      await settle()
      expect(frameRoot().getAttribute('data-state')).toBe('ready')
    })
  })

  describe('auto-height', () => {
    it('resizes on a report from the frame’s own window', async () => {
      await render(<Frame allowScripts maxHeight={400} />)
      expect(viewportHeight()).toBe('400px')
      postFrom(iframe().contentWindow, report(120))
      expect(viewportHeight()).toBe('120px')
      expect(expandButton()).toBeNull()
    })

    it('ignores a report from a foreign source, even with origin "null" and the right id', async () => {
      const other = document.createElement('iframe')
      document.body.appendChild(other)
      await render(<Frame allowScripts maxHeight={400} />)

      postFrom(window, report(120))
      postFrom(other.contentWindow, report(120))
      postFrom(null, report(120))
      expect(viewportHeight()).toBe('400px')
      other.remove()
    })

    it('ignores a report with another id, another type or a non-opaque origin', async () => {
      await render(<Frame allowScripts maxHeight={400} />)
      const source = iframe().contentWindow
      postFrom(source, report(120, 'someone-else'))
      postFrom(source, { ...report(120), type: 'resize' })
      postFrom(source, report(120), 'https://evil.example')
      expect(viewportHeight()).toBe('400px')
    })

    it('ignores reports entirely when scripts are off', async () => {
      await render(<Frame maxHeight={400} />)
      postFrom(iframe().contentWindow, report(120))
      expect(viewportHeight()).toBe('400px')
    })

    it('clamps to maxHeight and toggles with the expand control', async () => {
      await render(<Frame allowScripts maxHeight={300} />)
      postFrom(iframe().contentWindow, report(900))
      expect(viewportHeight()).toBe('300px')

      const button = expandButton()!
      expect(button.getAttribute('aria-expanded')).toBe('false')
      expect(button.getAttribute('aria-controls')).toBe(`${ID}-viewport`)
      expect(button.textContent).toBe('Show more')

      act(() => button.click())
      expect(viewportHeight()).toBe('900px')
      expect(expandButton()!.getAttribute('aria-expanded')).toBe('true')
      expect(expandButton()!.textContent).toBe('Show less')
      expect(frameRoot().getAttribute('data-expanded')).toBe('true')

      act(() => expandButton()!.click())
      expect(viewportHeight()).toBe('300px')
      expect(expandButton()!.getAttribute('aria-expanded')).toBe('false')
    })

    it('the control is keyboard reachable as a native button', async () => {
      await render(<Frame allowScripts maxHeight={300} />)
      postFrom(iframe().contentWindow, report(900))
      const button = expandButton()!
      button.focus()
      expect(document.activeElement).toBe(button)
      expect(button.getAttribute('type')).toBe('button')
    })

    it('drops the control again when content shrinks below the cap', async () => {
      await render(<Frame allowScripts maxHeight={300} />)
      postFrom(iframe().contentWindow, report(900))
      expect(expandButton()).not.toBeNull()
      postFrom(iframe().contentWindow, report(200))
      expect(expandButton()).toBeNull()
      expect(viewportHeight()).toBe('200px')
    })

    it('with scripts off, expands a fixed frame to the viewport-relative height', async () => {
      await render(<Frame maxHeight={300} />)
      expect(viewportHeight()).toBe('300px')
      act(() => expandButton()!.click())
      expect(viewportHeight()).toBe('80vh')
    })

    it('a new document starts unmeasured, ignoring reports from the previous frame', async () => {
      await render(<Frame allowScripts maxHeight={400} html="<p>one</p>" />)
      const previous = iframe().contentWindow
      postFrom(previous, report(120))
      expect(viewportHeight()).toBe('120px')

      await render(<Frame allowScripts maxHeight={400} html="<p>two</p>" />)
      expect(viewportHeight()).toBe('400px')
      postFrom(previous, report(150))
      expect(viewportHeight()).toBe('400px')
      postFrom(iframe().contentWindow, report(150))
      expect(viewportHeight()).toBe('150px')
    })
  })
})
