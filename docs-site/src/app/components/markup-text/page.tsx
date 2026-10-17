import { MarkupTextExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const markupTextProps = [
  {
    name: 'text',
    type: 'string',
    description: 'Source text (required). Flutter `text`.',
  },
  {
    name: 'mode',
    type: "'markup' | 'message'",
    default: "'markup'",
    description:
      '`markup`: `**bold**`, `{token}` and `` `code` ``. `message`: `**bold**`, `` `code` ``, auto-linked URLs and `mentions`; braces are literal.',
  },
  {
    name: 'inline',
    type: 'Record<string, React.ReactNode>',
    description:
      'Nodes that replace `{token}` placeholders (markup mode). Flutter `inline`. A token with no node renders nothing and logs a development error.',
  },
  {
    name: 'mentions',
    type: 'MarkupTextMention[]',
    description:
      'Mention ranges `{ id, start, end, type? }` as UTF-16 offsets into `text` (message mode). Invalid or overlapping ranges are dropped with a development warning.',
  },
  {
    name: 'onMentionClick',
    type: '(mention: MarkupTextMention) => void',
    description: 'When set, mention chips render as buttons and this is called with the activated mention.',
  },
  {
    name: 'strongClassName',
    type: 'string',
    description: 'Extra classes for bold runs (default weight is `font-semibold`). Flutter `strongStyle`.',
  },
  {
    name: 'textAlign',
    type: "'start' | 'end' | 'left' | 'right' | 'center' | 'justify'",
    description: 'Horizontal alignment. Flutter `textAlign`. Makes a `span` root block-level.',
  },
  {
    name: 'linkTarget',
    type: "'_blank' | '_self'",
    default: "'_blank'",
    description: 'Where web links open. `mailto:` links never get a target.',
  },
  {
    name: 'newTabLabel',
    type: 'string',
    default: "'(opens in a new tab)'",
    description: 'Visually hidden hint appended to links that open a new tab.',
  },
  {
    name: 'as',
    type: "'span' | 'p' | 'div'",
    default: "'span'",
    description: 'Root element. `span` nests safely inside other text.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Classes for the root (text size, colour). Flutter `style`.',
  },
]

const usageCode = `import { MarkupText } from '@refraction-ui/react'

// Instruction copy: bold runs and inline nodes without splitting the sentence.
<MarkupText
  as="p"
  text="**Open Settings**, then press {save}."
  inline={{ save: <kbd>⌘S</kbd> }}
/>

// Message text: mentions from structured ranges, safe auto-links, inline code.
<MarkupText
  mode="message"
  text="Thanks @Ann! See https://example.com and run \`pnpm i\`."
  mentions={[{ id: 'user-ann', start: 7, end: 11, type: 'user' }]}
  onMentionClick={(mention) => openProfile(mention.id)}
/>

// The pure parser is exported too, for components that compose it.
import { parseMarkupText } from '@refraction-ui/react'
parseMarkupText('Press **{key}**')
// → [{ type: 'text', text: 'Press ', strong: false },
//    { type: 'token', name: 'key', strong: true }]`

const code = (value: string) => <code className="text-xs bg-muted px-1 rounded">{value}</code>

export default function MarkupTextPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Markup Text</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Inline rich text without HTML strings: bold runs and inline nodes (a keycap in a
          sentence) for instruction copy, and mention chips, safe links and inline code for
          message text. A pure parser turns the text into typed segments; nothing is ever
          injected with <code className="text-base">dangerouslySetInnerHTML</code>.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Instructions</h2>
        <p className="text-sm text-muted-foreground">
          Wrap words in {code('**')} to bold them and write {code('{name}')} where a node from{' '}
          {code('inline')} should appear. Bold does not nest: markers pair left to right, and an
          unterminated {code('**')} is shown as typed. Escape with a backslash ({code('\\{')},{' '}
          {code('\\*')}, {code('\\`')}, {code('\\\\')}).
        </p>
        <MarkupTextExamples section="instructions" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Message text</h2>
        <p className="text-sm text-muted-foreground">
          With {code('mode="message"')}, mention chips come from structured {code('mentions')}{' '}
          ranges (UTF-16 offsets, the shape the composer&apos;s resolved tokens already use), never
          from matching {code('@')} in the text. A mention is atomic: markup inside its range is
          inert, and when ranges overlap the earliest one wins. URLs starting with{' '}
          {code('http://')}, {code('https://')}, {code('www.')} or {code('mailto:')} are linked,
          with trailing sentence punctuation and unbalanced brackets left outside the link.
        </p>
        <MarkupTextExamples section="message" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Link safety</h2>
        <p className="text-sm text-muted-foreground">
          Every link gets {code('rel="noopener noreferrer nofollow"')}. Any other scheme,
          including {code('javascript:')}, {code('data:')} and {code('vbscript:')}, stays plain
          text, and hrefs are re-checked with the URL parser before rendering.
        </p>
        <MarkupTextExamples section="safety" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Alignment</h2>
        <MarkupTextExamples section="alignment" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Missing tokens</h2>
        <p className="text-sm text-muted-foreground">
          A {code('{token}')} with no node in {code('inline')} renders nothing in every
          environment, so the braces are never shown and server and client markup always match.
          In development it also logs a {code('console.error')} (code{' '}
          {code('markup-text/missing-inline-node:<name>')}), once per token name. It does not
          throw: a copy typo should not take the page down.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Flutter mapping</h2>
        <p className="text-sm text-muted-foreground">
          The props keep the names of Flutter&apos;s {code('RefractionMarkupText')}:{' '}
          {code('text')} → {code('text')}, {code('style')} → {code('className')},{' '}
          {code('strongStyle')} → {code('strongClassName')}, {code('inline')} →{' '}
          {code('inline')}, {code('textAlign')} → {code('textAlign')}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Bold runs use {code('<strong>')}, so emphasis is semantic, not only visual.</li>
          <li>
            Links are underlined (not identified by colour alone), reachable with Tab, and carry a
            visually hidden {code('newTabLabel')} when they open a new tab.
          </li>
          <li>
            With {code('onMentionClick')}, mention chips are native buttons: Tab to reach, Enter or
            Space to activate. Without it they are plain text with no tab stop.
          </li>
          <li>
            Links and chips show the focus-visible ring; their colour transitions stop under{' '}
            {code('prefers-reduced-motion')}.
          </li>
          <li>Text inherits the surrounding rem-based size; inline code is sized relative to it.</li>
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
        <PropsTable props={markupTextProps} />
      </section>
    </div>
  )
}
