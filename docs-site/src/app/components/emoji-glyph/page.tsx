import { EmojiGlyphExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const emojiGlyphProps = [
  {
    name: 'emoji',
    type: 'string',
    description: 'The emoji to draw, e.g. "👍". One grapheme; anything else is drawn as native text.',
  },
  {
    name: 'size',
    type: 'number | string',
    default: "'1em'",
    description:
      'A number is logical pixels (as in Flutter), emitted as rem so it follows the reader’s font size; a string is any CSS length.',
  },
  {
    name: 'animate',
    type: 'boolean',
    default: 'true',
    description:
      'Play the animated art where it exists. `false` always shows the Twemoji still; `prefers-reduced-motion` does too, whatever this says.',
  },
  {
    name: 'animatedBaseUrl',
    type: 'string',
    default: 'pinned jsDelivr mirror of the Flutter assets',
    description: 'Directory holding `<key>.json` animated art. Point it at your own copy to self-host.',
  },
  {
    name: 'twemojiBaseUrl',
    type: 'string',
    default: 'pinned jsDelivr Twemoji',
    description: 'Directory holding the Twemoji SVG stills.',
  },
  {
    name: 'loadAnimation',
    type: '(request: { url, container, signal }) => Promise<{ destroy(): void }>',
    default: 'lottieEmojiGlyphLoader',
    description:
      'Mounts the animation on first use. The default lazily imports lottie-web and fetches the JSON; inject your own player or a fake in tests.',
  },
  {
    name: 'onAnimationError',
    type: '(error: unknown) => void',
    description: 'Called when the animated art fails to load. The still glyph stays in place.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { EmojiGlyph, Button } from '@refraction-ui/react'

export function ThumbsUpReaction({ count }: { count: number }) {
  // EmojiGlyph is decorative; the button carries the meaning.
  return (
    <Button variant="outline" aria-label={\`Thumbs up, \${count} reactions\`}>
      <EmojiGlyph emoji="👍" size={20} />
      {count}
    </Button>
  )
}`

const selfHostCode = `// Copy packages/flutter/assets/emoji_animated/*.json to /public/emoji-animated
// and the Twemoji SVGs to /public/emoji, then:
<EmojiGlyph emoji="🔥" animatedBaseUrl="/emoji-animated" twemojiBaseUrl="/emoji" />`

const keyCode = `import { emojiGlyphKey, resolveEmojiGlyphSources } from '@refraction-ui/react'

emojiGlyphKey('❤️')    // '2764'         (U+FE0F left out)
emojiGlyphKey('👍🏽')   // '1f44d_1f3fd'

resolveEmojiGlyphSources('👍').map((s) => s.kind)
// ['animated', 'twemoji', 'native']
resolveEmojiGlyphSources('👍', { animate: false }).map((s) => s.kind)
// ['twemoji', 'native']`

const code = 'text-xs bg-muted px-1 rounded'

export default function EmojiGlyphPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Emoji Glyph</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          One emoji, drawn the same on every platform: the animated Noto art where the
          library ships one, otherwise the Twemoji still, otherwise the native glyph.
          The same component as Flutter&apos;s <code className={code}>RefractionEmojiGlyph</code>,
          with the same props and the same art.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Reactions people use most come animated. Numeric sizes are logical pixels,
          emitted as rem.
        </p>
        <EmojiGlyphExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Fallback order</h2>
        <p className="text-sm text-muted-foreground">
          Every emoji takes the same path: animated art if its key is in the shared
          manifest, then the Twemoji still, then the native glyph. The native glyph
          renders at once (also on the server) and art fades in over it, so a slow or
          failed load never leaves an empty box. An emoji that gains an animation in
          the shared manifest animates on every platform.
        </p>
        <EmojiGlyphExamples section="fallback" />
        <CodeBlock code={keyCode} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Still</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>animate={'{false}'}</code> never loads the animation.
          With <code className={code}>prefers-reduced-motion: reduce</code> every glyph
          shows its still, and a playing animation stops as soon as the setting changes.
        </p>
        <EmojiGlyphExamples section="still" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">In reactions</h2>
        <p className="text-sm text-muted-foreground">
          The glyph is decorative, so the control around it names the reaction and its
          count, and shows pressed state with its fill as well as <code className={code}>aria-pressed</code>.
        </p>
        <EmojiGlyphExamples section="reactions" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Loading and self-hosting</h2>
        <p className="text-sm text-muted-foreground">
          Nothing animated is in your initial bundle. The first time an animated glyph
          comes near the viewport it fetches one Lottie file (usually 10–100 kB) and
          dynamic-imports the lottie-web light player (about 47 kB gzipped, once per
          page). Files are cached and shared between glyphs. By default both art sets
          come from jsDelivr, pinned to a release: the animated files are the ones the
          Flutter package bundles, byte for byte. To keep requests on your own origin,
          copy them and pass the directories:
        </p>
        <EmojiGlyphExamples section="self-hosted" />
        <CodeBlock code={selfHostCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Always <code className={code}>aria-hidden</code> and never focusable: you supply
            the meaning with a label on the surrounding control or visually hidden text.
          </li>
          <li>
            Respects <code className={code}>prefers-reduced-motion</code>: no animation is
            loaded or played, and the cross-fade between layers is turned off.
          </li>
          <li>Sizes are rem or em, so glyphs scale with the reader&apos;s font size.</li>
          <li>
            When you make a glyph interactive, give the control a 44 px target and a visible
            focus ring, as in the reactions example.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Licences</h2>
        <p className="text-sm text-muted-foreground">
          Both art sets require attribution under{' '}
          <a className="text-primary underline underline-offset-4" href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
          . Keep these credits in your app, for example on an About or Licences screen:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Animated emoji:{' '}
            <a className="text-primary underline underline-offset-4" href="https://googlefonts.github.io/noto-emoji-animation/">
              Noto animated emoji
            </a>
            , Copyright Google Inc. and contributors, CC BY 4.0.
          </li>
          <li>
            Still emoji:{' '}
            <a className="text-primary underline underline-offset-4" href="https://github.com/jdecked/twemoji">
              Twemoji
            </a>
            , Copyright Twitter, Inc and contributors, CC BY 4.0.
          </li>
          <li>
            Player:{' '}
            <a className="text-primary underline underline-offset-4" href="https://github.com/airbnb/lottie-web">
              lottie-web
            </a>
            , MIT.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={emojiGlyphProps} />
      </section>
    </div>
  )
}
