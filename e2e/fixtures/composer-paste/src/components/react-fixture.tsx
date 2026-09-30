import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { RefractionComposer, type ComposerAPI, type ComposerSubmission } from '../../../../../packages/react-composer/src/index.js'

const records: Record<string, { images: { name: string; type: string; size: number }[]; submissions: ComposerSubmission[] }> = {}
function show() { document.getElementById('results')!.textContent = JSON.stringify(records, null, 2) }
export function recordImages(framework: string, images: File[], api: ComposerAPI) {
  records[framework] ??= { images: [], submissions: [] }
  for (const file of images) {
    records[framework].images.push({ name: file.name, type: file.type, size: file.size })
    // Fixture-only staging; production upload belongs to the host callback.
    const id = api.addAttachment({ kind: 'image', name: file.name, mimeType: file.type, sizeBytes: file.size })
    if (id) api.updateAttachment(id, { status: 'ready' })
  }
  show()
}
export function recordSubmit(framework: string, submission: ComposerSubmission) {
  records[framework] ??= { images: [], submissions: [] }
  records[framework].submissions.push(submission)
  show()
}
export function mountReactFixture() {
  const apiRef = React.createRef<ComposerAPI>()
  createRoot(document.getElementById('react-root')!).render(
    <RefractionComposer defaultValue={new URL(location.href).searchParams.get('draft') ?? 'before selected after'} maxAttachmentSizeBytes={1024} apiRef={apiRef}
      onImagesPasted={images => recordImages('react', images, apiRef.current!)}
      onSubmit={submission => recordSubmit('react', submission)} />,
  )
}
