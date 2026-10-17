import { HighlightTextExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const highlightTextProps = [
  {
    name: 'text',
    type: 'string',
    description: 'The full text to display. It is always rendered unchanged — matches are only wrapped.',
  },
  {
    name: 'query',
    type: 'string | readonly string[]',
    description:
      'A phrase, or an array of terms each highlighted independently. Matched literally (no regex). Empty / whitespace-only terms are ignored; terms are trimmed.',
  },
  {
    name: 'ranges',
    type: 'readonly HighlightRange[]',
    description:
      'Explicit `{ start, end }` spans (UTF-16 offsets, end-exclusive) to highlight, combined with `query` matches. Clamped to the text and widened to whole characters.',
  },
  {
    name: 'caseSensitive',
    type: 'boolean',
    default: 'false',
    description: 'Match letter case exactly.',
  },
  {
    name: 'diacriticSensitive',
    type: 'boolean',
    default: 'false',
    description: 'Treat “e” and “é” as different letters. Precomposed and decomposed forms still match each other.',
  },
  {
    name: 'wholeWord',
    type: 'boolean',
    default: 'false',
    description:
      'Only match whole tokens: no letter, number, combining mark or `_` directly before or after the match.',
  },
  {
    name: 'markClassName',
    type: 'string',
    description: 'Extra classes appended to every `<mark>`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the wrapping `<span>`.',
  },
]

const usageCode = `import { HighlightText, splitHighlightQuery } from '@refraction-ui/react'

export function SearchResult({ title, input }: { title: string; input: string }) {
  // One phrase: query="new file". Every word on its own: split the input.
  return <HighlightText text={title} query={splitHighlightQuery(input)} />
}`

const headlessCode = `import { getHighlightSegments } from '@refraction-ui/react'

getHighlightSegments('Crème brûlée', { query: 'creme' })
// [
//   { text: 'Crème', highlighted: true,  start: 0, end: 5 },
//   { text: ' brûlée', highlighted: false, start: 5, end: 12 },
// ]`

export default function HighlightTextPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Highlight Text</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Marks the parts of a text that match a query — or explicit ranges — with{' '}
          <code className={code}>&lt;mark&gt;</code>, so search results show why they matched.
          Case- and diacritic-insensitive by default, with an optional whole-word mode.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Search</h2>
        <p className="text-sm text-muted-foreground">
          Pass an array of terms (here from{' '}
          <code className={code}>splitHighlightQuery(input)</code>) to highlight every word
          independently. Overlapping and touching matches merge into one mark.
        </p>
        <HighlightTextExamples section="search" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Case and diacritics</h2>
        <p className="text-sm text-muted-foreground">
          By default “creme” matches “Crème”. Offsets always point into the original string, so
          the accented characters are highlighted, never shifted. Use{' '}
          <code className={code}>diacriticSensitive</code> and{' '}
          <code className={code}>caseSensitive</code> to be strict.
        </p>
        <HighlightTextExamples section="diacritics" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Whole words</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>wholeWord</code> skips matches inside a longer token. Scripts
          written without spaces (Chinese, Japanese, Thai) have no token boundaries to find, so
          leave it off for them.
        </p>
        <HighlightTextExamples section="whole-word" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Explicit ranges</h2>
        <p className="text-sm text-muted-foreground">
          When a fuzzy scorer already knows which characters matched, pass them as{' '}
          <code className={code}>ranges</code>. A range that would cut an emoji or an accented
          letter in half is widened to the whole character.
        </p>
        <HighlightTextExamples section="ranges" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Headless</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>getHighlightSegments(text, options)</code> returns the segments
          without rendering anything — use it to highlight inside your own markup. It also
          exports <code className={code}>findHighlightRanges</code>,{' '}
          <code className={code}>mergeHighlightRanges</code> and{' '}
          <code className={code}>splitHighlightQuery</code>.
        </p>
        <CodeBlock frameworks={{ react: headlessCode }} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Colour</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Marks use the existing <code className={code}>bg-warning</code> /{' '}
            <code className={code}>text-warning-foreground</code> pair: across every built-in
            theme it measures at least 5.9:1 (most themes 7.7:1 or more) in both light and dark,
            above WCAG AA for body text.
          </li>
          <li>
            It is deliberately not <code className={code}>bg-accent</code>: menus and command
            lists use accent for the active row, where an accent highlight would disappear.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Not colour alone: matches are also <code className={code}>font-semibold</code>, a cue
            that survives greyscale, colour-blindness and forced-colours modes.
          </li>
          <li>
            Matches are real <code className={code}>&lt;mark&gt;</code> elements. Some screen
            readers announce them as “highlighted” or “marked”; many read them as plain text,
            depending on the reader and its settings. So never rely on the mark to carry meaning
            — announce the result count (for example in a live region) next to the search box.
          </li>
          <li>
            The text is never altered or split into labelled pieces: assistive tech and
            copy-paste get the full string.
          </li>
          <li>
            It is static text: it takes no focus, adds no tab stops and has no animation, so
            there is nothing to reduce for <code className={code}>prefers-reduced-motion</code>.
          </li>
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
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={highlightTextProps} />
      </section>
    </div>
  )
}
