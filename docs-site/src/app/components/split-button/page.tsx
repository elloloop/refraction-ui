import { SplitButtonExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const variantType =
  "'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'tertiary' | 'destructive' | 'link'"

const rootProps = [
  {
    name: 'variant',
    type: variantType,
    default: "'default'",
    description: "Button's variants, applied to both parts.",
  },
  {
    name: 'size',
    type: "'xs' | 'sm' | 'default' | 'lg' | 'icon' | 'icon-sm' | 'icon-xs'",
    default: "'default'",
    description:
      "Button's sizes, applied to both parts. The caret is a square as tall as the action.",
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables both parts natively and closes the menu.',
  },
  {
    name: 'open',
    type: 'boolean',
    description: 'Controlled menu state. Pair with `onOpenChange`.',
  },
  {
    name: 'defaultOpen',
    type: 'boolean',
    default: 'false',
    description: 'Initial menu state when uncontrolled.',
  },
  {
    name: 'onOpenChange',
    type: '(open: boolean) => void',
    description: 'Called when the caret, a key press, an item or an outside press opens or closes the menu.',
  },
  {
    name: 'minTapTarget',
    type: 'number',
    default: '44',
    description:
      'Minimum hit area of each part in CSS pixels. Extends past the visual box without moving the layout.',
  },
  {
    name: '...props',
    type: 'HTMLAttributes<HTMLDivElement>',
    description:
      'Attributes for the `role="group"` wrapper, such as `aria-label` and `className`. `ref` is forwarded to it.',
  },
]

const actionProps = [
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'The visible label. An icon-only action also needs an `aria-label`.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables only the action. A disabled group always disables it.',
  },
  {
    name: '...props',
    type: 'ButtonProps',
    description:
      "Every Button prop (`onClick`, `loading`, `type`, `aria-*`, …) except `variant`, `size` and `asChild`, which come from the group. `ref` is forwarded to the <button>.",
  },
]

const triggerProps = [
  {
    name: 'label',
    type: 'string',
    default: "'More options'",
    description: 'The caret\'s accessible name (`aria-label`). Say what the menu holds: "Microphone options".',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    default: 'chevron',
    description: 'Replaces the default chevron glyph. Rendered inside the button; mark it `aria-hidden`.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables only the caret and closes the menu. A disabled group always disables it.',
  },
  {
    name: '...props',
    type: 'ButtonHTMLAttributes',
    description:
      'Every native button attribute except `aria-label` and `type` (the caret never submits). `ref` is forwarded to the <button>.',
  },
]

const menuProps = [
  {
    name: 'align',
    type: "'start' | 'center' | 'end'",
    default: "'end'",
    description:
      "Logical alignment to the caret. `end` lines the menu up with the control's end edge, in left-to-right and right-to-left layouts alike.",
  },
  {
    name: 'sideOffset',
    type: 'number',
    default: '4',
    description: 'Gap in px between the caret and the menu.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: '`DropdownMenuItem`, `DropdownMenuSeparator` and `DropdownMenuLabel`.',
  },
  {
    name: '...props',
    type: 'HTMLAttributes<HTMLDivElement>',
    description:
      'Attributes for the `role="menu"` element, which is named by the caret. `ref` is forwarded to it.',
  },
]

const usageCode = `import {
  SplitButton,
  SplitButtonAction,
  SplitButtonTrigger,
  SplitButtonMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@refraction-ui/react'

export function SaveButton({ onSave, onSaveDraft, onSaveCopy, onSaveTemplate }: SaveButtonProps) {
  return (
    <SplitButton aria-label="Save document">
      <SplitButtonAction onClick={onSave}>Save</SplitButtonAction>
      <SplitButtonTrigger label="More save options" />
      <SplitButtonMenu>
        <DropdownMenuItem onSelect={onSaveDraft}>Save as draft</DropdownMenuItem>
        <DropdownMenuItem onSelect={onSaveCopy}>Save a copy</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSaveTemplate}>Save as template</DropdownMenuItem>
      </SplitButtonMenu>
    </SplitButton>
  )
}`

export default function SplitButtonPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Split Button</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A primary action fused with a caret that opens a menu of secondary actions. Both
          parts are real buttons with their own names; the menu is{' '}
          <code className={code}>DropdownMenu</code>, so it keeps the same keyboard model, and
          both parts take Button&apos;s variants and sizes.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Press <strong>Save</strong> for the main action, or the caret (or focus it and press
          ArrowDown) for the others.
        </p>
        <SplitButtonExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Variants</h2>
        <p className="text-sm text-muted-foreground">
          Every Button variant is available through <code className={code}>variant</code>.
          Bordered variants share one border between the parts; the others are divided by a
          hairline in a tint of their own text colour.
        </p>
        <SplitButtonExamples section="variants" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>size</code> takes Button&apos;s sizes. The caret is always a
          square as tall as the action.
        </p>
        <SplitButtonExamples section="sizes" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Icon action</h2>
        <p className="text-sm text-muted-foreground">
          With an icon size the action is a square too, as in call controls: the action toggles
          the microphone and the caret picks the device. An icon-only action needs an{' '}
          <code className={code}>aria-label</code>, and the caret&apos;s{' '}
          <code className={code}>label</code> should say what its menu holds.
        </p>
        <SplitButtonExamples section="icon" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tap target</h2>
        <p className="text-sm text-muted-foreground">
          Each part&apos;s hit area extends to <code className={code}>minTapTarget</code> (44 px
          by default), however small the visual size, so the caret stays easy to hit.
        </p>
        <SplitButtonExamples section="tap-target" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Disabled</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>disabled</code> on the group disables both parts; on one part it
          disables only that part.
        </p>
        <SplitButtonExamples section="disabled" />
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
            Two native <code className={code}>&lt;button type=&quot;button&quot;&gt;</code>{' '}
            elements in a <code className={code}>role=&quot;group&quot;</code>, each a Tab stop with
            its own name. The caret is named &quot;More options&quot; unless you pass{' '}
            <code className={code}>label</code>; give the group an{' '}
            <code className={code}>aria-label</code> when the row has several.
          </li>
          <li>
            Enter and Space activate either part. The caret is a menu button (
            <code className={code}>aria-haspopup=&quot;menu&quot;</code>,{' '}
            <code className={code}>aria-expanded</code>,{' '}
            <code className={code}>aria-controls</code>): Enter, Space or ArrowDown opens the menu
            and focuses its first item, and the menu is labelled by the caret.
          </li>
          <li>
            In the menu, arrow keys move between items and skip disabled ones. Escape, or
            choosing an item, closes it and returns focus to the caret; Tab or a press outside
            closes it too.
          </li>
          <li>
            Disabled parts are disabled natively (and skipped by Tab). Each part&apos;s hit area
            is at least 44 × 44 px (WCAG 2.5.5) and the two never overlap.
          </li>
          <li>
            A visible <code className={code}>focus-visible</code> ring that sits above the other
            part; colours come from theme tokens and colour transitions stop under{' '}
            <code className={code}>prefers-reduced-motion</code>. Corners, the divider and the
            menu&apos;s alignment are logical, so right-to-left layouts mirror.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">SplitButton props</h2>
        <PropsTable props={rootProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          SplitButtonAction props
        </h2>
        <PropsTable props={actionProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          SplitButtonTrigger props
        </h2>
        <PropsTable props={triggerProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          SplitButtonMenu props
        </h2>
        <PropsTable props={menuProps} />
      </section>
    </div>
  )
}
