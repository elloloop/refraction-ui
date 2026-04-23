import { cva } from '@refraction-ui/shared'

export interface StepsAPI {
  dataAttributes: Record<string, string>
}

export function createSteps(): StepsAPI {
  return { dataAttributes: { 'data-slot': 'steps' } }
}

export function createStep(): StepsAPI {
  return { dataAttributes: { 'data-slot': 'step' } }
}

export function createStepIndicator(): StepsAPI {
  return { dataAttributes: { 'data-slot': 'step-indicator' } }
}

export function createStepContent(): StepsAPI {
  return { dataAttributes: { 'data-slot': 'step-content' } }
}

export function createStepTitle(): StepsAPI {
  return { dataAttributes: { 'data-slot': 'step-title' } }
}

export function createStepDescription(): StepsAPI {
  return { dataAttributes: { 'data-slot': 'step-description' } }
}

export const stepsVariants = cva({
  base: 'flex flex-col gap-0',
  variants: {
    orientation: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

export const stepVariants = cva({
  base: 'flex gap-3',
  variants: {
    status: {
      completed: 'text-foreground',
      active: 'text-foreground',
      upcoming: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    status: 'upcoming',
  },
})

export const stepIndicatorVariants = cva({
  base: 'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold',
  variants: {
    status: {
      completed: 'border-primary bg-primary text-primary-foreground',
      active: 'border-primary bg-background text-primary',
      upcoming: 'border-muted bg-background text-muted-foreground',
    },
  },
  defaultVariants: {
    status: 'upcoming',
  },
})

export const stepTitleVariants = cva({
  base: 'font-semibold leading-none tracking-tight',
})

export const stepDescriptionVariants = cva({
  base: 'text-sm text-muted-foreground mt-1',
})