import * as React from 'react'
import { createComposer } from '@refraction-ui/composer'
import type { ComposerAPI, ComposerConfig, ComposerState } from '@refraction-ui/composer'

export interface UseComposerResult {
  /** Live core snapshot (re-renders on change). */
  state: ComposerState
  /** The underlying composer core, for imperative use (beginEdit, addAttachment, …). */
  api: ComposerAPI
}

interface ComposerCoreRef {
  api: ComposerAPI
  /** Cached snapshot — `getState()` builds a fresh object per call, which
   * `useSyncExternalStore` would treat as an endless change loop. */
  snapshot: ComposerState
}

/**
 * useComposer — binds the headless `createComposer` core to React via
 * `useSyncExternalStore`. The core is created once with the config of the
 * first render (the core reads `maxLength`/`maxAttachments`/`validator`/
 * `replyToMessageId`/draft fields lazily, so callers may mutate a stable
 * config object to keep those live). The core is destroyed on unmount and
 * lazily recreated if React StrictMode re-subscribes after that dev-only
 * unmount/remount cycle.
 *
 * @param init Optional one-time initializer invoked right after creation and
 *   before the first snapshot (e.g. to seed attachments SSR-deterministically).
 */
export function useComposer(
  config: ComposerConfig = {},
  init?: (api: ComposerAPI) => void,
): UseComposerResult {
  const configRef = React.useRef(config)
  const initRef = React.useRef(init)
  const coreRef = React.useRef<ComposerCoreRef | null>(null)

  const getCore = React.useCallback((): ComposerCoreRef => {
    if (coreRef.current === null) {
      const api = createComposer(configRef.current)
      initRef.current?.(api)
      coreRef.current = { api, snapshot: api.getState() }
    }
    return coreRef.current
  }, [])

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const core = getCore()
      return core.api.subscribe((next) => {
        core.snapshot = next
        onStoreChange()
      })
    },
    [getCore],
  )

  const getSnapshot = React.useCallback(() => getCore().snapshot, [getCore])

  const state = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  React.useEffect(
    () => () => {
      // Cancel core timers on unmount. Nulling the ref lets a StrictMode
      // remount (which re-runs `subscribe`) recreate a live core instead of
      // talking to a destroyed one.
      coreRef.current?.api.destroy()
      coreRef.current = null
    },
    [],
  )

  return { state, api: getCore().api }
}
