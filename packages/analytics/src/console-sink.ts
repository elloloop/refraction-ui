import type { AnalyticsEvent, AnalyticsSink } from './types.js'

export interface ConsoleSinkOptions {
  /** Injected logger (defaults to globalThis.console). */
  logger?: Pick<Console, 'log' | 'groupCollapsed' | 'groupEnd'>
  /** Consent categories this sink requires. Default: none (always allowed). */
  consentCategories?: string[]
}

/**
 * Built-in `console` sink — the dev preset's default. Prints each canonical
 * envelope so engineers can see exactly what would ship over the wire.
 */
export function createConsoleSink(
  options: ConsoleSinkOptions = {},
): AnalyticsSink {
  const logger =
    options.logger ??
    (globalThis as unknown as { console: Console }).console

  return {
    name: 'console',
    consentCategories: options.consentCategories,
    deliver(batch: AnalyticsEvent[]): void {
      for (const ev of batch) {
        const label = `[analytics] ${ev.type}${ev.event ? ` ${ev.event}` : ''}`
        if (typeof logger.groupCollapsed === 'function') {
          logger.groupCollapsed(label)
          logger.log(ev)
          logger.groupEnd?.()
        } else {
          logger.log(label, ev)
        }
      }
    },
  }
}
