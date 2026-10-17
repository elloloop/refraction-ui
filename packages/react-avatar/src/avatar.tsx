import * as React from 'react'
import {
  createAvatar,
  avatarVariants,
  avatarImageVariants,
  avatarFallbackVariants,
  avatarPresenceVariants,
  type AvatarSize,
  type AvatarShape,
  type PresenceStatus,
} from '@refraction-ui/avatar'
import { cn } from '@refraction-ui/shared'

/* ─── Context ──────────────────────────────────────────────────── */
interface AvatarContextValue {
  size: AvatarSize
  imageLoaded: boolean
  imageError: boolean
  setImageLoaded: (loaded: boolean) => void
  setImageError: (error: boolean) => void
}

const AvatarContext = React.createContext<AvatarContextValue>({
  size: 'md',
  imageLoaded: false,
  imageError: false,
  setImageLoaded: () => {},
  setImageError: () => {},
})

/* ─── Avatar (root) ────────────────────────────────────────────── */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize
  /** `circle` (default) or `square` (rounded corners) — e.g. for teams and organisations. */
  shape?: AvatarShape
  /**
   * Shows a presence dot at the bottom end corner. With an `aria-label` the
   * status joins the avatar's name ("Ada Lovelace (Away)"); without one the
   * dot is named on its own.
   */
  presence?: PresenceStatus
  /** The status as words, e.g. for another language. Default: "Online", "Away", … */
  presenceLabel?: string
}

/**
 * Avatar -- circular image with fallback support and an optional presence dot.
 * Compound component: use Avatar > AvatarImage + AvatarFallback.
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar(
    {
      size = 'md',
      shape = 'circle',
      presence,
      presenceLabel,
      'aria-label': ariaLabel,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    const api = createAvatar({ size, alt: ariaLabel, presence, presenceLabel })

    return (
      <AvatarContext.Provider value={{ size, imageLoaded, imageError, setImageLoaded, setImageError }}>
        <span
          ref={ref}
          className={cn(avatarVariants({ size, shape }), className)}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          {children}
          {api.presence && (
            <span
              className={avatarPresenceVariants({ status: api.presence.status, shape, size })}
              {...api.presence.ariaProps}
              {...api.presence.dataAttributes}
            />
          )}
        </span>
      </AvatarContext.Provider>
    )
  },
)

/* ─── AvatarImage ──────────────────────────────────────────────── */
export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage({ className, src, alt = '', onLoad, onError, ...props }, ref) {
    const { imageError, setImageLoaded, setImageError } = React.useContext(AvatarContext)

    const imageRef = React.useRef<HTMLImageElement | null>(null)
    const mergedRef = React.useCallback((node: HTMLImageElement | null) => {
      imageRef.current = node
      if (typeof ref === 'function') {
        const cleanup: unknown = ref(node)
        if (typeof cleanup === 'function') {
          return () => {
            imageRef.current = null
            cleanup()
          }
        }
      } else if (ref) ref.current = node
    }, [ref])

    React.useEffect(() => {
      // SSR images may finish before hydration installs event handlers. Read
      // the native result instead of erasing a cached success or failure.
      const image = imageRef.current
      setImageLoaded(!!image?.complete && image.naturalWidth > 0)
      setImageError(!!image?.complete && image.naturalWidth === 0)
    }, [src, setImageLoaded, setImageError])

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageLoaded(true)
      onLoad?.(e)
    }

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageError(true)
      onError?.(e)
    }

    if (imageError) return null

    return (
      <img
        ref={mergedRef}
        className={cn(avatarImageVariants(), className)}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    )
  },
)

/* ─── AvatarFallback ───────────────────────────────────────────── */
export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ className, children, ...props }, ref) {
    const { size, imageLoaded, imageError } = React.useContext(AvatarContext)

    if (imageLoaded && !imageError) return null

    return (
      <span
        ref={ref}
        className={cn(avatarFallbackVariants({ size }), className)}
        {...props}
      >
        {children}
      </span>
    )
  },
)
