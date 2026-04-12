import * as React from 'react'
import { cn } from '@refraction-ui/shared'

const CarouselContext = React.createContext<{
  type: 'single' | 'multiple'
  value: string | string[]
  onValueChange: (value: string) => void
} | null>(null)

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  type?: 'single' | 'multiple'
  collapsible?: boolean
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, type = 'single', collapsible, value: controlledValue, defaultValue, onValueChange, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
      defaultValue ?? (type === 'multiple' ? [] : '')
    )

    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue

    const handleValueChange = React.useCallback(
      (itemValue: string) => {
        if (type === 'single') {
          const newValue = value === itemValue && collapsible ? '' : itemValue
          setUncontrolledValue(newValue)
          onValueChange?.(newValue)
        } else {
          const arrValue = Array.isArray(value) ? value : []
          const newValue = arrValue.includes(itemValue)
            ? arrValue.filter((v) => v !== itemValue)
            : [...arrValue, itemValue]
          setUncontrolledValue(newValue)
          onValueChange?.(newValue)
        }
      },
      [type, collapsible, value, onValueChange]
    )

    return (
      <CarouselContext.Provider value={{ type, value, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("flex flex-col w-full", className)} {...props} />
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = 'Carousel'

const CarouselItemContext = React.createContext<{ value: string; isOpen: boolean } | null>(null)

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(CarouselContext)
    if (!context) throw new Error('CarouselItem must be within Carousel')

    const isOpen = context.type === 'single'
      ? context.value === value
      : Array.isArray(context.value) && context.value.includes(value)

    return (
      <CarouselItemContext.Provider value={{ value, isOpen }}>
        <div ref={ref} className={cn("border-b border-border", className)} data-state={isOpen ? 'open' : 'closed'} {...props} />
      </CarouselItemContext.Provider>
    )
  }
)
CarouselItem.displayName = 'CarouselItem'

export interface CarouselTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CarouselTrigger = React.forwardRef<HTMLButtonElement, CarouselTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const carouselContext = React.useContext(CarouselContext)
    const itemContext = React.useContext(CarouselItemContext)
    
    if (!carouselContext || !itemContext) throw new Error('CarouselTrigger missing context')

    return (
      <h3 className="flex m-0 p-0">
        <button
          ref={ref}
          type="button"
          aria-expanded={itemContext.isOpen}
          className={cn(
            "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
            className
          )}
          data-state={itemContext.isOpen ? 'open' : 'closed'}
          onClick={() => carouselContext.onValueChange(itemContext.value)}
          {...props}
        >
          {children}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </h3>
    )
  }
)
CarouselTrigger.displayName = 'CarouselTrigger'

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, ...props }, ref) => {
    const itemContext = React.useContext(CarouselItemContext)
    if (!itemContext) throw new Error('CarouselContent missing context')

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm",
          className
        )}
        data-state={itemContext.isOpen ? 'open' : 'closed'}
        hidden={!itemContext.isOpen}
        {...props}
      >
        <div className="pb-4 pt-0 text-muted-foreground leading-relaxed">{children}</div>
      </div>
    )
  }
)
CarouselContent.displayName = 'CarouselContent'
