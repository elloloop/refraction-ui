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
import { Input } from '@refraction-ui/react-input'

export function DialogExample() {
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="flex flex-wrap items-center gap-4">
        {/* Simple confirm dialog */}
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Open Dialog
          </DialogTrigger>
          <DialogOverlay>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>
                  Are you sure you want to continue? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
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

        {/* Edit Profile dialog with form */}
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
            Edit Profile
          </DialogTrigger>
          <DialogOverlay>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you are done.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input placeholder="Enter your name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" placeholder="Enter your email" defaultValue="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Bio</label>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background min-h-[80px] resize-none"
                    placeholder="Tell us about yourself"
                    defaultValue="Software engineer who loves building accessible UI components."
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                  Cancel
                </DialogClose>
                <DialogClose className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Save Changes
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </DialogOverlay>
        </Dialog>
      </div>
    </div>
  )
}
