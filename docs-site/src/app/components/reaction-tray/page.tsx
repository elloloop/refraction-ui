import { ReactionTrayExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const reactionTrayProps = [
  {
    name: 'options',
    type: 'ReactionTrayOption[]',
    description:
      'Every reaction, in order: `{ id, glyph, label, isActive? }`. `glyph` is an emoji string or any React node; `label` is the accessible name; `isActive` marks the current user’s reaction.',
  },
  {
    name: 'onSelected',
    type: '(option: ReactionTrayOption) => void',
    description:
      'Called with the picked option on click, Enter or Space. Flip its `isActive` in response to toggle.',
  },
  {
    name: 'inlineCount',
    type: 'number',
    default: '6',
    description: 'How many options show inline; the rest move behind “More”. No toggle when all fit.',
  },
  {
    name: 'initiallyExpanded',
    type: 'boolean',
    default: 'false',
    description: 'Start with the overflow options revealed.',
  },
  {
    name: 'moreLabel',
    type: 'string',
    default: "'More reactions'",
    description: 'Accessible name of the toggle while collapsed.',
  },
  {
    name: 'fewerLabel',
    type: 'string',
    default: "'Fewer reactions'",
    description: 'Accessible name of the toggle while expanded.',
  },
  {
    name: 'cellSize',
    type: 'number',
    default: '44',
    description:
      'Cell edge in CSS px, rendered in rem so it follows the user’s font size. Never below 44.',
  },
  {
    name: 'glyphSize',
    type: 'number',
    default: '24',
    description: 'Glyph size in CSS px, rendered in rem. Capped at the cell size.',
  },
  {
    name: 'autofocus',
    type: 'boolean',
    default: 'false',
    description: 'Focus the first cell on mount, e.g. when a long-press opens the tray.',
  },
  {
    name: 'renderGlyph',
    type: '(option: ReactionTrayOption) => React.ReactNode',
    default: 'option => option.glyph',
    description: 'Custom glyph painter (artwork, animation). The glyph is hidden from assistive tech either way.',
  },
  {
    name: 'aria-label',
    type: 'string',
    default: "'Reactions'",
    description: 'Accessible name of the grid.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the tray surface.',
  },
]

const usageCode = `import { ReactionTray, type ReactionTrayOption } from '@refraction-ui/react'

const initial: ReactionTrayOption[] = [
  { id: 'thumbs-up', glyph: '👍', label: 'Thumbs up' },
  { id: 'heart', glyph: '❤️', label: 'Heart', isActive: true },
  { id: 'joy', glyph: '😂', label: 'Tears of joy' },
  // …
]

export function MessageReactions() {
  const [options, setOptions] = React.useState(initial)

  return (
    <ReactionTray
      options={options}
      inlineCount={6}
      onSelected={(picked) =>
        setOptions((list) =>
          list.map((o) => (o.id === picked.id ? { ...o, isActive: !o.isActive } : o)),
        )
      }
      aria-label="React to message"
    />
  )
}`

export default function ReactionTrayPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reaction Tray</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A small set of quick reactions with the rest one step away behind “More” — for a
          message toolbar or a long-press menu. Each reaction is a toggle; the grid is fully
          keyboard navigable.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Six reactions inline, the rest behind the chevron. Pick one to toggle it; the glyph
          pops briefly.
        </p>
        <ReactionTrayExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Expanded with custom labels</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>initiallyExpanded</code> opens the overflow rows;{' '}
          <code className={code}>moreLabel</code> and <code className={code}>fewerLabel</code>{' '}
          name the toggle in each state.
        </p>
        <ReactionTrayExamples section="expanded" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Cell and glyph size</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>cellSize</code> and <code className={code}>glyphSize</code> are
          given in px and rendered in rem; cells never shrink below 44 px.
        </p>
        <ReactionTrayExamples section="sizes" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Custom glyphs</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>renderGlyph</code> swaps how a glyph is painted — artwork,
          an animation, or (here) a muted look for reactions you have not used.
        </p>
        <ReactionTrayExamples section="custom-glyph" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The tray is a <code className={code}>role=&quot;grid&quot;</code> with one tab stop.
            Arrow keys move in two dimensions, Home/End go to the ends of the row, and
            Ctrl+Home/Ctrl+End to the ends of the grid. Moves never wrap.
          </li>
          <li>
            Each reaction is a native button with <code className={code}>aria-pressed</code>,
            named by its <code className={code}>label</code>, so Enter and Space toggle it. The
            emoji itself is hidden from assistive tech so it is not read twice.
          </li>
          <li>
            The More/Fewer toggle carries <code className={code}>aria-expanded</code> and stays
            at the end of the first row, so focus remains on it while the extra rows open or
            close beneath.
          </li>
          <li>
            Active reactions get a visible border as well as a tint — not colour alone — and
            every cell shows a focus ring and is at least 44 × 44 px.
          </li>
          <li>
            The select pop and the chevron turn are switched off under{' '}
            <code className={code}>prefers-reduced-motion</code>.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={reactionTrayProps} />
      </section>
    </div>
  )
}
