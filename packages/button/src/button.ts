import type { AccessibilityProps, KeyboardHandlerMap } from '@refraction-ui/shared'
import { Keys } from '@refraction-ui/shared'

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'xs' | 'sm' | 'default' | 'lg' | 'icon'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  asChild?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export interface ButtonAPI {
  /** ARIA attributes to spread on the element */
  ariaProps: Partial<AccessibilityProps>
  /** Keyboard handlers to attach */
  keyboardHandlers: KeyboardHandlerMap
  /** Whether interaction should be blocked */
  isInteractive: boolean
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
}

export function createButton(props: ButtonProps = {}): ButtonAPI {
  const { disabled = false, loading = false, type = 'button' } = props
  const isInteractive = !disabled && !loading

  const ariaProps: Partial<AccessibilityProps> = {}
  if (disabled) {
    ariaProps['aria-disabled'] = true
  }
  if (loading) {
    ariaProps['aria-disabled'] = true
    ariaProps['aria-label'] = ariaProps['aria-label'] ?? undefined
  }

  const dataAttributes: Record<string, string> = {}
  if (loading) {
    dataAttributes['data-loading'] = ''
  }
  if (disabled) {
    dataAttributes['data-disabled'] = ''
  }

  const keyboardHandlers: KeyboardHandlerMap = {}
  if (!isInteractive) {
    keyboardHandlers[Keys.Enter] = (e) => e.preventDefault()
    keyboardHandlers[Keys.Space] = (e) => e.preventDefault()
  }

  return {
    ariaProps,
    keyboardHandlers,
    isInteractive,
    dataAttributes,
  }
}

export function getButtonType(props: ButtonProps): string {
  return props.type ?? 'button'
}
