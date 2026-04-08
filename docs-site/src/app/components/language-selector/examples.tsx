'use client'

import { useState } from 'react'
import { LanguageSelector } from '@refraction-ui/react-language-selector'

interface LanguageSelectorExamplesProps {
  section: 'basic'
}

export function LanguageSelectorExamples({ section }: LanguageSelectorExamplesProps) {
  const [lang, setLang] = useState('en')

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Single Select</span>
            <LanguageSelector
              value={lang}
              onValueChange={(v) => setLang(v as string)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
                { value: 'ja', label: 'Japanese' },
              ]}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
