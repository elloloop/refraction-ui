'use client'

import * as React from 'react'
import { BrowserChromeMock } from '@refraction-ui/react-browser-chrome-mock'

interface BrowserChromeMockExamplesProps {
  section: 'basic' | 'live' | 'rec'
}

export function BrowserChromeMockExamples({ section }: BrowserChromeMockExamplesProps) {
  if (section === 'basic') {
    return (
      <BrowserChromeMock url="loopwyse.com/dashboard">
        <div className="bg-card p-8 text-sm text-muted-foreground">
          Page content renders here.
        </div>
      </BrowserChromeMock>
    )
  }

  if (section === 'live') {
    return (
      <BrowserChromeMock url="loopwyse.com/r/7k2f" status="live">
        <div className="bg-card p-8 text-sm text-muted-foreground">
          Live session content renders here.
        </div>
      </BrowserChromeMock>
    )
  }

  if (section === 'rec') {
    return (
      <BrowserChromeMock url="loopwyse.com/recordings/abc123" status="rec">
        <div className="bg-card p-8 text-sm text-muted-foreground">
          Recording playback content renders here.
        </div>
      </BrowserChromeMock>
    )
  }

  return null
}
