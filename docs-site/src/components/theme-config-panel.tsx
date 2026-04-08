'use client'

import { useState, useRef, useEffect } from 'react'

interface ThemeConfigPanelProps {
  defaultConfig: string
}

function parseAndApply(css: string) {
  const root = document.documentElement
  const regex = /--([\w-]+)\s*:\s*([^;]+)/g
  let match
  while ((match = regex.exec(css)) !== null) {
    root.style.setProperty(`--${match[1]}`, match[2].trim())
  }
}

function clearApplied(css: string) {
  const root = document.documentElement
  const regex = /--([\w-]+)\s*:\s*([^;]+)/g
  let match
  while ((match = regex.exec(css)) !== null) {
    root.style.removeProperty(`--${match[1]}`)
  }
}

export function ThemeConfigPanel({ defaultConfig }: ThemeConfigPanelProps) {
  const [open, setOpen] = useState(false)
  const [css, setCss] = useState(defaultConfig)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Apply default config on mount so the example looks correct
  useEffect(() => {
    parseAndApply(defaultConfig)
    return () => clearApplied(defaultConfig)
  }, [defaultConfig])

  function handleApply() {
    parseAndApply(css)
  }

  function handleReset() {
    setCss(defaultConfig)
    parseAndApply(defaultConfig)
  }

  function handleCopy() {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
        </svg>
        Edit Theme
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 z-[101] h-full w-[400px] max-w-[90vw] bg-card border-l border-border shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <h2 className="text-base font-semibold text-foreground">Theme Config</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          <p className="text-sm text-muted-foreground mb-4">
            Edit the CSS custom properties below and click <strong>Apply</strong> to see changes live. Copy the config to use in your own project.
          </p>
          <textarea
            ref={textareaRef}
            value={css}
            onChange={(e) => setCss(e.target.value)}
            spellCheck={false}
            className="w-full h-[calc(100%-3rem)] min-h-[400px] rounded-md border border-input bg-muted/50 p-4 text-xs font-mono text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Actions */}
        <div className="border-t border-border px-5 py-4 shrink-0 flex items-center gap-2">
          <button
            onClick={handleApply}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleCopy}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </>
  )
}
