'use client'
import { MarkdownRenderer } from '@refraction-ui/react-markdown-renderer'
interface MarkdownRendererExamplesProps { section: 'basic' }
const sampleMarkdown = `# Hello World

This is a **markdown** renderer with *italic* and \`inline code\`.

## Features
- Headings
- Lists
- Code blocks
- Bold and italic text

\`\`\`js
const greeting = "Hello!"
console.log(greeting)
\`\`\`
`
export function MarkdownRendererExamples({ section }: MarkdownRendererExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-lg">
          <MarkdownRenderer content={sampleMarkdown} />
        </div>
      </div>
    )
  }
  return null
}
