/**
 * Screen reader announcement utility.
 * Creates and manages an aria-live region for dynamic content updates.
 */

export interface LiveRegionConfig {
  /** 'polite' (default) or 'assertive' */
  politeness?: 'polite' | 'assertive'
  /** Clear the announcement after this many ms. Default: 5000 */
  clearAfterMs?: number
}

export interface LiveRegion {
  announce(message: string): void
  clear(): void
  destroy(): void
}

/** Create a live region that announces messages to screen readers */
export function createLiveRegion(config: LiveRegionConfig = {}): LiveRegion {
  const { politeness = 'polite', clearAfterMs = 5000 } = config
  let element: HTMLElement | null = null
  let clearTimeout: ReturnType<typeof setTimeout> | null = null

  function getElement(): HTMLElement {
    if (!element && typeof document !== 'undefined') {
      element = document.createElement('div')
      element.setAttribute('role', 'status')
      element.setAttribute('aria-live', politeness)
      element.setAttribute('aria-atomic', 'true')
      // Visually hidden but accessible to screen readers
      Object.assign(element.style, {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      })
      document.body.appendChild(element)
    }
    return element!
  }

  return {
    announce(message: string): void {
      const el = getElement()
      if (!el) return

      // Clear any pending timeout
      if (clearTimeout !== null) {
        globalThis.clearTimeout(clearTimeout)
      }

      // Set text content — screen readers will detect the change via aria-live
      el.textContent = message

      if (clearAfterMs > 0) {
        clearTimeout = globalThis.setTimeout(() => {
          el.textContent = ''
          clearTimeout = null
        }, clearAfterMs)
      }
    },

    clear(): void {
      if (clearTimeout !== null) {
        globalThis.clearTimeout(clearTimeout)
        clearTimeout = null
      }
      if (element) {
        element.textContent = ''
      }
    },

    destroy(): void {
      if (clearTimeout !== null) {
        globalThis.clearTimeout(clearTimeout)
        clearTimeout = null
      }
      if (element && element.parentNode) {
        element.parentNode.removeChild(element)
        element = null
      }
    },
  }
}
