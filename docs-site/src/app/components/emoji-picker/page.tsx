import { EmojiPickerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const emojiProps = [
  { name: 'onSelect', type: '(emoji: EmojiEntry) => void', description: 'Called with the selected emoji entry (glyph, name, category, keywords, shortcode).' },
  { name: 'onStickerSelect', type: '(sticker: StickerItem) => void', description: 'Called with the selected sticker.' },
  { name: 'recentEmojis', type: 'EmojiEntry[]', description: 'Initial recents, most-recent-first.' },
  { name: 'emojiRenderer', type: '(emoji: EmojiEntry) => ReactNode', default: 'twemojiRenderer', description: 'Render seam. Default paints uniform Twemoji SVGs; pass nativeEmojiRenderer (or your own) to swap.' },
  { name: 'twemojiBaseUrl', type: 'string', description: 'Base URL for Twemoji assets — point at a self-hosted mirror to avoid the public CDN.' },
  { name: 'stickerSets', type: 'StickerSet[]', default: '[STARTER_STICKER_SET]', description: 'Sticker sets for the ⭐ tab. Pass [] to hide the tab; pass host/third-party packs to extend it.' },
  { name: 'stickerRenderer', type: '(sticker: StickerItem) => ReactNode', default: 'defaultStickerRenderer', description: 'Sticker render seam (svg / image / lottie). Supply a Lottie player here for animated Lottie stickers.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { EmojiPicker } from '@refraction-ui/react-emoji-picker'

export function MyComponent() {
  // Uniform Twemoji glyphs by default; onSelect gives the full entry.
  return <EmojiPicker onSelect={(e) => console.log(e.emoji, e.shortcode)} />
}`
const seamCode = `import { EmojiPicker, nativeEmojiRenderer } from '@refraction-ui/react-emoji-picker'

// Swap the uniform Twemoji default for OS-native glyphs — data + picker unchanged.
<EmojiPicker emojiRenderer={nativeEmojiRenderer} />

// Or self-host the uniform assets (no public CDN):
<EmojiPicker twemojiBaseUrl="/emoji" />`
export default function EmojiPickerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Emoji Picker</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          The full modern emoji set (~1,900 base emoji, Unicode 16.0) with category tabs, fuzzy
          search, recents, and a stickers tab. One shared dataset in{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/emoji-picker</code>{' '}
          backs the picker, the composer&apos;s <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">:</code>{' '}
          trigger, and rich-editor shortcodes — they never diverge.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Browse categories or search, and click an emoji to select it. Category switches, hover, and press are animated (reduced-motion aware).</p>
        <EmojiPickerExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Uniform rendering (the render seam)</h2>
        <p className="text-sm text-muted-foreground">
          Native emoji look different on every OS. By default the picker renders{' '}
          <strong>uniform Twemoji SVGs</strong> (lazily loaded, one small file per glyph) so everyone
          sees the same set — WhatsApp&apos;s approach. Rendering flows through a single{' '}
          <code className="text-xs bg-muted px-1 rounded">emojiRenderer</code> seam
          (<code className="text-xs bg-muted px-1 rounded">codepoint → ReactNode</code>), so you can
          swap to native glyphs, a self-hosted mirror, or another set (Noto/Fluent/Lottie) with one
          prop — the data and the picker are untouched.
        </p>
        <EmojiPickerExamples section="seam" />
        <CodeBlock frameworks={{ react: seamCode, astro: '<!-- same emojiRenderer seam -->' }} />
        <p className="text-xs text-muted-foreground">
          <strong>Attribution:</strong> Twemoji graphics are © Twitter and the Twemoji contributors,
          licensed <a className="underline" href="https://creativecommons.org/licenses/by/4.0/">CC-BY 4.0</a>.
          Apps shipping the default Twemoji renderer must preserve this attribution.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Stickers</h2>
        <p className="text-sm text-muted-foreground">
          The ⭐ tab renders <code className="text-xs bg-muted px-1 rounded">stickerSets</code>. A small
          bundled starter pack ships by default (one sticker self-animates via SMIL to prove the
          animated path); host or future packs plug in through the same prop, and the{' '}
          <code className="text-xs bg-muted px-1 rounded">stickerRenderer</code> seam supports{' '}
          <code className="text-xs bg-muted px-1 rounded">svg</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">image</code> (static or animated WebP), and{' '}
          <code className="text-xs bg-muted px-1 rounded">lottie</code> (supply a player). Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">stickerSets={'{[]}'}</code> to hide the tab.
        </p>
        <EmojiPickerExamples section="stickers" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-emoji-picker" />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={emojiProps} /></section>
    </div>
  )
}
