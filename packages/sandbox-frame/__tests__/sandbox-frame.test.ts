import { describe, it, expect } from 'vitest'
import {
  SANDBOX_FRAME_MESSAGE_TYPE,
  SANDBOX_FRAME_HEIGHT_CEILING,
  SANDBOX_FRAME_UNMEASURED_EXPANDED_HEIGHT,
  SANDBOX_FRAME_DEFAULT_LABELS,
  SANDBOX_FRAME_NONCE_BYTES,
  SandboxFrameConfigError,
  buildSandboxTokens,
  assertSandboxNonce,
  validateSandboxCspOptions,
  buildSandboxCsp,
  encodeSandboxNonce,
  isSafeSandboxThemeToken,
  pickSandboxThemeTokens,
  areSandboxThemeTokensEqual,
  buildSandboxThemeCss,
  escapeSandboxAttribute,
  toSandboxScriptLiteral,
  buildSandboxDocumentHead,
  buildSandboxDocument,
  readSandboxFrameHeight,
  resolveSandboxFrameHeight,
  resolveSandboxFrameLabels,
  sandboxFrameIframeVariants,
  sandboxFrameActionClass,
  type SandboxFramePermission,
} from '../src/index.js'

const NONCE = 'AAECAwQFBgcICQoLDA0ODw' // encodeSandboxNonce(0..15)
const ID = 'frame-1'

describe('buildSandboxTokens', () => {
  it('defaults to the strictest sandbox (no tokens at all)', () => {
    expect(buildSandboxTokens()).toEqual([])
    expect(buildSandboxTokens({})).not.toContain('allow-same-origin')
  })

  it('adds allow-scripts only when opted in', () => {
    expect(buildSandboxTokens({ allowScripts: true })).toEqual(['allow-scripts'])
  })

  it('emits granted permissions in canonical order without duplicates', () => {
    expect(
      buildSandboxTokens({
        permissions: ['allow-popups-to-escape-sandbox', 'allow-popups', 'allow-popups'],
      }),
    ).toEqual(['allow-popups', 'allow-popups-to-escape-sandbox'])
  })

  it('allows same-origin alone (still no scripts)', () => {
    expect(buildSandboxTokens({ permissions: ['allow-same-origin'] })).toEqual(['allow-same-origin'])
  })

  it('refuses allow-scripts together with allow-same-origin', () => {
    expect(() =>
      buildSandboxTokens({ allowScripts: true, permissions: ['allow-same-origin'] }),
    ).toThrow(SandboxFrameConfigError)
    expect(() =>
      buildSandboxTokens({ allowScripts: true, permissions: ['allow-same-origin'] }),
    ).toThrow(/remove its own sandbox/)
  })

  it.each([
    'allow-scripts',
    'allow-top-navigation',
    'allow-top-navigation-by-user-activation',
    'allow-forms',
    'allow-modals',
    'allow-downloads',
    'allow-scripts allow-same-origin',
  ])('refuses non-grantable token %s', (token) => {
    expect(() =>
      buildSandboxTokens({ permissions: [token as SandboxFramePermission] }),
    ).toThrow(SandboxFrameConfigError)
  })
})

describe('nonce', () => {
  it('encodes bytes as unpadded base64url (RFC 4648 vectors)', () => {
    const enc = (s: string) => encodeSandboxNonce(new TextEncoder().encode(s))
    expect(enc('')).toBe('')
    expect(enc('f')).toBe('Zg')
    expect(enc('fo')).toBe('Zm8')
    expect(enc('foo')).toBe('Zm9v')
    expect(enc('foobar')).toBe('Zm9vYmFy')
    expect(encodeSandboxNonce(new Uint8Array([0xfb, 0xff]))).toBe('-_8')
  })

  it('encodes 16 bytes into a valid 22-character nonce', () => {
    const bytes = Uint8Array.from({ length: SANDBOX_FRAME_NONCE_BYTES }, (_, i) => i)
    const nonce = encodeSandboxNonce(bytes)
    expect(nonce).toBe(NONCE)
    expect(() => assertSandboxNonce(nonce)).not.toThrow()
  })

  it.each(['', 'short', 'AAECAwQFBgcICQoLDA0OD"', 'AAECAwQFBgcICQoLDA0OD w', "AAECAwQFBgcICQoLDA0O'x"])(
    'rejects malformed nonce %j',
    (nonce) => {
      expect(() => assertSandboxNonce(nonce)).toThrow(SandboxFrameConfigError)
    },
  )
})

describe('buildSandboxCsp', () => {
  it('defaults to default-src none with data: images and inline styles, no script-src', () => {
    expect(buildSandboxCsp({ nonce: NONCE })).toBe(
      "default-src 'none'; base-uri 'none'; form-action 'none'; img-src data:; style-src 'unsafe-inline'",
    )
  })

  it('emits a nonce-only script-src when scripts are allowed', () => {
    const csp = buildSandboxCsp({ nonce: NONCE, allowScripts: true })
    expect(csp).toContain(`script-src 'nonce-${NONCE}'`)
    expect(csp.split('; ').at(-1)).toBe(`script-src 'nonce-${NONCE}'`)
  })

  it('ignores scriptSrc when scripts are not allowed', () => {
    const csp = buildSandboxCsp({ nonce: NONCE, csp: { scriptSrc: ['https://cdn.example.com'] } })
    expect(csp).not.toContain('script-src')
  })

  it('appends extra script sources after the nonce', () => {
    const csp = buildSandboxCsp({
      nonce: NONCE,
      allowScripts: true,
      csp: { scriptSrc: ['https://cdn.example.com', "'sha256-abc+/=='"] },
    })
    expect(csp).toContain(`script-src 'nonce-${NONCE}' https://cdn.example.com 'sha256-abc+/=='`)
  })

  it('makes image, media, font and style policies configurable', () => {
    const csp = buildSandboxCsp({
      nonce: NONCE,
      csp: {
        imgSrc: ['https:', 'data:'],
        mediaSrc: ['https://media.example.com'],
        fontSrc: ['https://fonts.example.com'],
        styleSrc: [],
      },
    })
    expect(csp).toContain('img-src https: data:')
    expect(csp).toContain('media-src https://media.example.com')
    expect(csp).toContain('font-src https://fonts.example.com')
    // Without 'unsafe-inline', only the nonce'd injected stylesheet applies.
    expect(csp).toContain(`style-src 'nonce-${NONCE}'`)
  })

  it('omits a directive whose source list is empty so it falls back to default-src', () => {
    expect(buildSandboxCsp({ nonce: NONCE, csp: { imgSrc: [] } })).not.toContain('img-src')
  })

  it('does not add a nonce to style-src when inline styles are allowed (it would disable them)', () => {
    expect(buildSandboxCsp({ nonce: NONCE })).not.toContain(`style-src 'nonce-`)
  })

  it.each([
    // Keywords: each re-enables script the consumer never vetted.
    "'unsafe-inline'",
    "'unsafe-eval'",
    "'strict-dynamic'",
    "'unsafe-hashes'",
    "'self'",
    "'wasm-unsafe-eval'",
    // A fixed consumer nonce is known to the HTML's author.
    "'nonce-AAECAwQFBgcICQoLDA0ODw'",
    // Wildcards, anywhere in the source.
    '*',
    'https://*',
    '*.com',
    'https://*.example.com',
    'http://*:*',
    'https://cdn.example.com:*',
    'https://cdn.example.com/*',
    // Scheme-only, host-less and non-https sources.
    'https:',
    'http:',
    'HTTPS:',
    'data:',
    'blob:',
    'filesystem:',
    'https://',
    'cdn.example.com',
    'http://cdn.example.com',
    'ws://cdn.example.com',
  ])('refuses script-src %s', (source) => {
    expect(() =>
      buildSandboxCsp({ nonce: NONCE, allowScripts: true, csp: { scriptSrc: [source] } }),
    ).toThrow(SandboxFrameConfigError)
    // Refused during validation too, so adapters fail before any nonce exists.
    expect(() => validateSandboxCspOptions({ scriptSrc: [source] })).toThrow(/refusing script-src/)
  })

  it.each([
    'https://cdn.example.com',
    'https://cdn.example.com:8443',
    'https://cdn.example.com/widgets/',
    "'sha384-abc+/_-=='",
  ])('accepts the explicit script-src %s', (source) => {
    const csp = buildSandboxCsp({ nonce: NONCE, allowScripts: true, csp: { scriptSrc: [source] } })
    expect(csp.split('; ').at(-1)).toBe(`script-src 'nonce-${NONCE}' ${source}`)
  })

  it('explains why a wildcard script-src is refused', () => {
    expect(() => validateSandboxCspOptions({ scriptSrc: ['https://*'] })).toThrow(/wildcards are refused/)
  })

  it.each([
    'https://a.com; script-src *',
    'https://a.com https://b.com',
    'a,b',
    '"x"',
    '<x>',
    "'unsafe-inline' 'x'",
    '',
  ])('refuses a source that could inject a directive: %j', (source) => {
    expect(() => validateSandboxCspOptions({ imgSrc: [source] })).toThrow(SandboxFrameConfigError)
  })

  it('validates the nonce', () => {
    expect(() => buildSandboxCsp({ nonce: 'bad' })).toThrow(SandboxFrameConfigError)
  })
})

describe('theme tokens', () => {
  it('accepts HSL triplets, lengths and quoted font stacks', () => {
    expect(isSafeSandboxThemeToken('background', '0 0% 100%')).toBe(true)
    expect(isSafeSandboxThemeToken('radius', '0.5rem')).toBe(true)
    expect(isSafeSandboxThemeToken('font-sans', "'__Inter_6b3a', 'Inter Fallback', sans-serif")).toBe(true)
  })

  it.each([
    ['background', '0 0% 100%</style><script>alert(1)</script>'],
    ['background', 'red;color:blue'],
    ['background', 'x} body{display:none'],
    ['background', 'red !important'],
    ['background', 'url(https://evil.example/pixel)'],
    ['background', 'URL (x)'],
    ['background', '\\3c/style'],
    ['background', 'a'.repeat(257)],
    ['background', ''],
    ['back ground', 'red'],
    ['--background', 'red'],
    ['bg;x', 'red'],
  ])('rejects %j = %j', (name, value) => {
    expect(isSafeSandboxThemeToken(name, value)).toBe(false)
  })

  it('picks only set, safe tokens from a reader', () => {
    const host: Record<string, string> = {
      '--background': ' 0 0% 100% ',
      '--foreground': '240 10% 10%',
      '--primary': 'x}</style>',
    }
    const tokens = pickSandboxThemeTokens((v) => host[v] ?? '', ['background', 'foreground', 'primary', 'ring'])
    expect(tokens).toEqual({ background: '0 0% 100%', foreground: '240 10% 10%' })
  })

  it('compares token maps shallowly', () => {
    expect(areSandboxThemeTokensEqual({ a: '1' }, { a: '1' })).toBe(true)
    expect(areSandboxThemeTokensEqual({ a: '1' }, { a: '2' })).toBe(false)
    expect(areSandboxThemeTokensEqual({ a: '1' }, { a: '1', b: '2' })).toBe(false)
  })

  it('emits tokens as :root custom properties before the base styles', () => {
    const css = buildSandboxThemeCss({ background: '0 0% 100%', radius: '0.5rem' })
    expect(css.startsWith(':root{--background:0 0% 100%;--radius:0.5rem}')).toBe(true)
    expect(css).toContain('background-color:hsl(var(--background))')
    expect(css).toContain('prefers-reduced-motion:reduce')
  })

  it('throws for an explicit token that cannot be forwarded', () => {
    expect(() => buildSandboxThemeCss({ background: '</style>' })).toThrow(SandboxFrameConfigError)
  })
})

describe('escaping helpers', () => {
  it('escapes attribute metacharacters', () => {
    expect(escapeSandboxAttribute(`a"b'c<d>e&f`)).toBe('a&quot;b&#39;c&lt;d&gt;e&amp;f')
  })

  it('writes script literals that cannot close the script element', () => {
    const literal = toSandboxScriptLiteral('</script><!--\u2028"')
    expect(literal).not.toMatch(/[<>]/)
    expect(literal).not.toContain('\u2028')
    // Still the same string once evaluated as JSON/JS.
    expect(JSON.parse(literal)).toBe('</script><!--\u2028"')
  })
})

describe('buildSandboxDocument', () => {
  const base = { nonce: NONCE, id: ID }

  it('puts the CSP meta first in <head>', () => {
    const doc = buildSandboxDocument({ ...base, html: '<p>Hi</p>' })
    expect(doc.startsWith('<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="')).toBe(true)
    expect(doc).toContain(`content="default-src &#39;none&#39;; base-uri &#39;none&#39;`)
  })

  it('injects no script without allowScripts', () => {
    const doc = buildSandboxDocument({ ...base, html: '' })
    expect(doc).not.toContain('<script')
    expect(doc).not.toContain('script-src')
  })

  it('injects the nonce’d reporter with allowScripts', () => {
    const doc = buildSandboxDocument({ ...base, html: '', allowScripts: true })
    expect(doc).toContain(`<script nonce="${NONCE}">`)
    expect(doc).toContain(JSON.stringify(SANDBOX_FRAME_MESSAGE_TYPE))
    expect(doc).toContain(JSON.stringify(ID))
    expect(doc).toContain('parent.postMessage({type:t,id:i,height:h},"*")')
  })

  it('includes no-referrer, base target and the theme stylesheet', () => {
    const doc = buildSandboxDocument({ ...base, html: '', themeTokens: { background: '0 0% 4%' } })
    expect(doc).toContain('<meta name="referrer" content="no-referrer">')
    expect(doc).toContain('<base target="_blank">')
    expect(doc).toContain(`<style nonce="${NONCE}">:root{--background:0 0% 4%}`)
  })

  it.each([
    '</script><script>alert(1)</script>',
    '"></iframe><script>alert(1)</script>',
    `'><img src=x onerror=alert(1)>`,
    '</style></head><body onload=alert(1)>',
    '<!--',
    '<meta http-equiv="Content-Security-Policy" content="default-src *">',
    '<plaintext>',
  ])('keeps hostile HTML as the unaltered suffix after every injected part: %j', (html) => {
    for (const allowScripts of [false, true]) {
      const head = buildSandboxDocumentHead({ ...base, allowScripts })
      const doc = buildSandboxDocument({ ...base, allowScripts, html })
      expect(doc).toBe(head + html)
      // The injected head is identical regardless of the untrusted body.
      expect(buildSandboxDocument({ ...base, allowScripts, html: '' })).toBe(head)
    }
  })

  it('escapes a hostile instance id inside the reporter script', () => {
    const id = '</script><script>alert(1)</script>'
    const head = buildSandboxDocumentHead({ nonce: NONCE, id, allowScripts: true })
    // Exactly one script open and one close: the id cannot end the script early.
    expect(head.match(/<script/g)).toHaveLength(1)
    expect(head.match(/<\/script>/g)).toHaveLength(1)
    expect(head).toContain('\\u003c/script\\u003e')
  })

  it('is deterministic for the same inputs', () => {
    const options = { ...base, html: '<b>x</b>', allowScripts: true }
    expect(buildSandboxDocument(options)).toBe(buildSandboxDocument(options))
  })
})

describe('readSandboxFrameHeight', () => {
  const frameWindow = { name: 'frame' }
  const expected = { source: frameWindow, id: ID }
  const message = (data: unknown, source: unknown = frameWindow, origin = 'null') => ({ data, source, origin })
  const report = (height: unknown, id = ID) => ({ type: SANDBOX_FRAME_MESSAGE_TYPE, id, height })

  it('accepts a report from the frame window', () => {
    expect(readSandboxFrameHeight(message(report(120)), expected)).toBe(120)
  })

  it('rounds fractional heights up', () => {
    expect(readSandboxFrameHeight(message(report(120.2)), expected)).toBe(121)
  })

  it('ignores a message from any other window, even with origin "null"', () => {
    expect(readSandboxFrameHeight(message(report(120), { name: 'other' }), expected)).toBeNull()
    expect(readSandboxFrameHeight(message(report(120), null), expected)).toBeNull()
  })

  it('ignores everything while the frame window is unknown', () => {
    expect(readSandboxFrameHeight(message(report(120), null), { source: null, id: ID })).toBeNull()
    expect(readSandboxFrameHeight(message(report(120), undefined), { source: undefined, id: ID })).toBeNull()
  })

  it('requires the opaque origin', () => {
    expect(readSandboxFrameHeight(message(report(120), frameWindow, 'https://evil.example'), expected)).toBeNull()
  })

  it('requires the type and this instance id', () => {
    expect(readSandboxFrameHeight(message({ ...report(120), type: 'other' }), expected)).toBeNull()
    expect(readSandboxFrameHeight(message(report(120, 'frame-2')), expected)).toBeNull()
  })

  it.each([[-1], [Number.NaN], [Number.POSITIVE_INFINITY], ['120'], [null], [undefined]])(
    'rejects height %j',
    (height) => {
      expect(readSandboxFrameHeight(message(report(height)), expected)).toBeNull()
    },
  )

  it.each([[null], ['str'], [42], [undefined]])('rejects non-object data %j', (data) => {
    expect(readSandboxFrameHeight(message(data), expected)).toBeNull()
  })

  it('clamps a huge report to the ceiling', () => {
    expect(readSandboxFrameHeight(message(report(1e9)), expected)).toBe(SANDBOX_FRAME_HEIGHT_CEILING)
  })
})

describe('resolveSandboxFrameHeight', () => {
  const max = 400

  it('scripts off: fixed max height, control always offered', () => {
    expect(resolveSandboxFrameHeight({ measured: null, measurable: false, maxHeight: max, expanded: false })).toEqual({
      height: max,
      canExpand: true,
    })
    expect(resolveSandboxFrameHeight({ measured: null, measurable: false, maxHeight: max, expanded: true })).toEqual({
      height: SANDBOX_FRAME_UNMEASURED_EXPANDED_HEIGHT,
      canExpand: true,
    })
  })

  it('scripts on, before the first report: max height, no control yet', () => {
    expect(resolveSandboxFrameHeight({ measured: null, measurable: true, maxHeight: max, expanded: false })).toEqual({
      height: max,
      canExpand: false,
    })
  })

  it('short content: its own height, no control', () => {
    for (const expanded of [false, true]) {
      expect(resolveSandboxFrameHeight({ measured: 120, measurable: true, maxHeight: max, expanded })).toEqual({
        height: 120,
        canExpand: false,
      })
    }
  })

  it('exactly the cap does not overflow', () => {
    expect(resolveSandboxFrameHeight({ measured: max, measurable: true, maxHeight: max, expanded: false })).toEqual({
      height: max,
      canExpand: false,
    })
  })

  it('tall content: clamped while collapsed, full when expanded', () => {
    expect(resolveSandboxFrameHeight({ measured: 900, measurable: true, maxHeight: max, expanded: false })).toEqual({
      height: max,
      canExpand: true,
    })
    expect(resolveSandboxFrameHeight({ measured: 900, measurable: true, maxHeight: max, expanded: true })).toEqual({
      height: 900,
      canExpand: true,
    })
  })

  it('never exceeds the ceiling, never goes negative', () => {
    expect(
      resolveSandboxFrameHeight({ measured: 1e9, measurable: true, maxHeight: max, expanded: true }).height,
    ).toBe(SANDBOX_FRAME_HEIGHT_CEILING)
    expect(resolveSandboxFrameHeight({ measured: -5, measurable: true, maxHeight: max, expanded: false }).height).toBe(0)
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects maxHeight %d', (maxHeight) => {
    expect(() =>
      resolveSandboxFrameHeight({ measured: null, measurable: false, maxHeight, expanded: false }),
    ).toThrow(SandboxFrameConfigError)
  })
})

describe('labels and styles', () => {
  it('merges label overrides over defaults', () => {
    expect(resolveSandboxFrameLabels({ expand: 'Mehr' })).toEqual({ ...SANDBOX_FRAME_DEFAULT_LABELS, expand: 'Mehr' })
  })

  it('iframe variants carry a focus ring and hide while loading', () => {
    expect(sandboxFrameIframeVariants()).toContain('focus-visible:ring-ring')
    expect(sandboxFrameIframeVariants({ state: 'loading' })).toContain('opacity-0')
    expect(sandboxFrameIframeVariants({ state: 'ready' })).toContain('opacity-100')
  })

  it('actions reuse Button styles with a 44px minimum target', () => {
    expect(sandboxFrameActionClass).toContain('min-h-11')
    expect(sandboxFrameActionClass).toContain('focus-visible:ring-2')
  })
})
