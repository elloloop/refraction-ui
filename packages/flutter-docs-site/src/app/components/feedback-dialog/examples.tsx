'use client'

import { FeedbackDialog, FeedbackButton } from '@refraction-ui/react-feedback-dialog'

interface FeedbackDialogExamplesProps { section: 'basic' }

export function FeedbackDialogExamples({ section }: FeedbackDialogExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <FeedbackDialog onSubmit={(data) => alert(JSON.stringify(data))}>
            <FeedbackButton className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Send Feedback
            </FeedbackButton>
          </FeedbackDialog>
        </div>
      </div>
    )
  }
  return null
}
