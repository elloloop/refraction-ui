'use client'

import { useEffect, useMemo, useState } from 'react'
import { Waveform } from '@refraction-ui/react'

interface WaveformExamplesProps {
  section: 'basic'
}

export function WaveformExamples({ section }: WaveformExamplesProps) {
  const [intensity, setIntensity] = useState(0.55)
  const [phase, setPhase] = useState(0)
  const [barCount, setBarCount] = useState(48)
  const [smoothing, setSmoothing] = useState(0.82)
  const [height, setHeight] = useState(56)
  const [color, setColor] = useState('var(--primary)')
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    if (!animate) return

    let frame = 0
    const startedAt = performance.now()

    const tick = (time: number) => {
      const elapsed = (time - startedAt) / 1000
      setPhase(elapsed)
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frame)
  }, [animate])

  const visualIntensity = animate
    ? 0.56 + Math.sin(phase * 2.2) * 0.28
    : intensity

  const samples = useMemo(
    () => Array.from({ length: 96 }, (_, index) => {
      const progress = index / 95
      const envelope = 0.45 + Math.sin(progress * Math.PI) * 0.55
      const carrier = Math.sin(index / 4.8 + phase * 3.8)

      return carrier * envelope * visualIntensity
    }),
    [phase, visualIntensity],
  )

  if (section !== 'basic') return null

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex h-40 flex-col gap-3 rounded-lg border border-border bg-background p-4">
          <span className="shrink-0 text-xs font-medium text-muted-foreground">Bars</span>
          <div className="flex h-24 items-center">
            <Waveform
              intensity={visualIntensity}
              height={height}
              variant="bars"
              barCount={barCount}
              smoothing={smoothing}
              color={color}
            />
          </div>
        </div>
        <div className="flex h-40 flex-col gap-3 rounded-lg border border-border bg-background p-4">
          <span className="shrink-0 text-xs font-medium text-muted-foreground">Line</span>
          <div className="flex h-24 items-center">
            <Waveform
              samples={samples}
              intensity={visualIntensity}
              height={height}
              variant="line"
              barCount={barCount}
              smoothing={smoothing}
              color={color}
            />
          </div>
        </div>
        <div className="flex h-40 flex-col gap-3 rounded-lg border border-border bg-background p-4">
          <span className="shrink-0 text-xs font-medium text-muted-foreground">Rings</span>
          <div className="flex h-24 items-center">
            <Waveform
              intensity={visualIntensity}
              height={height}
              variant="rings"
              barCount={barCount}
              smoothing={smoothing}
              color={color}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border border-border bg-background/90 p-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center justify-between gap-3 md:col-span-2 lg:col-span-1">
          <span className="text-sm font-medium text-foreground">Animate</span>
          <button
            type="button"
            onClick={() => setAnimate((value) => !value)}
            className={`relative h-6 w-11 rounded-full transition-colors ${animate ? 'bg-primary' : 'bg-muted'}`}
            aria-label="Toggle waveform animation"
            aria-pressed={animate}
          >
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${animate ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium text-foreground">
            Intensity
            <span className="text-xs text-muted-foreground">{Math.round(visualIntensity * 100)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={intensity}
            disabled={animate}
            onChange={(event) => setIntensity(Number(event.target.value))}
            className="w-full accent-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium text-foreground">
            Bar count
            <span className="text-xs text-muted-foreground">{barCount}</span>
          </label>
          <input
            type="range"
            min="12"
            max="96"
            step="4"
            value={barCount}
            onChange={(event) => setBarCount(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium text-foreground">
            Smoothing
            <span className="text-xs text-muted-foreground">{smoothing.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.01"
            value={smoothing}
            onChange={(event) => setSmoothing(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium text-foreground">
            Wave height
            <span className="text-xs text-muted-foreground">{height}px</span>
          </label>
          <input
            type="range"
            min="32"
            max="96"
            step="4"
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <span className="text-sm font-medium text-foreground">Color</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Primary', value: 'var(--primary)' },
              { label: 'Accent', value: 'var(--accent-foreground)' },
              { label: 'Muted', value: 'var(--muted-foreground)' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  color === option.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
