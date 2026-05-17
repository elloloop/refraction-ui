import * as React from 'react'
import {
  captureLibraryOriginError,
  type DevFeedbackRecord,
  type DevFeedbackSink,
  type LibraryOriginIdentity,
} from '@refraction-ui/shared'

/**
 * library-error-capture — the React capture seam for epic #247 / issue #249.
 *
 * Tags ONLY errors whose stack originates in a `@refraction-ui/*` package and
 * routes them to an optional, consumer-wired telemetry sink. The whole
 * filter → tag → route flow lives in `@refraction-ui/shared`'s
 * `captureLibraryOriginError`; this module is the thin React boundary around
 * it. App-origin errors are never captured, tagged, or forwarded to the
 * diagnostics sink — they pass straight through to the consumer's own error
 * handling, exactly as if this seam were not present.
 *
 * Zero hard dependency on the telemetry lib: the sink is the structural
 * `DevFeedbackSink` from shared (the real `@refraction-ui/logger`
 * `TelemetrySink` satisfies it). Nothing phones home unless a sink is wired.
 */

export interface LibraryErrorCaptureBoundaryProps {
  children: React.ReactNode
  /**
   * Fixed package/component identity tagged onto a captured library-origin
   * error. Carries NO app data — the fingerprint is derived from the stack.
   */
  identity: LibraryOriginIdentity
  /**
   * Optional, consumer-wired telemetry sink. Library-origin errors are
   * forwarded here when present; absent ⇒ no-op (nothing phones home).
   */
  sink?: DevFeedbackSink | null
  /**
   * Fallback UI rendered after ANY caught error (a boundary must render
   * something). May be a node or a render function receiving the error and a
   * reset callback. Defaults to re-rendering nothing (`null`).
   */
  fallback?:
    | React.ReactNode
    | ((error: Error, reset: () => void) => React.ReactNode)
  /**
   * Invoked for EVERY caught error (library- or app-origin), after capture is
   * attempted. `record` is the tagged diagnostics record for a library-origin
   * error, or `null` for an app-origin error (untouched — the app owns it).
   */
  onError?: (
    error: Error,
    info: React.ErrorInfo,
    record: DevFeedbackRecord | null,
  ) => void
}

interface LibraryErrorCaptureBoundaryState {
  error: Error | null
}

/**
 * LibraryErrorCaptureBoundary — a React error boundary whose ONLY telemetry
 * side effect is capturing refraction-ui-origin errors.
 *
 * ```tsx
 * <LibraryErrorCaptureBoundary
 *   identity={{ package: '@refraction-ui/react', componentName: 'Dialog',
 *               version: '0.1.5', framework: 'react' }}
 *   sink={mySink}
 * >
 *   <Dialog />
 * </LibraryErrorCaptureBoundary>
 * ```
 *
 * - A `@refraction-ui/*`-origin render error → tagged via shared's
 *   `libraryOriginError` and forwarded to `sink` (only if wired).
 * - An app-origin render error → NOT tagged, NOT forwarded; surfaced to
 *   `onError` with `record === null` and rendered via `fallback`, untouched.
 */
export class LibraryErrorCaptureBoundary extends React.Component<
  LibraryErrorCaptureBoundaryProps,
  LibraryErrorCaptureBoundaryState
> {
  state: LibraryErrorCaptureBoundaryState = { error: null }

  static getDerivedStateFromError(
    error: Error,
  ): LibraryErrorCaptureBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Filter + tag + route happens entirely in shared. Returns the tagged
    // record for a library-origin error, or null for an app-origin error
    // (which is left completely untouched — not forwarded anywhere).
    const record = captureLibraryOriginError(
      error,
      this.props.identity,
      this.props.sink,
    )
    this.props.onError?.(error, info, record)
  }

  reset = (): void => {
    this.setState({ error: null })
  }

  render(): React.ReactNode {
    const { error } = this.state
    if (error) {
      const { fallback } = this.props
      if (typeof fallback === 'function') {
        return fallback(error, this.reset)
      }
      return fallback ?? null
    }
    return this.props.children
  }
}

/**
 * captureReactLibraryError — the non-boundary React seam. Use from an
 * imperative handler (event handlers, effects, `window.onerror` bridges)
 * where an error boundary cannot reach. Same contract as the boundary:
 * library-origin only, optional sink, app-origin returns `null` untouched.
 */
export function captureReactLibraryError(
  error: unknown,
  identity: LibraryOriginIdentity,
  sink?: DevFeedbackSink | null,
): DevFeedbackRecord | null {
  return captureLibraryOriginError(error, identity, sink)
}
