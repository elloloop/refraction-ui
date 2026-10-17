'use client'

import * as React from 'react'
import { FileCard } from '@refraction-ui/react-file-card'

export type FileCardExampleSection = 'basic' | 'states' | 'upload' | 'link' | 'media' | 'localised'

interface FileCardExamplesProps {
  section: FileCardExampleSection
}

const KB = 1024
const MB = KB * KB
const UPLOAD_TICK_MS = 400
const UPLOAD_STEP_PERCENT = 8
const UPLOAD_DONE_PERCENT = 100

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-6 grid gap-3 sm:grid-cols-2">{children}</div>
}

function useLastAction() {
  const [last, setLast] = React.useState('—')
  return { last, log: (text: string) => () => setLast(text) }
}

function LastAction({ text }: { text: string }) {
  return (
    <p className="text-sm text-muted-foreground sm:col-span-2" aria-live="polite">
      Last action: {text}
    </p>
  )
}

export function FileCardExamples({ section }: FileCardExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'states') return <StatesExample />
  if (section === 'upload') return <UploadExample />
  if (section === 'link') return <LinkExample />
  if (section === 'media') return <MediaExample />
  if (section === 'localised') return <LocalisedExample />
  return null
}

function BasicExample() {
  const { last, log } = useLastAction()
  return (
    <Frame>
      <FileCard name="Q3-financial-report.pdf" mimeType="application/pdf" size={2.4 * MB} onOpen={log('open PDF')} />
      <FileCard name="budget-2026.xlsx" size={86 * KB} onOpen={log('open spreadsheet')} />
      <FileCard name="design-assets.zip" mimeType="application/zip" size={148 * MB} onOpen={log('open archive')} />
      <FileCard name="useFileCard.ts" mimeType="text/plain" size={3200} onOpen={log('open code')} />
      <FileCard name="kickoff-deck.pptx" size={12.8 * MB} onOpen={log('open deck')} />
      <FileCard name=".env.example" size={412} onOpen={log('open dotfile')} />
      <LastAction text={last} />
    </Frame>
  )
}

function StatesExample() {
  const { last, log } = useLastAction()
  return (
    <Frame>
      <FileCard
        name="customer-interviews.mp4"
        size={420 * MB}
        status="uploading"
        progress={45}
        onCancel={log('cancel')}
      />
      <FileCard name="raw-export.csv" size={8 * MB} status="uploading" onCancel={log('cancel indeterminate')} />
      <FileCard
        name="whiteboard-photo.heic"
        size={3.1 * MB}
        status="failed"
        error="Connection lost. Check your network and retry."
        onRetry={log('retry')}
      />
      <FileCard
        name="contract-signed.pdf"
        size={640 * KB}
        status="done"
        onOpen={log('open')}
        onDownload={log('download')}
      />
      <LastAction text={last} />
    </Frame>
  )
}

type UploadState = { status: 'uploading' | 'failed' | 'done'; progress: number }

function UploadExample() {
  const [state, setState] = React.useState<UploadState>({ status: 'uploading', progress: 0 })
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = React.useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }, [])

  const start = React.useCallback(() => {
    stop()
    setState({ status: 'uploading', progress: 0 })
    timer.current = setInterval(() => {
      setState((s) => {
        const progress = Math.min(UPLOAD_DONE_PERCENT, s.progress + UPLOAD_STEP_PERCENT)
        return { status: progress === UPLOAD_DONE_PERCENT ? 'done' : 'uploading', progress }
      })
    }, UPLOAD_TICK_MS)
  }, [stop])

  React.useEffect(() => {
    start()
    return stop
  }, [start, stop])

  React.useEffect(() => {
    if (state.status !== 'uploading') stop()
  }, [state.status, stop])

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <FileCard
        name="product-walkthrough-final-v3.mov"
        size={96 * MB}
        duration={312}
        status={state.status}
        progress={state.progress}
        error="Upload cancelled"
        onCancel={() => setState((s) => ({ ...s, status: 'failed' }))}
        onRetry={start}
        onOpen={() => {}}
        onDownload={() => {}}
      />
      <button
        type="button"
        onClick={start}
        className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Restart upload
      </button>
    </div>
  )
}

function LinkExample() {
  return (
    <Frame>
      <FileCard
        name="2026-10-17-engineering-all-hands-meeting-notes-and-action-items.docx"
        size={58 * KB}
        href="#file-card-link"
        maxNameLength={28}
        onDownload={() => {}}
      />
      <FileCard
        name="architecture-overview.backup-2026-10-17"
        size={1.2 * MB}
        href="#file-card-link"
        target="_blank"
        maxNameLength={24}
        actions={
          <a
            href="#file-card-link"
            download
            className="rounded-md px-2 py-1 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Save
          </a>
        }
      />
    </Frame>
  )
}

function MediaExample() {
  return (
    <Frame>
      <FileCard name="team-offsite.jpg" size={4.2 * MB} dimensions={{ width: 4032, height: 3024 }} onOpen={() => {}} />
      <FileCard name="standup-recording.webm" size={210 * MB} duration={1834} onOpen={() => {}} />
      <FileCard name="voice-note.m4a" size={620 * KB} duration={47} onOpen={() => {}} />
      <FileCard
        name="launch-video-4k.mp4"
        size={1.9 * KB * MB}
        duration={4321}
        dimensions={{ width: 3840, height: 2160 }}
        onOpen={() => {}}
      />
    </Frame>
  )
}

function LocalisedExample() {
  return (
    <Frame>
      <FileCard
        name="Quartalsbericht.pdf"
        size={2.4 * MB}
        locale="de-DE"
        labels={{ download: 'Herunterladen', kinds: { pdf: 'PDF-Dokument' } }}
        onOpen={() => {}}
        onDownload={() => {}}
      />
      <FileCard
        name="Präsentation.key"
        size={12.5 * MB}
        status="uploading"
        progress={62}
        locale="de-DE"
        labels={{
          uploading: 'Wird hochgeladen',
          cancel: 'Hochladen abbrechen',
          progress: (name) => `${name} wird hochgeladen`,
          kinds: { presentation: 'Präsentation' },
        }}
        onCancel={() => {}}
      />
    </Frame>
  )
}
