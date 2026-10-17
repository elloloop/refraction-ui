import { CallControlsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const callControlsProps = [
  {
    name: 'size',
    type: "'sm' | 'md'",
    default: "'md'",
    description: 'Visual size of the toolbar and its buttons.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the toolbar container.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description:
      'CallControlButton elements to render inside the toolbar. In the dock they are added after the panel toggles.',
  },
  {
    name: 'mic',
    type: 'CallControlsMediaToggle',
    description:
      'The microphone toggle, with an optional device menu slot. Passing any control turns on the dock. Never collapses.',
  },
  {
    name: 'camera',
    type: 'CallControlsMediaToggle',
    description: 'The camera toggle, with an optional device menu slot. Never collapses.',
  },
  {
    name: 'screenShare',
    type: 'CallControlsToggle',
    description: 'Share screen. Like every call action, it renders only when given and collapses into More controls under 600 px.',
  },
  {
    name: 'hand',
    type: 'CallControlsToggle',
    description: 'Raise hand. A call action.',
  },
  {
    name: 'reactions',
    type: 'CallControlsReactions',
    description: 'A trigger that opens your reaction picker. A call action.',
  },
  {
    name: 'captions',
    type: 'CallControlsToggle',
    description: 'Captions. A call action.',
  },
  {
    name: 'pip',
    type: 'CallControlsToggle',
    description: 'Picture in picture. A call action.',
  },
  {
    name: 'record',
    type: 'CallControlsToggle',
    description: 'Record. A call action that turns red while it records.',
  },
  {
    name: 'chat',
    type: 'CallControlsToggle',
    description: 'The chat panel toggle; count carries unread messages. Collapses under 600 px.',
  },
  {
    name: 'people',
    type: 'CallControlsToggle',
    description: 'The participants panel toggle; count carries the people in the call. Collapses under 600 px.',
  },
  {
    name: 'onLeave',
    type: '() => void',
    description: 'Leaves the call. The leave button renders only when this is given.',
  },
  {
    name: 'labels',
    type: 'Partial<CallControlsLabels>',
    description:
      'Replaces any string the dock renders: the toolbar and group names, each control, Leave call, More controls, and withCount(label, count).',
  },
  {
    name: 'icons',
    type: 'CallControlsIcons',
    description:
      'Replaces any built-in icon, by name: mic, micOff, camera, cameraOff, screenShare, hand, reactions, captions, pip, record, chat, people, leave, more, check.',
  },
  {
    name: 'containerClassName',
    type: 'string',
    description: 'Classes for the full-width wrapper whose width decides when the dock collapses.',
  },
]

const toggleProps = [
  {
    name: 'active',
    type: 'boolean',
    description:
      'Whether the control is on: mic live, camera on, sharing, hand raised, captions shown, recording, panel open. Exposed as aria-pressed.',
  },
  {
    name: 'onToggle',
    type: '() => void',
    description: 'Called when the control is pressed, in the bar or in More controls.',
  },
  {
    name: 'pending',
    type: 'boolean',
    description:
      'A change is in flight. The control keeps focus and reports aria-disabled; presses are ignored until you clear it.',
  },
  {
    name: 'count',
    type: 'number',
    description: 'Shown as a badge (99+ past 99) and read with the name, as in "Chat (3)".',
  },
  {
    name: 'menu',
    type: 'React.ReactNode',
    description:
      'mic and camera only. Rendered beside the toggle in one capsule, for a device menu trigger (see Device menus).',
  },
]

const reactionsProps = [
  {
    name: 'onOpen',
    type: '(anchor: HTMLElement) => void',
    description:
      'Opens your picker. anchor is the reactions button, or More controls when it was chosen from there.',
  },
  {
    name: 'expanded',
    type: 'boolean',
    description: 'Whether your picker is open. Exposed as aria-expanded.',
  },
  {
    name: 'pending',
    type: 'boolean',
    description: 'The control is temporarily unavailable.',
  },
]

const callControlButtonProps = [
  {
    name: 'label',
    type: 'string',
    description: 'Accessible label (aria-label) and screen-reader text.',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'Icon node rendered inside the button.',
  },
  {
    name: 'tone',
    type: "'default' | 'active' | 'destructive'",
    default: "'default'",
    description:
      'Visual tone: default (neutral), active (on/highlighted), destructive (leave/muted).',
  },
  {
    name: 'pressed',
    type: 'boolean',
    description:
      'Toggleable state — adds aria-pressed. Omit for non-toggleable controls.',
  },
  {
    name: 'size',
    type: "'sm' | 'md'",
    default: "'md'",
    description: 'Visual size of the button.',
  },
  {
    name: 'onClick',
    type: '() => void',
    description: 'Click handler.',
  },
]

const usageCode = `import { CallControls, CallControlButton } from '@refraction-ui/react'

export function MeetingBar() {
  const [micOn, setMicOn] = React.useState(true)

  return (
    <CallControls>
      <CallControlButton
        label={micOn ? 'Mute mic' : 'Unmute mic'}
        tone={micOn ? 'active' : 'destructive'}
        pressed={micOn}
        onClick={() => setMicOn(v => !v)}
      />
      <CallControlButton label="Share screen" />
      <CallControlButton label="Leave" tone="destructive" />
    </CallControls>
  )
}`

const dockCode = `import { CallControls } from '@refraction-ui/react'

export const CallDock = ({ call }) => (
  <CallControls
    mic={{ active: call.micOn, onToggle: call.toggleMic }}
    camera={{ active: call.cameraOn, onToggle: call.toggleCamera }}
    screenShare={{ active: call.sharing, onToggle: call.toggleShare }}
    hand={{ active: call.handUp, onToggle: call.toggleHand }}
    reactions={{ onOpen: call.openReactions }}
    captions={{ active: call.captions, onToggle: call.toggleCaptions }}
    chat={{
      active: call.chatOpen,
      onToggle: call.toggleChat,
      count: call.unread,
    }}
    people={{
      active: call.peopleOpen,
      onToggle: call.togglePeople,
      count: call.size,
    }}
    onLeave={call.leave}
  />
)`

const devicesCode = `import {
  CallControls,
  callControlsMenuTriggerClass,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@refraction-ui/react'

const micMenu = (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        aria-label="Microphone options"
        className={callControlsMenuTriggerClass}
      >
        <ChevronUpIcon />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {microphones.map((device) => (
        <DropdownMenuItem
          key={device.id}
          role="menuitemradio"
          aria-checked={device.id === selectedId}
          onSelect={() => selectMicrophone(device.id)}
        >
          {device.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

<CallControls
  mic={{ active: micOn, onToggle: toggleMic, menu: micMenu }}
  onLeave={leave}
/>`

export default function CallControlsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Call Controls</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A meeting bottom toolbar with composable round control buttons — mic,
          camera, screen-share, reactions, and a destructive leave/end button.
          Fully accessible with role="toolbar", aria-label, and aria-pressed for
          toggleable controls. Pass the controls as props instead and it becomes a
          call dock: grouped, with counts, a leave button, device menu slots and a
          More controls menu on narrow screens.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic bar</h2>
        <p className="text-sm text-muted-foreground">
          Compose any set of <code className="text-xs bg-muted px-1 rounded">CallControlButton</code> elements
          inside <code className="text-xs bg-muted px-1 rounded">CallControls</code>. The leave button uses
          <code className="text-xs bg-muted px-1 rounded">tone="destructive"</code>.
        </p>
        <CallControlsExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Toggled (muted) states</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">pressed</code> to mark a control as
          toggled. Use <code className="text-xs bg-muted px-1 rounded">tone="active"</code> when on
          and <code className="text-xs bg-muted px-1 rounded">tone="destructive"</code> when muted/off
          to signal the disabled state with red.
        </p>
        <CallControlsExamples section="toggled" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With leave button</h2>
        <p className="text-sm text-muted-foreground">
          The leave/end button always uses <code className="text-xs bg-muted px-1 rounded">tone="destructive"</code>.
          It is not toggleable and therefore receives no <code className="text-xs bg-muted px-1 rounded">pressed</code> prop.
        </p>
        <CallControlsExamples section="leave" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Call dock</h2>
        <p className="text-sm text-muted-foreground">
          Pass the controls as props and <code className="text-xs bg-muted px-1 rounded">CallControls</code> draws them in three groups: the
          microphone and camera, the call actions (share screen, raise hand, reactions, captions,
          picture in picture, record) and the panel toggles (chat, participants), then a leave
          button. A control renders only when you pass it, so the dock never shows a button that does
          nothing. Each name stays the same and <code className="text-xs bg-muted px-1 rounded">aria-pressed</code> carries the state;
          the microphone and camera turn red with a struck-through icon when they are off, recording
          turns red while it runs, and the others light up while they are on.
        </p>
        <CallControlsExamples section="dock" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Narrow dock</h2>
        <p className="text-sm text-muted-foreground">
          When the dock&apos;s own width is under 600 px — a phone, or a call column narrowed by a
          side panel — the call actions and panel toggles move into <code className="text-xs bg-muted px-1 rounded">More controls</code>,
          which opens a panel of the same controls above the dock. The microphone, camera and leave
          button stay in the bar. A dot on More controls means a collapsed control has a count.
          The frame below is 360 px wide.
        </p>
        <CallControlsExamples section="narrow" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Device menus</h2>
        <p className="text-sm text-muted-foreground">
          The microphone and camera each take a <code className="text-xs bg-muted px-1 rounded">menu</code> slot that is joined to the
          toggle into one capsule. Put a device picker&apos;s trigger there, styled with
           <code className="text-xs bg-muted px-1 rounded">callControlsMenuTriggerClass</code> so it fills the capsule and takes its
          colour. This example builds the picker from <code className="text-xs bg-muted px-1 rounded">DropdownMenu</code>.
        </p>
        <CallControlsExamples section="devices" />
        <CodeBlock code={devicesCode} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The bar is a <code className="text-xs bg-muted px-1 rounded">toolbar</code> named &ldquo;Call controls&rdquo;. Every button
            keeps its own tab stop, and the left and right arrows, Home and End move between them
            too (reversed in a right-to-left layout). The dock&apos;s groups are named &ldquo;Audio
            and video&rdquo;, &ldquo;Call actions&rdquo; and &ldquo;Panels&rdquo;.
          </li>
          <li>
            Toggles keep one name — &ldquo;Microphone&rdquo;, &ldquo;Camera&rdquo;, &ldquo;Share
            screen&rdquo;, &ldquo;Raise hand&rdquo; — and report on or off with
             <code className="text-xs bg-muted px-1 rounded">aria-pressed</code>. A count is read with the name, as in
            &ldquo;Chat (3)&rdquo;; the badge itself is hidden from assistive technology.
          </li>
          <li>
            Off and recording are never colour alone: the microphone and camera switch to a
            struck-through icon, and the More controls rows show a check mark for controls that
            are on.
          </li>
          <li>
            A pending control stays focusable and reports <code className="text-xs bg-muted px-1 rounded">aria-disabled</code>, so focus is
            not lost while a device starts.
          </li>
          <li>
            More controls reports <code className="text-xs bg-muted px-1 rounded">aria-expanded</code> and opens a named group of buttons
            with focus on the first. Up and down arrows move between them; choosing one runs it,
            closes the panel and returns focus to More controls, as does Escape. Pressing
            outside or moving focus away also closes it.
          </li>
          <li>
            The reactions trigger reports <code className="text-xs bg-muted px-1 rounded">aria-expanded</code> when you pass
             <code className="text-xs bg-muted px-1 rounded">expanded</code>.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage: call dock</h2>
        <p className="text-sm text-muted-foreground">
          The dock is React only, because every control takes a handler. Media and devices stay in
          your call SDK; the dock only shows their state and calls you back.
        </p>
        <CodeBlock code={dockCode} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CallControls props</h2>
        <PropsTable props={callControlsProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CallControlButton props</h2>
        <PropsTable props={callControlButtonProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CallControlsToggle and CallControlsMediaToggle</h2>
        <PropsTable props={toggleProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CallControlsReactions</h2>
        <PropsTable props={reactionsProps} />
      </section>
    </div>
  )
}
