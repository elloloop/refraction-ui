import type { AccessibilityProps } from '@elloloop/shared'
import { generateId } from '@elloloop/shared'

export type InputGroupOrientation = 'horizontal' | 'vertical'

export interface InputGroupProps {
  orientation?: InputGroupOrientation
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

export interface InputGroupAPI {
  /** ARIA attributes to spread on the group container */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
}

export function createInputGroup(props: InputGroupProps = {}): InputGroupAPI {
  const { orientation = 'horizontal' } = props
  const id = props.id ?? generateId('rfr-input-group')

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'group',
  }

  if (props['aria-label']) {
    ariaProps['aria-label'] = props['aria-label']
  }
  if (props['aria-labelledby']) {
    ariaProps['aria-labelledby'] = props['aria-labelledby']
  }

  const dataAttributes: Record<string, string> = {
    'data-orientation': orientation,
    id,
  }

  return {
    ariaProps,
    dataAttributes,
  }
}
