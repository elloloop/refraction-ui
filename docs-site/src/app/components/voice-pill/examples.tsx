'use client'

import { useEffect, useState } from 'react'
import { VoicePill } from '@refraction-ui/react'

interface VoicePillExamplesProps {
  section: 'basic'
}

export function VoicePillExamples({ section }: VoicePillExamplesProps) {
  const [intensity, setIntensity] = useState(0.65)
  const [muted, setMuted] = useState(false)
  const [speaker, setSpeaker] = useState<'ai' | 'user'>('ai')
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    if (!animate) return

    let frame = 0
    const startedAt = performance.now()

    const tick = (time: number) => {
      const elapsed = (time - startedAt) / 1000
      setIntensity(0.58 + Math.sin(elapsed * 2.4) * 0.28)
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frame)
  }, [animate])

  if (section !== 'basic') return null

  const label = speaker === 'ai' ? 'Alex' : 'You'
  const subtitle = muted ? 'Muted' : animate ? 'Listening...' : 'Previewing...'

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative min-h-80 overflow-hidden rounded-lg border border-border bg-background p-6">
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-primary/10 to-transparent" />
          <div className="relative max-w-md space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Live speaker state</span>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">
                {speaker === 'ai' ? 'Alex is responding' : 'User voice is active'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Current voice intensity is {Math.round(intensity * 100)}%.
              </p>
            </div>
          </div>

          <VoicePill
            speaker={speaker}
            label={label}
            sub={subtitle}
            intensity={intensity}
            muted={muted}
            onToggleMute={() => setMuted((value) => !value)}
            position="bottom-center"
            className="!absolute !bottom-6"
            style={{ position: 'absolute', bottom: '1.5rem' }}
          />
        </div>

        <div className="rounded-lg border border-border bg-background/90 p-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">Animate</span>
              <button
                type="button"
                onClick={() => setAnimate((value) => !value)}
                className={`relative h-6 w-11 rounded-full transition-colors ${animate ? 'bg-primary' : 'bg-muted'}`}
                aria-label="Toggle Voice Pill animation"
                aria-pressed={animate}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${animate ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-medium text-foreground">
                Intensity
                <span className="text-xs text-muted-foreground">{Math.round(intensity * 100)}%</span>
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
              <span className="text-sm font-medium text-foreground">Speaker</span>
              <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
                {(['ai', 'user'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSpeaker(value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      speaker === value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {value === 'ai' ? 'AI' : 'User'}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={muted}
                onChange={(event) => setMuted(event.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Muted
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
