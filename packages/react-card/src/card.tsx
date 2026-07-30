import * as React from 'react'
import {
  createCard,
  createCardHeader,
  createCardTitle,
  createCardDescription,
  createCardContent,
  createCardFooter,
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardContentVariants,
  cardFooterVariants,
} from '@refraction-ui/card'
import { cn } from '@refraction-ui/shared'
import { Slot } from '@refraction-ui/react-slot'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Merge the card's classes/props onto the single child element instead of
   * rendering a `<div>` (Radix-style `asChild`) — e.g.
   * `<Card asChild><a href="/x">…</a></Card>` for a clickable card. Expects
   * exactly one React element child. */
  asChild?: boolean
}

/**
 * Card -- a container with rounded corners, border, and shadow.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  function Card({ className, asChild = false, ...props }, ref) {
    const api = createCard()
    const classes = cn(cardVariants(), className)

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={classes}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={classes}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)

/**
 * CardHeader -- top section of a card, typically contains title and description.
 */
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    const api = createCardHeader()
    return (
      <div
        ref={ref}
        className={cn(cardHeaderVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)

/**
 * CardTitle -- heading within a card header.
 */
export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    const api = createCardTitle()
    return (
      <h3
        ref={ref}
        className={cn(cardTitleVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)

/**
 * CardDescription -- subtext within a card header.
 */
export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    const api = createCardDescription()
    return (
      <p
        ref={ref}
        className={cn(cardDescriptionVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)

/**
 * CardContent -- main body content area of a card.
 */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    const api = createCardContent()
    return (
      <div
        ref={ref}
        className={cn(cardContentVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)

/**
 * CardFooter -- bottom section of a card, typically contains actions.
 */
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    const api = createCardFooter()
    return (
      <div
        ref={ref}
        className={cn(cardFooterVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
