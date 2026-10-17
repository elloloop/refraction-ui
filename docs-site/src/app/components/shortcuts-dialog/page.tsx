import { ShortcutsDialogExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const shortcutsDialogProps = [
  {
    name: 'open',
    type: 'boolean',
    description: 'Controlled open state.',
  },
  {
    name: 'defaultOpen',
    type: 'boolean',
    default: 'false',
    description: 'Initial open state when uncontrolled.',
  },
  {
    name: 'onOpenChange',
    type: '(open: boolean) => void',
    description: 'Called when the dialog opens (shortcut or trigger) or closes (Esc, close button, overlay).',
  },
  {
    name: 'shortcuts',
    type: 'ShortcutsDialogShortcut[]',
    description:
      'Shortcuts listed besides the registered ones — `{ keys, description, group? }`, for keys handled outside `useShortcut`. Keys accept `Mod` (⌘ on macOS, Ctrl elsewhere).',
  },
  {
    name: 'includeDefaults',
    type: 'boolean',
    default: 'false',
    description: 'Also list every `SANE_DEFAULTS` action (Save, Undo, Copy, …), registered or not.',
  },
  {
    name: 'registry',
    type: 'ShortcutsDialogRegistrySource',
    default: 'globalShortcutRegistry',
    description:
      'Where registered shortcuts come from: `{ subscribe, getSnapshot, getServerSnapshot? }`. The default is the registry `useShortcut` fills.',
  },
  {
    name: 'openShortcut',
    type: 'boolean',
    default: 'true',
    description:
      'Listen for ⌘/ (Ctrl+/ off macOS) and `?` to open, ignoring keys typed into text fields, and list them. Enable it on one dialog per page.',
  },
  {
    name: 'platform',
    type: "'mac' | 'windows'",
    description:
      'Key legends to print and the modifier ⌘/ uses. Detected when omitted; the server renders `windows`. Inject for deterministic SSR and tests.',
  },
  {
    name: 'groupOrder',
    type: 'string[]',
    default: "['General']",
    description: 'Groups listed first, in this order; the rest follow alphabetically.',
  },
  {
    name: 'labels',
    type: 'Partial<ShortcutsDialogLabels>',
    description:
      'Visible and spoken strings: `title`, `description`, `searchLabel`, `searchPlaceholder`, `empty`, `close`, `openShortcut`, `alternative` and `resultCount(count)`.',
  },
  {
    name: 'trigger',
    type: 'React.ReactElement',
    description: 'Element that opens the dialog on click, such as a “Keyboard shortcuts” button.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the dialog panel.',
  },
]

const useShortcutOptions = [
  {
    name: 'description',
    type: 'string',
    description:
      'What the shortcut does. Only shortcuts with a description are listed; an `action` from `SANE_DEFAULTS` gets its default one.',
  },
  {
    name: 'group',
    type: 'string',
    default: "'General'",
    description: 'Section the shortcut is listed under. An `action` gets its default group.',
  },
]

const usageCode = `import { ShortcutsDialog, useShortcut, Button } from '@refraction-ui/react'

function Inbox() {
  // Registered shortcuts with a description are listed automatically.
  useShortcut({ shortcut: 'Alt+E', description: 'Archive', group: 'Messages', onTrigger: archive })
  useShortcut({ action: 'search', onTrigger: openSearch }) // listed as "Search"

  return (
    <>
      {/* Opens on ⌘/ or Ctrl+/ and ?, or from the trigger. */}
      <ShortcutsDialog trigger={<Button variant="outline">Keyboard shortcuts</Button>} />
    </>
  )
}`

export default function ShortcutsDialogPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">ShortcutsDialog</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          One place that lists every keyboard shortcut, generated from the shortcuts actually
          registered with <code className={code}>useShortcut</code>. Rows are grouped, searchable by
          action or key, and printed with platform-aware <code className={code}>Keycap</code>s. It
          opens on ⌘/ (Ctrl+/) and <code className={code}>?</code>.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Registered shortcuts</h2>
        <p className="text-sm text-muted-foreground">
          This demo registers four shortcuts with <code className={code}>useShortcut</code>. Each is
          listed live under its <code className={code}>group</code>, and dropped when its component
          unmounts. Try them, then press <code className={code}>?</code>.
        </p>
        <ShortcutsDialogExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sane defaults</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>includeDefaults</code> also lists every{' '}
          <code className={code}>SANE_DEFAULTS</code> action with its description. Combos that
          resolve to the same keys are listed once; the registered description wins.
        </p>
        <ShortcutsDialogExamples section="defaults" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Passing shortcuts</h2>
        <p className="text-sm text-muted-foreground">
          Keys handled elsewhere — an editor, a native control — go in{' '}
          <code className={code}>shortcuts</code>. <code className={code}>Mod</code> prints ⌘ on
          macOS and Ctrl elsewhere; <code className={code}>groupOrder</code> puts groups first.
        </p>
        <ShortcutsDialogExamples section="static" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Localised</h2>
        <p className="text-sm text-muted-foreground">
          Every visible and spoken string comes from <code className={code}>labels</code>,
          including the live result count.
        </p>
        <ShortcutsDialogExamples section="localised" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            A modal <code className={code}>Dialog</code> named by its title and description. Focus
            moves to the search field, is trapped while open, and returns to whatever had it —
            the trigger or the element focused when the shortcut was pressed — on Esc or close.
          </li>
          <li>
            <code className={code}>?</code> and ⌘/ (Ctrl+/) are ignored while typing in an input,
            textarea, select or contenteditable, so they never steal characters.
          </li>
          <li>
            Each group is a <code className={code}>section</code> labelled by its heading. A row&apos;s
            keys are read as one phrase (&quot;Command + / or ?&quot;); the printed keycaps are hidden
            from assistive tech.
          </li>
          <li>
            The number of matching shortcuts is announced in a polite live region as you search.
          </li>
          <li>
            The icon-only close button has an accessible name and a 44&nbsp;px hit area; every
            control shows a <code className={code}>focus-visible</code> ring. Transitions stop under{' '}
            <code className={code}>prefers-reduced-motion</code>.
          </li>
          <li>Text is rem-based and colours are theme tokens, so light, dark and system themes all work.</li>
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
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ShortcutsDialog props</h2>
        <PropsTable props={shortcutsDialogProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">useShortcut listing options</h2>
        <PropsTable props={useShortcutOptions} />
      </section>
    </div>
  )
}
