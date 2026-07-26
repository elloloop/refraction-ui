import * as React from 'react'
import { cn, devWarn } from '@refraction-ui/shared'
import {
  createCarousel,
  isItemOpen,
  type CarouselAPI,
  type CarouselState,
} from '@refraction-ui/carousel'

const CarouselContext = React.createContext<{
  state: CarouselState
  toggleItem: CarouselAPI['toggleItem']
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
    // The headless core owns the open/closed state machine; it is created once
    // and props are synced into it below.
    const apiRef = React.useRef<CarouselAPI | null>(null)
    if (apiRef.current === null) {
      apiRef.current = createCarousel({ type, collapsible, defaultValue, value: controlledValue, onValueChange })
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
      <CarouselContext.Provider value={{ state, toggleItem: api.toggleItem }}>
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
    if (!context) {
      devWarn(
        'react-carousel/carousel-item-outside-carousel',
        'CarouselItem was rendered outside of <Carousel>. Wrap it in <Carousel>.',
      )
      throw new Error('CarouselItem must be within Carousel')
    }

    const isOpen = isItemOpen(context.state, value)

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

    if (!carouselContext || !itemContext) {
      devWarn(
        'react-carousel/carousel-trigger-outside-item',
        'CarouselTrigger was rendered outside of a <CarouselItem> within <Carousel>. Nest it inside <CarouselItem>.',
      )
      throw new Error('CarouselTrigger missing context')
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
          onClick={() => carouselContext.toggleItem(itemContext.value)}
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
    if (!itemContext) {
      devWarn(
        'react-carousel/carousel-content-outside-item',
        'CarouselContent was rendered outside of a <CarouselItem> within <Carousel>. Nest it inside <CarouselItem>.',
      )
      throw new Error('CarouselContent missing context')
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
CarouselContent.displayName = 'CarouselContent'
