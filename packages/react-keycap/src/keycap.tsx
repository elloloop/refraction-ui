import * as React from 'react'
import {
  createKeycap,
  createKeyLegend,
  detectKeycapPlatform,
  keycapVariants,
  keyLegendClass,
  keyLegendSideClass,
  keyLegendIconClass,
  DEFAULT_KEYCAP_PLATFORM,
  type KeycapPlatform,
  type KeycapSize,
  type KeyLegendSide,
  type KeyLegendShow,
} from '@refraction-ui/keycap'
import { cn } from '@refraction-ui/shared'

export type { KeycapPlatform, KeycapSize, KeyLegendSide, KeyLegendShow }

const SR_ONLY_CLASS = 'sr-only'

/** The platform never changes during a session, so there is nothing to subscribe to. */
function subscribeToNothing(): () => void {
  return () => {}
}

function serverPlatform(): KeycapPlatform {
  return DEFAULT_KEYCAP_PLATFORM
}

/**
 * The injected platform, else the detected one. During SSR and hydration the
 * default platform is used so server and client markup match; the detected
 * platform takes over right after hydration. Inject `platform` to skip that.
 */
function useKeycapPlatform(platform?: KeycapPlatform): KeycapPlatform {
  const detected = React.useSyncExternalStore(
    subscribeToNothing,
    detectKeycapPlatform,
    serverPlatform,
  )
  return platform ?? detected
}

// ---------------------------------------------------------------------------
// KeyLegend — what is printed on a key: a glyph, a word or an icon, plus a side
// ---------------------------------------------------------------------------

export interface KeyLegendProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * The key, as an id or a word: `Alt`, `Option`, `Mod` (⌘ / Ctrl), `Shift`,
   * `Enter`, `K`, `Fn`. Known keys print platform glyphs and names; any other
   * word prints as written. It is also what a screen reader hears.
   */
  word: string
  /** Custom artwork printed instead of the glyph / word. Decorative: `word` still names the key. */
  icon?: React.ReactNode
  /** Which of a pair of keys is meant ("Right Option"). */
  side?: KeyLegendSide
  /** Print the glyph (⌥), the word (Option) or both (⌥ Option). */
  show?: KeyLegendShow
  /** Legend set; detected from the browser when omitted. Inject for SSR / tests. */
  platform?: KeycapPlatform
}

/**
 * KeyLegend — the legend printed on a key. Visible glyphs are `aria-hidden`;
 * a visually hidden name ("Right Option") is what assistive tech reads, so it
 * works inline in a sentence without the reader announcing "⌥".
 */
export const KeyLegend = React.forwardRef<HTMLSpanElement, KeyLegendProps>(
  function KeyLegend(
    { word, icon, side, show = 'glyph', platform: platformProp, className, ...props },
    ref,
  ) {
    const platform = useKeycapPlatform(platformProp)
    const legend = createKeyLegend({ word, side, platform, show })
    const hasIcon = icon !== undefined && icon !== null

    return (
      <span
        ref={ref}
        className={cn(keyLegendClass, className)}
        data-platform={platform}
        data-side={side}
        {...props}
      >
        <span aria-hidden="true" className={keyLegendClass}>
          {legend.sideText && <span className={keyLegendSideClass}>{legend.sideText}</span>}
          {hasIcon ? <span className={keyLegendIconClass}>{icon}</span> : <span>{legend.text}</span>}
        </span>
        <span className={SR_ONLY_CLASS}>{legend.label}</span>
      </span>
    )
  },
)

// ---------------------------------------------------------------------------
// Keycap — a single key, with size, pressed and highlighted states
// ---------------------------------------------------------------------------

export interface KeycapProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * What is printed on the key: a `<KeyLegend>`, or a string, which is shown
   * as a `KeyLegend` with that `word` (so `"Alt"` prints ⌥ on macOS).
   */
  legend: React.ReactNode
  /** Visual size. */
  size?: KeycapSize
  /** The key is held down. */
  pressed?: boolean
  /** The key is emphasised, e.g. the one to press next. */
  highlighted?: boolean
  /** Minimum width: a number is pixels, a string any CSS length. */
  minWidth?: number | string
  /** Overrides what a screen reader hears; the printed legend is then hidden from it. */
  semanticLabel?: string
  /** Legend set for a string `legend`; detected when omitted. */
  platform?: KeycapPlatform
}

/**
 * Keycap — a key as it is printed, rendered as `<kbd>`. Non-interactive: it
 * is not focusable and states are driven by props. `pressed` flattens the
 * key's lip and nudges it down; `highlighted` adds a ring — neither relies on
 * colour alone.
 */
export const Keycap = React.forwardRef<HTMLElement, KeycapProps>(function Keycap(
  {
    legend,
    size = 'md',
    pressed = false,
    highlighted = false,
    minWidth,
    semanticLabel,
    platform,
    className,
    style,
    ...props
  },
  ref,
) {
  const api = createKeycap({ size, pressed, highlighted, minWidth })
  const printed =
    typeof legend === 'string' ? <KeyLegend word={legend} platform={platform} /> : legend

  return (
    <kbd
      ref={ref}
      className={cn(
        keycapVariants({
          size: api.size,
          pressed: api.pressed ? 'true' : 'false',
          highlighted: api.highlighted ? 'true' : 'false',
        }),
        className,
      )}
      style={api.minWidth === undefined ? style : { minWidth: api.minWidth, ...style }}
      {...api.dataAttributes}
      {...props}
    >
      {semanticLabel ? (
        <>
          <span aria-hidden="true" className={keyLegendClass}>
            {printed}
          </span>
          <span className={SR_ONLY_CLASS}>{semanticLabel}</span>
        </>
      ) : (
        printed
      )}
    </kbd>
  )
})
