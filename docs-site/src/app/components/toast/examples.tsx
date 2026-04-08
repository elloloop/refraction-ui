'use client'

import { useToast, Toaster } from '@refraction-ui/react-toast'
import { Button } from '@refraction-ui/react-button'

export function ToastExamples() {
  const { toast } = useToast()

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="default"
          onClick={() => toast('This is a default notification.', { variant: 'default' })}
        >
          Default Toast
        </Button>
        <Button
          variant="default"
          onClick={() => toast('Operation completed successfully!', { variant: 'success' })}
        >
          Success Toast
        </Button>
        <Button
          variant="destructive"
          onClick={() => toast('Something went wrong.', { variant: 'error' })}
        >
          Error Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('Please check your input.', { variant: 'warning' })}
        >
          Warning Toast
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast('This toast sticks around.', { variant: 'default', duration: 0 })}
        >
          Persistent Toast
        </Button>
      </div>
      <Toaster />
    </div>
  )
}
