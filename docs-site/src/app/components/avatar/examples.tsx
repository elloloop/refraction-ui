'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@refraction-ui/react-avatar'

interface AvatarExamplesProps {
  section: 'sizes' | 'fallback'
}

export function AvatarExamples({ section }: AvatarExamplesProps) {
  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="xs">
              <AvatarFallback>XS</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">xs</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="sm">
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="md">
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">md</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="lg">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">lg</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="xl">
              <AvatarFallback>XL</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">xl</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'fallback') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="lg">
              <AvatarImage src="https://i.pravatar.cc/150?u=a" alt="User avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">With Image</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="lg">
              <AvatarImage src="/broken-image.jpg" alt="Broken" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">Fallback Initials</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="lg">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">Initials Only</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
