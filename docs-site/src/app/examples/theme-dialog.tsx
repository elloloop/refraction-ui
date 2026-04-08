'use client'

import { useState } from 'react'

interface ThemeDialogProps {
  themeName: string
  themeConfig: string
}

export function ThemeDialog({ themeName, themeConfig }: ThemeDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-[var(--button-radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
        </svg>
        View Theme
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[80vh] rounded-[var(--card-radius)] border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">{themeName} Theme Config</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius)] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(80vh-4rem)] p-6">
              <p className="text-sm text-muted-foreground mb-4">
                This example is themed entirely through CSS custom properties. Copy the variables below into your <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">globals.css</code> to replicate this brand.
              </p>
              <pre className="rounded-[var(--radius)] bg-muted p-4 overflow-x-auto">
                <code className="text-sm font-mono text-foreground whitespace-pre">{themeConfig}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
