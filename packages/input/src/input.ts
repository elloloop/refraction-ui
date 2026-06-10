import type { AccessibilityProps } from '@refraction-ui/shared'

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'

/** High-level validation affordance for an input. */
export type InputValidationState = 'valid' | 'invalid'

export interface InputProps {
  type?: InputType
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  placeholder?: string
  'aria-invalid'?: boolean
  /**
   * Validation affordance. The core derives `aria-invalid` from this:
   * - `'valid'` → `aria-invalid={false}`
   * - `'invalid'` → `aria-invalid={true}`
   *
   * An explicit `aria-invalid` prop always takes precedence.
   */
  validationState?: InputValidationState
}

export interface InputAPI {
  /** ARIA attributes to spread on the element */
  ariaProps: Partial<AccessibilityProps> & { 'aria-invalid'?: boolean; 'aria-required'?: boolean }
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
}

/**
 * Resolve the effective `aria-invalid` value from an explicit `aria-invalid`
 * prop and a high-level `validationState`. The explicit prop always wins;
 * otherwise `validationState` maps `'invalid' → true`, `'valid' → false`, and
 * an absent state leaves `aria-invalid` undefined (legacy behavior).
 */
export function resolveAriaInvalid(
  ariaInvalid: boolean | undefined,
  validationState: InputValidationState | undefined,
): boolean | undefined {
  if (ariaInvalid !== undefined) {
    return ariaInvalid
  }
  if (validationState === 'invalid') {
    return true
  }
  if (validationState === 'valid') {
    return false
  }
  return undefined
}

export function createInput(props: InputProps = {}): InputAPI {
  const {
    disabled = false,
    readOnly = false,
    required = false,
    'aria-invalid': ariaInvalid,
    validationState,
  } = props

  const resolvedInvalid = resolveAriaInvalid(ariaInvalid, validationState)

  const ariaProps: InputAPI['ariaProps'] = {}

  if (disabled) {
    ariaProps['aria-disabled'] = true
  }

  if (resolvedInvalid !== undefined) {
    ariaProps['aria-invalid'] = resolvedInvalid
  }

  if (required) {
    ariaProps['aria-required'] = true
  }

  const dataAttributes: Record<string, string> = {}

  if (disabled) {
    dataAttributes['data-disabled'] = ''
  }

  if (readOnly) {
    dataAttributes['data-readonly'] = ''
  }

  if (resolvedInvalid === true) {
    dataAttributes['data-invalid'] = ''
  }

  return {
    ariaProps,
    dataAttributes,
  }
}

export function getInputAriaProps(state: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
}): Partial<AccessibilityProps> & { 'aria-invalid'?: boolean; 'aria-required'?: boolean } {
  const ariaProps: Partial<AccessibilityProps> & { 'aria-invalid'?: boolean; 'aria-required'?: boolean } = {}

  if (state.disabled) {
    ariaProps['aria-disabled'] = true
  }

  if (state.invalid) {
    ariaProps['aria-invalid'] = true
  }

  if (state.required) {
    ariaProps['aria-required'] = true
  }

  return ariaProps
}
