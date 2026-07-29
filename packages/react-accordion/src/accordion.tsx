import * as React from 'react'
import { cn, devWarn } from '@refraction-ui/shared'
import {
  createAccordion,
  isItemOpen,
  type AccordionAPI,
  type AccordionState,
} from '@refraction-ui/accordion'

const AccordionContext = React.createContext<{
  state: AccordionState
  toggleItem: AccordionAPI['toggleItem']
} | null>(null)

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  type?: 'single' | 'multiple'
  collapsible?: boolean
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion({ className, type = 'single', collapsible, value: controlledValue, defaultValue, onValueChange, ...props }, ref) {
    // The headless core owns the open/closed state machine; it is created once
    // and props are synced into it below.
    const apiRef = React.useRef<AccordionAPI | null>(null)
    if (apiRef.current === null) {
      apiRef.current = createAccordion({ type, collapsible, defaultValue, value: controlledValue, onValueChange })
    }
    const api = apiRef.current

    const state = React.useSyncExternalStore(api.subscribe, api.getState, api.getState)

    React.useEffect(() => {
      api.setOptions({ type, collapsible, onValueChange })
    })
    React.useEffect(() => {
      if (controlledValue !== undefined) api.setValue(controlledValue)
    }, [api, controlledValue])

    return (
      <AccordionContext.Provider value={{ state, toggleItem: api.toggleItem }}>
        <div ref={ref} className={cn("flex flex-col w-full", className)} {...props} />
      </AccordionContext.Provider>
    )
  }
)

const AccordionItemContext = React.createContext<{ value: string; isOpen: boolean } | null>(null)

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ className, value, ...props }, ref) {
    const context = React.useContext(AccordionContext)
    if (!context) {
      devWarn(
        'react-accordion/item-outside-accordion',
        '<AccordionItem> must be rendered inside an <Accordion>. The missing AccordionContext makes this throw.',
      )
      throw new Error('AccordionItem must be within Accordion')
    }

    const isOpen = isItemOpen(context.state, value)

    return (
      <AccordionItemContext.Provider value={{ value, isOpen }}>
        <div ref={ref} className={cn("border-b border-border", className)} data-state={isOpen ? 'open' : 'closed'} {...props} />
      </AccordionItemContext.Provider>
    )
  }
)

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ className, children, ...props }, ref) {
    const accordionContext = React.useContext(AccordionContext)
    const itemContext = React.useContext(AccordionItemContext)

    if (!accordionContext || !itemContext) {
      devWarn(
        'react-accordion/trigger-missing-context',
        '<AccordionTrigger> must be rendered inside an <AccordionItem> within an <Accordion>. The missing AccordionContext/AccordionItemContext makes this throw.',
      )
      throw new Error('AccordionTrigger missing context')
    }

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
          onClick={() => accordionContext.toggleItem(itemContext.value)}
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

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, children, ...props }, ref) {
    const itemContext = React.useContext(AccordionItemContext)
    if (!itemContext) {
      devWarn(
        'react-accordion/content-missing-context',
        '<AccordionContent> must be rendered inside an <AccordionItem>. The missing AccordionItemContext makes this throw.',
      )
      throw new Error('AccordionContent missing context')
    }

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
