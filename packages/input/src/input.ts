import type { AccessibilityProps } from '@elloloop/shared'

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'

export interface InputProps {
  type?: InputType
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  placeholder?: string
  'aria-invalid'?: boolean
}

export interface InputAPI {
  /** ARIA attributes to spread on the element */
  ariaProps: Partial<AccessibilityProps> & { 'aria-invalid'?: boolean; 'aria-required'?: boolean }
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
}

export function createInput(props: InputProps = {}): InputAPI {
  const {
    disabled = false,
    readOnly = false,
    required = false,
    'aria-invalid': ariaInvalid,
  } = props

  const ariaProps: InputAPI['ariaProps'] = {}

  if (disabled) {
    ariaProps['aria-disabled'] = true
  }

  if (ariaInvalid) {
    ariaProps['aria-invalid'] = true
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

  if (ariaInvalid) {
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
