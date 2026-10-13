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
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(element => {
    if (element.tabIndex < 0 || element.matches(':disabled, input[type="hidden"]')) return false
    if (element.closest('[hidden], [inert]')) return false
    const view = element.ownerDocument.defaultView
    for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
      const style = view?.getComputedStyle(parent)
      if (style?.display === 'none' || style?.visibility === 'hidden') return false
    }
    return true
  })
}

/** Configuration for creating a focus trap */
export interface FocusTrapConfig {
  /** The container element */
  container: Element
  /** Called to get the initial focus target */
  initialFocus?: () => Element | null
  /** Framework-owned portals that are logically inside this scope. */
  containsFocus?: (target: EventTarget | null) => boolean
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

// Nested portals have separate DOM parents; only the innermost trap owns focus.
const activeContainers = new WeakMap<Document, Element[]>()

/** Create a focus trap that keeps Tab/Shift+Tab within a container */
export function createFocusTrap(config: FocusTrapConfig): FocusTrap {
  let active = false
  let previouslyFocused: Element | null = null
  const ownerDocument = config.container.ownerDocument

  function focusInside(): void {
    const target = config.initialFocus?.() ?? getFocusableElements(config.container)[0] ?? config.container
    if ('focus' in target) (target as HTMLElement).focus()
  }

  function handleFocusIn(event: FocusEvent): void {
    const containers = activeContainers.get(ownerDocument)
    if (containers?.at(-1) !== config.container) return
    if (!config.container.contains(event.target as Node) && !config.containsFocus?.(event.target)) focusInside()
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && config.onEscape) {
      event.preventDefault()
      config.onEscape()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = getFocusableElements(config.container)
    if (focusable.length === 0) {
      event.preventDefault()
      if ('focus' in config.container) (config.container as HTMLElement).focus()
      return
    }

    const first = focusable[0] as HTMLElement
    const last = focusable[focusable.length - 1] as HTMLElement

    if (event.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (ownerDocument.activeElement === first || ownerDocument.activeElement === config.container) {
        event.preventDefault()
        last.focus()
      }
    } else {
      // Tab: if on last element, wrap to first
      if (ownerDocument.activeElement === last) {
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
      if (ownerDocument) {
        previouslyFocused = ownerDocument.activeElement
        const containers = activeContainers.get(ownerDocument) ?? []
        activeContainers.set(ownerDocument, [...containers, config.container])
        ownerDocument.addEventListener('focusin', handleFocusIn)
      }

      focusInside()

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

      if (ownerDocument) {
        ownerDocument.removeEventListener('focusin', handleFocusIn)
        const containers = activeContainers.get(ownerDocument) ?? []
        activeContainers.set(ownerDocument, containers.filter(container => container !== config.container))
      }

      // Restore focus to the previously focused element
      if (
        config.returnFocusOnDeactivate !== false &&
        previouslyFocused &&
        'focus' in previouslyFocused &&
        previouslyFocused.isConnected
      ) {
        (previouslyFocused as HTMLElement).focus()
      }
    },

    isActive() {
      return active
    },
  }
}
