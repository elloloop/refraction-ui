import {
  SHORTCUT_KEY_DISPLAY,
  SHORTCUT_MAC_KEY_DISPLAY,
  isMacPlatform,
} from '@refraction-ui/keyboard-shortcut'

/**
 * Which legend set to print. `'mac'` uses Apple glyphs and names (⌥ Option,
 * ⌘ Command); `'windows'` covers every non-Apple platform (Windows, Linux,
 * ChromeOS), which share the `Ctrl` / `Alt` legends — the same binary split
 * ShortcutBadge makes.
 */
export type KeycapPlatform = 'mac' | 'windows'

export type KeycapSize = 'sm' | 'md' | 'lg'

/** Which of a pair of keys (left / right Option, Shift, …) is meant. */
export type KeyLegendSide = 'left' | 'right'

/**
 * What a legend prints: the platform glyph (⌥), the word (Option), or both
 * (⌥ Option). Keys without a glyph print their word in every mode.
 */
export type KeyLegendShow = 'glyph' | 'word' | 'both'

/** Platform assumed when nothing is injected and there is no `navigator` (SSR). */
export const DEFAULT_KEYCAP_PLATFORM: KeycapPlatform = 'windows'

/**
 * The platform's primary modifier: ⌘ on macOS, Ctrl elsewhere. Write `Mod`
 * when a shortcut means "Command on Mac, Control everywhere else".
 */
export const KEY_LEGEND_PRIMARY_MODIFIER = 'Mod'

/** Words spoken before the key name for a sided key ("Right Option"). */
export const KEY_LEGEND_SIDE_NAMES: Readonly<Record<KeyLegendSide, string>> = {
  left: 'Left',
  right: 'Right',
}

/**
 * Aliases accepted for `word`, mapped to the canonical key ids that the
 * ShortcutBadge glyph tables use. Lookup is case-insensitive.
 */
const KEY_ALIASES: Readonly<Record<string, string>> = {
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  opt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  return: 'Enter',
  backspace: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  escape: 'Escape',
  esc: 'Escape',
  tab: 'Tab',
  space: ' ',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
}

const ARROW_NAMES: Readonly<Record<string, string>> = {
  ArrowUp: 'Up Arrow',
  ArrowDown: 'Down Arrow',
  ArrowLeft: 'Left Arrow',
  ArrowRight: 'Right Arrow',
}

/**
 * Spoken / printed words per platform. The glyphs come from ShortcutBadge's
 * tables; these are the names a screen reader should hear instead of them.
 */
const MAC_KEY_NAMES: Readonly<Record<string, string>> = {
  Meta: 'Command',
  Ctrl: 'Control',
  Alt: 'Option',
  Shift: 'Shift',
  Enter: 'Return',
  Backspace: 'Delete',
  Delete: 'Forward Delete',
  Escape: 'Escape',
  Tab: 'Tab',
  ' ': 'Space',
  ...ARROW_NAMES,
}

const WINDOWS_KEY_NAMES: Readonly<Record<string, string>> = {
  Meta: 'Meta',
  Ctrl: 'Ctrl',
  Alt: 'Alt',
  Shift: 'Shift',
  Enter: 'Enter',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Escape: 'Escape',
  Tab: 'Tab',
  ' ': 'Space',
  ...ARROW_NAMES,
}

const KEY_NAMES: Readonly<Record<KeycapPlatform, Readonly<Record<string, string>>>> = {
  mac: MAC_KEY_NAMES,
  windows: WINDOWS_KEY_NAMES,
}

const KEY_GLYPHS: Readonly<Record<KeycapPlatform, Readonly<Record<string, string>>>> = {
  mac: SHORTCUT_MAC_KEY_DISPLAY,
  windows: SHORTCUT_KEY_DISPLAY,
}

const PRIMARY_MODIFIER_KEY: Readonly<Record<KeycapPlatform, string>> = {
  mac: 'Meta',
  windows: 'Ctrl',
}

/** Detects the platform from `navigator`, via ShortcutBadge's detection. */
export function detectKeycapPlatform(): KeycapPlatform {
  return isMacPlatform() ? 'mac' : 'windows'
}

/** The injected platform when given, otherwise the detected one. */
export function resolveKeycapPlatform(platform?: KeycapPlatform): KeycapPlatform {
  return platform ?? detectKeycapPlatform()
}

/**
 * Canonical key id for `word` on `platform`: aliases fold together
 * (`Cmd` → `Meta`, `Option` → `Alt`), `Mod` becomes the platform's primary
 * modifier, single characters are upper-cased, and any other word (`Fn`,
 * `Caps Lock`) is kept as written.
 */
export function normalizeKeyLegendKey(word: string, platform: KeycapPlatform): string {
  if (word === ' ') return ' '
  const trimmed = word.trim()
  const lower = trimmed.toLowerCase()
  if (lower === KEY_LEGEND_PRIMARY_MODIFIER.toLowerCase()) {
    return PRIMARY_MODIFIER_KEY[platform]
  }
  const alias = KEY_ALIASES[lower]
  if (alias !== undefined) return alias
  return trimmed.length === 1 ? trimmed.toUpperCase() : trimmed
}

/** The printed glyph for a key (⌥ on macOS, `Alt` elsewhere); its word when it has none. */
export function getKeyLegendGlyph(word: string, platform: KeycapPlatform): string {
  const key = normalizeKeyLegendKey(word, platform)
  return KEY_GLYPHS[platform][key] ?? getKeyLegendName(word, platform)
}

/** The key's name as a word (Option on macOS, Alt elsewhere). */
export function getKeyLegendName(word: string, platform: KeycapPlatform): string {
  const key = normalizeKeyLegendKey(word, platform)
  return KEY_NAMES[platform][key] ?? key
}

/** What a screen reader hears: the side and the name, never the glyph ("Right Option"). */
export function formatKeyLegendLabel(
  word: string,
  platform: KeycapPlatform,
  side?: KeyLegendSide,
): string {
  const name = getKeyLegendName(word, platform)
  return side ? `${KEY_LEGEND_SIDE_NAMES[side]} ${name}` : name
}

export interface KeyLegendOptions {
  /** The key, as an id or a word: `Alt`, `Option`, `Mod`, `Shift`, `Enter`, `K`, `Fn`. */
  word: string
  /** Which of a pair of keys is meant. */
  side?: KeyLegendSide
  /** Legend set to print. */
  platform: KeycapPlatform
  /** Print the glyph, the word, or both. Default `'glyph'`. */
  show?: KeyLegendShow
}

export interface KeyLegendAPI {
  /** Canonical key id after alias folding (`Option` → `Alt`). */
  key: string
  /** Printed glyph (or the word when the key has no glyph). */
  glyph: string
  /** The key's name as a word. */
  name: string
  /** Visible legend text for the requested `show` mode. */
  text: string
  /** Visible side word ("Right"), when a side is given. */
  sideText?: string
  /** Accessible name: side + name, never the glyph. */
  label: string
}

/** Text printed for `show`; `both` collapses to one word when glyph and name match. */
function legendText(glyph: string, name: string, show: KeyLegendShow): string {
  if (show === 'word') return name
  if (show === 'both' && glyph !== name) return `${glyph} ${name}`
  return glyph
}

/** Resolves everything a KeyLegend adapter prints and announces. */
export function createKeyLegend(options: KeyLegendOptions): KeyLegendAPI {
  const { word, side, platform, show = 'glyph' } = options
  const glyph = getKeyLegendGlyph(word, platform)
  const name = getKeyLegendName(word, platform)
  return {
    key: normalizeKeyLegendKey(word, platform),
    glyph,
    name,
    text: legendText(glyph, name, show),
    sideText: side ? KEY_LEGEND_SIDE_NAMES[side] : undefined,
    label: formatKeyLegendLabel(word, platform, side),
  }
}

export interface KeycapOptions {
  size?: KeycapSize
  /** The key is held down. */
  pressed?: boolean
  /** The key is emphasised (e.g. the key the user should press next). */
  highlighted?: boolean
  /** Minimum width: a number is pixels, a string any CSS length (`'4rem'`). */
  minWidth?: number | string
}

export interface KeycapAPI {
  size: KeycapSize
  pressed: boolean
  highlighted: boolean
  /** CSS `min-width`, or undefined when not set. */
  minWidth?: string
  /** State hooks for styling and tests; strings so they serialise identically in SSR. */
  dataAttributes: Record<string, string>
}

/** Turns `minWidth` into a CSS length; non-finite or negative numbers are ignored. */
export function resolveKeycapMinWidth(minWidth?: number | string): string | undefined {
  if (typeof minWidth === 'string') return minWidth.trim() === '' ? undefined : minWidth
  if (typeof minWidth !== 'number' || !Number.isFinite(minWidth) || minWidth < 0) {
    return undefined
  }
  return `${minWidth}px`
}

/** Resolves Keycap state into style inputs and data attributes. */
export function createKeycap(options: KeycapOptions = {}): KeycapAPI {
  const { size = 'md', pressed = false, highlighted = false, minWidth } = options
  return {
    size,
    pressed,
    highlighted,
    minWidth: resolveKeycapMinWidth(minWidth),
    dataAttributes: {
      'data-size': size,
      'data-pressed': pressed ? 'true' : 'false',
      'data-highlighted': highlighted ? 'true' : 'false',
    },
  }
}
