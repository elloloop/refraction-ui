'use client'

import {
  SocialAuthButton,
  SocialAuthRow,
} from '@refraction-ui/react-social-auth-button'

interface SocialAuthButtonExamplesProps {
  section: 'basic' | 'states' | 'last-used' | 'row'
}

export function SocialAuthButtonExamples({ section }: SocialAuthButtonExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid max-w-sm gap-3">
          <SocialAuthButton provider="google" />
          <SocialAuthButton provider="github" />
          <SocialAuthButton provider="microsoft" />
          <SocialAuthButton provider="apple" />
        </div>
      </div>
    )
  }

  if (section === 'states') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid max-w-sm gap-3">
          <SocialAuthButton provider="google" loading />
          <SocialAuthButton provider="github" disabled />
        </div>
      </div>
    )
  }

  if (section === 'last-used') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 pt-10">
        <div className="grid max-w-sm gap-4">
          <SocialAuthButton provider="google" lastUsed />
        </div>
      </div>
    )
  }

  if (section === 'row') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <SocialAuthRow>
          <SocialAuthButton provider="google" lastUsed />
          <SocialAuthButton provider="github" />
          <SocialAuthButton provider="microsoft" />
          <SocialAuthButton provider="apple" />
        </SocialAuthRow>
      </div>
    )
  }

  return null
}
