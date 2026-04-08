interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="text-sm font-mono text-foreground leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  )
}
