import type { AccessibilityProps } from '@refraction-ui/shared'

export type WaveformVariant = 'bars' | 'line' | 'rings'
export type WaveformSampleInput = Float32Array | number[]
export type WaveformSource = AnalyserNode | MediaStream | WaveformSampleInput

export interface WaveformProps {
  source?: WaveformSource
  samples?: WaveformSampleInput
  intensity?: number
  variant?: WaveformVariant
  height?: number | string
  width?: number | string
  barCount?: number
  smoothing?: number
  color?: string
  paused?: boolean
}

export interface NormalizedWaveformConfig {
  variant: WaveformVariant
  intensity: number
  height: number | string
  width: number | string
  barCount: number
  smoothing: number
  color: string
  paused: boolean
}

export interface WaveformAPI {
  config: NormalizedWaveformConfig
  samples: Float32Array
  ariaProps: Partial<AccessibilityProps>
  dataAttributes: Record<'data-variant' | 'data-paused', string>
  getSamples: (barCount?: number) => Float32Array
}

export const DEFAULT_WAVEFORM_BAR_COUNT = 48
export const DEFAULT_WAVEFORM_COLOR = 'var(--accent-2)'
export const DEFAULT_WAVEFORM_HEIGHT = 80
export const DEFAULT_WAVEFORM_INTENSITY = 1
export const DEFAULT_WAVEFORM_SMOOTHING = 0.8

const MAX_BAR_COUNT = 1024
const MAX_INTENSITY = 1

export function normalizeBarCount(value: number | undefined): number {
  if (value == null || !Number.isFinite(value)) return DEFAULT_WAVEFORM_BAR_COUNT

  return Math.min(MAX_BAR_COUNT, Math.max(1, Math.round(value)))
}

export function normalizeSmoothing(value: number | undefined): number {
  if (value == null || !Number.isFinite(value)) return DEFAULT_WAVEFORM_SMOOTHING

  return Math.min(0.99, Math.max(0, value))
}

export function normalizeIntensity(value: number | undefined): number {
  if (value == null || !Number.isFinite(value)) return DEFAULT_WAVEFORM_INTENSITY

  return Math.min(MAX_INTENSITY, Math.max(0, value))
}

export function normalizeWaveformConfig(props: WaveformProps = {}): NormalizedWaveformConfig {
  return {
    variant: props.variant ?? 'bars',
    intensity: normalizeIntensity(props.intensity),
    height: props.height ?? DEFAULT_WAVEFORM_HEIGHT,
    width: props.width ?? '100%',
    barCount: normalizeBarCount(props.barCount),
    smoothing: normalizeSmoothing(props.smoothing),
    color: props.color ?? DEFAULT_WAVEFORM_COLOR,
    paused: props.paused ?? false,
  }
}

export function isWaveformSampleInput(value: unknown): value is WaveformSampleInput {
  return value instanceof Float32Array || Array.isArray(value)
}

export function createSilentSamples(count = DEFAULT_WAVEFORM_BAR_COUNT): Float32Array {
  return new Float32Array(normalizeBarCount(count))
}

export function createIntensitySamples(
  intensity = DEFAULT_WAVEFORM_INTENSITY,
  count = DEFAULT_WAVEFORM_BAR_COUNT,
): Float32Array {
  const normalizedIntensity = normalizeIntensity(intensity)
  const normalizedCount = normalizeBarCount(count)
  const samples = new Float32Array(normalizedCount)

  if (normalizedIntensity === 0) return samples

  for (let i = 0; i < normalizedCount; i += 1) {
    const progress = normalizedCount <= 1 ? 0.5 : i / (normalizedCount - 1)
    const envelope = 0.35 + Math.sin(progress * Math.PI) * 0.65
    const carrier = Math.sin(progress * Math.PI * 6)
    samples[i] = carrier * envelope * normalizedIntensity
  }

  return samples
}

export function normalizeWaveformSamples(
  input: WaveformSampleInput | undefined,
  targetCount?: number,
): Float32Array {
  const sourceLength = input?.length ?? 0

  if (sourceLength === 0) {
    return targetCount == null ? new Float32Array() : createSilentSamples(targetCount)
  }

  const normalized = new Float32Array(sourceLength)
  let maxAbs = 0

  for (let i = 0; i < sourceLength; i += 1) {
    const value = Number(input?.[i])
    const sample = Number.isFinite(value) ? value : 0
    normalized[i] = sample
    maxAbs = Math.max(maxAbs, Math.abs(sample))
  }

  const divisor = maxAbs > 1 ? maxAbs : 1

  for (let i = 0; i < normalized.length; i += 1) {
    normalized[i] = clamp(normalized[i] / divisor, -1, 1)
  }

  if (targetCount == null || targetCount === normalized.length) {
    return normalized
  }

  return resampleWaveformSamples(normalized, targetCount)
}

export function resampleWaveformSamples(
  samples: WaveformSampleInput,
  targetCount: number,
): Float32Array {
  const count = normalizeBarCount(targetCount)
  const sourceLength = samples.length

  if (sourceLength === 0) return createSilentSamples(count)
  if (sourceLength === count) return Float32Array.from(samples)

  const output = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    const start = (i * sourceLength) / count
    const end = ((i + 1) * sourceLength) / count
    const firstIndex = Math.floor(start)
    const lastIndex = Math.max(firstIndex + 1, Math.ceil(end))
    let total = 0
    let values = 0

    for (let j = firstIndex; j < lastIndex && j < sourceLength; j += 1) {
      total += Number(samples[j])
      values += 1
    }

    output[i] = values > 0 ? total / values : Number(samples[Math.min(firstIndex, sourceLength - 1)])
  }

  return output
}

export function smoothWaveformSamples(
  previous: WaveformSampleInput | undefined,
  next: WaveformSampleInput,
  smoothing = DEFAULT_WAVEFORM_SMOOTHING,
): Float32Array {
  if (previous == null || previous.length === 0) {
    return Float32Array.from(next)
  }

  const amount = normalizeSmoothing(smoothing)
  const output = new Float32Array(next.length)

  for (let i = 0; i < next.length; i += 1) {
    const previousValue = Number(previous[i] ?? next[i])
    output[i] = previousValue * amount + Number(next[i]) * (1 - amount)
  }

  return output
}

export function scaleWaveformSamples(
  samples: WaveformSampleInput,
  intensity = DEFAULT_WAVEFORM_INTENSITY,
): Float32Array {
  const amount = normalizeIntensity(intensity)
  const output = new Float32Array(samples.length)

  for (let i = 0; i < samples.length; i += 1) {
    output[i] = clamp(Number(samples[i]) * amount, -1, 1)
  }

  return output
}

export function getWaveformPeak(samples: WaveformSampleInput): number {
  let peak = 0

  for (let i = 0; i < samples.length; i += 1) {
    peak = Math.max(peak, Math.abs(Number(samples[i]) || 0))
  }

  return Math.min(1, peak)
}

export function toCssDimension(value: number | string | undefined): string | undefined {
  if (value == null) return undefined

  return typeof value === 'number' ? `${value}px` : value
}

export function createWaveform(props: WaveformProps = {}): WaveformAPI {
  const config = normalizeWaveformConfig(props)
  const inputSamples = props.samples ?? (isWaveformSampleInput(props.source) ? props.source : undefined)
  const samples = inputSamples == null
    ? createIntensitySamples(config.intensity, config.barCount)
    : normalizeWaveformSamples(inputSamples, config.barCount)

  return {
    config,
    samples,
    ariaProps: {
      role: 'img',
      'aria-label': 'Audio waveform',
    },
    dataAttributes: {
      'data-variant': config.variant,
      'data-paused': String(config.paused),
    },
    getSamples(barCount = config.barCount) {
      return inputSamples == null
        ? createIntensitySamples(config.intensity, barCount)
        : normalizeWaveformSamples(inputSamples, barCount)
    },
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
