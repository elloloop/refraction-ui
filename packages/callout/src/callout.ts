import type { AccessibilityProps } from '@refraction-ui/shared'

export interface CalloutProps {
  /** Optional accessible role override */
  role?: string
}

export interface CalloutAPI {
  ariaProps: Partial<AccessibilityProps>
  dataAttributes: Record<string, string>
}

export function createCallout(props: CalloutProps = {}): CalloutAPI {
  const ariaProps: Partial<AccessibilityProps> = {}
  
  // Callouts are usually alert or region depending on severity
  if (props.role) {
    ariaProps.role = props.role
  } else {
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