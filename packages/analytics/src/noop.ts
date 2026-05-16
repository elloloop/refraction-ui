import type { Analytics } from './types.js'

/**
 * The noop collector returned when `enabled: false`.
 *
 * Every method is an empty function so calls are free and the surrounding
 * vendor/sink code can be tree-shaken out of a production bundle when
 * analytics is compiled off. Kept in its own module so bundlers can drop the
 * live collector entirely on the `enabled:false` path.
 */
export function createNoopAnalytics(): Analytics {
  const sessionId = '00000000-0000-4000-8000-000000000000'
  const noop = (): void => {}

  const api: Analytics = {
    track: noop,
    identify: noop,
    page: noop,
    screen: noop,
    group: noop,
    alias: noop,
    session: {
      id: () => sessionId,
      start: () => sessionId,
      end: noop,
      set: noop,
    },
    consent: {
      grant: noop,
      revoke: noop,
      granted: () => [],
      isGranted: () => false,
    },
    anonymousId: () => sessionId,
    userId: () => undefined,
    with: () => api,
    addSink: noop,
    removeSink: noop,
    get sinks() {
      return []
    },
    flush: async () => {},
    reset: noop,
    enabled: false,
  }

  return api
}
