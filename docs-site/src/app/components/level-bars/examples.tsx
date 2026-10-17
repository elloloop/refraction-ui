'use client'

import * as React from 'react'
import { LevelBars, LiveLevelBars, type LevelBarsColor } from '@refraction-ui/react-level-bars'
import { Button } from '@refraction-ui/react-button'

export type LevelBarsExampleSection = 'basic' | 'taper' | 'colors' | 'live' | 'microphone'

interface LevelBarsExamplesProps {
  section: LevelBarsExampleSection
}

/** A fixed snapshot so the static examples render the same every time. */
const SNAPSHOT = [0.18, 0.42, 0.66, 0.92, 0.74, 0.5, 0.86, 0.61, 0.35, 0.22, 0.48, 0.3]
const EVEN_ROW = Array.from({ length: 13 }, () => 1)
const COLORS: LevelBarsColor[] = ['primary', 'success', 'warning', 'destructive', 'muted']

/** How often the simulated input produces a new reading, in ms. */
const SIMULATED_INTERVAL_MS = 100
/** Phase steps of the two sines that make the simulated speech-like envelope. */
const SIMULATED_CARRIER_STEP = 0.9
const SIMULATED_ENVELOPE_STEP = 0.21

/** RMS of real speech sits well below 1; this lifts it into a readable range. */
const MICROPHONE_GAIN = 4

const panel = 'rounded-xl border border-border bg-card p-8'

export function LevelBarsExamples({ section }: LevelBarsExamplesProps) {
  if (section === 'basic') {
    return (
      <div className={panel}>
        <LevelBars levels={SNAPSHOT} />
      </div>
    )
  }

  if (section === 'taper') {
    return (
      <div className={`${panel} flex flex-wrap items-center gap-8`}>
        <LevelBars levels={EVEN_ROW} height={32} barWidth={4} gap={3} taper />
        <LevelBars levels={SNAPSHOT} height={32} barWidth={4} gap={3} taper />
      </div>
    )
  }

  if (section === 'colors') {
    return (
      <div className={`${panel} flex flex-wrap items-center gap-6`}>
        {COLORS.map((color) => (
          <span key={color} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <LevelBars levels={SNAPSHOT.slice(0, 6)} color={color} />
            {color}
          </span>
        ))}
      </div>
    )
  }

  if (section === 'live') return <SimulatedLiveExample />
  if (section === 'microphone') return <MicrophoneExample />
  return null
}

/** Deterministic, speech-like level for step `n` of the simulation. */
function simulatedLevel(step: number): number {
  const carrier = Math.abs(Math.sin(step * SIMULATED_CARRIER_STEP))
  const envelope = Math.abs(Math.sin(step * SIMULATED_ENVELOPE_STEP))
  return carrier * envelope
}

function SimulatedLiveExample() {
  const [step, setStep] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => setStep((s) => s + 1), SIMULATED_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  const level = simulatedLevel(step)

  return (
    <div className={`${panel} flex items-center gap-4`}>
      <LiveLevelBars level={level} bars={24} height={32} color="success" label="Simulated input level" />
      <span className="text-sm tabular-nums text-muted-foreground">{`${Math.round(level * 100)}%`}</span>
    </div>
  )
}

type MicrophoneState = 'idle' | 'listening' | 'unavailable'

/** Live microphone check: RMS of the analyser's time-domain samples, per frame. */
function MicrophoneExample() {
  const [state, setState] = React.useState<MicrophoneState>('idle')
  const [level, setLevel] = React.useState(0)
  const stopRef = React.useRef<(() => void) | null>(null)

  const stop = React.useCallback(() => {
    stopRef.current?.()
    stopRef.current = null
    setLevel(0)
    setState('idle')
  }, [])

  React.useEffect(() => () => stopRef.current?.(), [])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      context.createMediaStreamSource(stream).connect(analyser)
      const samples = new Float32Array(analyser.fftSize)
      let frame = 0

      const read = () => {
        analyser.getFloatTimeDomainData(samples)
        let sum = 0
        for (const sample of samples) sum += sample * sample
        setLevel(Math.sqrt(sum / samples.length) * MICROPHONE_GAIN)
        frame = requestAnimationFrame(read)
      }
      read()

      stopRef.current = () => {
        cancelAnimationFrame(frame)
        stream.getTracks().forEach((track) => track.stop())
        void context.close()
      }
      setState('listening')
    } catch {
      setState('unavailable')
    }
  }

  const listening = state === 'listening'

  return (
    <div className={`${panel} flex flex-wrap items-center gap-4`}>
      <Button variant={listening ? 'outline' : 'default'} onClick={listening ? stop : start}>
        {listening ? 'Stop check' : 'Check microphone'}
      </Button>
      <LiveLevelBars level={level} bars={20} height={28} label="Microphone level" />
      <span className="text-sm text-muted-foreground" aria-live="polite">
        {state === 'unavailable'
          ? 'Microphone unavailable or permission denied.'
          : listening
            ? 'Listening — speak to see the level move.'
            : 'Microphone off.'}
      </span>
    </div>
  )
}
