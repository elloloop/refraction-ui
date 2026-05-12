import * as React from 'react'
import {
  createIntensitySamples,
  createWaveform,
  drawWaveform,
  isWaveformSampleInput,
  normalizeSmoothing,
  normalizeWaveformSamples,
  prepareWaveformCanvas,
  smoothWaveformSamples,
  toCssDimension,
  waveformCanvasVariants,
  waveformVariants,
  type WaveformProps as CoreWaveformProps,
  type WaveformSource,
} from '@refraction-ui/waveform'
import { cn } from '@refraction-ui/shared'

export interface WaveformProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'color' | 'height' | 'width'>,
    CoreWaveformProps {}

type AnimationFrame = ReturnType<typeof requestAnimationFrame>
type TimeoutFrame = ReturnType<typeof setTimeout>
type AudioContextConstructor = typeof AudioContext

interface WaveformSize {
  width: number
  height: number
}

export const Waveform = React.forwardRef<HTMLDivElement, WaveformProps>(
  (
    {
      source,
      samples,
      intensity,
      variant,
      height,
      width,
      barCount,
      smoothing,
      color,
      paused,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
    const previousSamplesRef = React.useRef<Float32Array | null>(null)
    const mediaAnalyserRef = React.useRef<AnalyserNode | null>(null)
    const floatBufferRef = React.useRef<Float32Array | null>(null)
    const byteBufferRef = React.useRef<Uint8Array | null>(null)
    const prefersReducedMotion = usePrefersReducedMotion()

    const api = createWaveform({
      source,
      samples,
      intensity,
      variant,
      height,
      width,
      barCount,
      smoothing,
      color,
      paused,
    })

    const rootStyle = React.useMemo(
      () => ({
        ...style,
        width: toCssDimension(width) ?? style?.width ?? '100%',
        height: toCssDimension(height) ?? style?.height ?? `${api.config.height}px`,
        '--waveform-color': api.config.color,
      }) as React.CSSProperties & { '--waveform-color': string },
      [api.config.color, api.config.height, height, style, width],
    )

    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node

        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    React.useEffect(() => {
      if (!isMediaStreamSource(source)) {
        mediaAnalyserRef.current = null
        return
      }

      if (typeof window === 'undefined') return

      const AudioContextClass =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext

      if (!AudioContextClass) return

      const audioContext = new AudioContextClass()
      const analyser = audioContext.createAnalyser()
      const streamSource = audioContext.createMediaStreamSource(source)

      analyser.smoothingTimeConstant = normalizeSmoothing(api.config.smoothing)
      streamSource.connect(analyser)
      mediaAnalyserRef.current = analyser

      return () => {
        mediaAnalyserRef.current = null
        streamSource.disconnect()
        analyser.disconnect()

        if (audioContext.state !== 'closed') {
          void audioContext.close()
        }
      }
    }, [api.config.smoothing, source])

    React.useEffect(() => {
      if (isAnalyserSource(source)) {
        source.smoothingTimeConstant = normalizeSmoothing(api.config.smoothing)
      }
    }, [api.config.smoothing, source])

    React.useEffect(() => {
      const root = rootRef.current
      const canvas = canvasRef.current

      if (!root || !canvas) return

      let size = measureWaveform(root, api.config.width, api.config.height)
      let frame: AnimationFrame | TimeoutFrame | null = null
      let disposed = false

      const cancelFrame = () => {
        if (frame == null) return

        if (typeof window.requestAnimationFrame === 'function') {
          window.cancelAnimationFrame(frame as AnimationFrame)
        } else {
          clearTimeout(frame as TimeoutFrame)
        }

        frame = null
      }

      const readSamples = (): Float32Array => {
        if (samples != null) {
          return normalizeWaveformSamples(samples, api.config.barCount)
        }

        if (isWaveformSampleInput(source)) {
          return normalizeWaveformSamples(source, api.config.barCount)
        }

        const analyser = isAnalyserSource(source) ? source : mediaAnalyserRef.current
        if (analyser) {
          return readAnalyserSamples(analyser, api.config.barCount, floatBufferRef, byteBufferRef)
        }

        return createIntensitySamples(api.config.intensity, api.config.barCount)
      }

      const draw = () => {
        const context = prepareWaveformCanvas(canvas, {
          ...size,
          pixelRatio: window.devicePixelRatio || 1,
        })

        if (!context) return

        const nextSamples = readSamples()
        const renderedSamples = smoothWaveformSamples(
          previousSamplesRef.current ?? undefined,
          nextSamples,
          api.config.smoothing,
        )

        previousSamplesRef.current = renderedSamples

        drawWaveform(context, renderedSamples, size, {
          variant: api.config.variant,
          color: resolveCanvasColor(root, api.config.color),
          intensity: api.config.intensity,
          barCount: api.config.barCount,
        })
      }

      const schedule = () => {
        if (disposed || api.config.paused || prefersReducedMotion) return

        if (typeof window.requestAnimationFrame === 'function') {
          frame = window.requestAnimationFrame(tick)
        } else {
          frame = window.setTimeout(() => tick(), 16)
        }
      }

      const tick = () => {
        draw()
        schedule()
      }

      draw()
      schedule()

      const observer =
        typeof ResizeObserver === 'function'
          ? new ResizeObserver(() => {
              size = measureWaveform(root, api.config.width, api.config.height)
              draw()
            })
          : null

      observer?.observe(root)

      return () => {
        disposed = true
        cancelFrame()
        observer?.disconnect()
      }
    }, [
      api.config.barCount,
      api.config.color,
      api.config.height,
      api.config.intensity,
      api.config.paused,
      api.config.smoothing,
      api.config.variant,
      api.config.width,
      prefersReducedMotion,
      samples,
      source,
    ])

    return (
      <div
        ref={setRootRef}
        className={cn(waveformVariants({ variant: api.config.variant }), className)}
        style={rootStyle}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        <canvas
          ref={canvasRef}
          className={waveformCanvasVariants()}
          aria-hidden="true"
          data-waveform-canvas=""
        />
      </div>
    )
  },
)

Waveform.displayName = 'Waveform'

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(media.matches)

    update()
    media.addEventListener?.('change', update)

    return () => {
      media.removeEventListener?.('change', update)
    }
  }, [])

  return prefersReducedMotion
}

function readAnalyserSamples(
  analyser: AnalyserNode,
  barCount: number,
  floatBufferRef: React.MutableRefObject<Float32Array | null>,
  byteBufferRef: React.MutableRefObject<Uint8Array | null>,
): Float32Array {
  if (typeof analyser.getFloatTimeDomainData === 'function') {
    const length = Math.max(1, analyser.fftSize || analyser.frequencyBinCount || barCount)

    if (floatBufferRef.current?.length !== length) {
      floatBufferRef.current = new Float32Array(length)
    }

    analyser.getFloatTimeDomainData(floatBufferRef.current)
    return normalizeWaveformSamples(floatBufferRef.current, barCount)
  }

  const length = Math.max(1, analyser.frequencyBinCount || barCount)

  if (byteBufferRef.current?.length !== length) {
    byteBufferRef.current = new Uint8Array(length)
  }

  analyser.getByteFrequencyData(byteBufferRef.current)
  return normalizeWaveformSamples(Array.from(byteBufferRef.current), barCount)
}

function measureWaveform(
  element: HTMLElement,
  width: number | string,
  height: number | string,
): WaveformSize {
  const rect = element.getBoundingClientRect()
  const fallbackWidth = typeof width === 'number' ? width : 300
  const fallbackHeight = typeof height === 'number' ? height : 80

  return {
    width: Math.max(1, Math.round(rect.width || element.clientWidth || fallbackWidth)),
    height: Math.max(1, Math.round(rect.height || element.clientHeight || fallbackHeight)),
  }
}

function resolveCanvasColor(element: HTMLElement, color: string): string {
  const variableMatch = color.match(/^var\((--[^),\s]+)(?:,[^)]+)?\)$/)

  if (!variableMatch || typeof window.getComputedStyle !== 'function') {
    return color
  }

  const value = window.getComputedStyle(element).getPropertyValue(variableMatch[1]).trim()

  return value || color
}

function isAnalyserSource(value: WaveformSource | undefined): value is AnalyserNode {
  return (
    value != null &&
    typeof (value as AnalyserNode).frequencyBinCount === 'number' &&
    (
      typeof (value as AnalyserNode).getFloatTimeDomainData === 'function' ||
      typeof (value as AnalyserNode).getByteFrequencyData === 'function'
    )
  )
}

function isMediaStreamSource(value: WaveformSource | undefined): value is MediaStream {
  return value != null && typeof (value as MediaStream).getTracks === 'function'
}
