import * as React from 'react'
import { cn } from '@refraction-ui/shared'

const AccordionContext = React.createContext<{
  type: 'single' | 'multiple'
  value: string | string[]
  onValueChange: (value: string) => void
} | null>(null)

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  type?: 'single' | 'multiple'
  collapsible?: boolean
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
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
      <AccordionContext.Provider value={{ type, value, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("flex flex-col w-full", className)} {...props} />
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = 'Accordion'

const AccordionItemContext = React.createContext<{ value: string; isOpen: boolean } | null>(null)

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    if (!context) throw new Error('AccordionItem must be within Accordion')

    const isOpen = context.type === 'single'
      ? context.value === value
      : Array.isArray(context.value) && context.value.includes(value)

    return (
      <AccordionItemContext.Provider value={{ value, isOpen }}>
        <div ref={ref} className={cn("border-b border-border", className)} data-state={isOpen ? 'open' : 'closed'} {...props} />
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = 'AccordionItem'

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const accordionContext = React.useContext(AccordionContext)
    const itemContext = React.useContext(AccordionItemContext)
    
    if (!accordionContext || !itemContext) throw new Error('AccordionTrigger missing context')

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
          onClick={() => accordionContext.onValueChange(itemContext.value)}
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
AccordionTrigger.displayName = 'AccordionTrigger'

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const itemContext = React.useContext(AccordionItemContext)
    if (!itemContext) throw new Error('AccordionContent missing context')

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
AccordionContent.displayName = 'AccordionContent'
