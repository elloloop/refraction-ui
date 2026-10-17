import { MessageRowExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const messageRowProps = [
  { name: 'authorName', type: 'string', description: "Required. Sender's name. Visible on a lead row; screen-reader only on a continuation row." },
  { name: 'avatar', type: 'React.ReactNode', description: 'Avatar node (e.g. `<Avatar>`), sized to `avatarSize`. Hidden on continuation rows.' },
  { name: 'avatarSize', type: 'number', default: '36', description: 'Avatar size and gutter width in CSS px (rendered in rem). Continuation rows keep the gutter so bodies line up.' },
  { name: 'timestamp', type: 'string', description: 'Pre-formatted time ("10:42"). On continuation rows it appears on hover or focus.' },
  { name: 'body', type: 'React.ReactNode', description: 'Message content. Always selectable.' },
  { name: 'continuation', type: 'boolean', default: 'false', description: 'Same sender, close in time: hide the avatar and name, show the time on hover or focus.' },
  { name: 'quote', type: 'React.ReactNode', description: 'Reply preview above the body. Not part of the row label.' },
  { name: 'labels', type: 'React.ReactNode', description: 'Labels next to the name, e.g. "Forwarded · #releases" or a bot badge.' },
  { name: 'editedLabel', type: 'React.ReactNode', description: 'Edited marker after the body, e.g. "(edited)". Included in the row label.' },
  { name: 'status', type: 'React.ReactNode', description: 'Delivery or read status after the body.' },
  { name: 'footer', type: 'React.ReactNode', description: 'Below the body: reactions, thread summary.' },
  { name: 'actions', type: 'MessageRowAction[]', description: 'Toolbar actions: `{ icon, label, onSelected, destructive? }`. Those past `maxInlineActions` go into a "More actions" menu.' },
  { name: 'maxInlineActions', type: 'number', default: '3', description: 'Actions shown as inline buttons before the rest overflow. `0` puts all of them in the menu.' },
  { name: 'toolbarLeading', type: 'React.ReactNode', description: 'Leading toolbar slot, e.g. quick-reaction buttons. Its buttons join the toolbar\'s arrow-key navigation.' },
  { name: 'toolbarLabel', type: 'string', default: "'Message actions'", description: 'Accessible name of the toolbar.' },
  { name: 'moreActionsLabel', type: 'string', default: "'More actions'", description: 'Label (name and tooltip) of the overflow menu button.' },
  { name: 'moreActionsIcon', type: 'React.ReactNode', description: 'Icon for the overflow menu button. Defaults to a horizontal ellipsis.' },
  { name: 'onTap', type: '() => void', description: 'Plain click on the row — not on a control inside it, not after selecting text, not after a long-press. Also Enter while the row has focus (the row becomes focusable).' },
  { name: 'onLongPress', type: '() => void', description: 'Press and hold without moving. A drag past 10 px (a text selection) or a scroll cancels it. Not fired on tombstones.' },
  { name: 'longPressDelay', type: 'number', default: '500', description: 'Hold time in ms before `onLongPress` fires.' },
  { name: 'onContextMenu', type: 'React.MouseEventHandler<HTMLDivElement>', description: 'The native `contextmenu` event (right-click, the Menu key, Shift+F10), for a context menu. Skipped right after a touch long-press so two menus never open.' },
  { name: 'highlighted', type: 'boolean', default: 'false', description: 'Jump target: an outlined highlight that fades out after a second. Static under reduced motion.' },
  { name: 'semanticLabel', type: 'string', description: 'Overrides the row\'s accessible name. By default it reads author, time, text and the edited marker.' },
  { name: 'tombstone', type: 'boolean', default: 'false', description: 'Deleted message: shows `tombstoneText` and drops the toolbar, actions, long-press, quote, labels, status and footer.' },
  { name: 'tombstoneText', type: 'string', default: "'This message was deleted'", description: 'Tombstone text.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes for the row.' },
]

const actionFields = [
  { name: 'icon', type: 'React.ReactNode', description: 'The glyph. Decorative; `label` is the accessible name.' },
  { name: 'label', type: 'string', description: 'Required. Button name and tooltip, or the menu item text.' },
  { name: 'onSelected', type: '() => void', description: 'Called when the action is chosen.' },
  { name: 'destructive', type: 'boolean', default: 'false', description: 'Styles the action as destructive. Say it in the label too ("Delete message").' },
]

const usageCode = `import { MessageRow, Avatar, AvatarFallback } from '@refraction-ui/react'

export function Messages() {
  return (
    <div>
      <MessageRow
        authorName="Ana Lima"
        avatar={<Avatar size="sm"><AvatarFallback>AL</AvatarFallback></Avatar>}
        avatarSize={32}
        timestamp="10:41"
        body="The release branch is cut."
        actions={[
          { icon: <ReplyIcon />, label: 'Reply', onSelected: reply },
          { icon: <EditIcon />, label: 'Edit message', onSelected: edit },
          { icon: <TrashIcon />, label: 'Delete message', onSelected: remove, destructive: true },
        ]}
        onLongPress={openActionSheet}
      />
      <MessageRow
        authorName="Ana Lima"
        avatarSize={32}
        timestamp="10:42"
        continuation
        body="Changelog is in the PR."
        editedLabel="(edited)"
      />
    </div>
  )
}`

export default function MessageRowPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Message Row</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          One chat message, grouped by sender: avatar and name on the first row of a run, a
          hover-and-focus toolbar with quick reactions and overflowing actions, reply quotes,
          labels, tombstones and jump highlights — while the text stays selectable.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sender runs</h2>
        <p className="text-sm text-muted-foreground">
          Mark later messages from the same sender with{' '}
          <code className={code}>continuation</code>: the avatar and name are hidden and the
          time shows in the gutter on hover or focus.
        </p>
        <MessageRowExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Toolbar and actions</h2>
        <p className="text-sm text-muted-foreground">
          The toolbar appears on hover and when focus is inside the row. Quick reactions go in{' '}
          <code className={code}>toolbarLeading</code>; <code className={code}>actions</code> past{' '}
          <code className={code}>maxInlineActions</code> move into a menu. It floats above the
          row&apos;s trailing edge and hides while you select text.
        </p>
        <MessageRowExamples section="actions" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Quote, labels, status and footer</h2>
        <p className="text-sm text-muted-foreground">
          Slots for a reply preview, labels such as &quot;Forwarded&quot; or a bot badge, a
          delivery status, and a footer for reactions or a thread summary.
        </p>
        <MessageRowExamples section="slots" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tombstone</h2>
        <p className="text-sm text-muted-foreground">
          A deleted message keeps its place in the run but has no toolbar or actions, even if{' '}
          <code className={code}>actions</code> are passed.
        </p>
        <MessageRowExamples section="tombstone" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Jump highlight</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>highlighted</code> outlines the target and fades it out; with
          reduced motion it stays, without animating, until you turn it off.
        </p>
        <MessageRowExamples section="highlighted" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tap, long-press and context menu</h2>
        <p className="text-sm text-muted-foreground">
          Row-level gestures. Controls inside the row keep their own clicks, and a drag that
          selects text is never a tap or a long-press.
        </p>
        <MessageRowExamples section="gestures" />
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
            Each row is a <code className={code}>role=&quot;article&quot;</code> named by{' '}
            <code className={code}>aria-labelledby</code> over its author, time, body and edited
            marker, so the name reads the real text (links and code included) without copying it
            into an attribute. The body stays selectable and readable in browse mode.{' '}
            <code className={code}>semanticLabel</code> replaces the name with your own string.
          </li>
          <li>
            On continuation rows the name stays in the accessibility tree (visually hidden), and
            the gutter time is hidden with opacity, so every row still says who wrote it and when.
          </li>
          <li>
            The toolbar is a <code className={code}>role=&quot;toolbar&quot;</code> with one Tab
            stop per row; Left / Right arrows (wrapping), Home and End move between its buttons,
            including those in <code className={code}>toolbarLeading</code>. That keeps a long
            conversation to one stop per message instead of five. Focusing it reveals it.
          </li>
          <li>
            Every action is an IconButton with a required label, a tooltip and a 44 × 44 px hit
            area; the overflow button is a labelled menu button, and its menu supports arrows,
            Escape and returns focus to the button.
          </li>
          <li>
            Hover, the toolbar and the long-press are pointer conveniences: everything they open
            is reachable from the keyboard through the toolbar. With{' '}
            <code className={code}>onTap</code> the row itself is focusable (with a visible focus
            ring) and Enter taps it; the Menu key or Shift+F10 fires{' '}
            <code className={code}>onContextMenu</code>.
          </li>
          <li>
            Nothing is said by colour alone: the highlight is an outline as well as a tint, a
            tombstone is italic text that says it was deleted, destructive actions say so in
            their label, and a quote has a left rule.
          </li>
          <li>
            Under <code className={code}>prefers-reduced-motion</code> the highlight is static and
            the toolbar and time appear without a fade.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={messageRowProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">MessageRowAction</h2>
        <PropsTable props={actionFields} />
      </section>
    </div>
  )
}
