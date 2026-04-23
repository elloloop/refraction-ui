import * as React from 'react'

interface CodeSampleProps {
  language?: string
  title?: string
  children: string
}

/**
 * Minimal terminal/code-block wrapper. We don't syntax-highlight on the
 * server (shiki would pull a lot of JS) — these blocks are short and the
 * monochrome look matches the rest of the docs.
 */
export function CodeSample({ language, title, children }: CodeSampleProps) {
  return (
    <div className="rounded-xl bg-zinc-950 overflow-hidden ring-1 ring-white/10 dark:bg-zinc-900 my-4">
      {(title || language) && (
        <div className="border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 ml-2">
            {title ?? language ?? ''}
          </span>
        </div>
      )}
      <pre className="overflow-x-auto p-5">
        <code className="text-[13px] font-mono text-zinc-200 leading-relaxed whitespace-pre">
          {children}
        </code>
      </pre>
    </div>
  )
}
