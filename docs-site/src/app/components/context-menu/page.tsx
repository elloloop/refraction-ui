import { ContextMenuExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const rootProps = [
  { name: 'open', type: 'boolean', description: 'Whether the menu is open (controlled).' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Whether the menu starts open (uncontrolled).' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the menu opens or closes.' },
]

const triggerProps = [
  {
    name: 'asChild',
    type: 'boolean',
    default: 'false',
    description: 'Merge the trigger behaviour onto the single child element instead of wrapping it in a `<div>`.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: "Let the browser's native context menu through instead." },
  {
    name: 'longPressDelay',
    type: 'number',
    default: '500 (CONTEXT_MENU_LONG_PRESS_DELAY_MS)',
    description: 'Milliseconds a touch or pen must rest before the menu opens.',
  },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const contentProps = [
  {
    name: 'collisionPadding',
    type: 'number',
    default: '8',
    description: 'Minimum gap in px kept from the viewport edge when flipping and shifting. Also on ContextMenuSubContent.',
  },
  { name: 'aria-label', type: 'string', description: 'Accessible name for the menu (recommended).' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const itemProps = [
  { name: 'onSelect', type: '() => void', description: 'Called when the item is chosen; the menu then closes. Same shape as DropdownMenuItem.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Skipped by arrow keys and typeahead; ignores clicks. Same shape as DropdownMenuItem.' },
  { name: 'variant', type: "'default' | 'destructive'", default: "'default'", description: 'Tone. Use destructive for irreversible actions, and say so in the label.' },
  { name: 'inset', type: 'boolean', default: 'false', description: 'Indent the label to line up with checkable rows. Also on ContextMenuLabel and ContextMenuSubTrigger.' },
  { name: 'textValue', type: 'string', description: 'Text used for typeahead when the children are not plain text. Also on checkbox, radio and sub-trigger rows.' },
]

const checkableProps = [
  { name: 'checked', type: 'boolean', default: 'false', description: 'ContextMenuCheckboxItem: whether the item is checked (controlled).' },
  { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'ContextMenuCheckboxItem: called with the next checked state.' },
  { name: 'value', type: 'string', description: 'ContextMenuRadioGroup: the selected value. ContextMenuRadioItem: the value the item selects (required).' },
  { name: 'onValueChange', type: '(value: string) => void', description: 'ContextMenuRadioGroup: called with the value of the picked item.' },
  { name: 'disabled / onSelect', type: 'boolean / () => void', description: 'Checkbox and radio items accept the same disabled and onSelect as ContextMenuItem.' },
]

const subProps = [
  { name: 'open', type: 'boolean', description: 'ContextMenuSub: whether the submenu is open (controlled).' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'ContextMenuSub: whether the submenu starts open (uncontrolled).' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'ContextMenuSub: called when the submenu opens or closes.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'ContextMenuSubTrigger: prevents opening the submenu.' },
]

const usageCode = `import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@refraction-ui/react'

export function MessageRow({ message }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div tabIndex={0}>{message.text}</div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Message actions">
        <ContextMenuItem onSelect={() => reply(message)}>
          Reply<ContextMenuShortcut>R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
          <ContextMenuSubContent aria-label="Destinations">
            <ContextMenuItem onSelect={() => archive(message)}>Archive</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => remove(message)}>
          Delete message
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}`

function Code({ children }: { children: React.ReactNode }) {
  return <code className="text-xs bg-muted px-1 rounded">{children}</code>
}

export default function ContextMenuPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Context Menu</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A menu opened at the pointer on right-click or long-press, or at the focused element with Shift+F10 or the
          ContextMenu key, with submenus, checkable items and collision-aware positioning. Its rows take the same props
          as DropdownMenu&apos;s, so one menu definition serves both.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Actions with shortcut hints, a disabled item, nested submenus and a destructive action. Submenus open on
          hover after a short rest, or with ArrowRight; ArrowLeft returns to the parent. Group related rows with{' '}
          <Code>ContextMenuGroup</Code> and head them with <Code>ContextMenuLabel</Code>.
        </p>
        <ContextMenuExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Checkbox and radio items</h2>
        <p className="text-sm text-muted-foreground">
          <Code>ContextMenuCheckboxItem</Code> toggles a setting; <Code>ContextMenuRadioGroup</Code> with{' '}
          <Code>ContextMenuRadioItem</Code> picks one value. Both are controlled and draw a check or dot glyph, so the
          state is never shown by colour alone.
        </p>
        <ContextMenuExamples section="checkable" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">One definition, two menus</h2>
        <p className="text-sm text-muted-foreground">
          Items take <Code>disabled</Code> and <Code>onSelect</Code> exactly like <Code>DropdownMenuItem</Code>, so the
          same action list renders as a right-click menu and as a button menu.
        </p>
        <ContextMenuExamples section="shared" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Opens from the keyboard with <kbd>Shift</kbd>+<kbd>F10</kbd> or the <kbd>ContextMenu</kbd> key, anchored
            under the focused element, with focus on the first item. Make the trigger target focusable (for example{' '}
            <Code>tabIndex={'{0}'}</Code> on a row, or <Code>asChild</Code> on a button).
          </li>
          <li>
            Uses <Code>role=&quot;menu&quot;</Code> with <Code>menuitem</Code>, <Code>menuitemcheckbox</Code> and{' '}
            <Code>menuitemradio</Code> rows; sub-triggers carry <Code>aria-haspopup</Code>, <Code>aria-expanded</Code>{' '}
            and <Code>aria-controls</Code>. Give each menu an <Code>aria-label</Code>.
          </li>
          <li>
            Arrow keys move focus (wrapping), Home and End jump to the ends, typing a letter jumps to the next matching
            item, and disabled items are skipped. Enter or Space activates.
          </li>
          <li>
            Escape, Tab, choosing an item, or pressing outside closes the menu and returns focus to the target.
          </li>
          <li>
            Rows show a visible focus ring, text is rem-based, the entry animation stops under{' '}
            <Code>prefers-reduced-motion</Code>, and colours come from theme tokens, so light, dark and system themes
            all work. Destructive items use a token tone and should also say what they do (&ldquo;Delete
            message&rdquo;).
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ContextMenu props</h2>
        <PropsTable props={rootProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ContextMenuTrigger props</h2>
        <PropsTable props={triggerProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ContextMenuContent props</h2>
        <PropsTable props={contentProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ContextMenuItem props</h2>
        <PropsTable props={itemProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Checkbox and radio props</h2>
        <PropsTable props={checkableProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Submenu props</h2>
        <PropsTable props={subProps} />
      </section>
    </div>
  )
}
