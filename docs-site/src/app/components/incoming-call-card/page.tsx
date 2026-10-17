import { IncomingCallCardExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const incomingCallCardProps = [
  {
    name: 'callerName',
    type: 'string',
    description: "The caller's name. Required; it is the dialog's accessible name and the source of the avatar initials.",
  },
  {
    name: 'avatarSrc',
    type: 'string',
    description: "Caller's avatar image. Initials from `callerName` are shown until it loads or if it fails.",
  },
  {
    name: 'kind',
    type: "'audio' | 'video'",
    default: "'audio'",
    description: 'The call kind. Picks the description and the Accept icon (handset or camera).',
  },
  {
    name: 'kindLabel',
    type: 'string',
    description: 'Overrides the default "Incoming audio call" / "Incoming video call" description, e.g. for translation.',
  },
  {
    name: 'context',
    type: 'React.ReactNode',
    description: 'Optional context, such as the meeting, channel or team the call comes from. Part of the accessible description.',
  },
  {
    name: 'onAccept',
    type: '() => void',
    description: 'Required. Called when the user presses Accept.',
  },
  {
    name: 'onDecline',
    type: '() => void',
    description: 'Required. Called when the user presses Decline, on Esc with `escapeBehavior="decline"`, and when the countdown expires without an `onTimeout`.',
  },
  {
    name: 'onDismiss',
    type: '() => void',
    description: 'Called on Esc with `escapeBehavior="dismiss"`: hide the card but leave the call ringing.',
  },
  {
    name: 'onTimeout',
    type: '() => void',
    description: 'Called once when the countdown reaches zero. Falls back to `onDecline` when omitted.',
  },
  {
    name: 'acceptLabel',
    type: 'string',
    default: "'Accept'",
    description: 'Visible text of the Accept button.',
  },
  {
    name: 'declineLabel',
    type: 'string',
    default: "'Decline'",
    description: 'Visible text of the Decline button.',
  },
  {
    name: 'timeoutSeconds',
    type: 'number',
    description: 'Length of the ring in seconds. Shows a countdown; without `remaining` the card counts down on its own.',
  },
  {
    name: 'remaining',
    type: 'number',
    description: 'Seconds left when the app drives the countdown (controlled). The card then never ticks itself.',
  },
  {
    name: 'countdownLabel',
    type: '(remainingSeconds: number) => string',
    default: '`Ends in m:ss`',
    description: 'Visible countdown text for the seconds left.',
  },
  {
    name: 'escapeBehavior',
    type: "'none' | 'decline' | 'dismiss'",
    default: "'none'",
    description: 'What Esc does while focus is in the card.',
  },
  {
    name: 'layout',
    type: "'overlay' | 'window'",
    default: "'overlay'",
    description: 'A floating card over the app (fixed, top-right from `sm`), or the whole content of a small separate window.',
  },
  {
    name: 'autoFocus',
    type: 'boolean',
    default: 'true',
    description: 'Move focus to the card on mount, and back to the previous element on unmount.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the card.',
  },
]

const usageCode = `import { IncomingCallCard } from '@refraction-ui/react'

export function Ringing({ call, onAnswer, onReject, onMissed }) {
  return (
    <IncomingCallCard
      callerName={call.from.name}
      avatarSrc={call.from.avatarUrl}
      kind={call.video ? 'video' : 'audio'}
      context={call.channelName}
      timeoutSeconds={30}
      escapeBehavior="dismiss"
      onAccept={onAnswer}
      onDecline={onReject}
      onTimeout={onMissed}
    />
  )
}`

export default function IncomingCallCardPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Incoming Call Card</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A ringing call with Accept and Decline — impossible to miss, and impossible
          to answer by accident. Shows the caller, the call kind, optional context and
          an optional countdown, as an in-app overlay or as a small call window.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Overlay</h2>
        <p className="text-sm text-muted-foreground">
          Start a call: the card appears over the app and takes focus, so it is
          announced. Press Esc to dismiss it, let the 20-second countdown run out,
          or use the buttons. Clicking outside does nothing.
        </p>
        <IncomingCallCardExamples section="overlay" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Video call with context</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>kind=&quot;video&quot;</code> swaps the description and
          the Accept icon; <code className={code}>context</code> names where the call
          comes from. Here Esc declines. The examples below pass{' '}
          <code className={code}>autoFocus={'{false}'}</code> so the page does not jump
          on load; in an app, keep the default.
        </p>
        <IncomingCallCardExamples section="video" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Separate window</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>layout=&quot;window&quot;</code> fills its container, for
          a small always-on-top call window. Give the window&apos;s{' '}
          <code className={code}>html</code>, <code className={code}>body</code> and root a
          full height.
        </p>
        <IncomingCallCardExamples section="window" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">App-driven countdown</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className={code}>remaining</code> when your app owns the clock (for
          example, synced to the server&apos;s ring deadline). The card renders it and
          calls <code className={code}>onTimeout</code> once at zero.
        </p>
        <IncomingCallCardExamples section="countdown" />
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
            <code className={code}>role=&quot;alertdialog&quot;</code>, named by the caller
            (<code className={code}>aria-labelledby</code>) and described by the call kind
            and context (<code className={code}>aria-describedby</code>).
          </li>
          <li>
            On mount, focus moves to the card itself (<code className={code}>tabIndex=-1</code>),
            not to Accept, so it is announced and a stray Enter or Space does nothing.
            Tab reaches Decline, then Accept. Focus returns to where it was when the card
            unmounts.
          </li>
          <li>
            It is not modal: the app stays usable while the call rings, and an outside
            click never dismisses it. Esc does only what{' '}
            <code className={code}>escapeBehavior</code> says (nothing by default).
          </li>
          <li>
            Accept and Decline are real buttons with visible text and distinct icons
            (handset or camera, and a hung-up handset), at least 44 px tall — colour is
            never the only cue.
          </li>
          <li>
            The countdown is a <code className={code}>role=&quot;timer&quot;</code>, which is
            not announced every second; its progress bar is decorative.
          </li>
          <li>
            Under <code className={code}>prefers-reduced-motion</code> the ring pulse is
            removed and a static halo remains. The component plays no audio — ringing
            sounds are up to your app.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={incomingCallCardProps} />
      </section>
    </div>
  )
}
