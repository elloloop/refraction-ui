import * as React from 'react'
import {
  createAvatar,
  avatarVariants,
  avatarImageVariants,
  avatarFallbackVariants,
  type AvatarSize,
} from '@elloloop/avatar'
import { cn } from '@elloloop/shared'

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
}

/**
 * Avatar -- circular image with fallback support.
 * Compound component: use Avatar > AvatarImage + AvatarFallback.
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size = 'md', className, children, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    const api = createAvatar({ size })

    return (
      <AvatarContext.Provider value={{ size, imageLoaded, imageError, setImageLoaded, setImageError }}>
        <span
          ref={ref}
          className={cn(avatarVariants({ size }), className)}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          {children}
        </span>
      </AvatarContext.Provider>
    )
  },
)
Avatar.displayName = 'Avatar'

/* ─── AvatarImage ──────────────────────────────────────────────── */
export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt = '', onLoad, onError, ...props }, ref) => {
    const { setImageLoaded, setImageError } = React.useContext(AvatarContext)

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageLoaded(true)
      onLoad?.(e)
    }

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageError(true)
      onError?.(e)
    }

    return (
      <img
        ref={ref}
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
AvatarImage.displayName = 'AvatarImage'

/* ─── AvatarFallback ───────────────────────────────────────────── */
export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    const { size } = React.useContext(AvatarContext)

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
AvatarFallback.displayName = 'AvatarFallback'
