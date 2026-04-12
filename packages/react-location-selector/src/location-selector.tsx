import * as React from 'react'
import { createLocationSelector } from '@refraction-ui/location-selector'
import { cn } from '@refraction-ui/shared'

export interface LocationSelectorProps {
  defaultCountry?: string
  defaultLanguage?: string
  onCountryChange?: (country: string) => void
  onLanguageChange?: (language: string) => void
  className?: string
}

export function LocationSelector({
  defaultCountry = 'US',
  defaultLanguage = 'en',
  onCountryChange,
  onLanguageChange,
  className,
}: LocationSelectorProps) {
  const [country, setCountry] = React.useState(defaultCountry)
  const [language, setLanguage] = React.useState(defaultLanguage)

  const handleCountryChange = React.useCallback(
    (c: string) => {
      setCountry(c)
      onCountryChange?.(c)
    },
    [onCountryChange],
  )

  const handleLanguageChange = React.useCallback(
    (l: string) => {
      setLanguage(l)
      onLanguageChange?.(l)
    },
    [onLanguageChange],
  )

  const api = React.useMemo(
    () =>
      createLocationSelector({
        defaultCountry,
        defaultLanguage,
        onCountryChange: handleCountryChange,
        onLanguageChange: handleLanguageChange,
      }),
    [defaultCountry, defaultLanguage, handleCountryChange, handleLanguageChange],
  )

  return React.createElement(
    'div',
    { className: cn('flex flex-col gap-4 sm:flex-row', className) },
    React.createElement(
      'div',
      { className: 'flex flex-col gap-1.5 flex-1' },
      React.createElement('label', { htmlFor: api.countryProps.id, className: 'text-sm font-medium' }, 'Country'),
      React.createElement(
        'select',
        {
          id: api.countryProps.id,
          name: api.countryProps.name,
          value: country,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => api.setCountry(e.target.value),
          className: 'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        },
        api.countries.map((c: any) =>
          React.createElement('option', { key: c.code || c.id || c, value: c.code || c.id || c }, c.name || c.label || c)
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'flex flex-col gap-1.5 flex-1' },
      React.createElement('label', { htmlFor: api.languageProps.id, className: 'text-sm font-medium' }, 'Language'),
      React.createElement(
        'select',
        {
          id: api.languageProps.id,
          name: api.languageProps.name,
          value: language,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => api.setLanguage(e.target.value),
          className: 'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        },
        api.languages.map((l: any) =>
          React.createElement('option', { key: l.code || l.id || l, value: l.code || l.id || l }, l.name || l.label || l)
        )
      )
    )
  )
}
