import * as React from 'react'
import { Button, type ButtonProps } from '@refraction-ui/react-button'
import {
  createSocialAuthButton,
  socialAuthButtonVariants,
  socialAuthRowVariants,
  lastUsedBadgeVariants,
  type SocialProvider,
} from '@refraction-ui/social-auth-button'
import { cn } from '@refraction-ui/shared'
import {
  GoogleIcon,
  GitHubIcon,
  MicrosoftIcon,
  AppleIcon,
  type BrandIconProps,
} from './brand-icons.js'

export type { SocialProvider }

/** Brand mark component per provider (the markup that the JSX-free core omits). */
const PROVIDER_ICONS: Record<
  SocialProvider,
  (props: BrandIconProps) => React.JSX.Element
> = {
  google: GoogleIcon,
  github: GitHubIcon,
  microsoft: MicrosoftIcon,
  apple: AppleIcon,
}

export interface SocialAuthButtonProps
  extends Omit<ButtonProps, 'variant' | 'children'> {
  /** Identity provider this button authenticates against. */
  provider: SocialProvider
  /** Marks this as the provider the user signed in with last. */
  lastUsed?: boolean
  /** Shows a spinner and disables interaction. */
  loading?: boolean
}

/**
 * A branded social sign-in button built on the outline Button. Renders the
 * provider's brand icon and a "Continue with …" label, with optional loading
 * and "Last used" affordances. Labels, the `data-provider` hook, and the
 * monochrome decision come from the headless @refraction-ui/social-auth-button
 * core; only the icon markup lives here.
 */
export const SocialAuthButton = React.forwardRef<
  HTMLButtonElement,
  SocialAuthButtonProps
>(({ provider, lastUsed, loading, disabled, className, ...props }, ref) => {
  const { label, mono, dataAttributes } = createSocialAuthButton({ provider })
  const Icon = PROVIDER_ICONS[provider]

  return (
    <div className={socialAuthButtonVariants()}>
      <Button
        ref={ref}
        variant="outline"
        loading={loading}
        disabled={disabled}
        className={cn('w-full justify-center gap-2', className)}
        {...dataAttributes}
        {...props}
      >
        {!loading && <Icon mono={mono} className="shrink-0" />}
        {label}
      </Button>
      {lastUsed && <span className={lastUsedBadgeVariants()}>Last used</span>}
    </div>
  )
})

SocialAuthButton.displayName = 'SocialAuthButton'

export interface SocialAuthRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

/**
 * Responsive grid wrapper for SocialAuthButtons: one column on mobile, two
 * columns from the `sm` breakpoint up.
 */
export const SocialAuthRow = React.forwardRef<HTMLDivElement, SocialAuthRowProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(socialAuthRowVariants(), className)}
      {...props}
    >
      {children}
    </div>
  ),
)

SocialAuthRow.displayName = 'SocialAuthRow'
