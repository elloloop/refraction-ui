'use client'

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  type SheetSide,
} from '@refraction-ui/react-sheet'

interface SheetExamplesProps {
  section: 'basic' | 'sides'
}

const primaryClass =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90'

const ghostClass =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent'

function EditProfileSheet({ side, label }: { side?: SheetSide; label: string }) {
  return (
    <Sheet side={side}>
      <SheetTrigger className={ghostClass}>{label}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="my-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Name
            <input
              defaultValue="Ada Lovelace"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Email
            <input
              defaultValue="ada@example.com"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-normal"
            />
          </label>
        </div>
        <SheetFooter>
          <SheetClose className={ghostClass}>Cancel</SheetClose>
          <SheetClose className={primaryClass}>Save changes</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function SheetExamples({ section }: SheetExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <EditProfileSheet label="Open sheet" />
      </div>
    )
  }

  if (section === 'sides') {
    const sides: SheetSide[] = ['top', 'right', 'bottom', 'left']
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap gap-3">
          {sides.map((side) => (
            <EditProfileSheet key={side} side={side} label={`From ${side}`} />
          ))}
        </div>
      </div>
    )
  }

  return null
}
