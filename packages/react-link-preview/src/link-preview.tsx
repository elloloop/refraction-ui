import * as React from 'react'
import {
  createLinkPreview,
  linkPreviewVariants,
  linkPreviewCardVariants,
  linkPreviewMediaVariants,
  linkPreviewImageClass,
  linkPreviewBodyVariants,
  linkPreviewSiteClass,
  linkPreviewSiteIconClass,
  linkPreviewSiteTextClass,
  linkPreviewSeparatorClass,
  linkPreviewTitleVariants,
  linkPreviewDescriptionVariants,
  linkPreviewDismissClass,
  LINK_PREVIEW_DEFAULT_DISMISS_LABEL,
  type LinkPreviewVariant,
  type LinkPreviewImage,
  type LinkPreviewMetadata,
} from '@refraction-ui/link-preview'
import { IconButton } from '@refraction-ui/react-icon-button'
import { cn, devWarn } from '@refraction-ui/shared'

export type { LinkPreviewVariant, LinkPreviewImage, LinkPreviewMetadata }

export interface LinkPreviewProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      // `title` is the page title, not a tooltip; the card renders its own content.
      'title' | 'children'
    >,
    LinkPreviewMetadata {
  /** `full` (image above the text) or `compact` (thumbnail beside one-line text). */
  variant?: LinkPreviewVariant
  /** Link target. Defaults to `_blank`. */
  target?: React.HTMLAttributeAnchorTarget
  /** Appended to the link's name when it opens a new tab. `''` for none. */
  newTabLabel?: string
  /** Renders a dismiss button over the card's corner; called when it is pressed. */
  onDismiss?: () => void
  /** Accessible name (and tooltip) of the dismiss button. */
  dismissLabel?: string
  /** Glyph for the dismiss button. Defaults to an ×. */
  dismissIcon?: React.ReactNode
}

const DISMISS_ICON_PATH = 'M18 6 6 18M6 6l12 12'

function DismissGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={DISMISS_ICON_PATH} />
    </svg>
  )
}

/**
 * Remembers which image src failed to load, so a broken image falls back to
 * the muted box and a new src gets a fresh attempt.
 */
function useFailedSrc(src: string | undefined) {
  const [failedSrc, setFailedSrc] = React.useState<string | undefined>(undefined)
  const failed = src !== undefined && failedSrc === src
  const onError = React.useCallback(() => setFailedSrc(src), [src])
  return { failed, onError }
}

/**
 * LinkPreview — an unfurled link card under a message.
 *
 * The caller supplies the metadata; nothing is fetched. The whole card is one
 * `<a rel="noopener noreferrer nofollow">` named "title, site" and described
 * by the host and description. Only absolute http(s) URLs render; anything
 * else renders nothing. The image loads lazily into a box whose aspect ratio
 * is fixed up front. The optional dismiss button is a sibling of the link
 * (never nested in it), positioned over the card's corner.
 */
export const LinkPreview = React.forwardRef<HTMLDivElement, LinkPreviewProps>(
  function LinkPreview(
    {
      url,
      siteName,
      siteIcon,
      title,
      description,
      image,
      variant,
      target,
      newTabLabel,
      onDismiss,
      dismissLabel = LINK_PREVIEW_DEFAULT_DISMISS_LABEL,
      dismissIcon,
      className,
      ...props
    },
    ref,
  ) {
    const hostId = React.useId()
    const descriptionId = React.useId()
    const api = createLinkPreview({
      url,
      siteName,
      siteIcon,
      title,
      description,
      image,
      variant,
      target,
      newTabLabel,
      dismissible: onDismiss !== undefined,
      hostId,
      descriptionId,
    })
    const imageState = useFailedSrc(api?.image?.src)
    const iconState = useFailedSrc(api?.siteIcon)

    if (!api) {
      devWarn(
        'react-link-preview/unsafe-url',
        'LinkPreview only renders absolute http(s) URLs; this preview was not rendered.',
        { url },
      )
      return null
    }

    const showSiteRow = api.siteLabel !== undefined || (api.siteIcon !== undefined && !iconState.failed)

    return (
      <div
        ref={ref}
        className={cn(linkPreviewVariants({ variant: api.variant }), className)}
        {...api.dataAttributes}
        {...props}
      >
        <a className={linkPreviewCardVariants({ variant: api.variant })} {...api.linkProps}>
          {api.image ? (
            <div
              className={linkPreviewMediaVariants({ variant: api.variant })}
              style={{ aspectRatio: api.aspectRatio }}
              data-link-preview-media=""
            >
              {imageState.failed ? null : (
                <img
                  src={api.image.src}
                  alt={api.image.alt ?? ''}
                  width={api.image.width}
                  height={api.image.height}
                  loading="lazy"
                  decoding="async"
                  className={linkPreviewImageClass}
                  onError={imageState.onError}
                />
              )}
            </div>
          ) : null}
          <div
            className={linkPreviewBodyVariants({
              variant: api.variant,
              reserveDismissSpace: api.reserveDismissSpace ? 'true' : 'false',
            })}
          >
            {showSiteRow ? (
              <span className={linkPreviewSiteClass}>
                {api.siteIcon && !iconState.failed ? (
                  <img
                    src={api.siteIcon}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className={linkPreviewSiteIconClass}
                    onError={iconState.onError}
                  />
                ) : null}
                {api.siteLabel !== undefined ? (
                  <span className={linkPreviewSiteTextClass}>{api.siteLabel}</span>
                ) : null}
                {api.showHost ? (
                  <>
                    <span aria-hidden="true" className={linkPreviewSeparatorClass}>
                      ·
                    </span>
                    <span id={hostId} className={linkPreviewSiteTextClass}>
                      {api.host}
                    </span>
                  </>
                ) : null}
              </span>
            ) : null}
            <span className={linkPreviewTitleVariants({ variant: api.variant })}>{api.title}</span>
            {api.description !== undefined ? (
              <span
                id={descriptionId}
                className={linkPreviewDescriptionVariants({ variant: api.variant })}
              >
                {api.description}
              </span>
            ) : null}
          </div>
        </a>
        {onDismiss ? (
          <IconButton
            type="button"
            icon={dismissIcon ?? <DismissGlyph />}
            label={dismissLabel}
            size="sm"
            variant="secondary"
            className={linkPreviewDismissClass}
            onClick={onDismiss}
          />
        ) : null}
      </div>
    )
  },
)
