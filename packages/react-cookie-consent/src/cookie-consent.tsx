import * as React from 'react'
import { cn } from '@refraction-ui/shared'
import type { UseCookieConsentResult } from './use-cookie-consent.js'

const h = React.createElement

export interface CookieConsentProps {
  /** Result of `useCookieConsent()` */
  consent: UseCookieConsentResult
  /** Banner position (default 'bottom') */
  position?: 'bottom' | 'top'
  title?: string
  description?: React.ReactNode
  /** Link to the full cookie/privacy policy */
  policyUrl?: string
  policyLabel?: string
  className?: string
}

const btnPrimary = 'rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90'
const btnGhost = 'rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent'
const btnLink = 'text-sm text-muted-foreground underline hover:text-foreground'

/**
 * CookieConsent — batteries-included consent banner over `useCookieConsent()`.
 * Shows a prompt (Accept all / Reject all / Manage), with a settings view of
 * per-category toggles. Renders nothing once the user has consented.
 */
export function CookieConsent({
  consent,
  position = 'bottom',
  title = 'We use cookies',
  description = 'We use cookies to run the site, remember your preferences, and measure traffic. Choose which categories to allow.',
  policyUrl,
  policyLabel = 'Cookie policy',
  className,
}: CookieConsentProps) {
  const { state, acceptAll, rejectAll, savePreferences, setPreference } = consent
  const [settings, setSettings] = React.useState(false)

  if (!state.open) return null

  const wrapper = cn(
    'fixed inset-x-0 z-50 p-4',
    position === 'bottom' ? 'bottom-0' : 'top-0',
    className,
  )
  const panel = 'mx-auto max-w-3xl rounded-xl border border-border bg-background p-4 shadow-lg'

  const header = h(
    'div',
    null,
    h('h2', { className: 'text-base font-semibold' }, title),
    h('p', { className: 'mt-1 text-sm text-muted-foreground' }, description),
    policyUrl
      ? h('a', { href: policyUrl, target: '_blank', rel: 'noreferrer', className: cn(btnLink, 'mt-1 inline-block') }, policyLabel)
      : null,
  )

  const promptActions = h(
    'div',
    { className: 'mt-3 flex flex-wrap items-center gap-2' },
    h('button', { type: 'button', className: btnPrimary, onClick: () => acceptAll() }, 'Accept all'),
    h('button', { type: 'button', className: btnGhost, onClick: () => rejectAll() }, 'Reject all'),
    h('button', { type: 'button', className: cn(btnGhost, 'ml-auto'), onClick: () => setSettings(true) }, 'Manage preferences'),
  )

  const settingsView = h(
    'div',
    { className: 'mt-3 space-y-2' },
    ...state.categories.map((cat) =>
      h(
        'label',
        {
          key: cat.id,
          className: 'flex items-start justify-between gap-3 rounded-md border border-border p-3',
        },
        h(
          'span',
          { className: 'min-w-0' },
          h('span', { className: 'block text-sm font-medium' }, cat.label, cat.required ? ' (required)' : ''),
          cat.description ? h('span', { className: 'block text-xs text-muted-foreground' }, cat.description) : null,
        ),
        h('input', {
          type: 'checkbox',
          className: 'mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]',
          checked: !!state.preferences[cat.id],
          disabled: cat.required,
          'aria-label': cat.label,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPreference(cat.id, e.target.checked),
        }),
      ),
    ),
    h(
      'div',
      { className: 'flex flex-wrap items-center gap-2 pt-1' },
      h('button', { type: 'button', className: btnPrimary, onClick: () => savePreferences(state.preferences) }, 'Save preferences'),
      h('button', { type: 'button', className: btnGhost, onClick: () => acceptAll() }, 'Accept all'),
      h('button', { type: 'button', className: cn(btnLink, 'ml-auto'), onClick: () => setSettings(false) }, 'Back'),
    ),
  )

  return h(
    'div',
    { className: wrapper, role: 'dialog', 'aria-label': 'Cookie consent', 'aria-modal': false },
    h('div', { className: panel }, header, settings ? settingsView : promptActions),
  )
}
