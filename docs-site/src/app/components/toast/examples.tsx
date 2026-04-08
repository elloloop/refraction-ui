'use client'

import { useToast, Toaster } from '@refraction-ui/react-toast'
import { Button } from '@refraction-ui/react-button'

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
