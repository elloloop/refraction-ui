'use client'
import { useState } from 'react'
import { CodeEditor } from '@refraction-ui/react-code-editor'
interface CodeEditorExamplesProps { section: 'basic' }
export function CodeEditorExamples({ section }: CodeEditorExamplesProps) {
  const [code, setCode] = useState('function hello() {\n  console.log("Hello, World!")\n}')
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-lg">
          <CodeEditor value={code} onChange={setCode} language="javascript" />
        </div>
      </div>
    )
  }
  return null
}
