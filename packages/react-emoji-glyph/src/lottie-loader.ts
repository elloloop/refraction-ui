/**
 * The animation seam: mounts one animated emoji into a container and returns
 * a handle to stop it. `EmojiGlyph` calls it on first use only, so nothing
 * about animation (player code or art) is in the initial bundle. Hosts and
 * tests inject their own; the default plays Lottie JSON with `lottie-web`.
 */
export interface EmojiGlyphAnimationHandle {
  /** Stops playback and removes everything the loader rendered. */
  destroy(): void
}

export interface EmojiGlyphAnimationRequest {
  /** Where the art lives (from `animatedBaseUrl` and the emoji key). */
  url: string
  /** Empty element to render into; it is already sized to the glyph. */
  container: HTMLElement
  /** Aborted when the glyph unmounts or stops wanting the animation. */
  signal: AbortSignal
}

export type EmojiGlyphAnimationLoader = (
  request: EmojiGlyphAnimationRequest,
) => Promise<EmojiGlyphAnimationHandle>

/** The slice of the `lottie-web` API the default loader uses. */
export interface EmojiGlyphLottiePlayer {
  loadAnimation(params: {
    container: Element
    renderer: 'svg'
    loop: boolean
    autoplay: boolean
    animationData: unknown
  }): { destroy(): void }
}

export interface LottieEmojiGlyphLoaderOptions {
  /** Reads one animation file as text. Defaults to a credential-less `fetch`. */
  fetchText?: (url: string) => Promise<string>
  /** Loads the player. Defaults to a dynamic import of `lottie-web`'s light build. */
  importPlayer?: () => Promise<EmojiGlyphLottiePlayer>
}

async function fetchAnimationText(url: string): Promise<string> {
  // Art is public and static: send no cookies and no referrer, like the
  // Twemoji stills (`referrerpolicy="no-referrer"`).
  const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' })
  if (!response.ok) throw new Error(`EmojiGlyph: ${url} answered HTTP ${response.status}`)
  return response.text()
}

async function importLottieLight(): Promise<EmojiGlyphLottiePlayer> {
  // The light build is the SVG renderer without expression support, so it
  // never evaluates code from an animation file (no `eval`, CSP-safe).
  const module = await import('lottie-web/build/player/lottie_light')
  return module.default
}

function abortError(): Error {
  const error = new Error('EmojiGlyph: animation load aborted')
  error.name = 'AbortError'
  return error
}

/**
 * Builds a Lottie loader. Files are fetched once per URL and shared across
 * glyphs; each glyph parses its own copy because the player mutates the data
 * it is given. A failed fetch is forgotten so a later glyph can retry it.
 */
export function createLottieEmojiGlyphLoader(
  options: LottieEmojiGlyphLoaderOptions = {},
): EmojiGlyphAnimationLoader {
  const fetchText = options.fetchText ?? fetchAnimationText
  const importPlayer = options.importPlayer ?? importLottieLight
  const files = new Map<string, Promise<string>>()

  function readFile(url: string): Promise<string> {
    const cached = files.get(url)
    if (cached) return cached
    const pending = fetchText(url)
    files.set(url, pending)
    // Eviction only; the rejection still reaches every caller of `pending`.
    pending.catch(() => files.delete(url))
    return pending
  }

  return async ({ url, container, signal }) => {
    if (signal.aborted) throw abortError()
    const [text, player] = await Promise.all([readFile(url), importPlayer()])
    if (signal.aborted) throw abortError()
    const animation = player.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: JSON.parse(text),
    })
    return { destroy: () => animation.destroy() }
  }
}

/** The default loader: Lottie JSON played by `lottie-web`, loaded on first use. */
export const lottieEmojiGlyphLoader: EmojiGlyphAnimationLoader =
  /* @__PURE__ */ createLottieEmojiGlyphLoader()
