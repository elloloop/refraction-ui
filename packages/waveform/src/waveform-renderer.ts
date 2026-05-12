import {
  DEFAULT_WAVEFORM_COLOR,
  DEFAULT_WAVEFORM_INTENSITY,
  getWaveformPeak,
  normalizeBarCount,
  normalizeIntensity,
  resampleWaveformSamples,
  scaleWaveformSamples,
  type WaveformSampleInput,
  type WaveformVariant,
} from './waveform.js'

export interface WaveformCanvasSize {
  width: number
  height: number
  pixelRatio?: number
}

export interface WaveformRenderOptions {
  variant?: WaveformVariant
  color?: string
  intensity?: number
  barCount?: number
}

export function prepareWaveformCanvas(
  canvas: HTMLCanvasElement,
  size: WaveformCanvasSize,
): CanvasRenderingContext2D | null {
  const width = Math.max(1, Math.floor(size.width))
  const height = Math.max(1, Math.floor(size.height))
  const pixelRatio = Math.max(1, size.pixelRatio ?? 1)
  const pixelWidth = Math.floor(width * pixelRatio)
  const pixelHeight = Math.floor(height * pixelRatio)

  if (canvas.width !== pixelWidth) {
    canvas.width = pixelWidth
  }

  if (canvas.height !== pixelHeight) {
    canvas.height = pixelHeight
  }

  const context = canvas.getContext('2d')
  if (!context) return null

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

  return context
}

export function drawWaveform(
  context: CanvasRenderingContext2D,
  samples: WaveformSampleInput,
  size: WaveformCanvasSize,
  options: WaveformRenderOptions = {},
): void {
  const width = Math.max(1, Math.floor(size.width))
  const height = Math.max(1, Math.floor(size.height))
  const variant = options.variant ?? 'bars'
  const color = options.color ?? DEFAULT_WAVEFORM_COLOR
  const intensity = normalizeIntensity(options.intensity ?? DEFAULT_WAVEFORM_INTENSITY)
  const barCount = normalizeBarCount(options.barCount)

  context.clearRect(0, 0, width, height)
  applyCanvasColor(context, color)

  if (variant === 'line') {
    drawLine(context, samples, width, height, intensity)
    return
  }

  if (variant === 'rings') {
    drawRings(context, samples, width, height, intensity)
    return
  }

  drawBars(context, samples, width, height, intensity, barCount)
}

function drawBars(
  context: CanvasRenderingContext2D,
  samples: WaveformSampleInput,
  width: number,
  height: number,
  intensity: number,
  barCount: number,
) {
  const bars = scaleWaveformSamples(resampleWaveformSamples(samples, barCount), intensity)
  const slotWidth = width / bars.length
  const barWidth = Math.max(1, slotWidth * 0.64)
  const center = height / 2

  for (let i = 0; i < bars.length; i += 1) {
    const value = Math.abs(bars[i])
    const barHeight = Math.max(value * height, value > 0 ? 1 : 0)
    const x = i * slotWidth + (slotWidth - barWidth) / 2
    const y = center - barHeight / 2

    context.fillRect(x, y, barWidth, barHeight)
  }
}

function drawLine(
  context: CanvasRenderingContext2D,
  samples: WaveformSampleInput,
  width: number,
  height: number,
  intensity: number,
) {
  const lineSamples = scaleWaveformSamples(samples, intensity)
  const center = height / 2
  const amplitude = height * 0.45

  context.beginPath()

  for (let i = 0; i < lineSamples.length; i += 1) {
    const x = lineSamples.length <= 1 ? width / 2 : (i / (lineSamples.length - 1)) * width
    const y = center - Number(lineSamples[i]) * amplitude

    if (i === 0) {
      context.moveTo(x, y)
    } else {
      context.lineTo(x, y)
    }
  }

  context.lineWidth = Math.max(1.5, Math.min(width, height) * 0.025)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.stroke()
}

function drawRings(
  context: CanvasRenderingContext2D,
  samples: WaveformSampleInput,
  width: number,
  height: number,
  intensity: number,
) {
  const peak = getWaveformPeak(scaleWaveformSamples(samples, intensity))
  const minDimension = Math.min(width, height)
  const centerX = width / 2
  const centerY = height / 2
  const ringCount = 3
  const baseRadius = minDimension * 0.16
  const radiusStep = minDimension * 0.13

  context.save()
  context.lineWidth = Math.max(1.5, minDimension * 0.018)

  for (let i = 0; i < ringCount; i += 1) {
    const progress = (i + 1) / ringCount
    const pulse = peak * minDimension * 0.1 * progress
    const radius = baseRadius + radiusStep * i + pulse

    context.globalAlpha = 0.28 + progress * 0.34
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.stroke()
  }

  context.restore()
}

function applyCanvasColor(context: CanvasRenderingContext2D, color: string) {
  try {
    context.fillStyle = color
    context.strokeStyle = color
  } catch {
    context.fillStyle = '#000'
    context.strokeStyle = '#000'
  }
}
