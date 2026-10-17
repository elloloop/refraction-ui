/**
 * LinkPreview — headless logic for an unfurled link card under a message.
 *
 * The caller supplies the page metadata (typically from a server-side
 * unfurler); this core never fetches anything. It validates the URL, derives
 * the host shown on the card, builds the link's accessible name and resolves
 * the fixed aspect box the image sits in. All functions are pure.
 */

/** `compact`: thumbnail beside one-line text. `full`: wide image above the text. */
export type LinkPreviewVariant = 'compact' | 'full'

/** The preview image. Width and height (intrinsic pixels) set the aspect box. */
export interface LinkPreviewImage {
  src: string
  width?: number
  height?: number
  /** Alternative text. The link's name already carries title and site, so this defaults to `''`. */
  alt?: string
}

/** Caller-supplied page metadata. Only `url` is required. */
export interface LinkPreviewMetadata {
  url: string
  siteName?: string
  /** Favicon / site icon URL. Decorative. */
  siteIcon?: string
  title?: string
  description?: string
  image?: LinkPreviewImage
}

/** Only these schemes become a link. Everything else (`javascript:`, `data:`, `mailto:`, …) is rejected. */
export const LINK_PREVIEW_ALLOWED_PROTOCOLS: readonly string[] = ['http:', 'https:']

/**
 * `noopener` + `noreferrer` stop the opened page from reaching `window.opener`
 * and from seeing the conversation's URL; `nofollow` because the link is
 * user-generated content.
 */
export const LINK_PREVIEW_REL = 'noopener noreferrer nofollow'

/** Links in a conversation open outside it by default. */
export const LINK_PREVIEW_DEFAULT_TARGET = '_blank'

/** Spoken after the name when the link opens a new tab or window. */
export const LINK_PREVIEW_DEFAULT_NEW_TAB_LABEL = 'opens in a new tab'

/** Accessible name of the dismiss button. */
export const LINK_PREVIEW_DEFAULT_DISMISS_LABEL = 'Remove preview'

/** Joins the parts of the link's accessible name; screen readers pause on it. */
export const LINK_PREVIEW_NAME_SEPARATOR = ', '

export const LINK_PREVIEW_DEFAULT_VARIANT: LinkPreviewVariant = 'full'

/** Open Graph's recommended 1200 × 630 card, used when the image has no usable size. */
export const LINK_PREVIEW_DEFAULT_ASPECT_RATIO = 1200 / 630

/**
 * Bounds for the full variant's image box. A portrait or very tall image is
 * cropped (`object-cover`) to a square rather than pushing the conversation
 * down; a banner-thin image is cropped to 4 : 1.
 */
export const LINK_PREVIEW_MIN_ASPECT_RATIO = 1
export const LINK_PREVIEW_MAX_ASPECT_RATIO = 4

/** The compact thumbnail is always square. */
export const LINK_PREVIEW_COMPACT_ASPECT_RATIO = 1

/** Hostnames commonly carry this prefix; it adds nothing to the reader. */
const WWW_PREFIX = 'www.'

/**
 * Parse `url` and accept it only when it is an absolute http(s) URL.
 * Returns the parsed URL (its `href` is normalised and percent-encoded) or
 * `null`. Leading/trailing whitespace is ignored.
 */
export function parseLinkPreviewUrl(url: string | null | undefined): URL | null {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (trimmed.length === 0) return null
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }
  if (!LINK_PREVIEW_ALLOWED_PROTOCOLS.includes(parsed.protocol)) return null
  return parsed
}

/**
 * The host shown on the card: `host` (hostname plus any non-default port)
 * without a leading `www.`, lower-case as the URL parser returns it.
 *
 * Internationalised domains are shown exactly as the WHATWG URL parser
 * serialises them, which is the ASCII (punycode) form: `https://münchen.de`
 * displays as `xn--mnchen-3ya.de`. That is deliberate: the Unicode form can
 * be spoofed with look-alike characters, and the host is the one part of the
 * card the page's own metadata cannot fake.
 */
export function getLinkPreviewHost(url: URL): string {
  const { host } = url
  return host.startsWith(WWW_PREFIX) ? host.slice(WWW_PREFIX.length) : host
}

/** Trim a metadata string; blank or missing becomes `undefined`. */
export function normalizeLinkPreviewText(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/** Positive, finite number or `undefined`. */
function positiveDimension(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : undefined
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Aspect ratio (width / height) of the image box. Compact thumbnails are
 * square; the full variant follows the image's own size, clamped to
 * [{@link LINK_PREVIEW_MIN_ASPECT_RATIO}, {@link LINK_PREVIEW_MAX_ASPECT_RATIO}],
 * or the Open Graph default when the size is unknown. The box is sized before
 * the image loads, so a lazy image never shifts the conversation.
 */
export function resolveLinkPreviewAspectRatio(
  variant: LinkPreviewVariant,
  image: Pick<LinkPreviewImage, 'width' | 'height'> | undefined,
): number {
  if (variant === 'compact') return LINK_PREVIEW_COMPACT_ASPECT_RATIO
  const width = positiveDimension(image?.width)
  const height = positiveDimension(image?.height)
  if (width === undefined || height === undefined) return LINK_PREVIEW_DEFAULT_ASPECT_RATIO
  return clamp(width / height, LINK_PREVIEW_MIN_ASPECT_RATIO, LINK_PREVIEW_MAX_ASPECT_RATIO)
}

/** True when `target` opens a new browsing context (so the name should say so). */
export function linkPreviewOpensNewContext(target: string | undefined): boolean {
  return target !== undefined && target !== '_self' && target !== '_parent' && target !== '_top'
}

export interface LinkPreviewNameInput {
  title?: string
  siteName?: string
  host: string
  /** Appended when the link opens a new tab; omit or pass `''` for none. */
  newTabLabel?: string
}

/**
 * The link's accessible name: the title, then the site (its name, or the
 * host when the page gave none), then the new-tab hint. The description is
 * NOT part of the name; it is exposed once as the link's description.
 * Without a title the host stands in for it (and is not repeated).
 */
export function getLinkPreviewAccessibleName(input: LinkPreviewNameInput): string {
  const title = normalizeLinkPreviewText(input.title)
  const siteName = normalizeLinkPreviewText(input.siteName)
  const newTabLabel = normalizeLinkPreviewText(input.newTabLabel)
  const parts = [title ?? input.host]
  const site = siteName ?? input.host
  if (site !== parts[0]) parts.push(site)
  if (newTabLabel) parts.push(newTabLabel)
  return parts.join(LINK_PREVIEW_NAME_SEPARATOR)
}

export interface LinkPreviewOptions extends LinkPreviewMetadata {
  variant?: LinkPreviewVariant
  /** Link target. Defaults to {@link LINK_PREVIEW_DEFAULT_TARGET}. */
  target?: string
  newTabLabel?: string
  /** Whether a dismiss button is rendered over the card's corner. */
  dismissible?: boolean
  /** Id of the element that shows the host (injected by the adapter). */
  hostId?: string
  /** Id of the element that shows the description (injected by the adapter). */
  descriptionId?: string
}

/** The resolved, safe view of a preview. `null` from {@link createLinkPreview} means "render nothing". */
export interface LinkPreviewAPI {
  /** Normalised, percent-encoded http(s) URL. */
  href: string
  host: string
  variant: LinkPreviewVariant
  /** Visible title (falls back to the host). */
  title: string
  siteName?: string
  /**
   * Text of the site row: the site name, else the host when a title exists.
   * `undefined` when the host is already the visible title.
   */
  siteLabel?: string
  siteIcon?: string
  description?: string
  image?: LinkPreviewImage
  aspectRatio: number
  /** Whether the host gets its own visible slot (see {@link shouldShowLinkPreviewHost}). */
  showHost: boolean
  /** Attributes for the `<a>`. */
  linkProps: Record<string, string>
  /** Data attributes for the root element (styling hooks). */
  dataAttributes: Record<string, string>
  /** Whether the text column must leave room for the dismiss button. */
  reserveDismissSpace: boolean
}

/**
 * The host gets its own slot only when both a title and a site name exist.
 * Otherwise it already is the visible title or the site, and is already in
 * the accessible name. Showing it always matters: the site name comes from
 * the page's own metadata, the host from the real URL.
 */
export function shouldShowLinkPreviewHost(hasTitle: boolean, hasSiteName: boolean): boolean {
  return hasTitle && hasSiteName
}

/**
 * Ids the link is described by: the host (only when it is not already in
 * the name, see {@link shouldShowLinkPreviewHost}) and the description.
 * Order matches the visual order.
 */
export function getLinkPreviewDescribedBy(input: {
  hostId?: string
  descriptionId?: string
  includeHost: boolean
  hasDescription: boolean
}): string | undefined {
  const ids: string[] = []
  if (input.includeHost && input.hostId) ids.push(input.hostId)
  if (input.hasDescription && input.descriptionId) ids.push(input.descriptionId)
  return ids.length > 0 ? ids.join(' ') : undefined
}

/**
 * The dismiss button floats over the top-end corner. It lands on the image
 * in the full variant, so only the compact variant, or a full card without
 * an image, needs the text column padded away from it.
 */
export function shouldReserveLinkPreviewDismissSpace(
  variant: LinkPreviewVariant,
  dismissible: boolean,
  hasImage: boolean,
): boolean {
  if (!dismissible) return false
  return variant === 'compact' || !hasImage
}

/**
 * Resolve everything an adapter needs to render a preview, or `null` when
 * the URL is not an absolute http(s) URL. A preview's only job is to be that
 * link; a card that looks like a link but goes nowhere (or showing
 * attacker-chosen text for a `javascript:` URL) is worse than no card, and
 * the message text still shows the raw link.
 */
export function createLinkPreview(options: LinkPreviewOptions): LinkPreviewAPI | null {
  const url = parseLinkPreviewUrl(options.url)
  if (!url) return null

  const variant = options.variant ?? LINK_PREVIEW_DEFAULT_VARIANT
  const target = options.target ?? LINK_PREVIEW_DEFAULT_TARGET
  const host = getLinkPreviewHost(url)
  const title = normalizeLinkPreviewText(options.title)
  const siteName = normalizeLinkPreviewText(options.siteName)
  const description = normalizeLinkPreviewText(options.description)
  const siteIcon = normalizeLinkPreviewText(options.siteIcon)
  const imageSrc = normalizeLinkPreviewText(options.image?.src)
  const image = imageSrc && options.image ? { ...options.image, src: imageSrc } : undefined
  const newTabLabel = linkPreviewOpensNewContext(target)
    ? (options.newTabLabel ?? LINK_PREVIEW_DEFAULT_NEW_TAB_LABEL)
    : undefined
  const dismissible = options.dismissible ?? false
  const showHost = shouldShowLinkPreviewHost(title !== undefined, siteName !== undefined)

  const linkProps: Record<string, string> = {
    href: url.href,
    target,
    rel: LINK_PREVIEW_REL,
    'aria-label': getLinkPreviewAccessibleName({ title, siteName, host, newTabLabel }),
  }
  const describedBy = getLinkPreviewDescribedBy({
    hostId: options.hostId,
    descriptionId: options.descriptionId,
    includeHost: showHost,
    hasDescription: description !== undefined,
  })
  if (describedBy) linkProps['aria-describedby'] = describedBy

  return {
    href: url.href,
    host,
    variant,
    title: title ?? host,
    siteName,
    siteLabel: siteName ?? (title !== undefined ? host : undefined),
    siteIcon,
    description,
    image,
    aspectRatio: resolveLinkPreviewAspectRatio(variant, image),
    showHost,
    linkProps,
    dataAttributes: {
      'data-slot': 'link-preview',
      'data-variant': variant,
      'data-has-image': image ? 'true' : 'false',
    },
    reserveDismissSpace: shouldReserveLinkPreviewDismissSpace(variant, dismissible, image !== undefined),
  }
}
