import * as React from 'react'
import {
  nativeSelectChevronPath,
  nativeSelectIconClass,
  nativeSelectVariants,
  nativeSelectWrapperClass,
  type NativeSelectSize,
} from '@refraction-ui/native-select'
import { cn } from '@refraction-ui/shared'

export type { NativeSelectSize }

export interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Visual size; shadows the native `size` (visible rows), which a dropdown never wants. */
  size?: NativeSelectSize
  /** Classes for the positioning wrapper (width, margins); `className` styles the select. */
  containerClassName?: string
}

/**
 * NativeSelect — a native `<select>` with the input look and a chevron.
 * Children are ordinary `<option>`/`<optgroup>` elements; every native
 * attribute and event passes through, and the ref is the select itself. Use it
 * for forms and filter bars; use `Select` for a custom listbox.
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { size = 'default', className, containerClassName, children, ...props },
  ref,
) {
  return (
    <span className={cn(nativeSelectWrapperClass, containerClassName)} data-slot="native-select">
      <select ref={ref} className={cn(nativeSelectVariants({ size }), className)} {...props}>
        {children}
      </select>
      <svg
        className={nativeSelectIconClass}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={nativeSelectChevronPath} />
      </svg>
    </span>
  )
})
