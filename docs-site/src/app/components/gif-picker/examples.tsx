'use client'

import * as React from 'react'
import { GifPicker, type GifPickerItem, type GifPickerStatus, type GifPickerTab } from '@refraction-ui/react-gif-picker'

interface GifPickerExamplesProps {
  section: 'basic' | 'states' | 'reduced-motion'
}

/** Simulated provider latency so the loading state is visible in the demo. */
const DEMO_LATENCY_MS = 600
/** Items per simulated provider page. */
const DEMO_PAGE_SIZE = 6

/**
 * Self-contained demo artwork: an SVG "GIF" whose animated variant pulses and
 * whose still variant is its first frame. Real callers pass provider URLs.
 */
function demoArtwork(label: string, hue: number, width: number, height: number, animated: boolean): string {
  const r = Math.min(width, height) / 4
  const pulse = animated
    ? `<animate attributeName="r" values="${r};${r * 1.5};${r}" dur="1.2s" repeatCount="indefinite"/>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="hsl(${hue} 70% 45%)"/>
<circle cx="${width / 2}" cy="${height / 2}" r="${r}" fill="hsl(${hue} 80% 75%)">${pulse}</circle>
<text x="50%" y="88%" text-anchor="middle" font-family="sans-serif" font-size="${height / 9}" fill="white">${label}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function demoGif(id: string, label: string, hue: number, width: number, height: number, badge?: string): GifPickerItem {
  return {
    id,
    alt: label,
    title: label,
    width,
    height,
    badge,
    previewUrl: demoArtwork(label, hue, width, height, false),
    animatedUrl: demoArtwork(label, hue, width, height, true),
  }
}

const CATALOG: GifPickerItem[] = [
  demoGif('wave', 'Waving hello', 210, 240, 180),
  demoGif('party', 'Party time', 330, 200, 200),
  demoGif('thumbs', 'Thumbs up', 140, 240, 160),
  demoGif('coffee', 'Need coffee', 30, 200, 240),
  demoGif('ship', 'Ship it', 260, 240, 180),
  demoGif('cat', 'Cat typing', 280, 200, 200),
  demoGif('dance', 'Happy dance', 300, 240, 200),
  demoGif('mind', 'Mind blown', 10, 200, 200),
  demoGif('clap', 'Slow clap', 190, 240, 180),
  demoGif('nope', 'Nope', 0, 200, 160),
  demoGif('yay', 'Yay', 50, 240, 240),
  demoGif('think', 'Thinking', 230, 200, 200),
]

const OWN_GIFS: GifPickerItem[] = [
  demoGif('own-launch', 'Our launch day', 160, 240, 180),
  demoGif('own-team', 'Team high five', 350, 200, 200, 'In review'),
  demoGif('own-mascot', 'Mascot spin', 90, 240, 200, 'In review'),
]

const RECENT_LIMIT = 9

function matches(item: GifPickerItem, query: string): boolean {
  return query === '' || item.alt.toLowerCase().includes(query.toLowerCase())
}

/** A tiny in-memory "provider" so the demo exercises the real loader contract. */
function ProviderDemo() {
  // A ref, not state: recording a pick must not re-run the current request.
  const recentRef = React.useRef<GifPickerItem[]>([])
  const [request, setRequest] = React.useState<{ query: string; tab: GifPickerTab; pages: number }>({
    query: '',
    tab: 'popular',
    pages: 1,
  })
  const [status, setStatus] = React.useState<GifPickerStatus>('ready')
  const [results, setResults] = React.useState<GifPickerItem[]>(CATALOG.slice(0, DEMO_PAGE_SIZE))
  const [hasMore, setHasMore] = React.useState(CATALOG.length > DEMO_PAGE_SIZE)
  const [picked, setPicked] = React.useState<GifPickerItem | null>(null)

  React.useEffect(() => {
    const source = request.tab === 'popular' ? CATALOG : request.tab === 'recent' ? recentRef.current : OWN_GIFS
    const found = source.filter((item) => matches(item, request.query))
    const limit = request.pages * DEMO_PAGE_SIZE
    setStatus('loading')
    const handle = window.setTimeout(() => {
      setResults(found.slice(0, limit))
      setHasMore(found.length > limit)
      setStatus('ready')
    }, DEMO_LATENCY_MS)
    return () => window.clearTimeout(handle)
  }, [request])

  const handleSelect = (item: GifPickerItem) => {
    setPicked(item)
    recentRef.current = [item, ...recentRef.current.filter((r) => r.id !== item.id)].slice(0, RECENT_LIMIT)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <GifPicker
        results={results}
        status={status}
        hasMore={hasMore}
        onSelect={handleSelect}
        onSearch={(query, tab) => {
          setResults([])
          setRequest({ query, tab, pages: 1 })
        }}
        onLoadMore={() => setRequest((prev) => ({ ...prev, pages: prev.pages + 1 }))}
        attribution={<span>Demo GIF provider</span>}
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {picked ? `Selected: ${picked.alt}` : 'Pick a GIF — it will show up under Recent.'}
      </p>
    </div>
  )
}

export function GifPickerExamples({ section }: GifPickerExamplesProps) {
  if (section === 'basic') {
    return <ProviderDemo />
  }

  if (section === 'states') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 grid gap-6 md:grid-cols-3">
        <GifPicker results={[]} status="loading" onSelect={() => {}} size="sm" aria-label="GIF picker, loading" />
        <GifPicker
          results={[]}
          status="error"
          onRetry={() => {}}
          onSelect={() => {}}
          size="sm"
          aria-label="GIF picker, failed"
        />
        <GifPicker results={[]} defaultTab="recent" onSelect={() => {}} size="sm" aria-label="GIF picker, empty" />
      </div>
    )
  }

  if (section === 'reduced-motion') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <GifPicker results={CATALOG.slice(0, DEMO_PAGE_SIZE)} reducedMotion onSelect={() => {}} />
      </div>
    )
  }

  return null
}
