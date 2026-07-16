import * as React from 'react'
import {
  createEmojiPicker,
  EMOJI_DATA,
  CATEGORY_LABELS,
  searchEmojis,
  twemojiAssetUrl,
  DEFAULT_TWEMOJI_BASE_URL,
  STARTER_STICKER_SET,
  emojiPickerContainerStyles,
  emojiPickerSearchStyles,
  emojiPickerCategoryBarStyles,
  emojiPickerCategoryTabVariants,
  emojiPickerGridStyles,
  emojiPickerEmojiButtonStyles,
  emojiPickerSectionLabelStyles,
  emojiPickerPanelStyles,
  emojiPickerStickerButtonStyles,
  type EmojiCategory,
  type EmojiEntry,
  type StickerItem,
  type StickerSet,
} from '@refraction-ui/emoji-picker'
import { cn } from '@refraction-ui/shared'

/**
 * The emoji render seam: maps an emoji entry to a React node. Swap it to change
 * how glyphs are painted (native, Twemoji, Noto, Fluent, a Lottie player, …)
 * WITHOUT touching the data or the picker. The default is `twemojiRenderer`,
 * which lazily loads one small uniform SVG per glyph (WhatsApp-style "one look
 * everywhere"); `nativeEmojiRenderer` falls back to the OS glyph.
 */
export type EmojiRenderer = (emoji: EmojiEntry) => React.ReactNode

/** The sticker render seam: maps a sticker item to a React node. */
export type StickerRenderer = (sticker: StickerItem) => React.ReactNode

/** Renders the OS-native glyph (non-uniform across platforms). */
export const nativeEmojiRenderer: EmojiRenderer = (emoji) => emoji.emoji

/**
 * Renders a uniform Twemoji SVG (CC-BY 4.0 — attribution required, see the
 * package README). Lazily loaded per glyph; the native glyph is the `alt`
 * fallback if the asset can't load (e.g. offline).
 */
export function createTwemojiRenderer(baseUrl: string = DEFAULT_TWEMOJI_BASE_URL): EmojiRenderer {
  return (emoji) => (
    <img
      src={twemojiAssetUrl(emoji.emoji, baseUrl)}
      alt={emoji.emoji}
      draggable={false}
      loading="lazy"
      className="pointer-events-none h-[1.2em] w-[1.2em] select-none"
    />
  )
}

export const twemojiRenderer: EmojiRenderer = createTwemojiRenderer()

/**
 * Default sticker renderer. Handles inline SVG (`svg`, may self-animate via
 * SMIL) and image/animated-WebP URLs (`image`). For `lottie`, a host must
 * supply its own `stickerRenderer` with a Lottie player; the default shows the
 * static poster if `source` is a URL, else the label.
 */
export const defaultStickerRenderer: StickerRenderer = (sticker) => {
  if (sticker.kind === 'svg') {
    return (
      <span
        aria-hidden="true"
        className="block h-full w-full"
        dangerouslySetInnerHTML={{ __html: sticker.source }}
      />
    )
  }
  if (sticker.kind === 'image' || /^https?:|^data:/.test(sticker.source)) {
    return (
      <img
        src={sticker.source}
        alt={sticker.label}
        loading="lazy"
        draggable={false}
        className="pointer-events-none h-full w-full select-none object-contain"
      />
    )
  }
  return <span className="text-xs text-muted-foreground">{sticker.label}</span>
}

export interface EmojiPickerProps {
  /** Fired with the selected emoji entry. */
  onSelect?: (emoji: EmojiEntry) => void
  /** Fired with the selected sticker. */
  onStickerSelect?: (sticker: StickerItem) => void
  /** Initial recents (most-recent-first). */
  recentEmojis?: EmojiEntry[]
  className?: string
  /** Emoji render seam. Default: uniform Twemoji. */
  emojiRenderer?: EmojiRenderer
  /** Base URL for Twemoji assets (self-host to avoid the public CDN). */
  twemojiBaseUrl?: string
  /**
   * Sticker sets for the sticker tab. Defaults to the bundled starter pack;
   * pass `[]` to hide the sticker tab entirely.
   */
  stickerSets?: StickerSet[]
  /** Sticker render seam. Default: `defaultStickerRenderer`. */
  stickerRenderer?: StickerRenderer
}

const RECENT_LIMIT = 20

export function EmojiPicker({
  onSelect,
  onStickerSelect,
  recentEmojis: initialRecent = [],
  className,
  emojiRenderer,
  twemojiBaseUrl,
  stickerSets = [STARTER_STICKER_SET],
  stickerRenderer = defaultStickerRenderer,
}: EmojiPickerProps) {
  const [search, setSearch] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<EmojiCategory>('smileys')
  const [mode, setMode] = React.useState<'emoji' | 'sticker'>('emoji')
  const [recentEmojis, setRecentEmojis] = React.useState<EmojiEntry[]>(initialRecent)

  // Stable renderer: an explicit prop wins, else a Twemoji renderer bound to
  // the (optional) custom base URL.
  const renderEmoji = React.useMemo<EmojiRenderer>(
    () => emojiRenderer ?? createTwemojiRenderer(twemojiBaseUrl),
    [emojiRenderer, twemojiBaseUrl],
  )

  // Headless core drives ARIA + ids only; the grid data is derived here so the
  // full-set fuzzy search (`searchEmojis`) can rank results.
  const api = React.useMemo(() => createEmojiPicker({ recentEmojis }), [recentEmojis])

  const filteredEmojis = React.useMemo(() => {
    if (search.trim()) return searchEmojis(search)
    return EMOJI_DATA[activeCategory]
  }, [search, activeCategory])

  const handleSelect = (emoji: EmojiEntry) => {
    setRecentEmojis((prev) =>
      [emoji, ...prev.filter((e) => e.emoji !== emoji.emoji)].slice(0, RECENT_LIMIT),
    )
    onSelect?.(emoji)
  }

  const handleCategoryClick = (cat: EmojiCategory) => {
    setMode('emoji')
    setActiveCategory(cat)
    setSearch('')
  }

  const hasStickers = stickerSets.length > 0
  const showStickerTab = hasStickers && !search
  const panelKey = search ? 'search' : mode === 'sticker' ? 'sticker' : activeCategory

  return (
    <div className={cn(emojiPickerContainerStyles, className)} {...api.ariaProps}>
      <input
        {...api.searchInputProps}
        className={emojiPickerSearchStyles}
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearch(e.target.value)
          if (e.target.value) setMode('emoji')
        }}
      />

      {!search && (
        <div className={emojiPickerCategoryBarStyles} role="tablist" aria-label="Emoji categories">
          {api.categoryTabs.map((tab) => (
            <button
              key={tab.category}
              type="button"
              role="tab"
              aria-selected={mode === 'emoji' && tab.category === activeCategory}
              className={emojiPickerCategoryTabVariants({
                state: mode === 'emoji' && tab.category === activeCategory ? 'active' : 'inactive',
              })}
              onClick={() => handleCategoryClick(tab.category)}
              title={tab.label}
              aria-label={tab.label}
            >
              {tab.emoji}
            </button>
          ))}
          {showStickerTab && (
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'sticker'}
              className={emojiPickerCategoryTabVariants({
                state: mode === 'sticker' ? 'active' : 'inactive',
              })}
              onClick={() => {
                setMode('sticker')
                setSearch('')
              }}
              title="Stickers"
              aria-label="Stickers"
            >
              {'⭐'}
            </button>
          )}
        </div>
      )}

      {/* Swappable panel — keyed so a category/mode/search change cross-fades. */}
      <div key={panelKey} className={emojiPickerPanelStyles}>
        {mode === 'sticker' && !search ? (
          <StickerPanel
            stickerSets={stickerSets}
            render={stickerRenderer}
            onPick={(s) => onStickerSelect?.(s)}
          />
        ) : (
          <>
            {!search && recentEmojis.length > 0 && (
              <div>
                <div className={emojiPickerSectionLabelStyles}>Recent</div>
                <div className={emojiPickerGridStyles}>
                  {recentEmojis.map((emoji, i) => (
                    <button
                      key={`recent-${emoji.emoji}-${i}`}
                      type="button"
                      className={emojiPickerEmojiButtonStyles}
                      onClick={() => handleSelect(emoji)}
                      {...api.getEmojiAriaProps(emoji)}
                    >
                      {renderEmoji(emoji)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              {!search && (
                <div className={emojiPickerSectionLabelStyles}>{CATEGORY_LABELS[activeCategory]}</div>
              )}
              <div className={emojiPickerGridStyles} role="grid">
                {filteredEmojis.map((emoji, i) => (
                  <button
                    key={`${emoji.emoji}-${i}`}
                    type="button"
                    className={emojiPickerEmojiButtonStyles}
                    onClick={() => handleSelect(emoji)}
                    {...api.getEmojiAriaProps(emoji)}
                  >
                    {renderEmoji(emoji)}
                  </button>
                ))}
                {filteredEmojis.length === 0 && (
                  <div className="col-span-8 py-4 text-center text-sm text-muted-foreground">
                    No emojis found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StickerPanel({
  stickerSets,
  render,
  onPick,
}: {
  stickerSets: StickerSet[]
  render: StickerRenderer
  onPick: (sticker: StickerItem) => void
}) {
  return (
    <div className="max-h-64 overflow-y-auto p-1">
      {stickerSets.map((set) => (
        <div key={set.id}>
          <div className={emojiPickerSectionLabelStyles}>{set.label}</div>
          {set.stickers.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No stickers yet
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1 p-1">
              {set.stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  className={emojiPickerStickerButtonStyles}
                  onClick={() => onPick(sticker)}
                  aria-label={sticker.label}
                  title={sticker.label}
                >
                  {render(sticker)}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

EmojiPicker.displayName = 'EmojiPicker'
