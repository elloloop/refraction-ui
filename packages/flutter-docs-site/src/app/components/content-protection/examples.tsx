'use client'
import { ContentProtection } from '@refraction-ui/react-content-protection'
interface ContentProtectionExamplesProps { section: 'basic' }
export function ContentProtectionExamples({ section }: ContentProtectionExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <ContentProtection watermark={{ text: 'CONFIDENTIAL', opacity: 0.1 }}>
          <div className="p-8 bg-white dark:bg-gray-900 rounded-lg min-h-[200px]">
            <h3 className="text-lg font-semibold mb-2">Protected Content</h3>
            <p className="text-sm text-muted-foreground">
              This content has a watermark overlay. Right-click and copy protection can also be enabled.
            </p>
          </div>
        </ContentProtection>
      </div>
    )
  }
  return null
}
