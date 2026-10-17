import { KeycapExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const keycapProps = [
  {
    name: 'legend',
    type: 'React.ReactNode',
    description:
      'What is printed on the key: a `<KeyLegend>`, or a string, which is shown as a `KeyLegend` with that `word` (so `"Alt"` prints ⌥ on macOS).',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Visual size. Text is rem-based, so it follows the user’s font size.',
  },
  {
    name: 'pressed',
    type: 'boolean',
    default: 'false',
    description: 'The key is held down: its lip flattens and it moves down.',
  },
  {
    name: 'highlighted',
    type: 'boolean',
    default: 'false',
    description: 'The key is emphasised (e.g. the one to press next) with a ring and a tint.',
  },
  {
    name: 'minWidth',
    type: 'number | string',
    description: 'Minimum width. A number is pixels; a string is any CSS length (`"6rem"`).',
  },
  {
    name: 'semanticLabel',
    type: 'string',
    description:
      'Overrides what a screen reader hears. The printed legend is then hidden from assistive tech.',
  },
  {
    name: 'platform',
    type: "'mac' | 'windows'",
    description:
      'Legend set for a string `legend`. Detected from the browser when omitted; inject it for deterministic SSR and tests.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const keyLegendProps = [
  {
    name: 'word',
    type: 'string',
    description:
      'The key, as an id or a word: `Alt`, `Option`, `Mod` (⌘ on macOS, Ctrl elsewhere), `Shift`, `Enter`, `K`, `Fn`. Known keys print platform glyphs and names; other words print as written. It is also the spoken name.',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'Custom artwork printed instead of the glyph or word. Decorative — `word` still names the key.',
  },
  {
    name: 'side',
    type: "'left' | 'right'",
    description: 'Which of a pair of keys is meant. Printed as a word and spoken first ("Right Option").',
  },
  {
    name: 'show',
    type: "'glyph' | 'word' | 'both'",
    default: "'glyph'",
    description: 'Print the glyph (⌥), the word (Option) or both (⌥ Option). Keys without a glyph print their word.',
  },
  {
    name: 'platform',
    type: "'mac' | 'windows'",
    description:
      "Legend set. `'windows'` covers every non-Apple platform. Detected when omitted; the server renders `'windows'` and the client switches after hydration.",
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { Keycap, KeyLegend } from '@refraction-ui/react'

export function DictationHint({ held }: { held: boolean }) {
  return (
    <p>
      Hold{' '}
      <Keycap
        size="sm"
        pressed={held}
        legend={<KeyLegend word="Option" side="right" />}
      />{' '}
      to dictate.
    </p>
  )
}

// "Mod" is ⌘ on macOS and Ctrl elsewhere. Pass platform for deterministic SSR.
export function SearchShortcut() {
  return (
    <span>
      <Keycap legend="Mod" /> <Keycap legend="K" />
    </span>
  )
}`

export default function KeycapPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Keycap</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A key as it is printed — <code className={code}>Keycap</code> draws the key and{' '}
          <code className={code}>KeyLegend</code> prints what is on it, with platform-aware
          glyphs (⌥ Option on macOS, Alt on Windows), a side, and pressed and highlighted states.
          Use it to tell people which physical key to hold or press.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          A string legend is a key id or a word. <code className={code}>Mod</code> is the
          platform&apos;s primary modifier; <code className={code}>minWidth</code> widens a key
          such as the space bar.
        </p>
        <KeycapExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Inline in a sentence</h2>
        <p className="text-sm text-muted-foreground">
          Keycaps sit on the text baseline, so they read naturally in instructions. A screen reader
          hears &quot;Hold Right Option to dictate&quot;, not the ⌥ glyph.
        </p>
        <KeycapExamples section="inline" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>sm</code> for running text, <code className={code}>md</code> for
          shortcut lists, <code className={code}>lg</code> for setup screens.
        </p>
        <KeycapExamples section="sizes" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Pressed and highlighted</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>pressed</code> flattens the key and moves it down;{' '}
          <code className={code}>highlighted</code> adds a ring. Both change shape, not just colour.
        </p>
        <KeycapExamples section="states" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Hold to talk</h2>
        <p className="text-sm text-muted-foreground">
          Drive <code className={code}>pressed</code> from real key events. Press and hold Alt
          (Option on a Mac) while this page has focus.
        </p>
        <KeycapExamples section="hold" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Legends</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>KeyLegend</code> prints a glyph, a word or both, an optional{' '}
          <code className={code}>side</code>, or your own <code className={code}>icon</code>.{' '}
          <code className={code}>semanticLabel</code> on the keycap replaces the spoken name.
        </p>
        <KeycapExamples section="legends" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Platforms</h2>
        <p className="text-sm text-muted-foreground">
          Glyphs and names reuse ShortcutBadge&apos;s platform mapping. Pass{' '}
          <code className={code}>platform</code> to pin the legend set; otherwise it is detected
          after hydration.
        </p>
        <KeycapExamples section="platforms" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Rendered as <code className={code}>&lt;kbd&gt;</code>. The printed glyph is{' '}
            <code className={code}>aria-hidden</code>; a visually hidden name (&quot;Right
            Option&quot;) is read instead, so it works inside running text.
          </li>
          <li>
            A keycap describes a key — it is not a control, so it is not focusable and has no
            role. Announce live state changes (a key becoming held) in your own{' '}
            <code className={code}>aria-live</code> region, as the hold example does.
          </li>
          <li>
            Pressed and highlighted are shown by shape (lip, offset, ring) as well as colour.
            Transitions stop under <code className={code}>prefers-reduced-motion</code>.
          </li>
          <li>Text sizes are rem-based and colours are theme tokens, so light, dark and system themes all work.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Keycap props</h2>
        <PropsTable props={keycapProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">KeyLegend props</h2>
        <PropsTable props={keyLegendProps} />
      </section>
    </div>
  )
}
