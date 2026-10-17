/**
 * Headless core for SandboxFrame — show untrusted HTML in a locked-down
 * `srcdoc` iframe.
 *
 * Everything here is pure and deterministic: the caller injects the CSP nonce
 * (random bytes come from the adapter), the instance id and the theme token
 * values. The functions build three things the adapter renders verbatim:
 *
 * 1. the `sandbox` token list (opaque origin by default, scripts opt-in, never
 *    scripts together with same-origin);
 * 2. the Content-Security-Policy string (`default-src 'none'` baseline);
 * 3. the full `srcdoc` document, whose `<head>` starts with the CSP `<meta>`
 *    and whose untrusted body is the final, unaltered suffix of the string.
 *
 * Plus the parent-side rules for auto-height: which `message` events to trust
 * and how to clamp the reported height.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** `type` field of the height message posted by the injected reporter. */
export const SANDBOX_FRAME_MESSAGE_TYPE = 'refraction-ui:sandbox-frame:height'

/** Default collapsed height cap, in CSS pixels. */
export const SANDBOX_FRAME_DEFAULT_MAX_HEIGHT = 400

/**
 * Hard ceiling for any reported height, in CSS pixels. A report is
 * attacker-influenced data (the untrusted document decides its own layout, e.g.
 * `min-height: 110vh` grows on every resize), so even an expanded frame never
 * grows past this. Taller content scrolls inside the frame.
 */
export const SANDBOX_FRAME_HEIGHT_CEILING = 20_000

/**
 * Height of an expanded frame whose content height is unknown (scripts are
 * off, so nothing can measure it). Viewport-relative so it is useful on any
 * screen; the frame scrolls internally beyond it.
 */
export const SANDBOX_FRAME_UNMEASURED_EXPANDED_HEIGHT = '80vh'

/** Random bytes the adapter should draw for each CSP nonce (128 bits). */
export const SANDBOX_FRAME_NONCE_BYTES = 16

/** Shortest nonce accepted: 16 bytes of base64url without padding. */
const MIN_NONCE_LENGTH = 22

/** Longest theme token value forwarded into the frame. */
const MAX_THEME_VALUE_LENGTH = 256

/**
 * Theme tokens forwarded into the frame by default. They match the
 * `@refraction-ui/tailwind-config` custom properties (HSL triplets such as
 * `0 0% 100%`, plus `radius` and the font stacks).
 */
export const SANDBOX_FRAME_THEME_TOKENS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'muted',
  'muted-foreground',
  'primary',
  'primary-foreground',
  'accent',
  'accent-foreground',
  'border',
  'ring',
  'radius',
  'font-sans',
  'font-mono',
] as const

/** Default sources per CSP fetch directive. An empty list omits the directive, so it falls back to `default-src 'none'`. */
export const SANDBOX_FRAME_DEFAULT_CSP: Required<SandboxCspOptions> = {
  imgSrc: ['data:'],
  mediaSrc: [],
  fontSrc: [],
  styleSrc: ["'unsafe-inline'"],
  scriptSrc: [],
}

/** Default visible strings; every one is overridable for localisation. */
export const SANDBOX_FRAME_DEFAULT_LABELS: SandboxFrameLabels = {
  loading: 'Loading preview…',
  expand: 'Show more',
  collapse: 'Show less',
  navigationBlocked: 'This preview tried to navigate away, so it was stopped.',
  reload: 'Reload preview',
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Extra sandbox permissions a consumer may grant. `allow-scripts` is not in
 * this list on purpose — it is controlled by `allowScripts` so the CSP nonce
 * and height reporter stay in step with it. Navigation of the top page,
 * downloads, forms and modals are not grantable at all.
 */
export type SandboxFramePermission =
  | 'allow-same-origin'
  | 'allow-popups'
  | 'allow-popups-to-escape-sandbox'

/** Lifecycle of the frame as shown to the user. */
export type SandboxFrameStatus = 'loading' | 'ready' | 'error'

/** Visible strings rendered by the adapter. */
export interface SandboxFrameLabels {
  /** Shown while the frame's document is loading. */
  loading: string
  /** Expand control text while collapsed. */
  expand: string
  /** Expand control text while expanded. */
  collapse: string
  /** Error shown when the frame's content navigated away from its document. */
  navigationBlocked: string
  /** Button that restores the original document after an error. */
  reload: string
}

/** Configurable CSP fetch directives. Each entry is one CSP source expression. */
export interface SandboxCspOptions {
  /** `img-src` (default: `data:` only — remote images are tracking pixels). */
  imgSrc?: readonly string[]
  /** `media-src` (default: none). */
  mediaSrc?: readonly string[]
  /** `font-src` (default: none — the frame uses the system font fallback). */
  fontSrc?: readonly string[]
  /** `style-src` (default: `'unsafe-inline'`, so inline styles in the HTML work). */
  styleSrc?: readonly string[]
  /**
   * Extra `script-src` sources, used only when scripts are allowed. The nonce
   * for the injected height reporter is always added. Only explicit `https://`
   * hosts (optional port/path) and `'sha256|384|512-…'` hashes are accepted;
   * wildcards, schemes, `http:`/host-less sources, keywords and nonces are refused.
   */
  scriptSrc?: readonly string[]
}

/** Token name (without the leading `--`) → CSS value. */
export type SandboxThemeTokens = Readonly<Record<string, string>>

/** Thrown when a SandboxFrame configuration would weaken the sandbox. */
export class SandboxFrameConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SandboxFrameConfigError'
  }
}

// ---------------------------------------------------------------------------
// sandbox tokens
// ---------------------------------------------------------------------------

/** Grantable permissions in their canonical output order. */
const GRANTABLE_PERMISSIONS: readonly SandboxFramePermission[] = [
  'allow-same-origin',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
]

export interface SandboxTokenOptions {
  /** Adds `allow-scripts`. */
  allowScripts?: boolean
  /** Extra permissions (see {@link SandboxFramePermission}). */
  permissions?: readonly SandboxFramePermission[]
}

/**
 * Build the iframe `sandbox` token list.
 *
 * An empty list is the strictest sandbox (`sandbox=""`): opaque origin, no
 * scripts, no forms, no popups, no top navigation.
 *
 * Throws {@link SandboxFrameConfigError} for an unknown token (including
 * `allow-scripts`, which belongs to `allowScripts`) and for scripts together
 * with `allow-same-origin`: a same-origin script can reach
 * `window.frameElement` and remove its own `sandbox` attribute, after which it
 * runs with the host page's full privileges.
 */
export function buildSandboxTokens(options: SandboxTokenOptions = {}): string[] {
  const { allowScripts = false, permissions = [] } = options

  for (const permission of permissions) {
    if (!GRANTABLE_PERMISSIONS.includes(permission)) {
      throw new SandboxFrameConfigError(
        `SandboxFrame: unsupported sandbox permission "${String(permission)}". ` +
          `Allowed: ${GRANTABLE_PERMISSIONS.join(', ')}; scripts are enabled with allowScripts.`,
      )
    }
  }

  if (allowScripts && permissions.includes('allow-same-origin')) {
    throw new SandboxFrameConfigError(
      'SandboxFrame: refusing allow-scripts together with allow-same-origin — ' +
        'a same-origin script can remove its own sandbox and run with the host page’s privileges.',
    )
  }

  const granted = GRANTABLE_PERMISSIONS.filter((p) => permissions.includes(p))
  return allowScripts ? ['allow-scripts', ...granted] : granted
}

// ---------------------------------------------------------------------------
// CSP
// ---------------------------------------------------------------------------

/** A bare source (`data:`, `https://cdn.example.com`) or a quoted keyword/nonce/hash. */
const CSP_SOURCE_PATTERN = /^(?:'[A-Za-z0-9+/=_-]+'|[^\s;,'"<>\\]+)$/

/**
 * `script-src` is an allow-list, not a deny-list: every other source form
 * (wildcards like `https://*` or `*.com`, schemes like `https:`, host-less or
 * `http:` sources, and keywords like `'unsafe-eval'`, `'strict-dynamic'`,
 * `'unsafe-hashes'` or `'self'`) would let the untrusted document load or run
 * script the consumer never vetted. Only two forms are accepted:
 *
 * - an explicit `https://` host with an optional port and path — it names one
 *   origin the consumer trusts, and `https` stops a network attacker swapping
 *   the script;
 * - a `'sha256|384|512-…'` hash — it matches only the exact script it hashes.
 *
 * Consumer-supplied nonces are refused too: a fixed nonce is known to whoever
 * wrote the HTML, so it would let that HTML's own scripts run.
 */
const ALLOWED_SCRIPT_HOST_SOURCE =
  /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*(?::\d{1,5})?(?:\/[^*]*)?$/i
const ALLOWED_SCRIPT_HASH_SOURCE = /^'sha(?:256|384|512)-[A-Za-z0-9+/_-]+={0,2}'$/

const CSP_WILDCARD = '*'
const CSP_QUOTE = "'"

const NONCE_PATTERN = /^[A-Za-z0-9+/_-]+={0,2}$/

/** Throws unless `nonce` is a well-formed nonce of at least 128 bits. */
export function assertSandboxNonce(nonce: string): void {
  if (nonce.length < MIN_NONCE_LENGTH || !NONCE_PATTERN.test(nonce)) {
    throw new SandboxFrameConfigError(
      `SandboxFrame: invalid CSP nonce — expected at least ${MIN_NONCE_LENGTH} base64 characters.`,
    )
  }
}

function assertSources(directive: string, sources: readonly string[]): void {
  for (const source of sources) {
    if (!CSP_SOURCE_PATTERN.test(source)) {
      throw new SandboxFrameConfigError(
        `SandboxFrame: invalid ${directive} source ${JSON.stringify(source)}.`,
      )
    }
  }
}

/**
 * Validate consumer CSP options without building a policy. Adapters call this
 * during render so a bad configuration fails on the server too, before any
 * nonce exists.
 */
export function validateSandboxCspOptions(csp: SandboxCspOptions = {}): void {
  assertSources('img-src', csp.imgSrc ?? [])
  assertSources('media-src', csp.mediaSrc ?? [])
  assertSources('font-src', csp.fontSrc ?? [])
  assertSources('style-src', csp.styleSrc ?? [])
  const scriptSrc = csp.scriptSrc ?? []
  assertSources('script-src', scriptSrc)
  scriptSrc.forEach(assertScriptSource)
}

/** Throws unless `source` is an explicit https host or a script hash (see above). */
function assertScriptSource(source: string): void {
  if (ALLOWED_SCRIPT_HOST_SOURCE.test(source) || ALLOWED_SCRIPT_HASH_SOURCE.test(source)) return
  throw new SandboxFrameConfigError(
    `SandboxFrame: refusing script-src ${source} — ${scriptSourceRefusalReason(source)}, ` +
      'which would let the untrusted document run scripts you did not vet. ' +
      "Only explicit https:// hosts (e.g. https://cdn.example.com) and 'sha256-…' hashes are accepted.",
  )
}

function scriptSourceRefusalReason(source: string): string {
  if (source.includes(CSP_WILDCARD)) return 'wildcards are refused'
  if (source.startsWith(CSP_QUOTE)) return 'keywords and nonces are refused'
  return 'scheme-only, host-less and non-https sources are refused'
}

export interface SandboxCspInput {
  /** Consumer overrides; missing keys use {@link SANDBOX_FRAME_DEFAULT_CSP}. */
  csp?: SandboxCspOptions
  /** Whether the frame may run scripts (emits `script-src`). */
  allowScripts?: boolean
  /** Per-document nonce for the injected `<style>` / `<script>`. */
  nonce: string
}

function directive(name: string, sources: readonly string[]): string | null {
  return sources.length === 0 ? null : `${name} ${sources.join(' ')}`
}

/**
 * The `style-src` sources. CSP ignores `'unsafe-inline'` whenever a nonce is
 * present, so the nonce is added only when inline styles are not already
 * allowed — otherwise it would silently disable the HTML's own inline styles.
 */
function styleSources(styleSrc: readonly string[], nonce: string): string[] {
  return styleSrc.includes("'unsafe-inline'") ? [...styleSrc] : [`'nonce-${nonce}'`, ...styleSrc]
}

/**
 * Build the Content-Security-Policy for the frame document.
 *
 * Baseline: `default-src 'none'` (no network, frames, objects, workers or
 * connections), plus `base-uri 'none'` and `form-action 'none'`, which do not
 * fall back to `default-src`. `script-src` appears only when scripts are
 * allowed and then always carries the nonce, so the untrusted markup's own
 * inline scripts stay blocked; only the injected height reporter runs.
 */
export function buildSandboxCsp(input: SandboxCspInput): string {
  const { csp = {}, allowScripts = false, nonce } = input
  assertSandboxNonce(nonce)
  validateSandboxCspOptions(csp)
  const resolved = { ...SANDBOX_FRAME_DEFAULT_CSP, ...csp }

  return [
    "default-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    directive('img-src', resolved.imgSrc),
    directive('media-src', resolved.mediaSrc),
    directive('font-src', resolved.fontSrc),
    directive('style-src', styleSources(resolved.styleSrc, nonce)),
    allowScripts ? directive('script-src', [`'nonce-${nonce}'`, ...resolved.scriptSrc]) : null,
  ]
    .filter((part): part is string => part !== null)
    .join('; ')
}

/** Base64url alphabet (RFC 4648 §5) — safe inside a CSP and an HTML attribute. */
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const BITS_PER_BYTE = 8
const BITS_PER_CHAR = 6
const SIX_BIT_MASK = 0b111111

/**
 * Encode random bytes as an unpadded base64url nonce. Pure: the adapter passes
 * `crypto.getRandomValues(new Uint8Array(SANDBOX_FRAME_NONCE_BYTES))`.
 */
export function encodeSandboxNonce(bytes: Uint8Array): string {
  let out = ''
  let buffer = 0
  let bits = 0
  for (const byte of bytes) {
    buffer = (buffer << BITS_PER_BYTE) | byte
    bits += BITS_PER_BYTE
    while (bits >= BITS_PER_CHAR) {
      bits -= BITS_PER_CHAR
      out += BASE64URL_ALPHABET[(buffer >> bits) & SIX_BIT_MASK]
    }
    // Keep only the bits not yet emitted so the accumulator never overflows.
    buffer &= (1 << bits) - 1
  }
  if (bits > 0) {
    out += BASE64URL_ALPHABET[(buffer << (BITS_PER_CHAR - bits)) & SIX_BIT_MASK]
  }
  return out
}

// ---------------------------------------------------------------------------
// Theme tokens
// ---------------------------------------------------------------------------

const TOKEN_NAME_PATTERN = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/
/**
 * Characters a forwarded token value may contain: enough for HSL triplets,
 * lengths and quoted font stacks, never `<`, `{`, `}`, `;`, `\` or `!` — so a
 * value can neither close the `<style>` element nor add a declaration or rule.
 */
const TOKEN_VALUE_PATTERN = /^[A-Za-z0-9 %.,#()_+\-/'"]*$/
/** `url(` would turn a token into a fetch (still subject to the CSP). */
const TOKEN_URL_PATTERN = /url\s*\(/i

/** The CSS custom property a token is exposed as (`background` → `--background`). */
export function sandboxThemeVariable(name: string): string {
  return `--${name}`
}

/** Whether a token name/value pair can be forwarded into the frame safely. */
export function isSafeSandboxThemeToken(name: string, value: string): boolean {
  return (
    TOKEN_NAME_PATTERN.test(name) &&
    value.length > 0 &&
    value.length <= MAX_THEME_VALUE_LENGTH &&
    TOKEN_VALUE_PATTERN.test(value) &&
    !TOKEN_URL_PATTERN.test(value)
  )
}

/**
 * Collect theme tokens from the host using `read` (typically
 * `name => getComputedStyle(el).getPropertyValue('--' + name)`).
 *
 * Unset tokens are left out. Values that are not safe to forward (see
 * {@link isSafeSandboxThemeToken}) are left out too: host CSS may legitimately
 * hold arbitrary custom-property values, and the frame then falls back to its
 * defaults for that token rather than receiving markup it cannot contain.
 */
export function pickSandboxThemeTokens(
  read: (variable: string) => string,
  names: readonly string[] = SANDBOX_FRAME_THEME_TOKENS,
): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const name of names) {
    const value = read(sandboxThemeVariable(name)).trim()
    if (isSafeSandboxThemeToken(name, value)) tokens[name] = value
  }
  return tokens
}

/** Shallow equality for token maps (lets adapters skip needless reloads). */
export function areSandboxThemeTokensEqual(a: SandboxThemeTokens, b: SandboxThemeTokens): boolean {
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key])
}

/** Body padding inside the frame, so content does not touch the border. */
const FRAME_BODY_PADDING = '0.75rem'

/**
 * Base stylesheet for the frame. Missing tokens make `hsl(var(--x))` invalid
 * at computed-value time, which degrades to the browser default instead of
 * hardcoding a colour. Animations stop under `prefers-reduced-motion`, which
 * the frame inherits from the user's system.
 */
const FRAME_BASE_CSS = [
  `body{margin:0;padding:${FRAME_BODY_PADDING};background-color:hsl(var(--background));color:hsl(var(--foreground));font-family:var(--font-sans,system-ui,sans-serif);line-height:1.5;overflow-wrap:anywhere}`,
  'a{color:hsl(var(--primary))}',
  'hr{border:0;border-top:1px solid hsl(var(--border))}',
  'img,video,svg{max-width:100%;height:auto}',
  'pre,code,kbd{font-family:var(--font-mono,ui-monospace,monospace)}',
  '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}}',
].join('')

/**
 * Build the frame's stylesheet: theme tokens as `:root` custom properties,
 * then the base styles. Throws for a token that cannot be forwarded safely —
 * explicit tokens come from the developer, so a bad one is a bug to surface.
 */
export function buildSandboxThemeCss(tokens: SandboxThemeTokens = {}): string {
  const declarations = Object.entries(tokens).map(([name, value]) => {
    if (!isSafeSandboxThemeToken(name, value)) {
      throw new SandboxFrameConfigError(
        `SandboxFrame: theme token ${JSON.stringify(name)} has a value that cannot be forwarded safely.`,
      )
    }
    return `${sandboxThemeVariable(name)}:${value}`
  })
  const root = declarations.length > 0 ? `:root{${declarations.join(';')}}` : ''
  return root + FRAME_BASE_CSS
}

// ---------------------------------------------------------------------------
// srcdoc document
// ---------------------------------------------------------------------------

const HTML_ATTRIBUTE_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
}

/** Escape a string for a double-quoted HTML attribute. */
export function escapeSandboxAttribute(value: string): string {
  return value.replace(/[&"'<>]/g, (ch) => HTML_ATTRIBUTE_ESCAPES[ch])
}

/**
 * Serialise a value as a JavaScript literal that is safe inside `<script>`:
 * `<` (so `</script>` and `<!--` cannot appear), `>` , `&` and the JS line
 * separators U+2028/U+2029 are written as `\u` escapes.
 */
export function toSandboxScriptLiteral(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/**
 * The injected height reporter. It measures the root element (not
 * `scrollHeight`, which never drops below the viewport, so the frame could
 * never shrink) and posts `{ type, id, height }` to the parent on load and on
 * every resize. `"*"` is the target origin because an opaque-origin document
 * cannot know its parent's origin; the payload carries nothing but the height.
 */
function buildHeightReporter(id: string): string {
  return [
    '(function(){',
    `var t=${toSandboxScriptLiteral(SANDBOX_FRAME_MESSAGE_TYPE)},i=${toSandboxScriptLiteral(id)},l=-1;`,
    'function p(){var h=Math.ceil(document.documentElement.getBoundingClientRect().height);',
    'if(h===l)return;l=h;parent.postMessage({type:t,id:i,height:h},"*")}',
    'if(typeof ResizeObserver==="function"){new ResizeObserver(p).observe(document.documentElement)}',
    'addEventListener("load",p)',
    '})();',
  ].join('')
}

export interface SandboxDocumentOptions {
  /** The untrusted HTML. Inserted verbatim as the document body. */
  html: string
  /** Per-document CSP nonce (see {@link encodeSandboxNonce}). */
  nonce: string
  /** Per-instance id echoed in height messages. */
  id: string
  /** Inject the height reporter and emit `script-src`. */
  allowScripts?: boolean
  /** CSP overrides. */
  csp?: SandboxCspOptions
  /** Theme tokens forwarded as CSS custom properties. */
  themeTokens?: SandboxThemeTokens
}

/**
 * Everything that precedes the untrusted HTML in the frame document.
 *
 * The CSP `<meta>` is the first element in `<head>` — a meta policy only
 * governs content parsed after it. Then: no referrer for any allowed fetch,
 * `<base target="_blank">` so links do not navigate the frame itself (without
 * `allow-popups` they are inert), the theme stylesheet and, with scripts, the
 * reporter. Every injected value is validated or escaped.
 */
export function buildSandboxDocumentHead(options: Omit<SandboxDocumentOptions, 'html'>): string {
  const { nonce, id, allowScripts = false, csp, themeTokens } = options
  const policy = buildSandboxCsp({ csp, allowScripts, nonce })
  const nonceAttr = escapeSandboxAttribute(nonce)

  return [
    '<!DOCTYPE html><html><head>',
    `<meta http-equiv="Content-Security-Policy" content="${escapeSandboxAttribute(policy)}">`,
    '<meta name="referrer" content="no-referrer">',
    '<base target="_blank">',
    `<style nonce="${nonceAttr}">${buildSandboxThemeCss(themeTokens)}</style>`,
    allowScripts ? `<script nonce="${nonceAttr}">${buildHeightReporter(id)}</script>` : '',
    '</head><body>',
  ].join('')
}

/**
 * Build the complete `srcdoc` document.
 *
 * The untrusted HTML is the final suffix of the string and nothing is injected
 * after it, so markup such as `</script>`, `</head>` or an unclosed `<!--`
 * cannot alter or swallow any injected part. (Closing `</body></html>` are
 * optional in HTML and deliberately omitted for that reason.) The string is
 * meant for the iframe's `srcdoc` attribute; the framework escapes it as an
 * attribute value.
 */
export function buildSandboxDocument(options: SandboxDocumentOptions): string {
  const { html, ...head } = options
  return buildSandboxDocumentHead(head) + html
}

// ---------------------------------------------------------------------------
// Auto-height
// ---------------------------------------------------------------------------

/** The parts of a `MessageEvent` the height check reads. */
export interface SandboxMessageEventLike {
  source: unknown
  origin: string
  data: unknown
}

export interface SandboxMessageExpectation {
  /** The frame's `contentWindow` at the time the message arrives. */
  source: unknown
  /** The instance id the reporter was built with. */
  id: string
}

/** The origin of an opaque-origin (sandboxed, no same-origin) document. */
const OPAQUE_ORIGIN = 'null'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Decide whether a `message` event is a height report from *this* frame and
 * return the height (clamped to the ceiling), or `null` to ignore it.
 *
 * Why `event.source` and not `event.origin`: the frame has an opaque origin,
 * so its messages arrive with `origin === "null"` — the same string every other
 * sandboxed iframe, `data:` URL or `file:` page reports. An origin check
 * cannot tell this frame apart from any of them. `event.source` is the sending
 * window object itself, so comparing it with the iframe's `contentWindow` is
 * an identity check no other window can pass. The origin is still required to
 * be `"null"` (the reporter only exists with scripts on, which forbids
 * same-origin) and the id must match, as defence in depth.
 */
export function readSandboxFrameHeight(
  event: SandboxMessageEventLike,
  expected: SandboxMessageExpectation,
): number | null {
  if (expected.source == null || event.source !== expected.source) return null
  if (event.origin !== OPAQUE_ORIGIN) return null
  const { data } = event
  if (!isRecord(data)) return null
  if (data.type !== SANDBOX_FRAME_MESSAGE_TYPE || data.id !== expected.id) return null
  const { height } = data
  if (typeof height !== 'number' || !Number.isFinite(height) || height < 0) return null
  return Math.min(Math.ceil(height), SANDBOX_FRAME_HEIGHT_CEILING)
}

export interface SandboxHeightInput {
  /** Last reported content height, or `null` if none has arrived. */
  measured: number | null
  /** Whether a height can ever be reported (scripts allowed). */
  measurable: boolean
  /** Collapsed height cap. */
  maxHeight: number
  /** Whether the user expanded the frame. */
  expanded: boolean
}

export interface SandboxHeightResult {
  /** CSS height: pixels, or a CSS length when unmeasured and expanded. */
  height: number | string
  /** Whether to offer the expand/collapse control. */
  canExpand: boolean
}

/**
 * Resolve the frame's height.
 *
 * - Measured: collapsed shows `min(measured, maxHeight)`; expanded shows the
 *   measured height. The control appears only when content exceeds the cap.
 * - Unmeasurable (scripts off): a fixed `maxHeight` that scrolls internally,
 *   with the control always offered; expanded uses a viewport-relative height.
 * - Measurable but not yet reported: `maxHeight`, no control until a report.
 */
export function resolveSandboxFrameHeight(input: SandboxHeightInput): SandboxHeightResult {
  const { measured, measurable, maxHeight, expanded } = input
  if (!Number.isFinite(maxHeight) || maxHeight <= 0) {
    throw new SandboxFrameConfigError('SandboxFrame: maxHeight must be a positive number of pixels.')
  }

  if (measured === null) {
    if (!measurable) {
      return { height: expanded ? SANDBOX_FRAME_UNMEASURED_EXPANDED_HEIGHT : maxHeight, canExpand: true }
    }
    return { height: maxHeight, canExpand: false }
  }

  const content = Math.min(Math.max(0, measured), SANDBOX_FRAME_HEIGHT_CEILING)
  const overflows = content > maxHeight
  return {
    height: expanded || !overflows ? content : maxHeight,
    canExpand: overflows,
  }
}

/**
 * Throws unless `title` is a non-empty accessible name. An iframe without one
 * is announced as an anonymous frame, so the title is required, not optional.
 */
export function assertSandboxFrameTitle(title: string): void {
  if (title.trim() === '') {
    throw new SandboxFrameConfigError('SandboxFrame: `title` must be a non-empty accessible name for the frame.')
  }
}

/** Merge partial label overrides over the defaults. */
export function resolveSandboxFrameLabels(labels: Partial<SandboxFrameLabels> = {}): SandboxFrameLabels {
  return { ...SANDBOX_FRAME_DEFAULT_LABELS, ...labels }
}
