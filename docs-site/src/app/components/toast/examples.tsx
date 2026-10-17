'use client'

import { useState } from 'react'
import { useToast, Toaster } from '@refraction-ui/react-toast'
import { Button } from '@refraction-ui/react-button'

const INITIAL_DRAFTS = 3
// A toast that offers an action stays up longer, so there is time to reach it.
const ACTION_TOAST_DURATION = 6000

export function ToastExamples() {
  const { toast } = useToast()

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="default"
            className="w-full"
            onClick={() => toast('This is a default notification.', { variant: 'default' })}
          >
            Default
          </Button>
          <span className="text-xs text-muted-foreground font-medium">Neutral</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="default"
            className="w-full"
            onClick={() => toast('Operation completed successfully!', { variant: 'success' })}
          >
            Success
          </Button>
          <span className="text-xs text-muted-foreground font-medium">Positive</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => toast('Something went wrong. Please try again.', { variant: 'error' })}
          >
            Error
          </Button>
          <span className="text-xs text-muted-foreground font-medium">Destructive</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast('Please review your input before continuing.', { variant: 'warning' })}
          >
            Warning
          </Button>
          <span className="text-xs text-muted-foreground font-medium">Cautionary</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => toast('This toast stays until dismissed.', { variant: 'default', duration: 0 })}
          >
            Persistent
          </Button>
          <span className="text-xs text-muted-foreground font-medium">No auto-dismiss</span>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

/** Title and action examples. Renders no Toaster: pair it with one (ToastExamples has it). */
export function ToastActionExamples() {
  const { toast } = useToast()
  const [drafts, setDrafts] = useState(INITIAL_DRAFTS)

  const deleteDraft = () => {
    if (drafts === 0) {
      toast('There are no drafts left to delete.', { variant: 'warning' })
      return
    }
    setDrafts((n) => n - 1)
    toast('Draft deleted.', {
      duration: ACTION_TOAST_DURATION,
      action: { label: 'Undo', onClick: () => setDrafts((n) => n + 1) },
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-3">
          <Button variant="outline" className="w-full" onClick={deleteDraft}>
            Delete a draft
          </Button>
          <span className="text-xs text-muted-foreground font-medium">Drafts left: {drafts}</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="default"
            className="w-full"
            onClick={() =>
              toast('Everyone in the workspace can see your changes now.', {
                variant: 'success',
                title: 'Published',
              })
            }
          >
            With title
          </Button>
          <span className="text-xs text-muted-foreground font-medium">Title and message</span>
        </div>
      </div>
    </div>
  )
}
