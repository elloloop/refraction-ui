import * as React from 'react'
import {
  createRadioGroup,
  radioGroupVariants,
  radioItemVariants,
  radioCircleVariants,
  type RadioGroupProps as CoreRadioGroupProps,
} from '@refraction-ui/radio'
import { cn, devWarn } from '@refraction-ui/shared'

interface RadioContextValue {
  value: string | undefined
  onValueChange: (value: string) => void
  name?: string
  disabled: boolean
}

const RadioContext = React.createContext<RadioContextValue | null>(null)

export interface RadioGroupProps extends CoreRadioGroupProps {
  children: React.ReactNode
  className?: string
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup({ children, className, value: controlledValue, defaultValue, onValueChange, name, disabled = false, orientation = 'vertical' }: RadioGroupProps, ref) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const api = createRadioGroup({ value: currentValue, name, disabled, orientation })

  const handleChange = React.useCallback(
    (val: string) => {
      if (!isControlled) setInternalValue(val)
      onValueChange?.(val)
    },
    [isControlled, onValueChange],
  )

  const ctx = React.useMemo<RadioContextValue>(
    () => ({ value: currentValue, onValueChange: handleChange, name, disabled }),
    [currentValue, handleChange, name, disabled],
  )

  return React.createElement(
    RadioContext.Provider,
    { value: ctx },
    React.createElement(
      'div',
      { ref, ...api.groupProps, className: cn(radioGroupVariants({ orientation }), className) },
      children,
    ),
  )
  },
)

export interface RadioItemProps {
  value: string
  children?: React.ReactNode
  disabled?: boolean
  className?: string
}

export const RadioItem = React.forwardRef<HTMLLabelElement, RadioItemProps>(
  function RadioItem({ value, children, disabled = false, className }, ref) {
  const ctx = React.useContext(RadioContext)
  if (!ctx) {
    devWarn(
      'react-radio/radio-item-outside-group',
      'RadioItem was rendered outside of <RadioGroup>. Wrap it in <RadioGroup>.',
    )
    throw new Error('RadioItem must be used within RadioGroup')
  }

  const isChecked = ctx.value === value
  const isDisabled = ctx.disabled || disabled

  return React.createElement(
    'label',
    {
      ref,
      className: cn(radioItemVariants({ disabled: isDisabled ? 'true' : 'false' }), className),
      'data-state': isChecked ? 'checked' : 'unchecked',
    },
    React.createElement(
      'button',
      {
        type: 'button',
        role: 'radio',
        'aria-checked': isChecked,
        'aria-disabled': isDisabled || undefined,
        tabIndex: isChecked ? 0 : -1,
        disabled: isDisabled,
        className: cn(radioCircleVariants({ checked: isChecked ? 'true' : 'false' })),
        onClick: () => !isDisabled && ctx.onValueChange(value),
      },
      isChecked &&
        React.createElement(
          'span',
          { className: 'block h-2 w-2 rounded-full bg-primary-foreground mx-auto' },
        ),
    ),
    children && React.createElement('span', { className: 'text-sm' }, children),
  )
  },
)
