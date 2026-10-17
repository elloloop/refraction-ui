import { StatusBadgeExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const statusBadgeProps = [
  {
    name: 'label',
    type: 'string',
    description:
      'The status in words ("Allowed", "Off", "Checking…"). Required and always shown, so the status is never told by colour alone.',
  },
  {
    name: 'variant',
    type: "'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'tertiary' | 'positive' | 'caution' | 'done'",
    default: "'outline'",
    description:
      "One of Badge's variants, with Badge's exact styles. Pair a dot with `outline` or `secondary`: a dot in the same colour as a filled variant disappears.",
  },
  {
    name: 'icon',
    type: 'ReactNode',
    description:
      'Leading icon, decorative (`aria-hidden`). An svg child is sized to the label. Replaces a static `dotColor` dot; a pulsing dot replaces it while `pulsing`.',
  },
  {
    name: 'dotColor',
    type: "'primary' | 'success' | 'destructive' | 'warning' | 'info' | 'pending' | 'neutral' | 'muted'",
    description:
      'Semantic colour token for a leading LiveDot, never a raw CSS colour (anything else is ignored). Omit for no dot.',
  },
  {
    name: 'pulsing',
    type: 'boolean',
    default: 'false',
    description:
      'The status is still being worked out: draws a breathing LiveDot in `dotColor` (or `pending`). Under reduced motion the halo holds still.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the root `<span>`. Other span attributes (e.g. `role`, `id`) pass through.',
  },
]

const usageCode = `import { StatusBadge } from '@refraction-ui/react'

export function MicrophoneStatus({ state }: { state: 'checking' | 'allowed' | 'off' }) {
  if (state === 'checking') return <StatusBadge label="Checking…" pulsing />
  if (state === 'allowed') return <StatusBadge label="Allowed" dotColor="success" />
  return <StatusBadge label="Off" dotColor="muted" />
}`

const code = 'text-xs bg-muted px-1 rounded'

export default function StatusBadgePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Status Badge</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A badge with a leading dot or icon for a status in a word — the
          &ldquo;Allowed&rdquo;, &ldquo;Off&rdquo; and &ldquo;Checking…&rdquo; of setup and
          permission screens.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Give it a <code className={code}>label</code>, then a{' '}
          <code className={code}>dotColor</code>, an <code className={code}>icon</code>, or{' '}
          <code className={code}>pulsing</code>.
        </p>
        <StatusBadgeExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dot colours</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>dotColor</code> takes a LiveDot token name, so the dot
          follows light, dark and system themes.
        </p>
        <StatusBadgeExamples section="dot-colors" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Pulsing</h2>
        <p className="text-sm text-muted-foreground">
          While the status is being worked out, <code className={code}>pulsing</code>{' '}
          draws a breathing dot. Here the icon returns once the check settles.
        </p>
        <StatusBadgeExamples section="pulsing" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Icons</h2>
        <p className="text-sm text-muted-foreground">
          An icon suits filled variants, where a same-coloured dot would vanish.
        </p>
        <StatusBadgeExamples section="icons" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Variants</h2>
        <p className="text-sm text-muted-foreground">
          Every Badge variant, with Badge&apos;s own styles.
        </p>
        <StatusBadgeExamples section="variants" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">On a setup screen</h2>
        <StatusBadgeExamples section="setup-screen" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dot or icon: which wins</h2>
        <p className="text-sm text-muted-foreground">
          At most one mark sits before the label:
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <code className={code}>pulsing</code> — a breathing dot, even when an{' '}
            <code className={code}>icon</code> is given. &ldquo;Still checking&rdquo; is
            short-lived and must stay visible; the icon describes the settled state.
          </li>
          <li>
            <code className={code}>icon</code> — the icon; a static{' '}
            <code className={code}>dotColor</code> is ignored.
          </li>
          <li>
            <code className={code}>dotColor</code> — a static dot.
          </li>
          <li>None of these — the label alone.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Why it builds on Badge</h2>
        <p className="text-sm text-muted-foreground">
          StatusBadge reuses Badge&apos;s <code className={code}>badgeVariants</code>{' '}
          rather than StatusIndicator. It is a pill that takes Badge&apos;s{' '}
          <code className={code}>variant</code> names, and StatusIndicator is a bare dot
          with a muted caption, no surface and its own status types. The dot comes from
          LiveDot, which takes the same theme tokens and handles reduced motion. It
          renders a <code className={code}>&lt;span&gt;</code> (Badge renders a{' '}
          <code className={code}>&lt;div&gt;</code>), so it can sit inside a sentence,
          list row or button. It always uses Badge&apos;s <code className={code}>md</code>{' '}
          size because the <code className={code}>sm</code> size sets its text in pixels.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The label is always rendered as text, so the status never depends on the
            dot&apos;s colour.
          </li>
          <li>
            The dot and the icon are decorative (<code className={code}>aria-hidden</code>);
            the label carries the meaning.
          </li>
          <li>
            No role is added by default. A list of badges that were each a live region
            would make screen readers announce every one. When a single badge changes
            in place and the change should be announced, pass{' '}
            <code className={code}>role=&quot;status&quot;</code>. The element stays the
            same across updates, so the announcement works.
          </li>
          <li>
            <code className={code}>aria-busy</code> is not set while pulsing. It tells
            assistive technology to hold back the content until it is no longer busy,
            which would hide the &ldquo;Checking…&rdquo; label.
          </li>
          <li>
            Under <code className={code}>prefers-reduced-motion</code> the pulsing halo
            stops and holds still as a soft ring, so &ldquo;in progress&rdquo; still
            looks different without movement.
          </li>
          <li>
            It is not interactive and takes no focus. Put it next to the control that
            changes the status.
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
        <PropsTable props={statusBadgeProps} />
      </section>
    </div>
  )
}
