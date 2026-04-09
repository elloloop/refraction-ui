import * as React from 'react'
import {
  createInputGroup,
  inputGroupVariants,
  inputGroupAddonVariants,
  inputGroupButtonVariants,
  type InputGroupOrientation,
} from '@elloloop/input-group'
import { cn } from '@elloloop/shared'

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: InputGroupOrientation
}

/**
 * InputGroup — flex container that visually groups inputs, addons, and buttons.
 * Handles border-radius clipping on first/last children.
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ orientation = 'horizontal', className, children, ...props }, ref) => {
    const api = createInputGroup({
      orientation,
      id: props.id,
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby'],
    })

    return (
      <div
        ref={ref}
        className={cn(inputGroupVariants({ orientation }), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {children}
      </div>
    )
  },
)

InputGroup.displayName = 'InputGroup'

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: InputGroupOrientation
}

/**
 * InputGroupAddon — decorative text or icon addon (e.g., "$", "@", icons).
 */
export const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ orientation = 'horizontal', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(inputGroupAddonVariants({ orientation }), className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)

InputGroupAddon.displayName = 'InputGroupAddon'

export interface InputGroupTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * InputGroupText — inline text label within an input group.
 */
export const InputGroupText = React.forwardRef<HTMLSpanElement, InputGroupTextProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('flex items-center px-3 text-sm text-muted-foreground', className)}
        {...props}
      >
        {children}
      </span>
    )
  },
)

InputGroupText.displayName = 'InputGroupText'

export interface InputGroupButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  orientation?: InputGroupOrientation
}

/**
 * InputGroupButton — a button styled to sit flush inside an input group.
 */
export const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  ({ orientation = 'horizontal', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        className={cn(inputGroupButtonVariants({ orientation }), className)}
        {...props}
      >
        {children}
      </button>
    )
  },
)

InputGroupButton.displayName = 'InputGroupButton'
