import { ThreadSummaryExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const threadSummaryProps = [
  {
    name: 'label',
    type: 'string',
    description: 'Visible summary, e.g. "12 replies". Required.',
  },
  {
    name: 'detail',
    type: 'string',
    description: 'Secondary text, e.g. "Last reply 2 h ago".',
  },
  {
    name: 'avatars',
    type: 'ThreadSummaryAvatar[]',
    description:
      'Repliers as data: `{ id, name, src? }`. Rendered as a stacked, decorative row with `Avatar` (image, or initials from `name`).',
  },
  {
    name: 'onTap',
    type: '(event: React.MouseEvent<HTMLButtonElement>) => void',
    description:
      'Opens the thread. Fires on click and on Enter/Space. A consumer `onClick` runs first and can cancel it with `event.preventDefault()`.',
  },
  {
    name: 'semanticLabel',
    type: 'string',
    description: 'Accessible name override. Defaults to `label` and `detail` joined with ", ".',
  },
  {
    name: 'avatarSize',
    type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
    default: "'xs'",
    description: 'Size of each replier avatar (the `Avatar` size scale).',
  },
  {
    name: 'maxAvatars',
    type: 'number',
    default: '3',
    description:
      'Most avatars shown before the stack is capped. Negative values clamp to 0; the count stays in `label`.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the button. Other native `<button>` attributes pass through too.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the button.',
  },
]

const usageCode = `import { ThreadSummary } from '@refraction-ui/react'

export function MessageReplies({ thread, onOpenThread }) {
  return (
    <ThreadSummary
      avatars={thread.repliers} // [{ id, name, src? }]
      label={\`\${thread.replyCount} replies\`}
      detail="Last reply 2 h ago"
      onTap={() => onOpenThread(thread.id)}
    />
  )
}`

const code = (text: string) => (
  <code className="text-xs bg-muted px-1 rounded">{text}</code>
)

export default function ThreadSummaryPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Thread Summary</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          The replies line under a message: who replied, how many, and when.
          The whole line is one button that opens the thread.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Stacked replier {code('avatars')}, a {code('label')} and a{' '}
          {code('detail')}. Click anywhere on the line, or focus it and press
          Enter or Space, to call {code('onTap')}.
        </p>
        <ThreadSummaryExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Under a message</h2>
        <p className="text-sm text-muted-foreground">
          Give a fuller {code('semanticLabel')} when the visible text needs
          context for screen-reader users, such as whose message the thread
          belongs to.
        </p>
        <ThreadSummaryExamples section="in-message" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Narrow rows</h2>
        <p className="text-sm text-muted-foreground">
          The line wraps the detail onto a second line rather than overflowing
          a narrow column.
        </p>
        <ThreadSummaryExamples section="narrow" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Avatar size and cap</h2>
        <p className="text-sm text-muted-foreground">
          {code('avatarSize')} uses the {code('Avatar')} size scale;{' '}
          {code('maxAvatars')} (default 3) caps the stack.
        </p>
        <ThreadSummaryExamples section="sizes" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            The whole line is a single native {code('<button type="button">')},
            so it is in the tab order and Enter and Space open the thread. It
            contains no nested controls.
          </li>
          <li>
            The accessible name is {code('semanticLabel')} when given, otherwise{' '}
            {code('label')} and {code('detail')} (e.g. &ldquo;12 replies, Last
            reply 2 h ago&rdquo;). If you override it, keep the visible label
            in it so voice-control users can say what they see.
          </li>
          <li>
            Avatars are decorative ({code('aria-hidden')}, empty {code('alt')});
            the reply count belongs in {code('label')}.
          </li>
          <li>
            A visible {code('focus-visible')} ring marks keyboard focus. The
            label is set apart by weight and an underline on hover, not by
            colour alone. Text uses rem-based sizes, colours are theme tokens,
            and the hover transition is disabled under{' '}
            {code('prefers-reduced-motion')}.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={threadSummaryProps} />
      </section>
    </div>
  )
}
