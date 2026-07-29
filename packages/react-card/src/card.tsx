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

/**
 * Card -- a container with rounded corners, border, and shadow.
 */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...props }, ref) {
    const api = createCard()
    return (
      <div
        ref={ref}
        className={cn(cardVariants(), className)}
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
