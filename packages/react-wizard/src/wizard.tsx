import * as React from 'react'
import {
  createWizard,
  getStepState,
  getNextIndex,
  getPrevIndex,
  canAdvance,
  wizardVariants,
  wizardRailVariants,
  wizardStepItemVariants,
  wizardStepIndicatorVariants,
  wizardStepLabelVariants,
  wizardStepOptionalClass,
  wizardConnectorVariants,
  wizardContentClass,
  wizardFooterClass,
  wizardPrimaryButtonVariants,
  wizardSecondaryButtonVariants,
  type WizardStep,
  type WizardOrientation,
} from '@refraction-ui/wizard'
import { cn } from '@refraction-ui/shared'

export type { WizardStep, WizardOrientation }

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface WizardContextValue {
  currentIndex: number
  steps: WizardStep[]
  orientation: WizardOrientation
}

const WizardContext = React.createContext<WizardContextValue | null>(null)

function useWizardContext(): WizardContextValue {
  const ctx = React.useContext(WizardContext)
  if (!ctx) throw new Error('useWizardContext must be used inside <Wizard>')
  return ctx
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WizardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** Step definitions for the rail. */
  steps: WizardStep[]
  /** Controlled current step index (0-based). */
  step?: number
  /** Initial step index for uncontrolled usage. */
  defaultStep?: number
  /** Called when the current step changes (Back/Next). */
  onStepChange?: (index: number) => void
  /** Called when the user completes the final step. */
  onComplete?: () => void
  /** Orientation of the step rail. Default `'vertical'`. */
  orientation?: WizardOrientation
  /** Label for the Next button. */
  nextLabel?: React.ReactNode
  /** Label for the Back button. */
  backLabel?: React.ReactNode
  /** Label for the button on the final step. */
  completeLabel?: React.ReactNode
  /** Label for the Skip button (shown on optional steps only). */
  skipLabel?: React.ReactNode
  /**
   * Content for the active step. Either pass a render prop that receives the
   * current step index, or plain children shown for every step.
   */
  children?: React.ReactNode | ((currentIndex: number) => React.ReactNode)
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

/**
 * Wizard — a multi-step flow orchestration component.
 *
 * Renders a step rail (vertical by default) alongside the active step content
 * and a footer with Back / Skip (optional steps) / Next-or-Complete actions.
 * Supports controlled (`step` / `onStepChange`) and uncontrolled
 * (`defaultStep`) usage. Logic and styles come from the headless
 * `@refraction-ui/wizard` core.
 *
 * @example
 * ```tsx
 * <Wizard steps={steps} onComplete={handleComplete}>
 *   {(index) => <StepContent stepIndex={index} />}
 * </Wizard>
 * ```
 */
export const Wizard = React.forwardRef<HTMLDivElement, WizardProps>(
  (
    {
      steps,
      step: stepProp,
      defaultStep = 0,
      onStepChange,
      onComplete,
      orientation = 'vertical',
      nextLabel = 'Next',
      backLabel = 'Back',
      completeLabel = 'Complete',
      skipLabel = 'Skip',
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isControlled = stepProp !== undefined
    const [internal, setInternal] = React.useState(defaultStep)
    const currentIndex = isControlled ? stepProp : internal

    const advance = React.useCallback(() => {
      if (!canAdvance(currentIndex, steps.length)) {
        onComplete?.()
        return
      }
      const next = getNextIndex(currentIndex, steps.length)
      if (!isControlled) setInternal(next)
      onStepChange?.(next)
    }, [currentIndex, steps.length, isControlled, onStepChange, onComplete])

    const back = React.useCallback(() => {
      if (currentIndex === 0) return
      const prev = getPrevIndex(currentIndex)
      if (!isControlled) setInternal(prev)
      onStepChange?.(prev)
    }, [currentIndex, isControlled, onStepChange])

    const skip = React.useCallback(() => {
      advance()
    }, [advance])

    const stepStates = React.useMemo(
      () => getStepState(steps, currentIndex),
      [steps, currentIndex],
    )

    const isLastStep = currentIndex === steps.length - 1
    const currentStep = steps[currentIndex]
    const isOptional = currentStep?.optional ?? false

    const api = createWizard({
      currentIndex,
      count: steps.length,
      orientation,
    })

    return (
      <WizardContext.Provider value={{ currentIndex, steps, orientation }}>
        <div
          ref={ref}
          className={cn(wizardVariants({ orientation }), className)}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          {/* Step Rail */}
          <nav
            aria-label="Progress"
            className={wizardRailVariants({ orientation })}
          >
            {stepStates.map((state, i) => {
              const isLast = i === stepStates.length - 1
              return (
                <React.Fragment key={state.step.id}>
                  <div
                    className={wizardStepItemVariants({
                      orientation,
                      status: state.status,
                    })}
                  >
                    <span
                      aria-current={state.status === 'current' ? 'step' : undefined}
                      className={wizardStepIndicatorVariants({ status: state.status })}
                    >
                      {state.status === 'complete' ? (
                        <CheckIcon />
                      ) : (
                        <span>{state.index + 1}</span>
                      )}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={wizardStepLabelVariants({ status: state.status })}
                      >
                        {state.step.label}
                      </span>
                      {state.step.optional && (
                        <span className={wizardStepOptionalClass}>(Optional)</span>
                      )}
                    </div>
                  </div>
                  {!isLast && (
                    <div
                      aria-hidden="true"
                      className={wizardConnectorVariants({
                        orientation,
                        complete: state.status === 'complete' ? 'true' : 'false',
                      })}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </nav>

          {/* Content + Footer */}
          <div className={wizardContentClass}>
            <div className="flex-1">
              {typeof children === 'function' ? children(currentIndex) : children}
            </div>

            <div className={wizardFooterClass}>
              <button
                type="button"
                disabled={currentIndex === 0}
                className={wizardSecondaryButtonVariants()}
                onClick={back}
              >
                {backLabel}
              </button>

              {isOptional && (
                <button
                  type="button"
                  className={wizardSecondaryButtonVariants()}
                  onClick={skip}
                >
                  {skipLabel}
                </button>
              )}

              <button
                type="button"
                className={wizardPrimaryButtonVariants()}
                onClick={advance}
              >
                {isLastStep ? completeLabel : nextLabel}
              </button>
            </div>
          </div>
        </div>
      </WizardContext.Provider>
    )
  },
)

Wizard.displayName = 'Wizard'

// ---------------------------------------------------------------------------
// useWizard hook (for children that need context access)
// ---------------------------------------------------------------------------

/**
 * Access wizard state from within a child component rendered inside `<Wizard>`.
 */
export function useWizard(): WizardContextValue {
  return useWizardContext()
}

// ---------------------------------------------------------------------------
// Internal icons (no external dep — SVG inline)
// ---------------------------------------------------------------------------

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
