export {
  DEFAULT_WAVEFORM_BAR_COUNT,
  DEFAULT_WAVEFORM_COLOR,
  DEFAULT_WAVEFORM_HEIGHT,
  DEFAULT_WAVEFORM_INTENSITY,
  DEFAULT_WAVEFORM_SMOOTHING,
  createSilentSamples,
  createIntensitySamples,
  createWaveform,
  getWaveformPeak,
  isWaveformSampleInput,
  normalizeBarCount,
  normalizeIntensity,
  normalizeSmoothing,
  normalizeWaveformConfig,
  normalizeWaveformSamples,
  resampleWaveformSamples,
  scaleWaveformSamples,
  smoothWaveformSamples,
  toCssDimension,
  type NormalizedWaveformConfig,
  type WaveformAPI,
  type WaveformProps,
  type WaveformSampleInput,
  type WaveformSource,
  type WaveformVariant,
} from './waveform.js'

export {
  drawWaveform,
  prepareWaveformCanvas,
  type WaveformCanvasSize,
  type WaveformRenderOptions,
} from './waveform-renderer.js'

export {
  waveformCanvasVariants,
  waveformVariants,
} from './waveform.styles.js'
