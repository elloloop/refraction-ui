import type { AccessibilityProps } from '@refraction-ui/shared'

export interface TextareaProps {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  'aria-invalid'?: boolean
  rows?: number
  maxRows?: number
}

export interface TextareaAPI {
  /** ARIA attributes to spread on the element */
  ariaProps: Partial<AccessibilityProps> & { 'aria-invalid'?: boolean; 'aria-required'?: boolean }
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
}

export function createTextarea(props: TextareaProps = {}): TextareaAPI {
  const {
    disabled = false,
    readOnly = false,
    required = false,
    'aria-invalid': ariaInvalid,
  } = props

  const ariaProps: TextareaAPI['ariaProps'] = {}

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
