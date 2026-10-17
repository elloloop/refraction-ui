import { PaneHeaderExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const paneHeaderProps = [
  {
    name: 'title',
    type: 'React.ReactNode',
    description: 'The pane title (required). Rendered as a heading; truncates on one line when space runs out.',
  },
  {
    name: 'subtitle',
    type: 'React.ReactNode',
    description: 'Secondary line under the title, such as presence or a member count. Truncates.',
  },
  {
    name: 'leading',
    type: 'React.ReactNode',
    description: 'Leading control, typically a back button. Never shrinks.',
  },
  {
    name: 'avatar',
    type: 'React.ReactNode',
    description: 'Avatar before the title. Part of the title button when `onTitleTap` is set.',
  },
  {
    name: 'actions',
    type: 'React.ReactNode',
    description: 'Trailing actions (icon buttons, menus). Never shrink or truncate.',
  },
  {
    name: 'onTitleTap',
    type: '() => void',
    description: 'Makes avatar + title + subtitle one button, e.g. to open a details panel.',
  },
  {
    name: 'titleTapHint',
    type: 'string',
    description:
      'Visually hidden description of what the title button does, e.g. "Show contact details". Only used with `onTitleTap`.',
  },
  {
    name: 'height',
    type: 'number | string',
    default: "var(--pane-header-height, 3.5rem)",
    description:
      'Per-instance height: a CSS length, or a number of pixels. Omit it to inherit the shared `--pane-header-height`.',
  },
  {
    name: 'headingLevel',
    type: '1 | 2 | 3 | 4 | 5 | 6',
    default: '2',
    description: 'Heading level of the title, to fit the page outline.',
  },
  {
    name: 'id',
    type: 'string',
    description: 'Root id. The title gets `${id}-title`, so the pane can be labelled with `aria-labelledby`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { PaneHeader, paneHeaderHeightStyle } from '@refraction-ui/react'

export function Conversation() {
  return (
    // Share one height across every pane so the rules line up.
    <div style={paneHeaderHeightStyle('3.5rem')} className="flex">
      <section aria-labelledby="chat-title" className="min-w-0 flex-1">
        <PaneHeader
          id="chat"
          leading={<BackButton />}
          avatar={<ContactAvatar />}
          title="Ana Ruiz"
          subtitle="Online"
          onTitleTap={openDetails}
          titleTapHint="Show contact details"
          actions={<CallButton />}
        />
        {/* messages */}
      </section>
    </div>
  )
}`

const sharedHeightCode = `/* Or in CSS — set it once on the split view (or :root). */
.split-view {
  --pane-header-height: 3.5rem;
}`

function Code({ children }: { children: React.ReactNode }) {
  return <code className="text-xs bg-muted px-1 rounded">{children}</code>
}

export default function PaneHeaderPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pane Header</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          The bar across the top of a pane: a back control, avatar, title and subtitle, and actions.
          Every pane header shares one height, so in a split view (a list beside a conversation
          beside a thread) the rule underneath runs straight across.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          <Code>leading</Code>, <Code>avatar</Code>, <Code>title</Code>, <Code>subtitle</Code> and{' '}
          <Code>actions</Code> fill the row from start to end.
        </p>
        <PaneHeaderExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tappable title</h2>
        <p className="text-sm text-muted-foreground">
          With <Code>onTitleTap</Code>, the avatar, title and subtitle become one button, for example
          to open a details panel. It is named by the title, and the subtitle and{' '}
          <Code>titleTapHint</Code> describe it.
        </p>
        <PaneHeaderExamples section="tappable" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Split view: a shared height</h2>
        <p className="text-sm text-muted-foreground">
          Headers read the <Code>--pane-header-height</Code> custom property (default{' '}
          <Code>3.5rem</Code>, so it grows with the user&apos;s text size). Set it once on the
          container with <Code>paneHeaderHeightStyle()</Code> or in CSS, and every pane lines up. Use
          the <Code>height</Code> prop only to override a single header.
        </p>
        <PaneHeaderExamples section="split-view" />
        <CodeBlock frameworks={{ react: sharedHeightCode, astro: sharedHeightCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Truncation</h2>
        <p className="text-sm text-muted-foreground">
          When space runs out, the title and subtitle shorten with an ellipsis. The leading control
          and the actions keep their size.
        </p>
        <PaneHeaderExamples section="truncation" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Renders a <Code>&lt;header&gt;</Code> with no explicit role. Put each pane in a{' '}
            <Code>&lt;section&gt;</Code> (or <Code>&lt;aside&gt;</Code>, <Code>&lt;main&gt;</Code>)
            labelled by the title (<Code>aria-labelledby=&quot;{'{id}'}-title&quot;</Code>). Inside a
            sectioning element the header is not a landmark, so three panes never make three{' '}
            <Code>banner</Code> landmarks.
          </li>
          <li>
            The title is a real heading. Set <Code>headingLevel</Code> (default 2) so it fits the
            page outline.
          </li>
          <li>
            With <Code>onTitleTap</Code>, the heading wraps one native <Code>&lt;button&gt;</Code>{' '}
            (a heading cannot sit inside a button). Tab reaches it, and Enter or Space opens it. The
            back control and the actions stay outside it, so no control is nested inside another.
          </li>
          <li>
            The title button has a 44px minimum height and a visible focus ring. Its colour change on
            hover is switched off when the user prefers reduced motion.
          </li>
          <li>
            Give icon-only <Code>leading</Code> and <Code>actions</Code> buttons an{' '}
            <Code>aria-label</Code> and a 44px target (e.g. <Code>className=&quot;size-11&quot;</Code>).
            If the avatar shows the same person as the title, leave it unnamed so the name is not read
            twice.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={paneHeaderProps} />
      </section>
    </div>
  )
}
