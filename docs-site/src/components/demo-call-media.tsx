'use client'

import * as React from 'react'

/**
 * Stand-in media for the call component docs.
 *
 * `DemoCamera` and `DemoScreen` are static SVGs, so the docs pages screenshot
 * the same every run. `LiveDemoVideo` is a real `<video>` playing a
 * `MediaStream` drawn on a canvas — the same element a call app would attach a
 * participant's track to — and is used where pixels need not be locked
 * (Storybook).
 */

/** A camera frame: a head-and-shoulders silhouette on a per-person backdrop. */
export function DemoCamera({ hue = 210 }: { hue?: number }) {
  const id = React.useId()
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 35% 42%)`} />
          <stop offset="1" stopColor={`hsl(${(hue + 40) % 360} 30% 24%)`} />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${id}-bg)`} />
      <circle cx="160" cy="78" r="30" fill={`hsl(${hue} 20% 82%)`} />
      <path d="M96 180c0-38 28-62 64-62s64 24 64 62Z" fill={`hsl(${hue} 18% 70%)`} />
    </svg>
  )
}

/** A shared screen: a slide with a title, bullet lines and a chart. */
export function DemoScreen() {
  return (
    <svg viewBox="0 0 320 200" aria-hidden="true">
      <rect width="320" height="200" fill="hsl(var(--card))" />
      <rect x="20" y="20" width="150" height="14" rx="3" fill="hsl(var(--foreground) / 0.7)" />
      <rect x="20" y="50" width="120" height="7" rx="3" fill="hsl(var(--muted-foreground) / 0.5)" />
      <rect x="20" y="66" width="100" height="7" rx="3" fill="hsl(var(--muted-foreground) / 0.5)" />
      <rect x="20" y="82" width="110" height="7" rx="3" fill="hsl(var(--muted-foreground) / 0.5)" />
      <rect x="180" y="110" width="22" height="60" rx="2" fill="hsl(var(--primary) / 0.45)" />
      <rect x="210" y="90" width="22" height="80" rx="2" fill="hsl(var(--primary) / 0.65)" />
      <rect x="240" y="70" width="22" height="100" rx="2" fill="hsl(var(--primary))" />
      <rect x="20" y="170" width="280" height="2" fill="hsl(var(--border))" />
    </svg>
  )
}

/**
 * A live `<video>` element fed by a canvas-drawn `MediaStream`. Under reduced
 * motion the stream carries a still frame.
 */
export function LiveDemoVideo({ hue = 210 }: { hue?: number }) {
  const videoRef = React.useRef<HTMLVideoElement>(null)

  React.useEffect(() => {
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 360
    const ctx = canvas.getContext('2d')
    if (!video || !ctx || typeof canvas.captureStream !== 'function') return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let raf = 0
    const draw = () => {
      const t = still ? 0 : frame / 60
      ctx.fillStyle = `hsl(${hue} 35% 30%)`
      ctx.fillRect(0, 0, 640, 360)
      ctx.fillStyle = `hsl(${hue} 20% 82%)`
      ctx.beginPath()
      ctx.arc(320 + Math.sin(t) * 24, 150, 60, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(320 + Math.sin(t) * 24, 380, 130, 150, 0, Math.PI, 0)
      ctx.fill()
      frame += 1
      if (!still) raf = requestAnimationFrame(draw)
    }
    draw()

    const stream = canvas.captureStream(30)
    video.srcObject = stream
    void video.play().catch(() => {
      // Autoplay of a muted inline video can still be refused (e.g. a
      // background tab); the element shows the first frame and resumes on focus.
    })

    return () => {
      cancelAnimationFrame(raf)
      stream.getTracks().forEach((track) => track.stop())
      video.srcObject = null
    }
  }, [hue])

  return <video ref={videoRef} muted playsInline autoPlay aria-hidden="true" />
}
