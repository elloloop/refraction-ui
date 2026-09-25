import type { AccessibilityProps } from '@refraction-ui/shared'

export interface CalloutProps {
  /** Explicit role; always wins. */
  role?: string
  /** Destructive callouts are announced (`role="alert"`). */
  destructive?: boolean
  /**
   * Whether the callout has an accessible name (`aria-label` /
   * `aria-labelledby`). Only a named callout becomes a `region` landmark — an
   * unnamed region is an axe violation and landmark noise.
   */
  labelled?: boolean
}

export interface CalloutAPI {
  ariaProps: Partial<AccessibilityProps>
  dataAttributes: Record<string, string>
}

export function createCallout(props: CalloutProps = {}): CalloutAPI {
  const ariaProps: Partial<AccessibilityProps> = {}
  
  if (props.role) {
    ariaProps.role = props.role
  } else if (props.destructive) {
    ariaProps.role = 'alert'
  } else if (props.labelled) {
    ariaProps.role = 'region'
  }

  return {
    ariaProps,
    dataAttributes: { 'data-slot': 'callout' },
  }
}

export function createCalloutIcon(): { dataAttributes: Record<string, string> } {
  return { dataAttributes: { 'data-slot': 'callout-icon' } }
}

export function createCalloutContent(): { dataAttributes: Record<string, string> } {
  return { dataAttributes: { 'data-slot': 'callout-content' } }
}

export function createCalloutTitle(): { dataAttributes: Record<string, string> } {
  return { dataAttributes: { 'data-slot': 'callout-title' } }
}

export function createCalloutDescription(): { dataAttributes: Record<string, string> } {
  return { dataAttributes: { 'data-slot': 'callout-description' } }
}