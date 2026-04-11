'use client'

import { useState } from 'react'
import { useFramework, Framework } from './framework-context'

interface CodeBlockProps {
  code?: string
  frameworks?: Partial<Record<Framework, string>>
  language?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ code, frameworks, language = 'tsx', showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { framework } = useFramework()

  const displayCode = frameworks?.[framework] || code || ''

  const handleCopy = async () => {
    if (!displayCode) return
    try {
      await navigator.clipboard.writeText(displayCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = displayCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const lines = displayCode.split('\n')

  if (!displayCode) {
    return (
      <div className="rounded-xl bg-zinc-950 p-6 text-sm text-zinc-500 italic text-center dark:bg-zinc-900 ring-1 ring-white/10">
        Code example not yet available for {framework}.
      </div>
    )
  }

  return (
    <div className="group relative rounded-xl bg-zinc-950 overflow-hidden ring-1 ring-white/10 dark:bg-zinc-900">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{language}</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-zinc-400 transition-all hover:bg-white/5 hover:text-zinc-200"
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="py-4 text-[13px] leading-relaxed">
          {showLineNumbers ? (
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="w-12 select-none border-r border-white/5 pr-4 text-right font-mono text-xs text-zinc-600">
                      {i + 1}
                    </td>
                    <td className="pl-4 pr-6">
                      <code className="font-mono text-zinc-200 whitespace-pre">{line}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code className="block px-5 font-mono text-zinc-200 whitespace-pre">
              {displayCode}
            </code>
          )}
        </pre>
      </div>
    </div>
  )
}
