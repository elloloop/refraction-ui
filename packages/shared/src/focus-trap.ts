/**
 * Focus trap utilities — keeps keyboard focus within a container.
 * Used by Dialog, DropdownMenu, and other overlay components.
 * Pure TypeScript, no DOM dependency (accepts element via parameter).
 */

/** Selector for all natively focusable elements */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Get all focusable elements within a container */
export function getFocusableElements(container: Element): Element[] {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
}

/** Configuration for creating a focus trap */
export interface FocusTrapConfig {
  /** The container element */
  container: Element
  /** Called to get the initial focus target */
  initialFocus?: () => Element | null
  /** Called when Escape is pressed */
  onEscape?: () => void
  /** Whether to return focus to trigger on deactivate */
  returnFocusOnDeactivate?: boolean
}

/** A focus trap instance */
export interface FocusTrap {
  activate(): void
  deactivate(): void
  isActive(): boolean
}

/** Create a focus trap that keeps Tab/Shift+Tab within a container */
export function createFocusTrap(config: FocusTrapConfig): FocusTrap {
  let active = false
  let previouslyFocused: Element | null = null

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && config.onEscape) {
      event.preventDefault()
      config.onEscape()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = getFocusableElements(config.container)
    if (focusable.length === 0) return

    const first = focusable[0] as HTMLElement
    const last = focusable[focusable.length - 1] as HTMLElement

    if (event.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  return {
    activate() {
      if (active) return
      active = true

      // Remember the currently focused element so we can restore it later
      if (typeof document !== 'undefined') {
        previouslyFocused = document.activeElement
      }

      // Set initial focus
      if (config.initialFocus) {
        const target = config.initialFocus()
        if (target && 'focus' in target) {
          ;(target as HTMLElement).focus()
        }
      } else {
        const focusable = getFocusableElements(config.container)
        if (focusable.length > 0) {
          ;(focusable[0] as HTMLElement).focus()
        }
      }

      // Attach keydown listener to the container
      config.container.addEventListener(
        'keydown',
        handleKeyDown as EventListener,
      )
    },

    deactivate() {
      if (!active) return
      active = false

      config.container.removeEventListener(
        'keydown',
        handleKeyDown as EventListener,
      )

      // Restore focus to the previously focused element
      if (
        config.returnFocusOnDeactivate !== false &&
        previouslyFocused &&
        'focus' in previouslyFocused
      ) {
        ;(previouslyFocused as HTMLElement).focus()
      }
    },

    isActive() {
      return active
    },
  }
}
