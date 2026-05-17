/**
 * library-origin-error — builds the **library-origin error envelope** for
 * errors that originate inside a `@refraction-ui/*` package.
 *
 * The envelope is expressed THROUGH the existing telemetry record contract
 * (`@refraction-ui/logger`'s `LogRecord`) — the contract is reused, NOT
 * redefined. To keep `@refraction-ui/shared` zero-dependency, the record is
 * mirrored structurally (see {@link DevFeedbackRecord}) rather than imported;
 * a consumer wiring the real logger sink satisfies it structurally.
 *
 * Aggressive redaction (epic #247 guardrails): the payload is package,
 * componentName, version, a normalized stack **fingerprint hash**, and
 * framework only. Never app state, props values, user data, PII, or full app
 * stack frames.
 */

import type { DevFeedbackRecord, DevFeedbackSink } from './dev-feedback.js'

/** Matches any stack frame that references a `@refraction-ui/*` package. */
const REFRACTION_FRAME = /@refraction-ui\//

/** Frameworks a refraction-ui adapter can run under. */
export type LibraryFramework =
  | 'react'
  | 'angular'
  | 'astro'
  | 'vue'
  | 'svelte'
  | 'vanilla'
  | 'unknown'

/** Inputs describing where a library-origin error came from. */
export interface LibraryOriginErrorInput {
  /** Originating package, e.g. `@refraction-ui/react`. */
  package: string
  /** refraction-ui component the error originated in, e.g. `Dialog`. */
  componentName: string
  /** Originating package version, e.g. `0.1.5`. */
  version: string
  /** Host framework the component was running under. */
  framework: LibraryFramework
  /** The thrown error (or its stack string). Used ONLY to derive a hash. */
  error?: unknown
}

/**
 * The redacted, library-origin payload carried in `LogRecord.context`. Contains
 * NO app data — only the five identifying fields plus a stack fingerprint hash.
 */
export interface LibraryOriginEnvelope {
  /** Marks this record as a library-origin error (for downstream routing). */
  origin: 'refraction-ui'
  package: string
  componentName: string
  version: string
  framework: LibraryFramework
  /** Stable, app-data-free hash of the normalized stack. */
  fingerprint: string
}

/**
 * Normalize a stack trace into a deterministic, app-data-free string before
 * hashing:
 * - keep only frames that reference a `@refraction-ui/*` package (drop the
 *   app's own frames — library-origin only),
 * - strip absolute paths, line/column numbers, query strings, and hashes,
 * - sort-free (preserve call order) but whitespace-collapsed.
 *
 * If no refraction-ui frames are present the function returns an empty string,
 * which yields a stable "no-frames" fingerprint rather than leaking app frames.
 */
function normalizeStack(stack: string): string {
  const frames = stack
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('at ') || line.includes('@'))
    .filter((line) => REFRACTION_FRAME.test(line))
    .map((line) =>
      line
        // drop everything from the path/url onward, keep the symbol
        .replace(/\((?:.*?)(@refraction-ui\/[^):]+)[^)]*\)/, '($1)')
        .replace(/(@refraction-ui\/[^\s:?#]+)[^\s)]*/g, '$1')
        // strip :line:col
        .replace(/:\d+:\d+/g, '')
        // strip line:col without colon prefix
        .replace(/:\d+\b/g, '')
        // strip query/hash
        .replace(/[?#][^\s)]*/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )

  return frames.join('\n')
}

/**
 * Deterministic, dependency-free 53-bit string hash (cyrb53). Stable across
 * runs and processes for the same input — required so the intake can dedupe by
 * fingerprint. NOT cryptographic; it only needs to be collision-resistant
 * enough to group identical normalized stacks.
 */
function cyrb53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const out = 4294967296 * (2097151 & h2) + (h1 >>> 0)
  return out.toString(16).padStart(14, '0')
}

function stackOf(error: unknown): string {
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'stack' in error &&
    typeof (error as { stack?: unknown }).stack === 'string'
  ) {
    return (error as { stack: string }).stack
  }
  return ''
}

/**
 * Compute the stable stack fingerprint for a library-origin error. Exposed
 * separately so capture seams / tests can assert fingerprint stability without
 * building the whole record.
 */
export function stackFingerprint(error: unknown): string {
  const normalized = normalizeStack(stackOf(error))
  return cyrb53(normalized)
}

/**
 * Build the redacted library-origin envelope for an error.
 */
export function libraryOriginEnvelope(
  input: LibraryOriginErrorInput,
): LibraryOriginEnvelope {
  return {
    origin: 'refraction-ui',
    package: input.package,
    componentName: input.componentName,
    version: input.version,
    framework: input.framework,
    fingerprint: stackFingerprint(input.error),
  }
}

/**
 * Build the full library-origin error record, expressed THROUGH the existing
 * telemetry record contract (`LogRecord`, mirrored as {@link DevFeedbackRecord}
 * to avoid a hard logger dependency). The redacted envelope rides in
 * `context`; no app data, props, PII, or app stack frames are included.
 *
 * This record is exactly what a consumer-wired telemetry sink (or the
 * `devWarn`/`devError` injected sink) consumes.
 */
export function libraryOriginError(
  input: LibraryOriginErrorInput,
): DevFeedbackRecord {
  const envelope = libraryOriginEnvelope(input)
  return {
    level: 'error',
    message: `${input.package}/${input.componentName}: library-origin error`,
    timestamp: Date.now(),
    context: { ...envelope },
  }
}

/**
 * Library-origin predicate — `true` iff the error's stack contains at least
 * one frame that references a `@refraction-ui/*` package. This is the gate
 * every per-framework capture seam uses: only library-origin errors are
 * eligible; the app's own errors return `false` and pass through untouched.
 *
 * Mirrors exactly the frame-detection rule {@link stackFingerprint} normalizes
 * by — no new contract, just the companion predicate the seams need. Never
 * throws for a missing/odd error (returns `false`).
 */
export function isLibraryOriginError(error: unknown): boolean {
  const stack = stackOf(error)
  if (!stack) return false
  return REFRACTION_FRAME.test(stack)
}

/**
 * The fixed identity of the refraction-ui package/component a seam tags an
 * error with. The seam supplies this; the stack itself supplies the
 * fingerprint. Never carries app data.
 */
export type LibraryOriginIdentity = Pick<
  LibraryOriginErrorInput,
  'package' | 'componentName' | 'version' | 'framework'
>

/**
 * The single capture primitive shared by every per-framework seam (React error
 * boundary, Angular `ErrorHandler`, Astro middleware). It performs the entire
 * guarded flow in one place so the seams stay thin and identical in behavior:
 *
 *  1. **Library-origin filter** — if the error's stack has no
 *     `@refraction-ui/*` frame it is the app's own error: return `null` and do
 *     NOT touch, capture, or forward it.
 *  2. **Tag** — build the redacted {@link libraryOriginError} record
 *     (package/componentName/version/framework + app-data-free fingerprint).
 *  3. **Route to the optional sink** — forward the record to the
 *     consumer-injected sink ONLY if one was wired; a broken sink can never
 *     break the consumer app. With no sink this is a no-op beyond returning
 *     the record (so a seam can still surface it locally).
 *
 * @returns the tagged record for a library-origin error, or `null` when the
 *          error is app-origin (the "pass through untouched" signal).
 */
export function captureLibraryOriginError(
  error: unknown,
  identity: LibraryOriginIdentity,
  sink: DevFeedbackSink | null | undefined,
): DevFeedbackRecord | null {
  if (!isLibraryOriginError(error)) return null

  const record = libraryOriginError({ ...identity, error })

  if (sink) {
    try {
      sink.log(record)
    } catch {
      // A broken sink must never break the consumer app.
    }
  }

  return record
}
