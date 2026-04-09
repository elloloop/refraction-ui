import * as React from 'react'
import {
  createRadioGroup,
  radioGroupVariants,
  radioItemVariants,
  radioCircleVariants,
  type RadioGroupProps as CoreRadioGroupProps,
} from '@refraction-ui/radio'
import { cn } from '@refraction-ui/shared'

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

export function RadioGroup({
  children,
  className,
  value: controlledValue,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  orientation = 'vertical',
}: RadioGroupProps) {
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
      { ...api.groupProps, className: cn(radioGroupVariants({ orientation }), className) },
      children,
    ),
  )
}

export interface RadioItemProps {
  value: string
  children?: React.ReactNode
  disabled?: boolean
  className?: string
}

export function RadioItem({ value, children, disabled = false, className }: RadioItemProps) {
  const ctx = React.useContext(RadioContext)
  if (!ctx) throw new Error('RadioItem must be used within RadioGroup')

  const isChecked = ctx.value === value
  const isDisabled = ctx.disabled || disabled

  return React.createElement(
    'label',
    {
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
}

RadioGroup.displayName = 'RadioGroup'
RadioItem.displayName = 'RadioItem'
