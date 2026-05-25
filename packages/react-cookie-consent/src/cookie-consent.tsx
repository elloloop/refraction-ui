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

const btnBase = 'inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors'
const btnPrimary = cn(btnBase, 'bg-primary text-primary-foreground hover:opacity-90')
const btnGhost = cn(btnBase, 'border border-border hover:bg-accent')
const btnLink = 'text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'

/** A compact switch toggle. Required categories render a static "Always on". */
function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  if (disabled) {
    return h(
      'span',
      { className: 'rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground' },
      'Always on',
    )
  }
  return h(
    'button',
    {
      type: 'button',
      role: 'switch',
      'aria-checked': checked,
      'aria-label': label,
      onClick: () => onChange(!checked),
      className: cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted',
      ),
    },
    h('span', {
      className: cn(
        'inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform',
        checked ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
      ),
    }),
  )
}

function CookieIcon() {
  return h(
    'div',
    { className: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xl', 'aria-hidden': true },
    '🍪',
  )
}

/**
 * CookieConsent — batteries-included consent banner over `useCookieConsent()`.
 * Renders nothing once the user has consented.
 */
export function CookieConsent({
  consent,
  position = 'bottom',
  title = 'We use cookies',
  description = 'We use cookies to run the site, remember your preferences, and measure traffic. Choose which to allow.',
  policyUrl,
  policyLabel = 'Cookie policy',
  className,
}: CookieConsentProps) {
  const { state, acceptAll, rejectAll, savePreferences, setPreference } = consent
  const [settings, setSettings] = React.useState(false)

  if (!state.open) return null

  const wrapper = cn('fixed inset-x-0 z-50 p-4', position === 'bottom' ? 'bottom-0' : 'top-0', className)
  const panel = 'mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-lg'

  const policy = policyUrl
    ? h('a', { href: policyUrl, target: '_blank', rel: 'noreferrer', className: cn(btnLink, 'whitespace-nowrap') }, policyLabel)
    : null

  // — compact prompt —
  const promptView = h(
    'div',
    { className: 'flex flex-col gap-4 p-5 sm:flex-row sm:items-center' },
    h(CookieIcon),
    h(
      'div',
      { className: 'min-w-0 flex-1' },
      h('p', { className: 'text-sm font-semibold' }, title),
      h(
        'p',
        { className: 'mt-0.5 text-sm leading-relaxed text-muted-foreground' },
        description,
        policy ? h(React.Fragment, null, ' ', policy) : null,
      ),
    ),
    h(
      'div',
      { className: 'flex flex-wrap items-center gap-2 sm:shrink-0' },
      h('button', { type: 'button', className: btnLink, onClick: () => setSettings(true) }, 'Customize'),
      h('button', { type: 'button', className: btnGhost, onClick: () => rejectAll() }, 'Reject all'),
      h('button', { type: 'button', className: btnPrimary, onClick: () => acceptAll() }, 'Accept all'),
    ),
  )

  // — settings —
  const settingsView = h(
    'div',
    { className: 'p-5' },
    h(
      'div',
      { className: 'flex items-center gap-3' },
      h(CookieIcon),
      h(
        'div',
        null,
        h('p', { className: 'text-sm font-semibold' }, 'Cookie preferences'),
        h('p', { className: 'text-xs text-muted-foreground' }, 'Toggle the categories you want to allow.'),
      ),
    ),
    h(
      'div',
      { className: 'mt-4 space-y-2' },
      ...state.categories.map((cat) =>
        h(
          'div',
          { key: cat.id, className: 'flex items-center justify-between gap-4 rounded-xl border border-border p-3' },
          h(
            'div',
            { className: 'min-w-0' },
            h('p', { className: 'text-sm font-medium' }, cat.label),
            cat.description ? h('p', { className: 'mt-0.5 text-xs text-muted-foreground' }, cat.description) : null,
          ),
          h(Toggle, {
            checked: !!state.preferences[cat.id],
            disabled: cat.required,
            label: cat.label,
            onChange: (v: boolean) => setPreference(cat.id, v),
          }),
        ),
      ),
    ),
    h(
      'div',
      { className: 'mt-4 flex flex-wrap items-center gap-2' },
      h('button', { type: 'button', className: btnLink, onClick: () => setSettings(false) }, '← Back'),
      h('button', { type: 'button', className: cn(btnGhost, 'sm:ml-auto'), onClick: () => acceptAll() }, 'Accept all'),
      h('button', { type: 'button', className: btnPrimary, onClick: () => savePreferences(state.preferences) }, 'Save preferences'),
    ),
  )

  return h(
    'div',
    { className: wrapper, role: 'dialog', 'aria-label': 'Cookie consent', 'aria-modal': false },
    h('div', { className: panel }, settings ? settingsView : promptView),
  )
}
