import type { LogLevel, TelemetryEnv } from './types.js'

/**
 * Behavior derived from {@link TelemetryConfig.env}. The manager reads these
 * fields to decide level filtering, batching, sampling, and flush triggers.
 */
export interface TelemetryPreset {
  /** Records strictly below this level are dropped. */
  minLevel: LogLevel
  /** Buffer records and deliver in batches instead of synchronously. */
  batch: boolean
  /** Batch size before an automatic flush (only when `batch`). */
  batchSize: number
  /** Default sample rate when config omits `sampleRate`. */
  sampleRate: number
  /** Pretty, single-line console output (vs. structured JSON). */
  pretty: boolean
  /**
   * Flush buffered records on `pagehide` + `visibilitychange` (hidden),
   * using `navigator.sendBeacon` when available.
   */
  beaconFlush: boolean
}

/**
 * - development: sync, pretty, level=debug, no batching, sample everything.
 * - production: batched + sampled, level>=warn, beacon flush on page exit.
 */
export const PRESETS: Record<TelemetryEnv, TelemetryPreset> = {
  development: {
    minLevel: 'debug',
    batch: false,
    batchSize: 1,
    sampleRate: 1,
    pretty: true,
    beaconFlush: false,
  },
  production: {
    minLevel: 'warn',
    batch: true,
    batchSize: 20,
    sampleRate: 0.25,
    pretty: false,
    beaconFlush: true,
  },
}

/** Resolve the preset for an env (defensive copy so callers can't mutate it). */
export function resolvePreset(env: TelemetryEnv): TelemetryPreset {
  return { ...PRESETS[env] }
}
