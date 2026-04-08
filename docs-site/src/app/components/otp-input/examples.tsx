'use client'

import { useState } from 'react'
import { OtpInput } from '@refraction-ui/react-otp-input'

interface OtpInputExamplesProps {
  section: 'lengths' | 'types'
}

export function OtpInputExamples({ section }: OtpInputExamplesProps) {
  const [value4, setValue4] = useState('')
  const [value6, setValue6] = useState('')
  const [valueText, setValueText] = useState('')

  if (section === 'lengths') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">4-Digit OTP</span>
            <OtpInput length={4} value={value4} onChange={setValue4} />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">6-Digit OTP</span>
            <OtpInput length={6} value={value6} onChange={setValue6} />
          </div>
        </div>
      </div>
    )
  }

  if (section === 'types') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Numeric (default)</span>
            <OtpInput length={6} type="number" value={value6} onChange={setValue6} />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Alphanumeric</span>
            <OtpInput length={6} type="text" value={valueText} onChange={setValueText} />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Disabled</span>
            <OtpInput length={4} disabled />
          </div>
        </div>
      </div>
    )
  }

  return null
}
