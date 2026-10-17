import { FileCardExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const fileCardProps = [
  {
    name: 'name',
    type: 'string',
    description:
      'Required. Full file name, extension included. Shown middle-truncated; always available in full to assistive technology and as a tooltip.',
  },
  {
    name: 'mimeType',
    type: 'string',
    description:
      'MIME type. Picks the kind (image, video, audio, pdf, archive, code, spreadsheet, document, presentation, text, other); a generic or missing type falls back to the extension.',
  },
  {
    name: 'size',
    type: 'number',
    description: 'Size in bytes, shown as `2.4 MB` (binary multiples).',
  },
  {
    name: 'duration',
    type: 'number',
    description: 'Media duration in seconds, shown as `m:ss` or `h:mm:ss`.',
  },
  {
    name: 'dimensions',
    type: '{ width: number; height: number }',
    description: 'Pixel size, shown as `1,920 × 1,080`.',
  },
  {
    name: 'status',
    type: "'uploading' | 'failed' | 'done'",
    default: "'done'",
    description: 'Upload state.',
  },
  {
    name: 'progress',
    type: 'number',
    description:
      'Upload progress 0–100 while uploading (clamped and rounded). Omit for an indeterminate bar.',
  },
  {
    name: 'error',
    type: 'string',
    description: 'Failure message when `status="failed"`. Defaults to `labels.failed`.',
  },
  {
    name: 'onOpen',
    type: '(event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void',
    description:
      'Opens the file on click, Enter or Space. Without `href` the card renders as a `<button>`; with `href` it also runs on link activation (call `event.preventDefault()` to show a preview instead of navigating).',
  },
  {
    name: 'href',
    type: 'string',
    description:
      'Renders the card as a link. Relative, `http(s):` and `blob:` URLs only; `javascript:`, `data:` and other schemes are dropped.',
  },
  {
    name: 'target',
    type: 'React.HTMLAttributeAnchorTarget',
    description: 'Link target. `_blank` adds `rel="noopener noreferrer"`.',
  },
  {
    name: 'rel',
    type: 'string',
    description: 'Link `rel`, merged with `noopener noreferrer` for new tabs.',
  },
  {
    name: 'onCancel',
    type: '() => void',
    description: 'Shows a cancel icon button while uploading.',
  },
  {
    name: 'onRetry',
    type: '() => void',
    description: 'Shows a retry icon button when the upload failed.',
  },
  {
    name: 'onDownload',
    type: '() => void',
    description: 'Shows a download icon button when done.',
  },
  {
    name: 'actions',
    type: 'React.ReactNode',
    description: 'Extra controls after the built-in actions, e.g. an `<a download>` link.',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'Replaces the kind glyph, e.g. with an image thumbnail. Decorative (`aria-hidden`).',
  },
  {
    name: 'maxNameLength',
    type: 'number',
    default: '32',
    description: 'Visible name length in graphemes before middle truncation.',
  },
  {
    name: 'locale',
    type: 'string',
    default: "'en-US'",
    description: 'Locale for sizes, pixel sizes and percentages.',
  },
  {
    name: 'formatNumber',
    type: '(value: number, options: { maximumFractionDigits: number }) => string',
    description: 'Number formatter; overrides `locale`.',
  },
  {
    name: 'labels',
    type: 'FileCardLabelOverrides',
    description:
      'Translated strings: `kinds`, `uploading`, `failed`, `cancel`, `retry`, `download` and `progress(name)`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the card root.',
  },
]

const usageCode = `import { FileCard } from '@refraction-ui/react'

export function Attachment({ upload }) {
  return (
    <FileCard
      name={upload.file.name}
      mimeType={upload.file.type}
      size={upload.file.size}
      status={upload.status}        // 'uploading' | 'failed' | 'done'
      progress={upload.progress}    // 0–100
      error={upload.error}
      onCancel={upload.cancel}
      onRetry={upload.retry}
      onOpen={() => openPreview(upload.id)}
      onDownload={() => download(upload.id)}
    />
  )
}`

const helpersCode = `import {
  formatFileCardBytes,
  formatFileCardDuration,
  resolveFileCardKind,
  truncateFileCardName,
} from '@refraction-ui/react'

formatFileCardBytes(2_516_582)                       // '2.4 MB'
formatFileCardBytes(1536, { locale: 'de-DE' })       // '1,5 KB'
formatFileCardDuration(3725)                         // '1:02:05'
resolveFileCardKind({ mimeType: 'application/octet-stream', name: 'a.zip' }) // 'archive'
truncateFileCardName('quarterly-financial-report-final.pdf', 24)
// 'quarterly-…ort-final.pdf'`

export default function FileCardPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">File Card</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          One attachment card for every shared file and upload in a conversation: a kind icon, the
          name truncated in the middle so the extension stays visible, size and media details, and
          uploading, failed and done states.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          The kind comes from <code className={code}>mimeType</code>, or from the extension when the
          type is missing or generic. Click a card, or focus it and press Enter or Space, to open it.
        </p>
        <FileCardExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Upload states</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>status=&quot;uploading&quot;</code> shows a progress bar (indeterminate
          without <code className={code}>progress</code>) and a cancel button;{' '}
          <code className={code}>&quot;failed&quot;</code> shows the error and retry;{' '}
          <code className={code}>&quot;done&quot;</code> shows the download action.
        </p>
        <FileCardExamples section="states" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Live upload</h2>
        <p className="text-sm text-muted-foreground">
          A simulated upload. Cancel moves it to the failed state; retry starts again.
        </p>
        <FileCardExamples section="upload" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Links and long names</h2>
        <p className="text-sm text-muted-foreground">
          With <code className={code}>href</code> the card is a link. Long names are cut in the
          middle, keeping the extension; an extension too long to keep is cut like any other name.
          Hover a card to see the full name. Use <code className={code}>actions</code> for your own
          controls, such as an <code className={code}>&lt;a download&gt;</code>.
        </p>
        <FileCardExamples section="link" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Media details</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className={code}>duration</code> (seconds) and{' '}
          <code className={code}>dimensions</code> (pixels) when you know them.
        </p>
        <FileCardExamples section="media" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Localised</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>locale</code> (or <code className={code}>formatNumber</code>)
          formats sizes and percentages; <code className={code}>labels</code> translates every
          string. The default locale is fixed to <code className={code}>en-US</code> so server and
          client render the same text.
        </p>
        <FileCardExamples section="localised" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
        <p className="text-sm text-muted-foreground">
          The pure helpers behind the card are exported too:
        </p>
        <CodeBlock frameworks={{ react: helpersCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The card holds one interactive element — a native{' '}
            <code className={code}>&lt;button&gt;</code> or <code className={code}>&lt;a&gt;</code>{' '}
            around the name — whose overlay stretches over the whole card, so a click anywhere opens
            it. Enter and Space open it (Space is added for links, without scrolling the page).
          </li>
          <li>
            Cancel, retry and download are siblings of that element, never nested inside it:
            controls inside a button or link are invalid HTML and get read as part of its name.
            They come after it in tab order, have a 44 × 44 px hit area, and are described by the
            file name so &quot;Download&quot; is unambiguous in a list.
          </li>
          <li>
            When the name is truncated the visible text is hidden from screen readers and the full
            name is read instead; it is also the element&apos;s <code className={code}>title</code>{' '}
            tooltip.
          </li>
          <li>
            The open control is described by the kind, size and status. Status changes
            (uploading, failure message) are announced through a polite{' '}
            <code className={code}>role=&quot;status&quot;</code> region.
          </li>
          <li>
            The progress bar is a <code className={code}>role=&quot;progressbar&quot;</code> named
            after the file, with <code className={code}>aria-valuenow</code> and a percentage{' '}
            <code className={code}>aria-valuetext</code> (omitted while indeterminate). Its width
            transition and the indeterminate pulse stop under{' '}
            <code className={code}>prefers-reduced-motion</code>.
          </li>
          <li>
            Nothing relies on colour: the kind and the state are written out, and a failure also
            shows an icon. The focus ring outlines the whole card.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={fileCardProps} />
      </section>
    </div>
  )
}
