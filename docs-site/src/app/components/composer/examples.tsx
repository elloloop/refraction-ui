'use client'

import * as React from 'react'
import {
  RefractionComposer,
  createEmojiTrigger,
  type ComposerAPI,
  type ComposerSubmission,
  type ComposerTrigger,
} from '@refraction-ui/react-composer'
import { EmojiPicker } from '@refraction-ui/react-emoji-picker'

interface ComposerExamplesProps {
  section:
    | 'basic'
    | 'mentions'
    | 'slashAndEmoji'
    | 'expressionPanel'
    | 'attachments'
    | 'busyStop'
    | 'editMode'
    | 'states'
}

const card = 'rounded-xl border border-border bg-card p-8'

export function ComposerExamples({ section }: ComposerExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'mentions') return <MentionsExample />
  if (section === 'slashAndEmoji') return <SlashAndEmojiExample />
  if (section === 'expressionPanel') return <ExpressionPanelExample />
  if (section === 'attachments') return <AttachmentsExample />
  if (section === 'busyStop') return <BusyStopExample />
  if (section === 'editMode') return <EditModeExample />
  if (section === 'states') return <StatesExample />
  return null
}

/* ── Basic ─────────────────────────────────────────────────────── */

function BasicExample() {
  const [sent, setSent] = React.useState<string | null>(null)
  return (
    <div className={`${card} space-y-4`}>
      <RefractionComposer
        placeholder="Send a message…"
        onSubmit={(submission) => setSent(submission.plainText)}
      />
      {sent !== null && (
        <p className="text-sm text-muted-foreground">Sent: {sent}</p>
      )}
    </div>
  )
}

/* ── Mentions ──────────────────────────────────────────────────── */

const TEAMMATES = [
  { id: 'u1', display: 'Alice Chen', subtitle: 'Design' },
  { id: 'u2', display: 'Alan Turing', subtitle: 'Engineering' },
  { id: 'u3', display: 'Bob Marley', subtitle: 'Support' },
  { id: 'u4', display: 'Carol Danvers', subtitle: 'Product' },
  { id: 'u5', display: 'Dmitri Ivanov', subtitle: 'Data' },
]

const mentionTrigger: ComposerTrigger = {
  id: 'mention',
  symbol: '@',
  resolve: (query) =>
    TEAMMATES.filter((t) => t.display.toLowerCase().includes(query.toLowerCase())),
}

function MentionsExample() {
  return (
    <div className={card}>
      <RefractionComposer
        placeholder="Type @ to mention a teammate…"
        triggers={[mentionTrigger]}
        onSubmit={() => undefined}
      />
    </div>
  )
}

/* ── Slash commands + emoji ────────────────────────────────────── */

const SLASH_COMMANDS = [
  { id: 'summarize', display: 'summarize', subtitle: 'Summarize the thread' },
  { id: 'remind', display: 'remind', subtitle: 'Set a reminder' },
  { id: 'poll', display: 'poll', subtitle: 'Start a quick poll' },
]

const slashTrigger: ComposerTrigger = {
  id: 'slash',
  symbol: '/',
  scope: 'startOfMessage',
  resolve: (query) =>
    SLASH_COMMANDS.filter((c) => c.display.startsWith(query.toLowerCase())),
}

// The `:` trigger resolves against the FULL shared emoji set (~1900 emoji) — the
// same source the picker uses. No hand-maintained map to drift out of sync.
const emojiTrigger = createEmojiTrigger()

function SlashAndEmojiExample() {
  return (
    <div className={card}>
      <RefractionComposer
        placeholder="Type / for commands or :fir for emoji…"
        triggers={[slashTrigger, emojiTrigger]}
        onSubmit={() => undefined}
      />
    </div>
  )
}

/* ── Inline expression panel + filled surface ──────────────────── */

function ExpressionPanelExample() {
  const composerRef = React.useRef<HTMLTextAreaElement>(null)
  return (
    <div className={`${card} space-y-4`}>
      <RefractionComposer
        ref={composerRef}
        surface="filled"
        placeholder="Tap the smiley to open the emoji panel — your text stays visible…"
        triggers={[emojiTrigger]}
        onSubmit={() => undefined}
        accessoryPanel={
          <EmojiPicker
            className="w-full border-0 shadow-none"
            onSelect={(entry) => {
              const el = composerRef.current
              if (!el) return
              // Insert the glyph at the caret and keep focus in the field.
              const start = el.selectionStart ?? el.value.length
              const end = el.selectionEnd ?? el.value.length
              el.setRangeText(entry.emoji, start, end, 'end')
              el.dispatchEvent(new Event('input', { bubbles: true }))
              el.focus()
            }}
          />
        }
      />
      <p className="text-xs text-muted-foreground">
        The panel docks <strong>below the field, inside the composer</strong> — it never floats
        over the message you are typing. Uses the <code>filled</code> surface.
      </p>
    </div>
  )
}

/* ── Attachments ───────────────────────────────────────────────── */

function AttachmentsExample() {
  const apiRef = React.useRef<ComposerAPI>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  return (
    <div className={card}>
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          for (const file of Array.from(event.target.files ?? [])) {
            apiRef.current?.addAttachment({
              kind: file.type.startsWith('image/') ? 'image' : 'file',
              name: file.name,
              mimeType: file.type || undefined,
              sizeBytes: file.size,
              previewUrl: URL.createObjectURL(file),
            })
          }
          event.target.value = ''
        }}
      />
      <RefractionComposer
        apiRef={apiRef}
        maxAttachments={5}
        placeholder="Attach files with the paperclip — or drop them here…"
        onSubmit={() => undefined}
        leading={
          <button
            type="button"
            aria-label="Attach a file"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => fileRef.current?.click()}
          >
            📎
          </button>
        }
      />
    </div>
  )
}

/* ── Busy / stop ───────────────────────────────────────────────── */

function BusyStopExample() {
  const [busy, setBusy] = React.useState(false)
  const [reply, setReply] = React.useState('')
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = React.useCallback(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current)
    timerRef.current = null
    setBusy(false)
  }, [])

  React.useEffect(() => stop, [stop])

  const startStreaming = (submission: ComposerSubmission) => {
    const full = `You said: “${submission.plainText}” — streaming a slow reply…`
    setReply('')
    setBusy(true)
    let index = 0
    timerRef.current = setInterval(() => {
      index += 1
      setReply(full.slice(0, index))
      if (index >= full.length) stop()
    }, 40)
  }

  return (
    <div className={`${card} space-y-4`}>
      {reply !== '' && <p className="text-sm text-muted-foreground">{reply}</p>}
      <RefractionComposer
        busy={busy}
        onStop={stop}
        placeholder="Send something to start a fake stream…"
        onSubmit={startStreaming}
      />
    </div>
  )
}

/* ── Edit in place ─────────────────────────────────────────────── */

function EditModeExample() {
  const apiRef = React.useRef<ComposerAPI>(null)
  const [message, setMessage] = React.useState('We ship on Thursday.')

  const beginEdit = () => {
    apiRef.current?.beginEdit({ value: message, messageId: 'msg-1' })
  }

  return (
    <div className={`${card} space-y-4`}>
      <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
        <span className="flex-1">{message}</span>
        <button type="button" className="font-medium underline" onClick={beginEdit}>
          Edit
        </button>
      </div>
      <RefractionComposer
        apiRef={apiRef}
        placeholder="Press ↑ on an empty field to edit the last message…"
        onEditLastRequested={beginEdit}
        onSubmit={(submission) => {
          if (submission.editingMessageId === 'msg-1') setMessage(submission.plainText)
        }}
      />
    </div>
  )
}

/* ── States ────────────────────────────────────────────────────── */

function StatesExample() {
  return (
    <div className={`${card} space-y-6`}>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Disabled</p>
        <RefractionComposer disabled disabledPlaceholder="Messaging is turned off" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Read-only</p>
        <RefractionComposer readOnly defaultValue="You can select and copy this draft, but not edit it." />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Validation error (try sending the word “spam”)
        </p>
        <RefractionComposer
          defaultValue="This message contains spam"
          validator={(plainText) =>
            plainText.includes('spam')
              ? { isValid: false, reason: 'Messages may not contain “spam”.' }
              : { isValid: true }
          }
          onSubmit={() => undefined}
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Counter near the limit (maxLength 80)
        </p>
        <RefractionComposer
          maxLength={80}
          defaultValue="This prefilled draft is deliberately close to the eighty character limit now."
          onSubmit={() => undefined}
        />
      </div>
    </div>
  )
}
