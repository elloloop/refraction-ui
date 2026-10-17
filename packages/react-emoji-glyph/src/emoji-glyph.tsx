import * as React from 'react'
import {
  EMOJI_GLYPH_PRELOAD_MARGIN,
  EMOJI_GLYPH_REDUCED_MOTION_QUERY,
  emojiGlyphArtClass,
  emojiGlyphClass,
  emojiGlyphCssSize,
  emojiGlyphLayerVariants,
  emojiGlyphNativeClass,
  getVisibleEmojiGlyphSource,
  resolveEmojiGlyphSources,
  type EmojiGlyphSize,
  type EmojiGlyphSource,
  type EmojiGlyphSourceKind,
} from '@refraction-ui/emoji-glyph'
import { cn } from '@refraction-ui/shared'
import {
  lottieEmojiGlyphLoader,
  type EmojiGlyphAnimationHandle,
  type EmojiGlyphAnimationLoader,
} from './lottie-loader.js'

export type { EmojiGlyphSize, EmojiGlyphSource, EmojiGlyphSourceKind }

export interface EmojiGlyphProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The emoji to draw, e.g. `"👍"`. One grapheme; anything else draws natively. */
  emoji: string
  /** Logical pixels (emitted as rem) or a CSS length. Default `1em`. */
  size?: EmojiGlyphSize
  /** Play animated art where it exists. Reduced motion always wins. Default `true`. */
  animate?: boolean
  /** Directory of `<key>.json` animated art. Defaults to the pinned jsDelivr mirror. */
  animatedBaseUrl?: string
  /** Directory of Twemoji SVG stills. Defaults to the pinned jsDelivr mirror. */
  twemojiBaseUrl?: string
  /** Mounts the animation; read when loading starts. Defaults to `lottie-web`. */
  loadAnimation?: EmojiGlyphAnimationLoader
  /** Called when animated art fails to load; the still glyph stays in place. */
  onAnimationError?: (error: unknown) => void
}

function readReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(EMOJI_GLYPH_REDUCED_MOTION_QUERY).matches
}

/** Tracks `prefers-reduced-motion`, live. `false` on the server. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(EMOJI_GLYPH_REDUCED_MOTION_QUERY)
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])
  return reduced
}

/** Becomes `true` once the element nears the viewport, and stays true. */
function useFirstSeen(element: HTMLElement | null, enabled: boolean): boolean {
  const [seen, setSeen] = React.useState(false)
  React.useEffect(() => {
    if (!enabled || seen || !element) return
    if (typeof IntersectionObserver !== 'function') {
      setSeen(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true)
      },
      { rootMargin: EMOJI_GLYPH_PRELOAD_MARGIN },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, enabled, seen])
  return seen
}

/** The latest value of a prop, readable from effects without re-running them. */
function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value)
  React.useEffect(() => {
    ref.current = value
  })
  return ref
}

/**
 * Mounts the animation into `container` while `url` is set; returns whether
 * it is playing. Unmounting, a new URL, or `url` going away stops it.
 */
function useAnimation(
  container: HTMLElement | null,
  url: string | undefined,
  loaderRef: React.MutableRefObject<EmojiGlyphAnimationLoader>,
  onErrorRef: React.MutableRefObject<((error: unknown) => void) | undefined>,
): boolean {
  const [readyUrl, setReadyUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    // Read the media query live: the state copy may lag one render behind.
    if (!url || !container || readReducedMotion()) return
    const controller = new AbortController()
    let handle: EmojiGlyphAnimationHandle | undefined
    loaderRef.current({ url, container, signal: controller.signal }).then(
      (loaded) => {
        if (controller.signal.aborted) {
          loaded.destroy()
          return
        }
        handle = loaded
        setReadyUrl(url)
      },
      (error: unknown) => {
        // A cancelled load is not a failure; a real one is reported and the
        // still glyph (already visible) simply stays.
        if (!controller.signal.aborted) onErrorRef.current?.(error)
      },
    )
    return () => {
      controller.abort()
      handle?.destroy()
      setReadyUrl(null)
    }
  }, [container, url, loaderRef, onErrorRef])
  return url !== undefined && readyUrl === url
}

function findSource<K extends EmojiGlyphSourceKind>(
  sources: EmojiGlyphSource[],
  kind: K,
): Extract<EmojiGlyphSource, { kind: K }> | undefined {
  return sources.find((source): source is Extract<EmojiGlyphSource, { kind: K }> => source.kind === kind)
}

function layerClass(visible: boolean, base: string): string {
  return cn(base, emojiGlyphLayerVariants({ visible: visible ? 'true' : 'false' }))
}

/**
 * EmojiGlyph — one emoji drawn from the library's art: the animated Noto
 * Lottie where one ships, otherwise the Twemoji still, otherwise the native
 * glyph. The native glyph renders at once (also on the server) and art fades
 * in over it as it loads, so the box never jumps and a failed load leaves a
 * readable glyph. Animation loads on first sight only; `animate={false}` and
 * `prefers-reduced-motion` keep the still. Decorative: always `aria-hidden`,
 * the caller supplies the meaning (e.g. a labelled button around it).
 */
export const EmojiGlyph = React.forwardRef<HTMLSpanElement, EmojiGlyphProps>(
  function EmojiGlyph(
    {
      emoji,
      size,
      animate = true,
      animatedBaseUrl,
      twemojiBaseUrl,
      loadAnimation = lottieEmojiGlyphLoader,
      onAnimationError,
      className,
      style,
      ...props
    },
    forwardedRef,
  ) {
    const reducedMotion = useReducedMotion()
    const sources = React.useMemo(
      () => resolveEmojiGlyphSources(emoji, { animate, reducedMotion, animatedBaseUrl, twemojiBaseUrl }),
      [emoji, animate, reducedMotion, animatedBaseUrl, twemojiBaseUrl],
    )
    const animated = findSource(sources, 'animated')
    const still = findSource(sources, 'twemoji')

    const [root, setRoot] = React.useState<HTMLSpanElement | null>(null)
    const [animationContainer, setAnimationContainer] = React.useState<HTMLSpanElement | null>(null)
    const setRootRef = React.useCallback(
      (node: HTMLSpanElement | null) => {
        setRoot(node)
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef],
    )

    const loaderRef = useLatest(loadAnimation)
    const onErrorRef = useLatest(onAnimationError)
    const seen = useFirstSeen(root, animated !== undefined)
    const animationReady = useAnimation(animationContainer, seen ? animated?.url : undefined, loaderRef, onErrorRef)

    const [loadedStillUrl, setLoadedStillUrl] = React.useState<string | null>(null)
    const stillRef = React.useRef<HTMLImageElement>(null)
    React.useEffect(() => {
      // A server-rendered image can finish before React attaches onLoad.
      const image = stillRef.current
      if (still && image?.complete && image.naturalWidth > 0) setLoadedStillUrl(still.url)
    }, [still])
    const stillLoaded = still !== undefined && loadedStillUrl === still.url

    const visible = getVisibleEmojiGlyphSource({ animationReady, stillLoaded })
    const cssSize = emojiGlyphCssSize(size)

    return (
      <span
        ref={setRootRef}
        {...props}
        aria-hidden="true"
        data-emoji-glyph-source={visible}
        className={cn(emojiGlyphClass, className)}
        style={{ width: cssSize, height: cssSize, fontSize: cssSize, ...style }}
      >
        <span data-emoji-glyph-layer="native" className={layerClass(visible === 'native', emojiGlyphNativeClass)}>
          {emoji}
        </span>
        {still && (
          <img
            key={still.url}
            ref={stillRef}
            data-emoji-glyph-layer="twemoji"
            src={still.url}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setLoadedStillUrl(still.url)}
            onError={() => setLoadedStillUrl(null)}
            className={layerClass(visible === 'twemoji', emojiGlyphArtClass)}
          />
        )}
        {animated && (
          // One stable container: the loader's handle clears it on every swap,
          // and React never owns its children.
          <span
            ref={setAnimationContainer}
            data-emoji-glyph-layer="animated"
            className={layerClass(visible === 'animated', emojiGlyphArtClass)}
          />
        )}
      </span>
    )
  },
)
