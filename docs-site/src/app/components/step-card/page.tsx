import { StepCardExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const STEP_STATUS_TYPE =
  "'notDetermined' | 'needed' | 'checking' | 'granted' | 'failed'"

const stepCardProps = [
  {
    name: 'title',
    type: 'string',
    description: 'Step name. Names the card (an h3) and leads each status announcement. Required.',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'Decorative icon shown in a muted square; hidden from screen readers.',
  },
  {
    name: 'reason',
    type: 'React.ReactNode',
    description: 'Why the app needs this step. Always shown, even when collapsed.',
  },
  {
    name: 'status',
    type: `StepStatus (${STEP_STATUS_TYPE})`,
    default: "'notDetermined'",
    description:
      'Current status. Shown as a pill with an icon and text; a change is announced politely.',
  },
  {
    name: 'statusLabel',
    type: 'string',
    description:
      'Visible status text. Defaults to "Not checked yet", "Needed", "Checking…", "Granted" or "Failed".',
  },
  {
    name: 'actionLabel',
    type: 'string',
    description: 'Label of the single action button. Without it no button is rendered.',
  },
  {
    name: 'onAction',
    type: '() => void',
    description: 'Called when the action button is pressed.',
  },
  {
    name: 'instructions',
    type: 'readonly string[]',
    description:
      'Numbered steps, rendered by InstructionList through MarkupText (`**bold**`, `{token}`). Blank steps are dropped.',
  },
  {
    name: 'instructionsTitle',
    type: 'string',
    description: 'Label above the instructions; also names the list.',
  },
  {
    name: 'troubleshooting',
    type: 'string | readonly string[]',
    description:
      'Tips behind a disclosure, rendered through MarkupText. One string is one tip; several render as a list.',
  },
  {
    name: 'troubleshootingTitle',
    type: 'string',
    default: "'Having trouble?'",
    description: 'Label of the troubleshooting disclosure button.',
  },
  {
    name: 'liveHint',
    type: 'string',
    description: "Hint shown while `status` is `'checking'`, and read with the announcement.",
  },
  {
    name: 'expanded',
    type: 'boolean',
    default: 'true',
    description:
      'Shows instructions, action and troubleshooting. When false only the icon, title, reason, status and live hint show.',
  },
  {
    name: 'inline',
    type: 'Record<string, React.ReactNode>',
    description: 'Nodes for `{token}` placeholders in instructions and troubleshooting.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the card root.',
  },
]

const instructionListProps = [
  {
    name: 'steps',
    type: 'readonly string[]',
    description:
      'Steps in order, rendered through MarkupText. Blank steps are dropped; with none left nothing renders. Required.',
  },
  {
    name: 'title',
    type: 'string',
    description: 'Label above the list; also names the list for screen readers.',
  },
  {
    name: 'inline',
    type: 'Record<string, React.ReactNode>',
    description: 'Nodes for `{token}` placeholders in the steps.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the muted well.',
  },
]

const usageCode = `import { StepCard } from '@refraction-ui/react'

export function MicrophoneStep({ status, openSettings }) {
  return (
    <StepCard
      icon={<MicIcon />}
      title="Microphone"
      reason="So people in your calls can hear you."
      status={status} // 'notDetermined' | 'needed' | 'checking' | 'granted' | 'failed'
      actionLabel="Open System Settings"
      onAction={openSettings}
      instructions={[
        'Open **System Settings** with {key}.',
        'Go to **Privacy & Security → Microphone**.',
        'Turn on **Refraction**.',
      ]}
      inline={{ key: <kbd>⌘ ,</kbd> }}
      liveHint="Waiting for you to turn on Refraction…"
      troubleshooting="If Refraction is not listed, quit and reopen the app."
    />
  )
}`

const code = (value: string) => <code className="text-xs bg-muted px-1 rounded">{value}</code>

export default function StepCardPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Step Card</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A guided setup step whose status updates live — granting the microphone, screen
          recording or accessibility permission. Each card has an icon, a title, the reason it is
          needed, a status, one action, numbered instructions and collapsible troubleshooting.
          {' '}{code('InstructionList')} is the numbered list on its own.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Instructions bold the words the user sees on screen ({code('**Privacy & Security**')})
          and place inline nodes such as a keycap ({code('{settingsKey}')} with {code('inline')}).
        </p>
        <StepCardExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Statuses</h2>
        <p className="text-sm text-muted-foreground">
          Five statuses, each with its own icon and text so none relies on colour. The checking
          spinner stands still under {code('prefers-reduced-motion')}. Pass{' '}
          {code('statusLabel')} to change the text.
        </p>
        <StepCardExamples section="statuses" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Live status</h2>
        <p className="text-sm text-muted-foreground">
          Press the action: the card moves to {code("'checking'")}, shows the{' '}
          {code('liveHint')}, then {code("'granted'")}. Each change is announced to screen readers
          through a polite live region — never on first render.
        </p>
        <StepCardExamples section="live" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Setup guide</h2>
        <p className="text-sm text-muted-foreground">
          Use {code('expanded')} to open only the current step; the rest show their title and
          status.
        </p>
        <StepCardExamples section="guide" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Instruction list</h2>
        <p className="text-sm text-muted-foreground">
          A numbered list in a muted well, for instructions outside a card.
        </p>
        <StepCardExamples section="instruction-list" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Flutter mapping</h2>
        <p className="text-sm text-muted-foreground">
          Props keep the names of Flutter&apos;s {code('RefractionStepCard')} and{' '}
          {code('RefractionInstructionList')}. {code('RefractionStepStatus')} maps to the string
          union {code('StepStatus')}: {code('notDetermined')} (not read yet), {code('needed')},{' '}
          {code('checking')}, {code('granted')}, {code('failed')}. Flutter&apos;s {code('IconData')}{' '}
          {code('icon')} is any React node.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            The card is a {code('role="group"')} named by its title, which is an {code('<h3>')}.
          </li>
          <li>
            The status is a visible text label with an icon; colour only reinforces it.
          </li>
          <li>
            Status changes are announced through a visually hidden {code('role="status"')}{' '}
            {code('aria-live="polite"')} region with the step title (and the live hint while
            checking). The first render is silent, and label-only changes are not re-announced.
          </li>
          <li>
            Instructions are a real {code('<ol>')} with native numbers, named by the
            instructions title.
          </li>
          <li>
            The action and the troubleshooting disclosure are native buttons with the focus-visible
            ring; the disclosure exposes {code('aria-expanded')} and {code('aria-controls')}, and
            the troubleshooting button is at least 44 px tall.
          </li>
          <li>
            The spinner and the disclosure animation stop under {code('prefers-reduced-motion')}.
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
        <h2 className="text-xl font-semibold tracking-tight text-foreground">StepCard props</h2>
        <PropsTable props={stepCardProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">InstructionList props</h2>
        <PropsTable props={instructionListProps} />
      </section>
    </div>
  )
}
