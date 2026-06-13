import type { AccessibilityProps } from '@refraction-ui/shared'

/** A single step in a wizard flow. */
export interface WizardStep {
  /** Unique identifier for the step. */
  id: string
  /** Human-readable label shown in the step rail. */
  label: string
  /** When true the user may skip this step. */
  optional?: boolean
}

/** The resolved status of a step relative to the current position. */
export type WizardStepStatus = 'complete' | 'current' | 'upcoming'

/** A step enriched with its resolved status and position. */
export interface WizardStepState {
  step: WizardStep
  status: WizardStepStatus
  index: number
}

/** Orientation of the step rail. */
export type WizardOrientation = 'vertical' | 'horizontal'

export interface WizardProps {
  /** Controlled current step index (0-based). */
  currentIndex?: number
  /** Total number of steps. */
  count?: number
  /** Orientation of the step rail. */
  orientation?: WizardOrientation
}

export interface WizardAPI {
  /** ARIA attributes to spread on the root element. */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Derive the status of every step from the current position.
 *
 * Steps before `currentIndex` are `'complete'`, the step at `currentIndex` is
 * `'current'`, and every step after is `'upcoming'`.
 */
export function getStepState(
  steps: WizardStep[],
  currentIndex: number,
): WizardStepState[] {
  return steps.map((step, index) => {
    let status: WizardStepStatus
    if (index < currentIndex) {
      status = 'complete'
    } else if (index === currentIndex) {
      status = 'current'
    } else {
      status = 'upcoming'
    }
    return { step, status, index }
  })
}

/**
 * Returns the next step index, clamped to the last step so the wizard never
 * advances past the final step.
 */
export function getNextIndex(currentIndex: number, count: number): number {
  if (count <= 0) return currentIndex
  return Math.min(currentIndex + 1, count - 1)
}

/**
 * Returns the previous step index, clamped to 0 so the wizard never goes
 * behind the first step.
 */
export function getPrevIndex(currentIndex: number): number {
  return Math.max(currentIndex - 1, 0)
}

/**
 * Whether the wizard can advance from `currentIndex`.
 *
 * Returns `false` when already on the last step.
 */
export function canAdvance(currentIndex: number, count: number): boolean {
  if (count <= 0) return false
  return currentIndex < count - 1
}

/**
 * Fractional progress through the wizard (0 when on step 0, 1 when the final
 * step is complete). Returns 0 for empty wizards.
 *
 * `wizardProgress(0, 4)` → 0   (just started)
 * `wizardProgress(3, 4)` → 0.75
 * `wizardProgress(4, 4)` → 1   (done)
 */
export function wizardProgress(currentIndex: number, count: number): number {
  if (count <= 0) return 0
  return Math.min(currentIndex / count, 1)
}

/**
 * Build the framework-agnostic root props for a wizard component.
 *
 * Returns `role="group"` plus `data-step` / `data-orientation` attributes so
 * adapters can spread them onto their container without duplicating logic.
 */
export function createWizard(props: WizardProps = {}): WizardAPI {
  const { currentIndex = 0, count = 0, orientation = 'vertical' } = props

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'group',
  }

  const dataAttributes: Record<string, string> = {
    'data-step': String(currentIndex),
    'data-orientation': orientation,
  }

  if (count > 0) {
    dataAttributes['data-count'] = String(count)
  }

  return { ariaProps, dataAttributes }
}
