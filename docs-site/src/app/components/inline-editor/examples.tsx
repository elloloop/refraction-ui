'use client'

import { useState } from 'react'
import { InlineEditor } from '@refraction-ui/react-inline-editor'

interface InlineEditorExamplesProps { section: 'basic' }

export function InlineEditorExamples({ section }: InlineEditorExamplesProps) {
  const [content, setContent] = useState('Click to edit this text. Double-click or press the edit button to enter editing mode.')

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-md">
          <InlineEditor value={content} onChange={setContent} />
        </div>
      </div>
    )
  }
  return null
}
