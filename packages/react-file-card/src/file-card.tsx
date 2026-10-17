import * as React from 'react'
import {
  createFileCard,
  sanitizeFileCardHref,
  resolveFileCardRel,
  fileCardVariants,
  fileCardIconVariants,
  fileCardBodyClass,
  fileCardOpenControlClass,
  fileCardNameClass,
  fileCardMetaClass,
  fileCardStatusVariants,
  fileCardStatusIconClass,
  fileCardProgressTrackClass,
  fileCardProgressFillVariants,
  fileCardActionsClass,
  FILE_CARD_META_SEPARATOR,
  type FileCardAPI,
  type FileCardDimensions,
  type FileCardLabelOverrides,
  type FileCardNumberFormatter,
  type FileCardStatus,
} from '@refraction-ui/file-card'
import { IconButton } from '@refraction-ui/react-icon-button'
import { cn } from '@refraction-ui/shared'
import {
  FileCardKindIcon,
  FileCardCancelIcon,
  FileCardRetryIcon,
  FileCardDownloadIcon,
  FileCardAlertIcon,
} from './file-card-icons.js'

export type FileCardOpenEvent = React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>

export interface FileCardProps
  // `rel` is an RDFa attribute on every element in React's types; here it
  // belongs to the file link, not the card root.
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'rel'> {
  /** Full file name, extension included. Always available to AT and as a tooltip. */
  name: string
  /** MIME type; decides the kind icon (falls back to the extension). */
  mimeType?: string
  /** Size in bytes. */
  size?: number
  /** Media duration in seconds; shown as `m:ss` / `h:mm:ss`. */
  duration?: number
  /** Pixel size, shown as `width × height`. */
  dimensions?: FileCardDimensions
  /** Upload state. */
  status?: FileCardStatus
  /** Upload progress 0–100 while `status="uploading"`; omit for an indeterminate bar. */
  progress?: number
  /** Failure message when `status="failed"`. */
  error?: string
  /** Opens the file. Renders the card as a `<button>` (or runs alongside `href`). */
  onOpen?: (event: FileCardOpenEvent) => void
  /** Renders the card as a link. Unsafe schemes (`javascript:`, `data:`, …) are dropped. */
  href?: string
  /** Link target; `_blank` adds `rel="noopener noreferrer"`. */
  target?: React.HTMLAttributeAnchorTarget
  /** Link `rel`. */
  rel?: string
  /** Shows a cancel icon button while uploading. */
  onCancel?: () => void
  /** Shows a retry icon button when the upload failed. */
  onRetry?: () => void
  /** Shows a download icon button when done. */
  onDownload?: () => void
  /** Extra controls rendered after the built-in actions (e.g. an `<a download>`). */
  actions?: React.ReactNode
  /** Replaces the kind glyph, e.g. with an image thumbnail. Decorative. */
  icon?: React.ReactNode
  /** Visible name length in graphemes before middle truncation. */
  maxNameLength?: number
  /** Locale for sizes, dimensions and percentages. Defaults to `en-US`. */
  locale?: string
  /** Number formatter; overrides `locale`. */
  formatNumber?: FileCardNumberFormatter
  /** Translated strings (kind names, status text, action labels). */
  labels?: FileCardLabelOverrides
}

const SPACE_KEY = ' '

/** The visible (possibly truncated) name plus the full name for AT. */
function FileCardName({ api, name }: { api: FileCardAPI; name: string }) {
  if (!api.isTruncated) return <>{name}</>
  return (
    <>
      <span aria-hidden="true">{api.displayName}</span>
      <span className="sr-only">{name}</span>
    </>
  )
}

interface OpenControlProps {
  api: FileCardAPI
  name: string
  nameId: string
  describedBy: string
  href: string | undefined
  target: React.HTMLAttributeAnchorTarget | undefined
  rel: string | undefined
  onOpen: ((event: FileCardOpenEvent) => void) | undefined
}

/**
 * The single interactive element of the card body: a link when there is a
 * safe `href`, a button when there is only `onOpen`, plain text otherwise.
 */
function FileCardOpenControl({ api, name, nameId, describedBy, href, target, rel, onOpen }: OpenControlProps) {
  const content = <FileCardName api={api} name={name} />
  const shared = {
    id: nameId,
    title: name,
    'aria-describedby': describedBy,
    'data-file-card-open': '',
    className: fileCardOpenControlClass,
  }

  if (href !== undefined) {
    // Links activate on Enter only; the card promises Space too, like a button.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
      if (event.key !== SPACE_KEY) return
      event.preventDefault()
      event.currentTarget.click()
    }
    return (
      <a
        {...shared}
        href={href}
        target={target}
        rel={resolveFileCardRel(target, rel)}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
      >
        {content}
      </a>
    )
  }

  if (onOpen) {
    return (
      <button {...shared} type="button" onClick={onOpen}>
        {content}
      </button>
    )
  }

  return (
    <span id={nameId} title={name} className={fileCardNameClass}>
      {content}
    </span>
  )
}

function FileCardProgress({ api }: { api: FileCardAPI }) {
  const indeterminate = api.progress === null
  return (
    <div className={fileCardProgressTrackClass} {...api.progressAriaProps}>
      <div
        className={fileCardProgressFillVariants({ indeterminate: indeterminate ? 'true' : 'false' })}
        style={indeterminate ? undefined : { width: `${api.progress}%` }}
      />
    </div>
  )
}

/** Visible status line. Hidden from AT: the live region and progress bar carry the same facts. */
function FileCardStatusLine({ api }: { api: FileCardAPI }) {
  const text = api.progressText
    ? `${api.statusText}${FILE_CARD_META_SEPARATOR}${api.progressText}`
    : api.statusText
  return (
    <p aria-hidden="true" className={fileCardStatusVariants({ status: api.status })}>
      {api.status === 'failed' && (
        <span className={fileCardStatusIconClass}>
          <FileCardAlertIcon />
        </span>
      )}
      <span className="truncate">{text}</span>
    </p>
  )
}

interface ActionsProps {
  api: FileCardAPI
  nameId: string
  onCancel?: () => void
  onRetry?: () => void
  onDownload?: () => void
  actions?: React.ReactNode
}

function FileCardActions({ api, nameId, onCancel, onRetry, onDownload, actions }: ActionsProps) {
  const { status, labels } = api
  // Short visible labels (they double as tooltips); the file name reaches AT
  // as the description, so "Cancel upload" is never ambiguous in a list.
  const shared = { variant: 'ghost', size: 'sm', 'aria-describedby': nameId } as const
  const cancel = status === 'uploading' && onCancel
  const retry = status === 'failed' && onRetry
  const download = status === 'done' && onDownload
  if (!cancel && !retry && !download && actions == null) return null

  return (
    <div className={fileCardActionsClass}>
      {cancel && <IconButton {...shared} label={labels.cancel} icon={<FileCardCancelIcon />} onClick={onCancel} />}
      {retry && <IconButton {...shared} label={labels.retry} icon={<FileCardRetryIcon />} onClick={onRetry} />}
      {download && (
        <IconButton {...shared} label={labels.download} icon={<FileCardDownloadIcon />} onClick={onDownload} />
      )}
      {actions}
    </div>
  )
}

/**
 * FileCard — one card for every shared file and upload in a conversation.
 *
 * Shows a kind glyph (from the MIME type or extension), the name
 * middle-truncated so the extension stays visible, the kind, size and media
 * details as text, and the upload state: a `role="progressbar"` with cancel
 * while uploading, an error with retry when failed, a download action when
 * done.
 *
 * Structure: the card body holds ONE interactive element — a `<button>`
 * (`onOpen`) or `<a>` (`href`) wrapping the name — whose `::after` overlay
 * stretches over the whole card, so a click anywhere opens the file. The
 * action buttons are siblings stacked above that overlay, never descendants:
 * interactive content inside a button or link is invalid HTML, gets flattened
 * into the card's accessible name, and would fire the card's click too.
 */
export const FileCard = React.forwardRef<HTMLDivElement, FileCardProps>(function FileCard(
  {
    name,
    mimeType,
    size,
    duration,
    dimensions,
    status,
    progress,
    error,
    onOpen,
    href,
    target,
    rel,
    onCancel,
    onRetry,
    onDownload,
    actions,
    icon,
    maxNameLength,
    locale,
    formatNumber,
    labels,
    className,
    ...props
  },
  ref,
) {
  const api = createFileCard({
    name,
    mimeType,
    size,
    duration,
    dimensions,
    status,
    progress,
    error,
    maxNameLength,
    locale,
    formatNumber,
    labels,
  })
  const id = React.useId()
  const nameId = `${id}-name`
  const metaId = `${id}-meta`
  const statusId = `${id}-status`
  const safeHref = sanitizeFileCardHref(href)
  const interactive = safeHref !== undefined || onOpen !== undefined

  return (
    <div
      ref={ref}
      className={cn(fileCardVariants({ status: api.status, interactive: interactive ? 'true' : 'false' }), className)}
      {...api.dataAttributes}
      {...props}
    >
      <span aria-hidden="true" className={fileCardIconVariants({ status: api.status })}>
        {icon ?? <FileCardKindIcon kind={api.kind} />}
      </span>
      <div className={fileCardBodyClass}>
        <FileCardOpenControl
          api={api}
          name={name}
          nameId={nameId}
          describedBy={`${metaId} ${statusId}`}
          href={safeHref}
          target={target}
          rel={rel}
          onOpen={onOpen}
        />
        <p id={metaId} className={fileCardMetaClass}>
          {api.metaText}
        </p>
        {/* Always mounted so state changes are announced; empty when done. */}
        <span id={statusId} role="status" className="sr-only">
          {api.statusText}
        </span>
        {api.status !== 'done' && <FileCardStatusLine api={api} />}
        {api.status === 'uploading' && <FileCardProgress api={api} />}
      </div>
      <FileCardActions
        api={api}
        nameId={nameId}
        onCancel={onCancel}
        onRetry={onRetry}
        onDownload={onDownload}
        actions={actions}
      />
    </div>
  )
})
