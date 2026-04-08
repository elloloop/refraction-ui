'use client'

import {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@refraction-ui/react-dialog'
import { Button } from '@refraction-ui/react-button'

export function DialogExample() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Dialog>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Open Dialog
        </DialogTrigger>
        <DialogOverlay>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                This is an example dialog. Press Escape or click the overlay to dismiss.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Dialog content can contain any elements: forms, text, images, or other components.
              </p>
            </div>
            <DialogFooter>
              <DialogClose className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                Cancel
              </DialogClose>
              <DialogClose className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Confirm
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </div>
  )
}
