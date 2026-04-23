import * as React from 'react'
import {
  createSteps,
  createStep,
  createStepIndicator,
  createStepContent,
  createStepTitle,
  createStepDescription,
  stepsVariants,
  stepVariants,
  stepIndicatorVariants,
  stepTitleVariants,
  stepDescriptionVariants,
} from '@refraction-ui/steps'
import { cn } from '@refraction-ui/shared'

export interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal'
}

export const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ className, orientation, ...props }, ref) => {
    const api = createSteps()
    return (
      <div
        ref={ref}
        className={cn(stepsVariants({ orientation }), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
Steps.displayName = 'Steps'

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'completed' | 'active' | 'upcoming'
}

export const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ className, status, ...props }, ref) => {
    const api = createStep()
    return (
      <div
        ref={ref}
        className={cn(stepVariants({ status }), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
Step.displayName = 'Step'

export interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'completed' | 'active' | 'upcoming'
}

export const StepIndicator = React.forwardRef<HTMLDivElement, StepIndicatorProps>(
  ({ className, status, ...props }, ref) => {
    const api = createStepIndicator()
    return (
      <div
        ref={ref}
        className={cn(stepIndicatorVariants({ status }), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
StepIndicator.displayName = 'StepIndicator'

export const StepContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const api = createStepContent()
    return (
      <div
        ref={ref}
        className={cn('flex-1 pb-8', className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
StepContent.displayName = 'StepContent'

export const StepTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const api = createStepTitle()
    return (
      <h4
        ref={ref}
        className={cn(stepTitleVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
StepTitle.displayName = 'StepTitle'

export const StepDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const api = createStepDescription()
    return (
      <p
        ref={ref}
        className={cn(stepDescriptionVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
StepDescription.displayName = 'StepDescription'