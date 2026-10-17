'use client'

import { MediaFrame, type MediaFrameLabelPosition } from '@refraction-ui/react-media-frame'

interface MediaFrameExamplesProps {
  section: 'ratios' | 'fit' | 'tone' | 'corners'
}

/**
 * Stand-in artwork drawn inline so the examples need no network image. It is
 * 16:9 itself; `fit` chooses whether it covers the frame or sits letterboxed.
 */
function Artwork({ fit = 'cover' }: { fit?: 'cover' | 'contain' }) {
  return (
    <svg
      viewBox="0 0 160 90"
      preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Artwork: hills under a sun"
    >
      <rect width="160" height="90" className="fill-primary/15" />
      <circle cx="116" cy="30" r="14" className="fill-primary" />
      <path d="M0 72 L38 42 L74 66 L106 46 L160 76 V90 H0 Z" className="fill-primary/60" />
    </svg>
  )
}

const CORNERS: MediaFrameLabelPosition[] = ['top-start', 'top-end', 'bottom-start', 'bottom-end']

export function MediaFrameExamples({ section }: MediaFrameExamplesProps) {
  if (section === 'ratios') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <MediaFrame ratio="1:1" label="1080×1080 · PNG" className="w-40 rounded-md">
            <Artwork />
          </MediaFrame>
          <MediaFrame ratio="16:9" label="1920×1080 · MP4" className="w-64 rounded-md">
            <Artwork />
          </MediaFrame>
          <MediaFrame
            ratio="9:16"
            label="00:09"
            labelPosition="bottom-end"
            className="w-28 rounded-md"
          >
            <Artwork />
          </MediaFrame>
        </div>
      </div>
    )
  }

  if (section === 'fit') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <figure className="space-y-2">
            <MediaFrame ratio="4:5" label="cover" className="w-40 rounded-md">
              <Artwork fit="cover" />
            </MediaFrame>
            <figcaption className="text-xs text-muted-foreground">Cropped to fill</figcaption>
          </figure>
          <figure className="space-y-2">
            <MediaFrame ratio="4:5" label="contain" className="w-40 rounded-md">
              <Artwork fit="contain" />
            </MediaFrame>
            <figcaption className="text-xs text-muted-foreground">Letterboxed</figcaption>
          </figure>
        </div>
      </div>
    )
  }

  if (section === 'tone') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <MediaFrame ratio="16:9" label="Rendering…" className="w-56 rounded-md" />
          <MediaFrame
            ratio="16:9"
            tone="tertiary"
            label="Rendering…"
            className="w-56 rounded-md"
          />
        </div>
      </div>
    )
  }

  if (section === 'corners') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CORNERS.map((corner) => (
            <MediaFrame key={corner} ratio="4:3" label={corner} labelPosition={corner} className="rounded-md">
              <Artwork />
            </MediaFrame>
          ))}
        </div>
      </div>
    )
  }

  return null
}
