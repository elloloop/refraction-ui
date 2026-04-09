import type { Orientation } from '@elloloop/shared'

export interface ResizableLayoutProps {
  orientation?: Orientation
  /** Initial sizes as percentages (must sum to 100) */
  defaultSizes?: number[]
  /** Minimum size for each pane (percentage) */
  minSizes?: number[]
  /** Maximum size for each pane (percentage) */
  maxSizes?: number[]
  /** localStorage key for persisting sizes */
  persistKey?: string
}

export interface ResizableLayoutAPI {
  /** Current pane sizes as percentages */
  sizes: number[]
  /** Begin a resize operation at divider index */
  startResize: (index: number) => void
  /** Apply a delta (percentage) during resize */
  onResize: (delta: number) => void
  /** End the current resize operation */
  endResize: () => void
  /** Generate CSS custom properties for pane sizes */
  getCSSVariables: () => Record<string, string>
  /** Current orientation */
  orientation: Orientation
}

/**
 * Clamp a value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function createResizableLayout(props: ResizableLayoutProps = {}): ResizableLayoutAPI {
  const {
    orientation = 'horizontal',
    defaultSizes = [50, 50],
    minSizes = [],
    maxSizes = [],
    persistKey,
  } = props

  let sizes = loadSizes(persistKey) ?? [...defaultSizes]
  let resizingIndex: number | null = null
  let sizesBeforeResize: number[] = []

  function loadSizes(key?: string): number[] | null {
    if (!key) return null
    try {
      if (typeof globalThis.localStorage !== 'undefined') {
        const stored = globalThis.localStorage.getItem(key)
        if (stored) {
          const parsed = JSON.parse(stored) as number[]
          if (Array.isArray(parsed) && parsed.length === defaultSizes.length) {
            return parsed
          }
        }
      }
    } catch {
      // localStorage not available or invalid data
    }
    return null
  }

  function saveSizes(key: string, values: number[]): void {
    try {
      if (typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.setItem(key, JSON.stringify(values))
      }
    } catch {
      // localStorage not available
    }
  }

  function getMinSize(index: number): number {
    return minSizes[index] ?? 0
  }

  function getMaxSize(index: number): number {
    return maxSizes[index] ?? 100
  }

  function startResize(index: number): void {
    resizingIndex = index
    sizesBeforeResize = [...sizes]
  }

  function onResize(delta: number): void {
    if (resizingIndex === null) return

    const i = resizingIndex
    const j = i + 1
    if (j >= sizes.length) return

    const totalAvailable = sizesBeforeResize[i] + sizesBeforeResize[j]

    // Compute new size for pane i
    let newSizeI = sizesBeforeResize[i] + delta
    newSizeI = clamp(newSizeI, getMinSize(i), getMaxSize(i))

    // Compute new size for pane j from remaining
    let newSizeJ = totalAvailable - newSizeI
    newSizeJ = clamp(newSizeJ, getMinSize(j), getMaxSize(j))

    // Re-adjust pane i if pane j was constrained
    newSizeI = totalAvailable - newSizeJ

    sizes[i] = newSizeI
    sizes[j] = newSizeJ
  }

  function endResize(): void {
    resizingIndex = null
    sizesBeforeResize = []
    if (persistKey) {
      saveSizes(persistKey, sizes)
    }
  }

  function getCSSVariables(): Record<string, string> {
    const vars: Record<string, string> = {}
    for (let i = 0; i < sizes.length; i++) {
      vars[`--rfr-pane-${i}-size`] = `${sizes[i]}%`
    }
    return vars
  }

  return {
    sizes,
    startResize,
    onResize,
    endResize,
    getCSSVariables,
    orientation,
  }
}
