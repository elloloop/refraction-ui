'use client'

import { useState } from 'react'
import { useFramework } from './framework-context'

interface InstallCommandProps {
  packageName?: string
  basePackage?: string
}

export function InstallCommand({ packageName, basePackage }: InstallCommandProps) {
  const [copied, setCopied] = useState(false)
  const { framework } = useFramework()
  
  const finalPackageName = basePackage 
    ? `@refraction-ui/${framework}-${basePackage}`
    : packageName

  const command = `pnpm add ${finalPackageName}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = command
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-zinc-950 px-4 py-3 font-mono text-sm dark:bg-zinc-900 dark:ring-1 dark:ring-white/10">
      <span className="text-zinc-500 select-none">$</span>
      <code className="flex-1 text-zinc-100 select-all">{command}</code>
      <button
        onClick={handleCopy}
        className="ml-auto inline-flex items-center justify-center rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        aria-label="Copy install command"
      >
        {copied ? (
          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
        )}
      </button>
    </div>
  )
}
