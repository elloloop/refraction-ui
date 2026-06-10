'use client'

import {
  CodeBlock as RuiCodeBlock,
  CodeBlockHeader,
  CodeBlockContent,
} from '@refraction-ui/react-code-block'

interface CodeBlockExamplesProps {
  section: 'basic' | 'with-header'
}

const snippet = `function greet(name) {
  return \`Hello, \${name}!\`
}

greet('world')`

export function CodeBlockExamples({ section }: CodeBlockExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <RuiCodeBlock>
          <CodeBlockContent>{snippet}</CodeBlockContent>
        </RuiCodeBlock>
      </div>
    )
  }

  if (section === 'with-header') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <RuiCodeBlock>
          <CodeBlockHeader>
            <span className="text-xs font-medium text-muted-foreground">greet.js</span>
            <span className="text-xs text-muted-foreground">JavaScript</span>
          </CodeBlockHeader>
          <CodeBlockContent>{snippet}</CodeBlockContent>
        </RuiCodeBlock>
      </div>
    )
  }

  return null
}
