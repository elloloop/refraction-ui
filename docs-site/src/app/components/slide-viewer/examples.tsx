'use client'
import { SlideViewer } from '@refraction-ui/react-slide-viewer'
interface SlideViewerExamplesProps { section: 'basic' }
export function SlideViewerExamples({ section }: SlideViewerExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-lg">
          <SlideViewer
            slides={[
              { id: '1', title: 'Introduction', content: 'Welcome to the presentation', type: 'text' },
              { id: '2', title: 'Features', content: 'Key features overview', type: 'text' },
              { id: '3', title: 'Summary', content: 'Thank you for watching', type: 'text' },
            ]}
          />
        </div>
      </div>
    )
  }
  return null
}
