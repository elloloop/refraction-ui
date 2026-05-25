import * as React from 'react'
import { cn } from '@refraction-ui/shared'
import type { MessageAttachment } from '@refraction-ui/conversation'

const h = React.createElement

/** A `/` command entry. */
export interface SlashCommand {
  id: string
  label: string
  description?: string
  icon?: string
  /** Text inserted into the composer when chosen. If omitted, `onSlashCommand` fires and the trigger is removed. */
  insertText?: string
}

/** An `@` mention candidate. */
export interface Mention {
  id: string
  label: string
  avatarUrl?: string
}

export interface ComposerProps {
  placeholder?: string
  busy?: boolean
  /** `/` command palette entries */
  slashCommands?: SlashCommand[]
  /** `@` mention candidates — array or (async) resolver of a query */
  mentions?: Mention[] | ((query: string) => Mention[] | Promise<Mention[]>)
  /** Show the markdown formatting toolbar (default true) */
  toolbar?: boolean
  /** Enable `:` emoji autocomplete (default true) */
  emoji?: boolean
  /** Enable the attach button (default true) */
  attachments?: boolean
  /** Error to surface above the input (with a Retry button) */
  error?: string | null
  onRetry?: () => void
  onSubmit: (content: string, attachments?: MessageAttachment[]) => void
  onStop?: () => void
  /** Called when a `/` command without `insertText` is chosen */
  onSlashCommand?: (cmd: SlashCommand) => void
  autoFocus?: boolean
}

/** Common :shortcode: → emoji. Small, dependency-free set covering the usual ones. */
const EMOJI: Record<string, string> = {
  smile: '😄', grin: '😁', joy: '😂', rofl: '🤣', wink: '😉', heart_eyes: '😍',
  thinking: '🤔', neutral: '😐', sob: '😭', scream: '😱', tada: '🎉', fire: '🔥',
  heart: '❤️', thumbsup: '👍', thumbsdown: '👎', clap: '👏', pray: '🙏', eyes: '👀',
  rocket: '🚀', sparkles: '✨', star: '⭐', check: '✅', x: '❌', warning: '⚠️',
  bulb: '💡', bug: '🐛', wave: '👋', ok_hand: '👌', muscle: '💪', '100': '💯',
  poop: '💩', ghost: '👻', robot: '🤖', cat: '🐱', dog: '🐶', coffee: '☕',
  pizza: '🍕', beer: '🍺', sun: '☀️', moon: '🌙', zap: '⚡',
}

interface TriggerState {
  type: '/' | '@' | ':'
  query: string
  start: number // index of the trigger char in the value
  end: number // caret position
}

/** Detect an active `/`, `@`, or `:` trigger immediately before the caret. */
function detectTrigger(text: string, caret: number): TriggerState | null {
  const before = text.slice(0, caret)
  const m = before.match(/(?:^|\s)([/@:])([\w+-]*)$/)
  if (!m) return null
  const type = m[1] as TriggerState['type']
  const query = m[2] ?? ''
  return { type, query, start: caret - query.length - 1, end: caret }
}

/**
 * Composer — rich message input: markdown formatting toolbar + Cmd/Ctrl shortcuts,
 * and `/` command, `@` mention, and `:` emoji autocomplete menus.
 */
export function Composer({
  placeholder = 'Type a message…  (/ commands, @ mentions, : emoji)',
  busy = false,
  slashCommands = [],
  mentions,
  toolbar = true,
  emoji = true,
  attachments = true,
  error,
  onRetry,
  onSubmit,
  onStop,
  onSlashCommand,
  autoFocus,
}: ComposerProps) {
  const [value, setValue] = React.useState('')
  const [pending, setPending] = React.useState<MessageAttachment[]>([])
  const [trigger, setTrigger] = React.useState<TriggerState | null>(null)
  const [active, setActive] = React.useState(0)
  const [mentionItems, setMentionItems] = React.useState<Mention[]>([])
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  // Resolve `@` mentions for the current query.
  React.useEffect(() => {
    if (trigger?.type !== '@' || !mentions) {
      setMentionItems([])
      return
    }
    if (Array.isArray(mentions)) {
      const q = trigger.query.toLowerCase()
      setMentionItems(mentions.filter((m) => m.label.toLowerCase().includes(q)).slice(0, 8))
      return
    }
    let cancelled = false
    Promise.resolve(mentions(trigger.query)).then((res) => {
      if (!cancelled) setMentionItems(res.slice(0, 8))
    })
    return () => {
      cancelled = true
    }
  }, [trigger, mentions])

  // Items for the active trigger menu.
  const items: { key: string; primary: string; secondary?: string; icon?: string; apply: string; runCmd?: SlashCommand }[] =
    React.useMemo(() => {
      if (!trigger) return []
      const q = trigger.query.toLowerCase()
      if (trigger.type === '/') {
        return slashCommands
          .filter((c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
          .slice(0, 8)
          .map((c) => ({ key: c.id, primary: c.label, secondary: c.description, icon: c.icon, apply: c.insertText ?? '', runCmd: c }))
      }
      if (trigger.type === '@') {
        return mentionItems.map((m) => ({ key: m.id, primary: m.label, icon: m.avatarUrl ? '' : '@', apply: `@${m.label} ` }))
      }
      if (trigger.type === ':' && emoji) {
        return Object.entries(EMOJI)
          .filter(([name]) => name.includes(q))
          .slice(0, 8)
          .map(([name, char]) => ({ key: name, primary: `${char}  :${name}:`, apply: char }))
      }
      return []
    }, [trigger, slashCommands, mentionItems, emoji])

  const menuOpen = trigger !== null && items.length > 0

  React.useEffect(() => setActive(0), [trigger?.type, trigger?.query])

  function syncFromTextarea(el: HTMLTextAreaElement) {
    setValue(el.value)
    setTrigger(detectTrigger(el.value, el.selectionStart ?? el.value.length))
  }

  function selectItem(i: number) {
    const item = items[i]
    if (!item || !trigger) return
    if (trigger.type === '/' && !item.apply && item.runCmd) {
      // Run-style command: drop the trigger text, fire the callback.
      const next = value.slice(0, trigger.start) + value.slice(trigger.end)
      setValue(next)
      setTrigger(null)
      onSlashCommand?.(item.runCmd)
      queueCaret(trigger.start)
      return
    }
    const next = value.slice(0, trigger.start) + item.apply + value.slice(trigger.end)
    setValue(next)
    setTrigger(null)
    queueCaret(trigger.start + item.apply.length)
  }

  function queueCaret(pos: number) {
    requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      el.focus()
      el.setSelectionRange(pos, pos)
    })
  }

  /** Wrap or prefix the current selection for a toolbar action. */
  function format(kind: 'bold' | 'italic' | 'code' | 'link' | 'quote' | 'ul' | 'ol') {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const sel = value.slice(start, end)
    let replacement = sel
    let caretOffset = 0
    if (kind === 'bold') replacement = `**${sel || 'bold'}**`
    else if (kind === 'italic') replacement = `*${sel || 'italic'}*`
    else if (kind === 'code') replacement = sel.includes('\n') ? `\n\`\`\`\n${sel}\n\`\`\`\n` : `\`${sel || 'code'}\``
    else if (kind === 'link') {
      replacement = `[${sel || 'text'}](url)`
      caretOffset = replacement.length - 4 // place caret at "url"
    } else if (kind === 'quote' || kind === 'ul' || kind === 'ol') {
      const prefix = kind === 'quote' ? '> ' : kind === 'ul' ? '- ' : '1. '
      const block = (sel || 'item').split('\n').map((l) => prefix + l).join('\n')
      replacement = (start > 0 && value[start - 1] !== '\n' ? '\n' : '') + block
    }
    const next = value.slice(0, start) + replacement + value.slice(end)
    setValue(next)
    const caret = caretOffset ? start + caretOffset : start + replacement.length
    queueCaret(caret)
  }

  function submit() {
    const text = value.trim()
    if ((!text && pending.length === 0) || busy) return
    onSubmit(text, pending.length ? pending : undefined)
    setValue('')
    setPending([])
    setTrigger(null)
  }

  function onFiles(files: FileList | null) {
    if (!files) return
    setPending((p) => [
      ...p,
      ...Array.from(files).map((f) => ({
        id: `${f.name}-${f.size}-${f.lastModified}`,
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type || 'application/octet-stream',
        size: f.size,
      })),
    ])
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (menuOpen) {
      if (e.key === 'ArrowDown') return (e.preventDefault(), setActive((a) => (a + 1) % items.length))
      if (e.key === 'ArrowUp') return (e.preventDefault(), setActive((a) => (a - 1 + items.length) % items.length))
      if (e.key === 'Enter' || e.key === 'Tab') return (e.preventDefault(), selectItem(active))
      if (e.key === 'Escape') return (e.preventDefault(), setTrigger(null))
    }
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key.toLowerCase() === 'b') return (e.preventDefault(), format('bold'))
    if (mod && e.key.toLowerCase() === 'i') return (e.preventDefault(), format('italic'))
    if (mod && e.key.toLowerCase() === 'e') return (e.preventDefault(), format('code'))
    if (mod && e.key.toLowerCase() === 'k') return (e.preventDefault(), format('link'))
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const iconBtn = 'flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground'
  const toolbarBtn = (label: string, title: string, kind: Parameters<typeof format>[0]) =>
    h(
      'button',
      {
        key: kind,
        type: 'button',
        title,
        className: cn(iconBtn, 'text-xs font-medium'),
        onMouseDown: (e: React.MouseEvent) => e.preventDefault(), // keep textarea selection
        onClick: () => format(kind),
      },
      label,
    )

  const menu = menuOpen
    ? h(
        'div',
        {
          className:
            'absolute bottom-full left-0 z-20 mb-2 w-72 overflow-hidden rounded-xl border border-border bg-popover shadow-lg',
          role: 'listbox',
        },
        h(
          'div',
          { className: 'border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground' },
          trigger?.type === '/' ? 'Commands' : trigger?.type === '@' ? 'Mentions' : 'Emoji',
        ),
        ...items.map((it, i) =>
          h(
            'button',
            {
              key: it.key,
              type: 'button',
              role: 'option',
              'aria-selected': i === active,
              className: cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                i === active ? 'bg-accent' : 'hover:bg-accent/50',
              ),
              onMouseEnter: () => setActive(i),
              onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
              onClick: () => selectItem(i),
            },
            it.icon ? h('span', { className: 'w-4 text-center text-muted-foreground' }, it.icon) : null,
            h('span', { className: 'flex-1 truncate' }, it.primary),
            it.secondary ? h('span', { className: 'truncate text-xs text-muted-foreground' }, it.secondary) : null,
          ),
        ),
      )
    : null

  return h(
    'div',
    { className: 'p-3' },
    h(
      'div',
      { className: 'relative' },
      menu,
      // unified input card
      h(
        'div',
        {
          className:
            'overflow-hidden rounded-2xl border border-border bg-background transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40',
        },
        // error banner
        error
          ? h(
              'div',
              { className: 'flex items-center gap-2 border-b border-border bg-destructive/5 px-3 py-2 text-xs text-destructive', role: 'alert' },
              h('span', { className: 'flex-1 truncate' }, error),
              onRetry ? h('button', { type: 'button', className: 'font-medium underline', onClick: () => onRetry() }, 'Retry') : null,
            )
          : null,
        // attachment chips
        pending.length > 0
          ? h(
              'div',
              { className: 'flex flex-wrap gap-2 px-3 pt-3' },
              ...pending.map((a) =>
                h(
                  'span',
                  { key: a.id, className: 'inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs' },
                  a.name,
                  h(
                    'button',
                    { type: 'button', className: 'text-muted-foreground hover:text-destructive', onClick: () => setPending((p) => p.filter((x) => x.id !== a.id)) },
                    '✕',
                  ),
                ),
              ),
            )
          : null,
        // textarea (borderless)
        h('textarea', {
          ref,
          className: 'block max-h-40 w-full resize-none bg-transparent px-3.5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none',
          rows: 1,
          value,
          placeholder,
          autoFocus,
          'aria-label': 'Message',
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => syncFromTextarea(e.target),
          onClick: (e: React.MouseEvent<HTMLTextAreaElement>) => syncFromTextarea(e.currentTarget),
          onKeyUp: (e: React.KeyboardEvent<HTMLTextAreaElement>) => syncFromTextarea(e.currentTarget),
          onKeyDown,
          onBlur: () => setTimeout(() => setTrigger(null), 120),
        }),
        // bottom action bar
        h(
          'div',
          { className: 'flex items-center gap-0.5 px-2 pb-2' },
          attachments
            ? h(
                React.Fragment,
                null,
                h('input', {
                  ref: fileRef,
                  type: 'file',
                  accept: 'image/*',
                  multiple: true,
                  className: 'hidden',
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    onFiles(e.target.files)
                    e.target.value = ''
                  },
                }),
                h('button', { type: 'button', className: iconBtn, 'aria-label': 'Attach image or GIF', onClick: () => fileRef.current?.click() }, '📎'),
              )
            : null,
          attachments && toolbar ? h('span', { className: 'mx-1 h-5 w-px bg-border' }) : null,
          toolbar
            ? h(
                React.Fragment,
                null,
                toolbarBtn('B', 'Bold (⌘B)', 'bold'),
                toolbarBtn('𝑖', 'Italic (⌘I)', 'italic'),
                toolbarBtn('</>', 'Code (⌘E)', 'code'),
                toolbarBtn('🔗', 'Link (⌘K)', 'link'),
                toolbarBtn('❝', 'Quote', 'quote'),
                toolbarBtn('•', 'Bulleted list', 'ul'),
                toolbarBtn('1.', 'Numbered list', 'ol'),
              )
            : null,
          h('div', { className: 'flex-1' }),
          busy
            ? h(
                'button',
                { type: 'button', 'aria-label': 'Stop', className: 'flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground', onClick: () => onStop?.() },
                '■',
              )
            : h(
                'button',
                {
                  type: 'button',
                  'aria-label': 'Send',
                  className: 'flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-base font-semibold text-primary-foreground transition disabled:opacity-40',
                  disabled: !value.trim() && pending.length === 0,
                  onClick: submit,
                },
                '↑',
              ),
        ),
      ),
    ),
  )
}
