import type { AccessibilityProps } from '@refraction-ui/shared'

export interface CardProps {
  /** Optional accessible role override */
  role?: string
}

export interface CardAPI {
  /** ARIA attributes to spread on the element */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
}

export function createCard(props: CardProps = {}): CardAPI {
  const ariaProps: Partial<AccessibilityProps> = {}
  if (props.role) {
    ariaProps.role = props.role
  }

  return {
    ariaProps,
    dataAttributes: { 'data-slot': 'card' },
  }
}

export function createCardHeader(): { dataAttributes: Record<string, string> } {
  return { dataAttributes: { 'data-slot': 'card-header' } }
}

export function createCardTitle(): { dataAttributes: Record<string, string> } {
  return { dataAttributes: { 'data-slot': 'card-title' } }
}

export function createCardDescription(): { dataAttributes: Record<string, string> } {
  return { dataAttributes: { 'data-slot': 'card-description' } }
}

export function createCardContent(): { dataAttributes: Record<string, string> } {
  return { dataAttributes: { 'data-slot': 'card-content' } }
}

export function createCardFooter(): { dataAttributes: Record<string, string> } {
  return { dataAttributes: { 'data-slot': 'card-footer' } }
}
