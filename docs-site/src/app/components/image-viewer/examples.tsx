'use client'

import * as React from 'react'
import { ImageViewer, type ImageViewerImage } from '@refraction-ui/react-image-viewer'
import { IconButton } from '@refraction-ui/react-icon-button'

export type ImageViewerExampleSection = 'basic' | 'gallery' | 'localised'

interface ImageViewerExamplesProps {
  section: ImageViewerExampleSection
}

/* ------------------------------------------------------------------------ */
/* Sample images                                                             */
/* ------------------------------------------------------------------------ */

// Demo content, not UI chrome: generated "screenshots" (vector, so they stay
// crisp at 8×). Like a photo they carry their own fixed colours; the viewer
// around them is fully token-themed.
const SAMPLE_WIDTH = 1600
const SAMPLE_HEIGHT = 1000

interface Sample {
  title: string
  accent: string
  alt: string
  caption: string
}

const SAMPLES: Sample[] = [
  {
    title: 'Build #4821 — failed',
    accent: 'crimson',
    alt: 'CI build log with a failed test step highlighted',
    caption: 'Build #4821: the integration step failed after 3 min 12 s.',
  },
  {
    title: 'Latency (p95)',
    accent: 'steelblue',
    alt: 'Line chart of p95 latency rising sharply at 14:05',
    caption: 'p95 latency spiked at 14:05, right after the deploy.',
  },
  {
    title: 'Settings — Notifications',
    accent: 'seagreen',
    alt: 'Notification settings page with email digests turned off',
    caption: 'Email digests are off by default for new workspaces.',
  },
  {
    title: 'Error: quota exceeded',
    accent: 'darkorange',
    alt: 'Error dialog reading "Storage quota exceeded" with a retry button',
    caption: 'The quota dialog shown to free-plan users.',
  },
]

function sampleSvg({ title, accent }: Sample): string {
  const rows = Array.from({ length: 9 }, (_, i) => {
    const y = 220 + i * 70
    const width = 600 + ((i * 137) % 700)
    const fill = i === 4 ? accent : 'lightgray'
    return `<rect x="120" y="${y}" width="${width}" height="28" rx="6" fill="${fill}"/>`
  }).join('')
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SAMPLE_WIDTH} ${SAMPLE_HEIGHT}">`,
    `<rect width="${SAMPLE_WIDTH}" height="${SAMPLE_HEIGHT}" fill="whitesmoke"/>`,
    `<rect width="${SAMPLE_WIDTH}" height="120" fill="${accent}"/>`,
    `<text x="120" y="80" font-family="system-ui, sans-serif" font-size="48" fill="white">${title}</text>`,
    rows,
    `<circle cx="1360" cy="420" r="150" fill="none" stroke="${accent}" stroke-width="24"/>`,
    `<text x="120" y="940" font-family="ui-monospace, monospace" font-size="22" fill="dimgray">`,
    'Zoom in to read the fine print: every detail stays sharp at 8x.</text>',
    '</svg>',
  ].join('')
}

function dataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const SVGS = SAMPLES.map(sampleSvg)

const IMAGES: ImageViewerImage[] = SAMPLES.map((sample, i) => ({
  src: dataUri(SVGS[i]),
  alt: sample.alt,
  caption: sample.caption,
  width: SAMPLE_WIDTH,
  height: SAMPLE_HEIGHT,
}))

/* ------------------------------------------------------------------------ */
/* Action icons + handlers                                                   */
/* ------------------------------------------------------------------------ */

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}
const DownloadIcon = () => (
  <Glyph>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </Glyph>
)
const ExternalIcon = () => (
  <Glyph>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Glyph>
)

function download(index: number) {
  const link = document.createElement('a')
  link.href = IMAGES[index].src
  link.download = `screenshot-${index + 1}.svg`
  link.click()
}

function openOriginal(index: number) {
  // Browsers block top-level navigation to data: URLs, so open a blob URL.
  const url = URL.createObjectURL(new Blob([SVGS[index]], { type: 'image/svg+xml' }))
  window.open(url, '_blank', 'noopener,noreferrer')
}

interface ThumbnailProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  image: ImageViewerImage
  label: string
}

// Forwards its ref and props so it can be the viewer's `trigger` (Dialog
// clones the trigger to add `onClick`, `aria-expanded` and `aria-haspopup`).
const Thumbnail = React.forwardRef<HTMLButtonElement, ThumbnailProps>(function Thumbnail(
  { image, label, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className="overflow-hidden rounded-lg border border-border bg-muted transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
      {...props}
    >
      <img src={image.src} alt="" className="block h-28 w-44 object-cover" />
    </button>
  )
})

/* ------------------------------------------------------------------------ */
/* Sections                                                                  */
/* ------------------------------------------------------------------------ */

export function ImageViewerExamples({ section }: ImageViewerExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <ImageViewer
          images={[IMAGES[0]]}
          trigger={<Thumbnail image={IMAGES[0]} label={`Open image: ${IMAGES[0].alt}`} />}
        />
      </div>
    )
  }

  if (section === 'gallery') return <GalleryExample />
  if (section === 'localised') return <LocalisedExample />
  return null
}

function GalleryExample() {
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(0)

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-8">
      <div className="flex flex-wrap gap-3">
        {IMAGES.map((image, i) => (
          <Thumbnail
            key={image.alt}
            image={image}
            label={`Open image ${i + 1} of ${IMAGES.length}: ${image.alt}`}
            onClick={() => {
              setIndex(i)
              setOpen(true)
            }}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {`Showing image ${index + 1} of ${IMAGES.length} when open.`}
      </p>
      <ImageViewer
        images={IMAGES}
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
        actions={(_, i) => (
          <>
            <IconButton variant="ghost" icon={<DownloadIcon />} label="Download" onClick={() => download(i)} />
            <IconButton variant="ghost" icon={<ExternalIcon />} label="Open original" onClick={() => openOriginal(i)} />
          </>
        )}
      />
    </div>
  )
}

function LocalisedExample() {
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <ImageViewer
        images={IMAGES.slice(1)}
        loop
        labels={{
          dialog: 'Visionneuse d’images',
          close: 'Fermer',
          zoomIn: 'Zoom avant',
          zoomOut: 'Zoom arrière',
          resetZoom: 'Réinitialiser le zoom',
          previous: 'Image précédente',
          next: 'Image suivante',
          position: (i, n) => `Image ${i} sur ${n}`,
          zoom: (percent) => `Zoom ${percent} %`,
        }}
        trigger={<Thumbnail image={IMAGES[1]} label="Ouvrir la galerie (3 images)" />}
      />
    </div>
  )
}
