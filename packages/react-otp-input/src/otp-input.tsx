import * as React from 'react'
import {
  createOtpInput,
  otpInputContainerVariants,
  otpInputSlotVariants,
  type OtpInputType,
} from '@refraction-ui/otp-input'
import { cn } from '@refraction-ui/shared'

export interface OtpInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  length?: number
  value?: string
  onChange?: (value: string) => void
  autoFocus?: boolean
  type?: OtpInputType
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
}

/**
 * OtpInput -- a row of individual input boxes for one-time password entry.
 *
 * Features: auto-advance on type, backspace navigation, paste support, numeric/text mode.
 */
export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  ({
    length = 6,
    value = '',
    onChange,
    autoFocus = false,
    type = 'number',
    disabled = false,
    size = 'default',
    className,
    ...props
  }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
    const [focusedIndex, setFocusedIndex] = React.useState(autoFocus ? 0 : -1)
    const [values, setValues] = React.useState<string[]>(() =>
      Array.from({ length }, (_, i) => value.charAt(i) || ''),
    )

    // Sync external value changes
    React.useEffect(() => {
      setValues(Array.from({ length }, (_, i) => value.charAt(i) || ''))
    }, [value, length])

    // Auto-focus first input
    React.useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }, [autoFocus])

    const api = createOtpInput({ length, value, autoFocus, type, disabled })

    const updateValue = (index: number, char: string) => {
      const filtered = type === 'number' ? char.replace(/[^0-9]/g, '') : char
      const newChar = filtered.charAt(0) || ''
      const newValues = [...values]
      newValues[index] = newChar
      setValues(newValues)
      onChange?.(newValues.join(''))
      return newChar
    }

    const handleInput = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const char = inputValue.slice(-1)
      const result = updateValue(index, char)

      // Auto-advance to next input
      if (result && index < length - 1) {
        setFocusedIndex(index + 1)
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (values[index]) {
          updateValue(index, '')
        } else if (index > 0) {
          updateValue(index - 1, '')
          setFocusedIndex(index - 1)
          inputRefs.current[index - 1]?.focus()
        }
      }

      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault()
        setFocusedIndex(index - 1)
        inputRefs.current[index - 1]?.focus()
      }

      if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault()
        setFocusedIndex(index + 1)
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasteData = e.clipboardData.getData('text')
      const parsed = api.parsePaste(pasteData)
      setValues(parsed)
      onChange?.(parsed.join(''))

      // Focus the last filled input or the next empty one
      const lastFilledIndex = parsed.findLastIndex((v) => v !== '')
      const nextIndex = Math.min(lastFilledIndex + 1, length - 1)
      setFocusedIndex(nextIndex)
      inputRefs.current[nextIndex]?.focus()
    }

    const handleFocus = (index: number) => {
      setFocusedIndex(index)
    }

    const handleBlur = () => {
      setFocusedIndex(-1)
    }

    return (
      <div
        ref={ref}
        className={cn(otpInputContainerVariants({ size }), className)}
        {...api.rootAriaProps}
        {...props}
      >
        {Array.from({ length }, (_, index) => {
          const slotProps = api.getSlotProps(index)
          const isFocused = index === focusedIndex
          const isFilled = values[index] !== ''

          return (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              className={cn(otpInputSlotVariants({
                size,
                focused: isFocused ? 'true' : 'false',
                filled: isFilled ? 'true' : 'false',
              }))}
              value={values[index]}
              onChange={(e) => handleInput(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              maxLength={1}
              inputMode={type === 'number' ? 'numeric' : 'text'}
              pattern={type === 'number' ? '[0-9]*' : undefined}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              disabled={disabled}
              aria-label={`Digit ${index + 1} of ${length}`}
              data-slot="otp-slot"
              data-focused={isFocused ? '' : undefined}
              data-filled={isFilled ? '' : undefined}
            />
          )
        })}
      </div>
    )
  },
)

OtpInput.displayName = 'OtpInput'
