import { ColorChipExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const colorChipProps = [
  {
    name: 'label',
    type: 'string',
    description:
      'Required. The visible text, always shown so chips are never told apart by colour alone. Also seeds the default colour.',
  },
  {
    name: 'dot',
    type: 'ColorChipCategory (1–8)',
    default: 'colorFor(label)',
    description: 'Categorical colour of the dot. Pass `colorFor(id)` to key the colour on a stable id.',
  },
  {
    name: 'wash',
    type: 'ColorChipCategory (1–8)',
    default: 'dot',
    description: 'Categorical colour of the pale background; the text uses its matching foreground.',
  },
  {
    name: 'hint',
    type: 'string',
    description: 'Secondary text after the label, e.g. "from the calendar".',
  },
  {
    name: 'onEdit',
    type: '() => void',
    description:
      'Makes the whole chip one edit button and is called when it is activated. Omit for a non-interactive chip.',
  },
  {
    name: 'editLabel',
    type: 'string',
    default: '`Edit ${label}`',
    description:
      'Accessible name of the edit button. Include the visible label (WCAG 2.5.3); a dev warning flags it when missing.',
  },
  {
    name: 'editTooltip',
    type: 'string',
    default: 'editLabel',
    description:
      'Tooltip shown on hover and keyboard focus of the edit button. An empty string turns it off.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { ColorChip, colorFor } from '@refraction-ui/react'

export function SpeakerChip({ speaker, onRename }) {
  return (
    <ColorChip
      label={speaker.name}
      dot={colorFor(speaker.id)}
      hint={speaker.fromCalendar ? 'from the calendar' : undefined}
      onEdit={onRename}
      editLabel={\`Rename \${speaker.name}\`}
      editTooltip="Rename this speaker"
    />
  )
}`

export default function ColorChipPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Color Chip</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A label with a stable categorical colour — a dot on a pale wash — and an optional hint,
          for telling speakers in a transcript or tags on a row apart. When editable, the whole
          chip is one button with its own label and tooltip.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Without <code className={code}>dot</code>, the colour comes from{' '}
          <code className={code}>colorFor(label)</code>: the same text always gets the same colour.
        </p>
        <ColorChipExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Hint</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>hint</code> adds secondary text after the label in a lighter
          weight.
        </p>
        <ColorChipExamples section="hint" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Editable</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className={code}>onEdit</code> to make the whole chip one button, marked with
          a pencil. It is named by <code className={code}>editLabel</code> and shows{' '}
          <code className={code}>editTooltip</code> on hover and keyboard focus.
        </p>
        <ColorChipExamples section="editable" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Palette</h2>
        <p className="text-sm text-muted-foreground">
          Eight categorical tokens, each a triple —{' '}
          <code className={code}>--category-N</code> (dot),{' '}
          <code className={code}>--category-N-wash</code> and{' '}
          <code className={code}>--category-N-foreground</code> — defined for light and dark in
          every theme. Text on wash meets WCAG AA (4.5:1) and the dot is at least 3:1 against
          the wash and the page.
        </p>
        <ColorChipExamples section="palette" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">In a transcript</h2>
        <p className="text-sm text-muted-foreground">
          Key the colour on a stable id with <code className={code}>colorFor(id)</code> so a
          speaker keeps their colour when renamed, across sessions and platforms.{' '}
          <code className={code}>colorFor</code> is a 32-bit FNV-1a hash of the key&apos;s UTF-16
          code units, modulo 8.
        </p>
        <ColorChipExamples section="transcript" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The label is always visible, so colour is never the only cue. The dot and the
            separator are <code className={code}>aria-hidden</code>.
          </li>
          <li>
            A read-only chip is a plain <code className={code}>&lt;span&gt;</code>: not a tab stop
            and no role.
          </li>
          <li>
            An editable chip is a single native{' '}
            <code className={code}>&lt;button type=&quot;button&quot;&gt;</code> named by{' '}
            <code className={code}>editLabel</code>, reachable with Tab, activated with Enter or
            Space, with a visible focus ring and a hit area of at least 44 px. The hint is linked
            with <code className={code}>aria-describedby</code>.
          </li>
          <li>
            The tooltip appears on hover and keyboard focus and Escape dismisses it. The floating
            copy is <code className={code}>aria-hidden</code>; when it says more than the name, a
            screen-reader copy is linked as a description, so nothing is read twice.
          </li>
          <li>
            Transitions stop under <code className={code}>prefers-reduced-motion</code>. Text is
            rem-based, and a transparent border becomes visible in forced-colours mode.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={colorChipProps} />
      </section>
    </div>
  )
}
