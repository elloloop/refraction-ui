import * as React from 'react'
import {
  SANDBOX_FRAME_DEFAULT_MAX_HEIGHT,
  SANDBOX_FRAME_NONCE_BYTES,
  assertSandboxFrameTitle,
  areSandboxThemeTokensEqual,
  buildSandboxDocument,
  buildSandboxTokens,
  encodeSandboxNonce,
  pickSandboxThemeTokens,
  readSandboxFrameHeight,
  resolveSandboxFrameHeight,
  resolveSandboxFrameLabels,
  validateSandboxCspOptions,
  sandboxFrameClass,
  sandboxFrameViewportClass,
  sandboxFrameIframeVariants,
  sandboxFrameLoadingClass,
  sandboxFrameSpinnerClass,
  sandboxFrameErrorClass,
  sandboxFrameFooterClass,
  sandboxFrameActionClass,
  type SandboxCspOptions,
  type SandboxFrameLabels,
  type SandboxFramePermission,
  type SandboxFrameStatus,
  type SandboxThemeTokens,
} from '@refraction-ui/sandbox-frame'
import { cn } from '@refraction-ui/shared'

export type {
  SandboxCspOptions,
  SandboxFrameLabels,
  SandboxFramePermission,
  SandboxFrameStatus,
  SandboxThemeTokens,
}

export interface SandboxFrameProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The untrusted HTML to display. It never runs with the host's privileges. */
  html: string
  /** Accessible name of the frame (required; announced by screen readers). */
  title: string
  /**
   * Allow scripts in the frame. Only the injected height reporter can run
   * (CSP nonce); the HTML's own inline scripts stay blocked. Enables auto-height.
   * Never combined with `allow-same-origin`.
   */
  allowScripts?: boolean
  /** Extra sandbox permissions. `allow-same-origin` is refused with `allowScripts`. */
  permissions?: readonly SandboxFramePermission[]
  /** CSP source overrides for images, media, fonts, styles and extra scripts. */
  csp?: SandboxCspOptions
  /**
   * Theme tokens forwarded into the frame as CSS custom properties. When
   * omitted, the host's resolved tokens are read from the element and re-read
   * when the theme changes.
   */
  themeTokens?: SandboxThemeTokens
  /** Collapsed height cap in pixels; taller content gets an expand control. */
  maxHeight?: number
  /** Overrides for the visible strings. */
  labels?: Partial<SandboxFrameLabels>
  /** Called whenever the status changes (`loading` → `ready`, or `error`). */
  onStatusChange?: (status: SandboxFrameStatus) => void
}

/** Attributes on `<html>` whose change can switch the theme. */
const THEME_ATTRIBUTES = ['class', 'style', 'data-theme']
/** Media query whose change can switch a `system` theme. */
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

/**
 * Draw a fresh CSP nonce. Fails closed: without a real random source the
 * frame is never rendered.
 */
function createNonce(): string {
  const cryptoApi = globalThis.crypto
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== 'function') {
    throw new Error('SandboxFrame: crypto.getRandomValues is required to create a CSP nonce.')
  }
  return encodeSandboxNonce(cryptoApi.getRandomValues(new Uint8Array(SANDBOX_FRAME_NONCE_BYTES)))
}

/**
 * Read the host's resolved theme tokens from `rootRef` after mount, and again
 * whenever `<html>`'s class/style/data-theme or the system colour scheme
 * changes. Returns `null` until the first read (and while disabled).
 */
function useHostThemeTokens(
  rootRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
): SandboxThemeTokens | null {
  const [tokens, setTokens] = React.useState<SandboxThemeTokens | null>(null)

  React.useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return

    const read = () => {
      const style = window.getComputedStyle(root)
      const next = pickSandboxThemeTokens((variable) => style.getPropertyValue(variable))
      // Same tokens → keep the old object so the frame document is not rebuilt.
      setTokens((prev) => (prev && areSandboxThemeTokensEqual(prev, next) ? prev : next))
    }
    read()

    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: THEME_ATTRIBUTES })
    const media = typeof window.matchMedia === 'function' ? window.matchMedia(COLOR_SCHEME_QUERY) : null
    media?.addEventListener('change', read)

    return () => {
      observer.disconnect()
      media?.removeEventListener('change', read)
    }
  }, [enabled, rootRef])

  return tokens
}

/** A height report, tied to the iframe element whose document sent it. */
interface Measurement {
  frame: HTMLIFrameElement
  height: number
}

/**
 * SandboxFrame — shows untrusted HTML in a locked-down `srcdoc` iframe.
 *
 * The frame is sandboxed with an opaque origin (no `allow-same-origin` by
 * default, scripts opt-in, never both) and its document starts with a strict
 * CSP. The document is built on the client after mount: it needs a fresh
 * random CSP nonce and the host's resolved theme tokens, so server HTML
 * contains the loading shell but never the untrusted markup.
 *
 * Each document gets its own iframe element (keyed by the document), so a
 * second `load` from the same element can only mean its content navigated
 * away — the frame is then removed and an error with a reload action shown.
 */
export const SandboxFrame = React.forwardRef<HTMLDivElement, SandboxFrameProps>(
  function SandboxFrame(
    {
      html,
      title,
      allowScripts = false,
      permissions,
      csp,
      themeTokens,
      maxHeight = SANDBOX_FRAME_DEFAULT_MAX_HEIGHT,
      labels: labelOverrides,
      onStatusChange,
      id: idProp,
      className,
      ...props
    },
    ref,
  ) {
    // Validate in render so a weakened configuration fails loudly, on the server too.
    assertSandboxFrameTitle(title)
    const sandbox = buildSandboxTokens({ allowScripts, permissions }).join(' ')
    validateSandboxCspOptions(csp)

    const generatedId = React.useId()
    const id = idProp ?? generatedId
    const viewportId = `${id}-viewport`
    const labels = resolveSandboxFrameLabels(labelOverrides)

    const rootRef = React.useRef<HTMLDivElement>(null)
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement)

    const [nonce, setNonce] = React.useState<string | null>(null)
    React.useEffect(() => {
      setNonce(createNonce())
    }, [])

    const hostTokens = useHostThemeTokens(rootRef, themeTokens === undefined)
    const tokens = themeTokens ?? hostTokens

    const srcDoc =
      nonce !== null && tokens !== null
        ? buildSandboxDocument({ html, nonce, id, allowScripts, csp, themeTokens: tokens })
        : null

    const [frame, setFrame] = React.useState<HTMLIFrameElement | null>(null)
    const [readyFrame, setReadyFrame] = React.useState<HTMLIFrameElement | null>(null)
    const loadedFrameRef = React.useRef<HTMLIFrameElement | null>(null)
    const [blocked, setBlocked] = React.useState(false)
    const [reloads, setReloads] = React.useState(0)
    const [measurement, setMeasurement] = React.useState<Measurement | null>(null)
    const [expanded, setExpanded] = React.useState(false)

    const status: SandboxFrameStatus = blocked
      ? 'error'
      : frame !== null && readyFrame === frame
        ? 'ready'
        : 'loading'

    const handleLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
      const loaded = event.currentTarget
      if (loadedFrameRef.current === loaded) {
        // The element's own document already loaded: this is a navigation
        // (a self-targeted link, a meta refresh). Remove the frame.
        setBlocked(true)
        return
      }
      loadedFrameRef.current = loaded
      setReadyFrame(loaded)
    }

    const reload = () => {
      setBlocked(false)
      setReloads((count) => count + 1)
    }

    React.useEffect(() => {
      if (!allowScripts || frame === null) return
      const onMessage = (event: MessageEvent) => {
        // contentWindow is read per message: it is the identity check.
        const height = readSandboxFrameHeight(event, { source: frame.contentWindow, id })
        if (height !== null) setMeasurement({ frame, height })
      }
      window.addEventListener('message', onMessage)
      return () => window.removeEventListener('message', onMessage)
    }, [allowScripts, frame, id])

    // A report belongs to one document; a new document starts unmeasured.
    const measured = measurement !== null && measurement.frame === frame ? measurement.height : null
    const { height, canExpand } = resolveSandboxFrameHeight({
      measured,
      measurable: allowScripts,
      maxHeight,
      expanded,
    })

    const onStatusChangeRef = React.useRef(onStatusChange)
    React.useEffect(() => {
      onStatusChangeRef.current = onStatusChange
    })
    React.useEffect(() => {
      onStatusChangeRef.current?.(status)
    }, [status])

    return (
      <div
        {...props}
        ref={rootRef}
        id={id}
        className={cn(sandboxFrameClass, className)}
        data-state={status}
        data-scripts={allowScripts ? 'on' : 'off'}
        data-expanded={expanded ? 'true' : 'false'}
        aria-busy={status === 'loading' || undefined}
      >
        {blocked ? (
          <div role="alert" className={sandboxFrameErrorClass}>
            <p>{labels.navigationBlocked}</p>
            <button type="button" className={sandboxFrameActionClass} onClick={reload}>
              {labels.reload}
            </button>
          </div>
        ) : (
          <div id={viewportId} className={sandboxFrameViewportClass} style={{ height }}>
            {srcDoc !== null && (
              <React.Fragment key={reloads}>
                <iframe
                  key={srcDoc}
                  ref={setFrame}
                  title={title}
                  sandbox={sandbox}
                  srcDoc={srcDoc}
                  referrerPolicy="no-referrer"
                  className={sandboxFrameIframeVariants({ state: status })}
                  onLoad={handleLoad}
                />
              </React.Fragment>
            )}
            {status === 'loading' && (
              <div role="status" className={sandboxFrameLoadingClass}>
                <span aria-hidden="true" className={sandboxFrameSpinnerClass} />
                <span>{labels.loading}</span>
              </div>
            )}
          </div>
        )}
        {!blocked && canExpand && (
          <div className={sandboxFrameFooterClass}>
            <button
              type="button"
              className={sandboxFrameActionClass}
              aria-expanded={expanded}
              aria-controls={viewportId}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? labels.collapse : labels.expand}
            </button>
          </div>
        )}
      </div>
    )
  },
)
