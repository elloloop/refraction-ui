import { ComposerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const composerProps = [
  { name: 'onImagesPasted', type: '(images: File[]) => void', description: 'Opt-in PNG/JPEG handoff from an explicit paste. Files stay host-owned; mixed text replaces the current selection. No upload or send is performed.' },
  { name: 'onPasteError', type: '(error: unknown) => void', description: 'Image size/empty-payload or clipboard read errors. The full batch and draft are unchanged; localized pasteFailedNotice is visible.' },
  { name: 'onAttachmentAdd', type: '(attachment: ComposerAttachment, file: File) => void', description: 'Without onImagesPasted, the existing generic file staging path also provides the original File to the host uploader.' },
  { name: 'maxAttachmentSizeBytes / acceptAttachment', type: 'number / (draft) => boolean | string', description: 'Core attachment gates. Image handoff defaults to 100 MiB per PNG/JPEG; maxAttachmentSizeBytes can lower/override that clipboard limit. Host-owned staging also applies count/accept gates.' },
  {
    name: 'value',
    type: 'string',
    description: 'Controlled value. When set, the prop wins over internal edits.',
  },
  {
    name: 'defaultValue',
    type: 'string',
    description: 'Initial value for uncontrolled usage.',
  },
  {
    name: 'onChange',
    type: '(value: string) => void',
    description:
      'Fired with the new text after every user-driven change, including the optimistic clear on submit.',
  },
  {
    name: 'onSubmit',
    type: '(submission: ComposerSubmission) => void',
    description:
      'Receives `{ plainText, tokens, attachments, replyToMessageId?, editingMessageId? }`. The field clears optimistically; transport is yours.',
  },
  {
    name: 'placeholder',
    type: 'string',
    description: 'Placeholder text (presentational only — the accessible name is independent).',
  },
  {
    name: 'disabledPlaceholder',
    type: 'string',
    description: 'Distinct placeholder shown while disabled. Falls back to `placeholder`.',
  },
  {
    name: 'minLines',
    type: 'number',
    default: '1',
    description: 'Rows shown when empty.',
  },
  {
    name: 'maxLines',
    type: 'number',
    default: '6',
    description: 'Auto-grow ceiling; the field scrolls internally beyond it.',
  },
  {
    name: 'maxLength',
    type: 'number',
    description:
      'Grapheme-cluster budget (never splits emoji/combining clusters). A counter appears within 20% of the limit. Fixed at mount.',
  },
  {
    name: 'maxAttachments',
    type: 'number',
    description: 'Attachment count limit; overflow surfaces via `onAttachmentRejected`.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the whole composer (distinct from readOnly).',
  },
  {
    name: 'readOnly',
    type: 'boolean',
    default: 'false',
    description: 'Value is selectable/copyable but not editable.',
  },
  {
    name: 'busy',
    type: 'boolean',
    default: 'false',
    description: 'Streaming state: swaps the default send button for a stop button and blocks submit.',
  },
  {
    name: 'onStop',
    type: '() => void',
    description: 'Fired by the built-in stop button while `busy`.',
  },
  {
    name: 'surface',
    type: "'outlined' | 'filled'",
    default: "'outlined'",
    description:
      'Resting fill of the pill. `filled` uses a calm muted fill distinct from the page plus a hairline; both keep a tasteful focus-visible ring.',
  },
  {
    name: 'accessoryPanel',
    type: 'React.ReactNode',
    description:
      'Host content (e.g. an emoji picker) docked INLINE below the field — never a floating overlay. Adds a toggle button to the action row; open/close is animated + reduced-motion aware.',
  },
  {
    name: 'accessoryPanelOpen / defaultAccessoryPanelOpen / onAccessoryPanelToggle',
    type: 'boolean / boolean / (open) => void',
    description: 'Controlled or uncontrolled open state for the inline expression panel.',
  },
  {
    name: 'autoFocus',
    type: 'boolean',
    description: 'Focus the textarea on mount.',
  },
  {
    name: 'dir',
    type: "'ltr' | 'rtl' | 'auto'",
    description: 'Text direction passthrough; the layout uses logical properties throughout.',
  },
  {
    name: 'triggers',
    type: 'ComposerTrigger[]',
    description:
      "Inline trigger configs (mention '@', slash '/', emoji ':', tag '#', custom multi-char). Each provides a `resolve(query)` for the suggestion menu. Fixed at mount.",
  },
  {
    name: 'submitOnEnter',
    type: 'boolean',
    default: 'true',
    description:
      'Whether plain Enter submits (Shift+Enter is always a newline). Defaults to true; a coarse pointer flips the default to false after mount. An explicit prop wins.',
  },
  {
    name: 'strings',
    type: 'Partial<RefractionComposerStrings>',
    description: 'Overridable text bundle (labels, counter, notices) with English defaults.',
  },
  {
    name: 'leading',
    type: 'React.ReactNode',
    description: 'Rendered at the start of the action row (e.g. an attach button).',
  },
  {
    name: 'trailing',
    type: 'React.ReactNode',
    description: 'Rendered at the end of the action row, before the primary action.',
  },
  {
    name: 'primaryAction',
    type: '({ hasText, canSend, busy }) => React.ReactNode',
    description: 'Replaces the built-in send ⇄ stop primary action.',
  },
  {
    name: 'renderSuggestion',
    type: '(candidate, { active, index }) => React.ReactNode',
    description: 'Custom row content for suggestion menu items.',
  },
  {
    name: 'initialAttachments',
    type: 'ComposerAttachmentDraft[]',
    description: 'Attachments staged at creation (SSR-deterministic).',
  },
  {
    name: 'draftStore / draftKey',
    type: 'ComposerDraftStore / string',
    description:
      'Injected draft persistence: debounced autosave, restore on mount, cleared on send.',
  },
  {
    name: 'validator',
    type: '(plainText, tokens) => { isValid, reason? }',
    description: 'Blocks submit and surfaces `reason` as the error banner; the draft is kept.',
  },
  {
    name: 'replyToMessageId',
    type: 'string',
    description: 'Threaded onto every submission.',
  },
  {
    name: 'onEditLastRequested',
    type: '() => void',
    description: 'ArrowUp on an empty field (desktop edit-last affordance).',
  },
  {
    name: 'onEditCancel',
    type: '() => void',
    description: 'Escape pressed while in edit mode (after the draft is restored).',
  },
  {
    name: 'onTypingActivity',
    type: '() => void',
    description: 'Throttled typing signal (leading edge, max one per 3s).',
  },
  {
    name: 'onAttachmentAdd / onAttachmentRejected',
    type: '(attachment) => void / (event) => void',
    description: 'Attachment pipeline callbacks (paste, drop, or `apiRef` additions).',
  },
  {
    name: 'onEvent',
    type: '(event: ComposerEvent) => void',
    description:
      "Raw core notice channel: 'paste-trimmed', 'insert-rejected', 'edit-rejected', 'attachment-rejected', 'typing'.",
  },
  {
    name: 'apiRef',
    type: 'React.Ref<ComposerAPI>',
    description:
      'Receives the composer core for imperative use — `beginEdit`, `addAttachment`, `setError`, `insertTextAtCursor`, ….',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the outer landmark.',
  },
]

const usageCode = `import { RefractionComposer, type ComposerTrigger } from '@refraction-ui/react'

const mentions: ComposerTrigger = {
  id: 'mention',
  symbol: '@',
  resolve: (query) => searchTeammates(query), // sync or async
}

export function ChatFooter() {
  return (
    <RefractionComposer
      placeholder="Send a message…"
      triggers={[mentions]}
      maxLength={2000}
      onSubmit={({ plainText, tokens, attachments }) => {
        sendMessage({ plainText, tokens, attachments })
      }}
    />
  )
}`

const astroUsageCode = `---
import { RefractionInteractiveComposer } from '@refraction-ui/astro'
---

<!-- Opt-in interactive island; no React integration required. -->
<RefractionInteractiveComposer id="composer" defaultValue="Keep this draft">
  <div slot="leading">
    <button type="button" aria-label="Dictate">Mic</button>
    <button type="button" aria-label="Dictation language">Language</button>
  </div>
  <button slot="trailing" type="button">Attach</button>
</RefractionInteractiveComposer>
<!-- Host-owned actions use the row below the same editable field.
     Connect the named buttons to your recording/menu/upload services. -->
<script>
  const composer = document.getElementById('composer')!
  composer.addEventListener('refraction:images-pasted', event => {
    const { images, api } = (event as CustomEvent).detail
    // Original File objects; hand them to your uploader here.
    // Stage with api.addAttachment, then updateAttachment on upload completion.
    console.log(images.map((file: File) => file.name))
  })
  composer.addEventListener('refraction:submit', event => {
    // Only explicit Send (or opt-in submitOnEnter) emits a submission.
    console.log((event as CustomEvent).detail)
  })
</script>`

export default function ComposerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Composer</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A chat message composer with auto-grow, inline triggers (@mention, /command,
          :emoji:) committed as atomic tokens, attachments, drafts, busy/stop, and
          edit-in-place — driven by a headless, framework-agnostic core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Enter sends (Shift+Enter for a newline); whitespace-only messages are never
          sendable. The field clears optimistically on submit.
        </p>
        <ComposerExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Mentions</h2>
        <p className="text-sm text-muted-foreground">
          An <code className="text-xs bg-muted px-1 rounded">@</code> trigger with a local
          candidate list. Committed mentions are atomic tokens: backspace removes the whole
          token and the caret never rests inside one.
        </p>
        <ComposerExamples section="mentions" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Slash commands and emoji</h2>
        <p className="text-sm text-muted-foreground">
          A <code className="text-xs bg-muted px-1 rounded">/</code> trigger scoped to the
          start of the message, plus a <code className="text-xs bg-muted px-1 rounded">:</code>{' '}
          emoji trigger from <code className="text-xs bg-muted px-1 rounded">createEmojiTrigger()</code>,
          which resolves against the <strong>full shared emoji set (~1,900 emoji)</strong> — the
          same source the picker uses. Directly typing a known{' '}
          <code className="text-xs bg-muted px-1 rounded">:shortcode:</code> commits the emoji
          without opening the menu. The menu now eases in (fade + scale) and honours reduced motion.
        </p>
        <ComposerExamples section="slashAndEmoji" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Inline expression panel &amp; filled surface
        </h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">accessoryPanel</code> docks host content
          (here the full emoji picker) <strong>below the field, inside the composer&apos;s own
          stack</strong> — never a floating overlay that covers the message you are typing, the web
          analogue of WhatsApp&apos;s panel-in-the-keyboard. A toggle button appears in the action
          row; open/close is animated and reduced-motion aware. This example also uses{' '}
          <code className="text-xs bg-muted px-1 rounded">surface=&quot;filled&quot;</code>: a calm
          muted fill distinct from the page with a tasteful focus ring.
        </p>
        <ComposerExamples section="expressionPanel" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Attachments</h2>
        <p className="text-sm text-muted-foreground">
          Files arrive via paste, drag-and-drop, or imperatively through{' '}
          <code className="text-xs bg-muted px-1 rounded">apiRef.addAttachment</code>. Chips
          render in a tray above the field and now <strong>animate in (fade + scale) and out
          (a faster exit) </strong>before unmounting; attachments-only messages are sendable.
          Under reduced motion the removal is instant.
        </p>
        <ComposerExamples section="attachments" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Clipboard images</h2>
        <p className="text-sm text-muted-foreground">
          Opt in with <code>onImagesPasted</code> to receive original PNG/JPEG files for your uploader.
          An explicit paste preserves image-only selections and inserts mixed text at the selection;
          it never submits. Unsupported formats are skipped; empty or oversized images reject the
          entire batch before changing the draft. Browser paste events require no background clipboard
          reads or permission polling. Disabled, read-only and composing states block processing. Busy only blocks Send; pasting remains available.
        </p>
        <ComposerExamples section="clipboard" />
        <p className="text-sm text-muted-foreground">
          Astro exposes the same clipboard boundary through <code>RefractionInteractiveComposer</code>
          and bubbling <code>refraction:images-pasted</code> / <code>refraction:paste-error</code> events.
          Its existing static Composer shell remains available. Host upload statuses/removal use the
          event&apos;s core API; files and upload transport remain host-owned. This island covers text,
          image handoff and attachment staging; it does not add React&apos;s mention or accessory UI.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Busy / stop</h2>
        <p className="text-sm text-muted-foreground">
          While <code className="text-xs bg-muted px-1 rounded">busy</code>, the send button
          becomes a stop button and Enter is swallowed — the ChatGPT/Claude-style send ⇄ stop
          swap is one prop.
        </p>
        <ComposerExamples section="busyStop" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Edit in place</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">beginEdit</code> seeds the field and
          submissions carry <code className="text-xs bg-muted px-1 rounded">editingMessageId</code>;
          Escape cancels and restores the pre-edit draft. ArrowUp on an empty field fires{' '}
          <code className="text-xs bg-muted px-1 rounded">onEditLastRequested</code>.
        </p>
        <ComposerExamples section="editMode" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">States</h2>
        <p className="text-sm text-muted-foreground">
          Disabled (distinct placeholder), read-only (selectable, not editable), a
          draft-preserving validation error, and the grapheme-aware counter near the limit.
        </p>
        <ComposerExamples section="states" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: astroUsageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={composerProps} />
      </section>
    </div>
  )
}
