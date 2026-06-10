'use client'

import { useState } from 'react'
import { LocationSelector } from '@refraction-ui/react-location-selector'

interface LocationSelectorExamplesProps {
  section: 'basic' | 'controlled'
}

export function LocationSelectorExamples({ section }: LocationSelectorExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-md">
          <LocationSelector defaultCountry="US" defaultLanguage="en" />
        </div>
      </div>
    )
  }

  if (section === 'controlled') {
    return <ControlledExample />
  }

  return null
}

function ControlledExample() {
  const [country, setCountry] = useState('US')
  const [language, setLanguage] = useState('en')

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="max-w-md">
        <LocationSelector
          defaultCountry="US"
          defaultLanguage="en"
          onCountryChange={setCountry}
          onLanguageChange={setLanguage}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Selected:{' '}
          <code className="rounded bg-muted px-1 font-mono text-xs">{country}</code> /{' '}
          <code className="rounded bg-muted px-1 font-mono text-xs">{language}</code>
        </p>
      </div>
    </div>
  )
}
