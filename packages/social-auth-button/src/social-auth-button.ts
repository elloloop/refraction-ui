export type SocialProvider = 'google' | 'github' | 'microsoft' | 'apple'

/** "Continue with …" label shown on each provider's button. */
export const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Continue with Google',
  github: 'Continue with GitHub',
  microsoft: 'Continue with Microsoft',
  apple: 'Continue with Apple',
}

/**
 * Which providers render their brand mark monochrome (currentColor). GitHub and
 * Apple are monochrome by design so they read correctly on dark/outline
 * surfaces; Google and Microsoft keep their full brand color.
 */
export const PROVIDER_MONO: Record<SocialProvider, boolean> = {
  google: false,
  github: true,
  microsoft: false,
  apple: true,
}

export interface SocialAuthButtonProps {
  /** Identity provider this button authenticates against. */
  provider: SocialProvider
}

export interface SocialAuthButtonAPI {
  /** Data attributes for CSS styling hooks. */
  dataAttributes: Record<string, string>
  /** "Continue with …" label for the provider. */
  label: string
  /** Whether the brand mark should render monochrome. */
  mono: boolean
}

/**
 * Framework-agnostic core for a social sign-in button. Returns the provider
 * label, monochrome hint, and the `data-provider` styling hook. No React/JSX.
 */
export function createSocialAuthButton(
  props: SocialAuthButtonProps,
): SocialAuthButtonAPI {
  const { provider } = props

  return {
    dataAttributes: { 'data-provider': provider },
    label: PROVIDER_LABELS[provider],
    mono: PROVIDER_MONO[provider],
  }
}
