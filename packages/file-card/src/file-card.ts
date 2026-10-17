/**
 * Headless FileCard core: pure helpers for an attachment card (kind, name,
 * size, media details, upload state). JSX-free and deterministic — no clock,
 * no randomness, and number formatting uses an explicit locale so server and
 * client render the same text.
 */

/* ------------------------------------------------------------------ */
/*  Kinds                                                              */
/* ------------------------------------------------------------------ */

export const FILE_CARD_KINDS = [
  'image',
  'video',
  'audio',
  'pdf',
  'archive',
  'code',
  'spreadsheet',
  'document',
  'presentation',
  'text',
  'other',
] as const

export type FileKind = (typeof FILE_CARD_KINDS)[number]

/** Exact MIME types whose kind can't be read from the top-level type. */
const MIME_KIND: Readonly<Record<string, FileKind>> = {
  'application/pdf': 'pdf',
  'application/zip': 'archive',
  'application/x-zip-compressed': 'archive',
  'application/gzip': 'archive',
  'application/x-gzip': 'archive',
  'application/x-tar': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/vnd.rar': 'archive',
  'application/x-bzip2': 'archive',
  'application/x-xz': 'archive',
  'application/json': 'code',
  'application/ld+json': 'code',
  'application/xml': 'code',
  'application/javascript': 'code',
  'application/typescript': 'code',
  'application/x-sh': 'code',
  'application/x-python-code': 'code',
  'application/sql': 'code',
  'application/x-yaml': 'code',
  'application/yaml': 'code',
  'application/toml': 'code',
  'text/html': 'code',
  'text/css': 'code',
  'text/javascript': 'code',
  'text/x-python': 'code',
  'text/x-typescript': 'code',
  'text/xml': 'code',
  'text/yaml': 'code',
  'text/x-shellscript': 'code',
  'text/csv': 'spreadsheet',
  'text/tab-separated-values': 'spreadsheet',
  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'application/vnd.oasis.opendocument.spreadsheet': 'spreadsheet',
  'application/vnd.apple.numbers': 'spreadsheet',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.oasis.opendocument.text': 'document',
  'application/rtf': 'document',
  'text/rtf': 'document',
  'application/vnd.apple.pages': 'document',
  'application/vnd.ms-powerpoint': 'presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
  'application/vnd.oasis.opendocument.presentation': 'presentation',
  'application/vnd.apple.keynote': 'presentation',
}

/** Top-level MIME types that decide the kind on their own. */
const MIME_TOP_LEVEL_KIND: Readonly<Record<string, FileKind>> = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  text: 'text',
}

/**
 * MIME types that say nothing about the content, so the extension decides.
 * Browsers report `application/octet-stream` (or an empty type) for anything
 * they don't recognise.
 */
const GENERIC_MIME_TYPES: ReadonlySet<string> = new Set(['', 'application/octet-stream'])

const EXTENSION_KIND: Readonly<Record<string, FileKind>> = {
  ...extensions('image', ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'bmp', 'ico', 'heic', 'heif', 'tif', 'tiff']),
  ...extensions('video', ['mp4', 'm4v', 'mov', 'webm', 'mkv', 'avi', 'wmv', 'ogv']),
  ...extensions('audio', ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'weba']),
  ...extensions('pdf', ['pdf']),
  ...extensions('archive', ['zip', 'gz', 'tgz', 'tar', '7z', 'rar', 'bz2', 'xz']),
  ...extensions('code', [
    'js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'html', 'htm', 'css', 'scss', 'py', 'rb',
    'go', 'rs', 'java', 'kt', 'swift', 'c', 'h', 'cpp', 'hpp', 'cs', 'php', 'sh', 'sql', 'yaml',
    'yml', 'toml', 'xml', 'dart', 'vue', 'astro',
  ]),
  ...extensions('spreadsheet', ['csv', 'tsv', 'xls', 'xlsx', 'ods', 'numbers']),
  ...extensions('document', ['doc', 'docx', 'odt', 'rtf', 'pages']),
  ...extensions('presentation', ['ppt', 'pptx', 'odp', 'key']),
  ...extensions('text', ['txt', 'md', 'markdown', 'log']),
}

function extensions(kind: FileKind, list: readonly string[]): Record<string, FileKind> {
  return Object.fromEntries(list.map((ext) => [ext, kind]))
}

/** Lower-cased MIME type without parameters (`text/plain; charset=utf-8` → `text/plain`). */
function normalizeMimeType(mimeType: string | undefined): string {
  return (mimeType ?? '').split(';')[0].trim().toLowerCase()
}

/**
 * Split a file name into its base and extension (the extension keeps its dot).
 * A leading dot belongs to the base, so dotfiles have no extension
 * (`.gitignore` → `{ base: '.gitignore', extension: '' }`); so does a trailing
 * dot (`notes.` → no extension).
 */
export function splitFileCardName(name: string): { base: string; extension: string } {
  const dot = name.lastIndexOf('.')
  if (dot <= 0 || dot === name.length - 1) return { base: name, extension: '' }
  return { base: name.slice(0, dot), extension: name.slice(dot) }
}

/** The extension in lower case without its dot, or `''` when there is none. */
export function getFileCardExtension(name: string): string {
  return splitFileCardName(name).extension.slice(1).toLowerCase()
}

/**
 * Resolve a file's kind. A specific MIME type wins; a generic or missing one
 * (`application/octet-stream`, `''`) falls back to the extension, and so does
 * a top-level `text/*` type the extension can refine (`text/plain` for a
 * `.ts` file is still code).
 */
export function resolveFileCardKind(input: { mimeType?: string; name?: string }): FileKind {
  const mime = normalizeMimeType(input.mimeType)
  const byExtension = EXTENSION_KIND[getFileCardExtension(input.name ?? '')]

  const exact = MIME_KIND[mime]
  if (exact) return exact
  if (GENERIC_MIME_TYPES.has(mime)) return byExtension ?? 'other'

  const topLevel = MIME_TOP_LEVEL_KIND[mime.split('/')[0]]
  if (topLevel === 'text') return byExtension ?? 'text'
  return topLevel ?? byExtension ?? 'other'
}

/* ------------------------------------------------------------------ */
/*  Number formatting                                                  */
/* ------------------------------------------------------------------ */

/**
 * Formats a number for display. Inject one to localise digits/separators
 * consistently with the rest of an app; the default uses `Intl.NumberFormat`.
 */
export type FileCardNumberFormatter = (
  value: number,
  options: { maximumFractionDigits: number },
) => string

/**
 * Fixed default so server and client render identical text (the runtime's
 * locale differs between them). Pass `locale` or `formatNumber` to localise.
 */
export const FILE_CARD_DEFAULT_LOCALE = 'en-US'

export function createFileCardNumberFormatter(
  locale: string = FILE_CARD_DEFAULT_LOCALE,
): FileCardNumberFormatter {
  return (value, { maximumFractionDigits }) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value)
}

/* ------------------------------------------------------------------ */
/*  Bytes                                                              */
/* ------------------------------------------------------------------ */

/** Unit names, smallest first; each is `FILE_CARD_BYTE_BASE` times the previous. */
export const FILE_CARD_BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const

/** Binary multiples, matching what file managers and `file-upload` show. */
export const FILE_CARD_BYTE_BASE = 1024

/** One decimal above bytes ("2.4 MB"); whole bytes are never fractional. */
export const FILE_CARD_BYTE_FRACTION_DIGITS = 1

export interface FileCardByteFormatOptions {
  /** Locale for the default number formatter. */
  locale?: string
  /** Number formatter; overrides `locale`. */
  formatNumber?: FileCardNumberFormatter
  /** Unit names, smallest first (translate or use IEC `KiB`). Defaults to `FILE_CARD_BYTE_UNITS`. */
  units?: readonly string[]
  /** Multiple between units. Defaults to 1024; pass 1000 for SI. */
  base?: number
}

/**
 * Human-readable size: `0 B`, `512 B`, `1.5 KB`, `2.4 MB`. Picks the largest
 * unit that keeps the value at least 1, and bumps to the next unit when
 * rounding would show the base itself (`1023.96 KB` → `1 MB`, not `1,024 KB`).
 * Returns `''` for a negative or non-finite size, which callers treat as
 * "size unknown".
 */
export function formatFileCardBytes(bytes: number, options: FileCardByteFormatOptions = {}): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  const units = options.units ?? FILE_CARD_BYTE_UNITS
  const base = options.base ?? FILE_CARD_BYTE_BASE
  const formatNumber = options.formatNumber ?? createFileCardNumberFormatter(options.locale)
  const last = units.length - 1

  let index = 0
  let value = bytes
  while (index < last && value >= base) {
    value /= base
    index += 1
  }
  const digits = index === 0 ? 0 : FILE_CARD_BYTE_FRACTION_DIGITS
  if (index < last && roundTo(value, digits) >= base) {
    value /= base
    index += 1
  }
  return `${formatNumber(roundTo(value, digits), { maximumFractionDigits: digits })} ${units[index]}`
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/* ------------------------------------------------------------------ */
/*  Duration and dimensions                                            */
/* ------------------------------------------------------------------ */

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const CLOCK_FIELD_WIDTH = 2

function pad(value: number): string {
  return String(value).padStart(CLOCK_FIELD_WIDTH, '0')
}

/**
 * Media duration as `m:ss`, or `h:mm:ss` from one hour (`65` → `1:05`,
 * `3725` → `1:02:05`). Fractions are dropped, not rounded, so a 59.9 s clip
 * never reads as a minute. Returns `''` for negative or non-finite input.
 */
export function formatFileCardDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return ''
  const total = Math.floor(seconds)
  const hours = Math.floor(total / SECONDS_PER_HOUR)
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const secs = total % SECONDS_PER_MINUTE
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs)}`
  return `${minutes}:${pad(secs)}`
}

export interface FileCardDimensions {
  width: number
  height: number
}

/** Separator between width and height; a multiplication sign, not the letter x. */
export const FILE_CARD_DIMENSION_SEPARATOR = '×'

/**
 * Pixel size as `1920 × 1080`. Returns `''` unless both sides are positive
 * finite numbers.
 */
export function formatFileCardDimensions(
  dimensions: FileCardDimensions,
  formatNumber: FileCardNumberFormatter = createFileCardNumberFormatter(),
): string {
  const { width, height } = dimensions
  if (!isPositive(width) || !isPositive(height)) return ''
  const whole = { maximumFractionDigits: 0 }
  return `${formatNumber(width, whole)} ${FILE_CARD_DIMENSION_SEPARATOR} ${formatNumber(height, whole)}`
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

/* ------------------------------------------------------------------ */
/*  Middle truncation                                                  */
/* ------------------------------------------------------------------ */

export const FILE_CARD_ELLIPSIS = '…'

/** Default visible length of a name, in graphemes. */
export const FILE_CARD_DEFAULT_MAX_NAME_LENGTH = 32

/** Base-name graphemes always kept before the ellipsis, so a name never starts with "…". */
const MIN_HEAD_GRAPHEMES = 1

/** Splits text into user-perceived characters. */
export type FileCardSegmenter = (text: string) => string[]

/**
 * Grapheme segmentation, so an emoji, flag or accented letter is never cut in
 * half. Falls back to code points where `Intl.Segmenter` is missing (still
 * never splits a surrogate pair).
 */
export function segmentFileCardGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), (part) => part.segment)
  }
  return Array.from(text)
}

export interface FileCardTruncateOptions {
  /** Defaults to `…`. */
  ellipsis?: string
  /** Defaults to `segmentFileCardGraphemes`. */
  segment?: FileCardSegmenter
}

/**
 * Shorten a file name to `maxLength` graphemes by cutting the middle of the
 * base name, so the extension stays visible:
 * at 24, `quarterly-financial-report-final.pdf` → `quarterly-…ort-final.pdf`.
 *
 * - No extension (including dotfiles such as `.gitignore`): plain middle
 *   truncation of the whole name.
 * - An extension too long to leave room for the start of the name (an
 *   arbitrary `.backup-2024-01-01`): plain middle truncation too, which still
 *   ends with the end of the extension.
 * - `maxLength` is clamped up so the result always holds one grapheme each
 *   side of the ellipsis; a non-finite `maxLength` disables truncation.
 */
export function truncateFileCardName(
  name: string,
  maxLength: number = FILE_CARD_DEFAULT_MAX_NAME_LENGTH,
  options: FileCardTruncateOptions = {},
): string {
  if (!Number.isFinite(maxLength)) return name
  const ellipsis = options.ellipsis ?? FILE_CARD_ELLIPSIS
  const segment = options.segment ?? segmentFileCardGraphemes

  const graphemes = segment(name)
  const ellipsisLength = segment(ellipsis).length
  const limit = Math.max(Math.floor(maxLength), ellipsisLength + 2 * MIN_HEAD_GRAPHEMES)
  if (graphemes.length <= limit) return name

  const budget = limit - ellipsisLength
  const { base, extension } = splitFileCardName(name)
  const extensionLength = segment(extension).length

  if (extensionLength === 0 || budget - extensionLength < MIN_HEAD_GRAPHEMES) {
    return cutMiddle(graphemes, budget, ellipsis)
  }
  const baseKept = cutMiddle(segment(base), budget - extensionLength, ellipsis)
  return `${baseKept}${extension}`
}

/** Keep `keep` graphemes split around an ellipsis, the extra one at the start. */
function cutMiddle(graphemes: string[], keep: number, ellipsis: string): string {
  const head = Math.ceil(keep / 2)
  const tail = keep - head
  const end = tail > 0 ? graphemes.slice(-tail).join('') : ''
  return `${graphemes.slice(0, head).join('')}${ellipsis}${end}`
}

/* ------------------------------------------------------------------ */
/*  Links                                                              */
/* ------------------------------------------------------------------ */

/**
 * Schemes a file link may use. `blob:` covers local previews of a file being
 * uploaded; relative URLs (no scheme) are always allowed. Everything else —
 * `javascript:`, `data:`, `vbscript:`, `file:` — is rejected.
 */
export const FILE_CARD_ALLOWED_PROTOCOLS: readonly string[] = ['http:', 'https:', 'blob:']

/** `noopener noreferrer` for links that open a new browsing context. */
export const FILE_CARD_NEW_TAB_REL = 'noopener noreferrer'

const SCHEME_PATTERN = /^([a-z][a-z\d+.-]*):/i
// Browsers strip whitespace and control characters from URLs, which is how
// `java\nscript:` slips past a naive scheme check; refuse them outright.
// eslint-disable-next-line no-control-regex
const WHITESPACE_OR_CONTROL = /[\s\u0000-\u001f\u007f]/

/** The href when it is safe to render, otherwise `undefined` (the card then can't navigate). */
export function sanitizeFileCardHref(href: string | undefined): string | undefined {
  if (!href || WHITESPACE_OR_CONTROL.test(href)) return undefined
  const scheme = SCHEME_PATTERN.exec(href)?.[1]
  if (scheme === undefined) return href
  return FILE_CARD_ALLOWED_PROTOCOLS.includes(`${scheme.toLowerCase()}:`) ? href : undefined
}

/** `rel` for a file link: adds `noopener noreferrer` when it opens a new tab. */
export function resolveFileCardRel(target: string | undefined, rel: string | undefined): string | undefined {
  if (target !== '_blank') return rel
  const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean))
  for (const token of FILE_CARD_NEW_TAB_REL.split(' ')) tokens.add(token)
  return Array.from(tokens).join(' ')
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

export type FileCardStatus = 'uploading' | 'failed' | 'done'

export const FILE_CARD_DEFAULT_STATUS: FileCardStatus = 'done'

export const FILE_CARD_PROGRESS_MIN = 0
export const FILE_CARD_PROGRESS_MAX = 100

/** Separator between metadata parts ("PDF · 2.4 MB · 3 pages"). */
export const FILE_CARD_META_SEPARATOR = ' · '

export interface FileCardLabels {
  /** Kind names shown in the metadata line and announced with the name. */
  kinds: Record<FileKind, string>
  /** Status text while uploading. */
  uploading: string
  /** Status text when the upload failed and no `error` is given. */
  failed: string
  /** Cancel-upload icon button. */
  cancel: string
  /** Retry icon button. */
  retry: string
  /** Download icon button. */
  download: string
  /** Progress bar name; receives the file name. */
  progress: (name: string) => string
}

export const FILE_CARD_DEFAULT_LABELS: FileCardLabels = {
  kinds: {
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    pdf: 'PDF',
    archive: 'Archive',
    code: 'Code',
    spreadsheet: 'Spreadsheet',
    document: 'Document',
    presentation: 'Presentation',
    text: 'Text',
    other: 'File',
  },
  uploading: 'Uploading',
  failed: 'Upload failed',
  cancel: 'Cancel upload',
  retry: 'Retry upload',
  download: 'Download',
  progress: (name) => `Uploading ${name}`,
}

export interface FileCardLabelOverrides extends Partial<Omit<FileCardLabels, 'kinds'>> {
  kinds?: Partial<Record<FileKind, string>>
}

export function resolveFileCardLabels(overrides: FileCardLabelOverrides = {}): FileCardLabels {
  return {
    ...FILE_CARD_DEFAULT_LABELS,
    ...overrides,
    kinds: { ...FILE_CARD_DEFAULT_LABELS.kinds, ...overrides.kinds },
  }
}

/**
 * Clamp progress into 0–100 and round to a whole percent. `null` means
 * indeterminate (no number known), which the progress bar renders without
 * `aria-valuenow`.
 */
export function clampFileCardProgress(progress: number | undefined): number | null {
  if (progress === undefined || !Number.isFinite(progress)) return null
  return Math.round(Math.min(FILE_CARD_PROGRESS_MAX, Math.max(FILE_CARD_PROGRESS_MIN, progress)))
}

export interface FileCardOptions {
  /** Full file name, extension included. */
  name: string
  mimeType?: string
  /** Size in bytes. */
  size?: number
  /** Media duration in seconds (audio/video). */
  duration?: number
  /** Pixel size (images/video). */
  dimensions?: FileCardDimensions
  status?: FileCardStatus
  /** Upload progress, 0–100. Omit while uploading for an indeterminate bar. */
  progress?: number
  /** Failure message; defaults to `labels.failed`. */
  error?: string
  /** Visible name length in graphemes before middle truncation. */
  maxNameLength?: number
  locale?: string
  formatNumber?: FileCardNumberFormatter
  labels?: FileCardLabelOverrides
}

export interface FileCardAPI {
  kind: FileKind
  kindLabel: string
  status: FileCardStatus
  /** The name to show: middle-truncated when longer than `maxNameLength`. */
  displayName: string
  /** Whether `displayName` differs from the full name (the full name must then reach AT separately). */
  isTruncated: boolean
  /** Kind, size and media details joined by `FILE_CARD_META_SEPARATOR`. */
  metaText: string
  /** Status text for uploading/failed; `''` when done. */
  statusText: string
  /** Clamped progress, or `null` when indeterminate or not uploading. */
  progress: number | null
  /** Formatted percentage ("45%"), or `''` when indeterminate. */
  progressText: string
  /** `role="progressbar"` attributes; `aria-valuenow` only when determinate. */
  progressAriaProps: Record<string, string | number | boolean>
  dataAttributes: Record<string, string>
  labels: FileCardLabels
}

function metaParts(options: FileCardOptions, kindLabel: string, formatNumber: FileCardNumberFormatter): string[] {
  const parts = [kindLabel]
  if (options.size !== undefined) parts.push(formatFileCardBytes(options.size, { formatNumber }))
  if (options.duration !== undefined) parts.push(formatFileCardDuration(options.duration))
  if (options.dimensions) parts.push(formatFileCardDimensions(options.dimensions, formatNumber))
  return parts.filter(Boolean)
}

function statusTextFor(status: FileCardStatus, error: string | undefined, labels: FileCardLabels): string {
  if (status === 'uploading') return labels.uploading
  if (status === 'failed') return error?.trim() || labels.failed
  return ''
}

export function createFileCard(options: FileCardOptions): FileCardAPI {
  const status = options.status ?? FILE_CARD_DEFAULT_STATUS
  const labels = resolveFileCardLabels(options.labels)
  const formatNumber = options.formatNumber ?? createFileCardNumberFormatter(options.locale)
  const kind = resolveFileCardKind({ mimeType: options.mimeType, name: options.name })
  const kindLabel = labels.kinds[kind]
  const displayName = truncateFileCardName(options.name, options.maxNameLength)

  const progress = status === 'uploading' ? clampFileCardProgress(options.progress) : null
  const progressText =
    progress === null ? '' : `${formatNumber(progress, { maximumFractionDigits: 0 })}%`

  const progressAriaProps: Record<string, string | number | boolean> = {
    role: 'progressbar',
    'aria-label': labels.progress(options.name),
    'aria-valuemin': FILE_CARD_PROGRESS_MIN,
    'aria-valuemax': FILE_CARD_PROGRESS_MAX,
  }
  if (progress !== null) {
    progressAriaProps['aria-valuenow'] = progress
    progressAriaProps['aria-valuetext'] = progressText
  }

  return {
    kind,
    kindLabel,
    status,
    displayName,
    isTruncated: displayName !== options.name,
    metaText: metaParts(options, kindLabel, formatNumber).join(FILE_CARD_META_SEPARATOR),
    statusText: statusTextFor(status, options.error, labels),
    progress,
    progressText,
    progressAriaProps,
    dataAttributes: { 'data-state': status, 'data-kind': kind },
    labels,
  }
}
