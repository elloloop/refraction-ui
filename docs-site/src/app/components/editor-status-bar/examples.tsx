'use client'

import * as React from 'react'
import { EditorStatusBar } from '@refraction-ui/react-editor-status-bar'

interface EditorStatusBarExamplesProps {
  section: 'convenience' | 'custom-segments' | 'minimal'
}

export function EditorStatusBarExamples({ section }: EditorStatusBarExamplesProps) {
  if (section === 'convenience') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-8 bg-muted/30 h-24 flex items-center justify-center text-sm text-muted-foreground">
          Editor pane
        </div>
        <EditorStatusBar
          line={17}
          col={1}
          indentation="Spaces: 4"
          language="Python 3.11.4"
          encoding="UTF-8"
          eol="LF"
          status="Auto-saved"
        />
      </div>
    )
  }

  if (section === 'custom-segments') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-8 bg-muted/30 h-24 flex items-center justify-center text-sm text-muted-foreground">
          Editor pane
        </div>
        <EditorStatusBar
          segments={[
            { id: 'branch', label: 'main', align: 'left', tone: 'accent' },
            { id: 'errors', label: '0 errors', align: 'left', tone: 'muted' },
            { id: 'warnings', label: '2 warnings', align: 'left', tone: 'default' },
            { id: 'lang', label: 'TypeScript', align: 'right', tone: 'accent' },
            { id: 'prettier', label: 'Prettier', align: 'right', tone: 'muted' },
          ]}
        />
      </div>
    )
  }

  if (section === 'minimal') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-8 bg-muted/30 h-24 flex items-center justify-center text-sm text-muted-foreground">
          Editor pane
        </div>
        <EditorStatusBar line={1} col={1} />
      </div>
    )
  }

  return null
}
