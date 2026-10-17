import { IconButtonExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const iconButtonProps = [
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'The glyph (usually an SVG). Rendered aria-hidden and sized to `iconSize`.',
  },
  {
    name: 'label',
    type: 'string',
    description:
      'Required. The accessible name (`aria-label`) and the tooltip text. Keep it the same in both toggle states.',
  },
  {
    name: 'showTooltip',
    type: 'boolean',
    default: 'true',
    description: 'Show `label` as a tooltip on hover and keyboard focus.',
  },
  {
    name: 'variant',
    type: "'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'tertiary' | 'destructive' | 'link'",
    default: "'ghost'",
    description: "Button's variants.",
  },
  {
    name: 'size',
    type: "'xs' | 'sm' | 'default'",
    default: "'default'",
    description: "Visual size: Button's square icon sizes (28, 32 and 36 px).",
  },
  {
    name: 'iconSize',
    type: 'number',
    default: '14 (xs) / 16',
    description: 'Glyph size in CSS pixels (rendered in rem so it follows the root font size).',
  },
  {
    name: 'minTapTarget',
    type: 'number',
    default: '44',
    description:
      'Minimum hit area in CSS pixels. Extends past the visual box without changing its size or the layout.',
  },
  {
    name: 'pressed',
    type: 'boolean',
    description:
      'Toggle state, exposed as `aria-pressed` and `data-state="on" | "off"`. Omit for a plain button.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the button natively and suppresses the tooltip.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the <button>.',
  },
  {
    name: '...props',
    type: 'ButtonHTMLAttributes',
    description:
      'Every native button attribute (`onClick`, `type`, `form`, `aria-*`, …) except `children`, `aria-label` and `aria-pressed`. `ref` is forwarded to the <button>.',
  },
]

const usageCode = `import { IconButton } from '@refraction-ui/react'
import { Mic, MicOff, PhoneOff } from 'lucide-react'

export function CallToolbar({ onClose }: { onClose: () => void }) {
  const [muted, setMuted] = React.useState(false)

  return (
    <div role="toolbar" aria-label="Call controls" className="flex gap-1">
      <IconButton
        icon={muted ? <MicOff /> : <Mic />}
        label="Mute microphone"
        pressed={muted}
        onClick={() => setMuted((m) => !m)}
      />
      <IconButton icon={<PhoneOff />} label="Leave call" variant="destructive" onClick={onClose} />
    </div>
  )
}`

export default function IconButtonPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Icon Button</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An icon-only button that cannot ship without a name. The required{' '}
          <code className={code}>label</code> is its accessible name and its tooltip, the hit
          area is at least 44 × 44 px whatever the visual size, and a{' '}
          <code className={code}>pressed</code> prop turns it into a toggle for mute and camera
          controls. Built on Button, so it shares Button&apos;s variants.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Hover or Tab to a button to see its label. The default variant is{' '}
          <code className={code}>ghost</code>, the usual look for toolbar chrome.
        </p>
        <IconButtonExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Variants</h2>
        <p className="text-sm text-muted-foreground">
          Every Button variant is available through <code className={code}>variant</code>.
        </p>
        <IconButtonExamples section="variants" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>size</code> picks one of Button&apos;s square icon sizes;{' '}
          <code className={code}>iconSize</code> sets the glyph independently.
        </p>
        <IconButtonExamples section="sizes" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Toggle</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className={code}>pressed</code> to get{' '}
          <code className={code}>aria-pressed</code>. Keep the label fixed and swap the icon so
          the state is not told by colour alone. A pressed ghost button also gets a fill and an
          inset shadow; with other variants, swap <code className={code}>variant</code>.
        </p>
        <IconButtonExamples section="toggle" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tap target</h2>
        <p className="text-sm text-muted-foreground">
          An invisible, absolutely positioned box centred on the button extends the hit area
          to <code className={code}>minTapTarget</code> (44 px by default). Leave enough space
          between neighbours so their extended areas do not overlap.
        </p>
        <IconButtonExamples section="tap-target" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Disabled</h2>
        <p className="text-sm text-muted-foreground">
          Disabled buttons are skipped by Tab and show no tooltip.
        </p>
        <IconButtonExamples section="disabled" />
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
            A native <code className={code}>&lt;button type=&quot;button&quot;&gt;</code> named by{' '}
            <code className={code}>aria-label</code>: reachable with Tab and activated with Enter
            or Space. The icon is <code className={code}>aria-hidden</code>.
          </li>
          <li>
            The tooltip appears on hover and on keyboard focus, and Escape dismisses it (the key
            still reaches an enclosing dialog). It repeats the name visually only: it is{' '}
            <code className={code}>aria-hidden</code> and not linked with{' '}
            <code className={code}>aria-describedby</code>, so screen readers hear the label once.
          </li>
          <li>
            The hit area is at least 44 × 44 px (WCAG 2.5.5) without changing the visual size
            or the layout around the button.
          </li>
          <li>
            Toggles expose <code className={code}>aria-pressed</code>; keep the label constant
            (&quot;Mute microphone&quot;) and swap the icon so the state is not conveyed by colour
            alone.
          </li>
          <li>
            A visible <code className={code}>focus-visible</code> ring; colour transitions and the
            tooltip animation stop under <code className={code}>prefers-reduced-motion</code>.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={iconButtonProps} />
      </section>
    </div>
  )
}
