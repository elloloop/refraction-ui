import { describe, it, expect } from 'vitest'
import {
  createSocialAuthButton,
  PROVIDER_LABELS,
  type SocialProvider,
} from '../src/social-auth-button.js'
import {
  socialAuthRowVariants,
  lastUsedBadgeVariants,
  socialAuthButtonVariants,
} from '../src/social-auth-button.styles.js'

const PROVIDERS: SocialProvider[] = ['google', 'github', 'microsoft', 'apple']

describe('PROVIDER_LABELS', () => {
  it('maps each provider to its "Continue with" label', () => {
    expect(PROVIDER_LABELS.google).toBe('Continue with Google')
    expect(PROVIDER_LABELS.github).toBe('Continue with GitHub')
    expect(PROVIDER_LABELS.microsoft).toBe('Continue with Microsoft')
    expect(PROVIDER_LABELS.apple).toBe('Continue with Apple')
  })
})

describe('createSocialAuthButton', () => {
  it.each(PROVIDERS)('sets data-provider for %s', (provider) => {
    const api = createSocialAuthButton({ provider })
    expect(api.dataAttributes['data-provider']).toBe(provider)
  })

  it('returns the provider label', () => {
    expect(createSocialAuthButton({ provider: 'google' }).label).toBe(
      'Continue with Google',
    )
  })

  it('marks github and apple monochrome, google and microsoft colored', () => {
    expect(createSocialAuthButton({ provider: 'github' }).mono).toBe(true)
    expect(createSocialAuthButton({ provider: 'apple' }).mono).toBe(true)
    expect(createSocialAuthButton({ provider: 'google' }).mono).toBe(false)
    expect(createSocialAuthButton({ provider: 'microsoft' }).mono).toBe(false)
  })
})

describe('variants', () => {
  it('row uses a responsive two-column grid', () => {
    const classes = socialAuthRowVariants()
    expect(classes).toContain('grid')
    expect(classes).toContain('grid-cols-1')
    expect(classes).toContain('sm:grid-cols-2')
    expect(classes).toContain('gap-3')
  })

  it('lastUsed badge is a floating pill', () => {
    const classes = lastUsedBadgeVariants()
    expect(classes).toContain('-top-2')
    expect(classes).toContain('-right-2')
    expect(classes).toContain('bg-primary')
  })

  it('button wrapper is relatively positioned', () => {
    expect(socialAuthButtonVariants()).toContain('relative')
  })
})
