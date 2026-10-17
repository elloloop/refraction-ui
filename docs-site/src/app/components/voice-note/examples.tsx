'use client'

import * as React from 'react'
import { VoiceNote } from '@refraction-ui/react-voice-note'

export type VoiceNoteExampleSection = 'basic' | 'speed' | 'labels' | 'error'

interface VoiceNoteExamplesProps {
  section: VoiceNoteExampleSection
}

/*
 * The docs ship no audio files, so the demo synthesises a short "voice-like"
 * clip in the browser: a tone shaped into syllables, encoded as 16-bit PCM
 * WAV. Its peaks are measured from the same samples, the way an app would
 * pre-compute them on upload.
 */
const DEMO_SAMPLE_RATE = 8000
const DEMO_SECONDS = 12
const DEMO_TONE_HZ = 220
const DEMO_SYLLABLES_PER_SECOND = 3.2
const DEMO_PHRASE_SECONDS = 2.5
const DEMO_GAIN = 0.6
const DEMO_PEAK_COUNT = 64
const WAV_HEADER_BYTES = 44
const PCM_BYTES_PER_SAMPLE = 2
const PCM_MAX = 0x7fff

/** Deterministic syllable envelope: bursts with pauses between phrases. */
function envelope(t: number): number {
  const syllable = Math.abs(Math.sin(Math.PI * DEMO_SYLLABLES_PER_SECOND * t))
  const phrase = Math.max(0, Math.sin((Math.PI * t) / DEMO_PHRASE_SECONDS))
  return syllable * phrase
}

function synthesise(seconds: number): Float32Array {
  const samples = new Float32Array(Math.round(seconds * DEMO_SAMPLE_RATE))
  for (let i = 0; i < samples.length; i += 1) {
    const t = i / DEMO_SAMPLE_RATE
    samples[i] = Math.sin(2 * Math.PI * DEMO_TONE_HZ * t) * envelope(t) * DEMO_GAIN
  }
  return samples
}

function measurePeaks(samples: Float32Array, count: number): number[] {
  const window = Math.floor(samples.length / count)
  return Array.from({ length: count }, (_, bar) => {
    let peak = 0
    for (let i = bar * window; i < (bar + 1) * window; i += 1) peak = Math.max(peak, Math.abs(samples[i]))
    return peak
  })
}

function encodeWav(samples: Float32Array): Blob {
  const dataBytes = samples.length * PCM_BYTES_PER_SAMPLE
  const view = new DataView(new ArrayBuffer(WAV_HEADER_BYTES + dataBytes))
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i))
  }
  writeText(0, 'RIFF')
  view.setUint32(4, WAV_HEADER_BYTES - 8 + dataBytes, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, DEMO_SAMPLE_RATE, true)
  view.setUint32(28, DEMO_SAMPLE_RATE * PCM_BYTES_PER_SAMPLE, true)
  view.setUint16(32, PCM_BYTES_PER_SAMPLE, true)
  view.setUint16(34, PCM_BYTES_PER_SAMPLE * 8, true)
  writeText(36, 'data')
  view.setUint32(40, dataBytes, true)
  samples.forEach((sample, i) => {
    view.setInt16(WAV_HEADER_BYTES + i * PCM_BYTES_PER_SAMPLE, Math.round(sample * PCM_MAX), true)
  })
  return new Blob([view], { type: 'audio/wav' })
}

interface DemoClip {
  src: string
  peaks: number[]
}

/** Build the clip after mount (Blob URLs are browser-only) and revoke it on unmount. */
function useDemoClip(): DemoClip | null {
  const [clip, setClip] = React.useState<DemoClip | null>(null)
  React.useEffect(() => {
    const samples = synthesise(DEMO_SECONDS)
    const src = URL.createObjectURL(encodeWav(samples))
    setClip({ src, peaks: measurePeaks(samples, DEMO_PEAK_COUNT) })
    return () => URL.revokeObjectURL(src)
  }, [])
  return clip
}

/** Not decodable as audio, so the browser reports a media error. */
const BROKEN_SRC = 'data:audio/ogg;base64,AAAA'
const BROKEN_PEAKS = [0.2, 0.5, 0.9, 0.6, 0.3, 0.7, 0.4, 0.8, 0.5, 0.2]

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">{children}</div>
}

function Basic() {
  const clip = useDemoClip()
  return (
    <Frame>
      <div className="min-h-16">
        {clip && <VoiceNote src={clip.src} peaks={clip.peaks} duration={DEMO_SECONDS} />}
      </div>
    </Frame>
  )
}

function ControlledSpeed() {
  const clip = useDemoClip()
  const [rate, setRate] = React.useState(1.5)
  return (
    <Frame>
      <div className="min-h-16">
        {clip && (
          <VoiceNote
            src={clip.src}
            peaks={clip.peaks}
            duration={DEMO_SECONDS}
            playbackRate={rate}
            onPlaybackRateChange={setRate}
          />
        )}
      </div>
      <p className="text-sm text-muted-foreground">Speed held by the parent: {`${rate}×`}</p>
    </Frame>
  )
}

function Labels() {
  const clip = useDemoClip()
  return (
    <Frame>
      <div className="min-h-16">
        {clip && (
          <VoiceNote
            src={clip.src}
            peaks={clip.peaks}
            duration={DEMO_SECONDS}
            aria-label="Sprachnachricht von Ana"
            labels={{
              play: 'Abspielen',
              pause: 'Pause',
              seek: 'Position',
              playbackRate: 'Wiedergabegeschwindigkeit',
              loading: 'Wird geladen…',
              error: 'Diese Sprachnachricht kann nicht abgespielt werden',
            }}
            getAriaValueText={(now, total) => `${Math.floor(now)} von ${Math.floor(total)} Sekunden`}
          />
        )}
      </div>
    </Frame>
  )
}

function ErrorState() {
  return (
    <Frame>
      <VoiceNote src={BROKEN_SRC} peaks={BROKEN_PEAKS} duration={8} />
    </Frame>
  )
}

export function VoiceNoteExamples({ section }: VoiceNoteExamplesProps) {
  switch (section) {
    case 'basic':
      return <Basic />
    case 'speed':
      return <ControlledSpeed />
    case 'labels':
      return <Labels />
    case 'error':
      return <ErrorState />
    default:
      return null
  }
}
