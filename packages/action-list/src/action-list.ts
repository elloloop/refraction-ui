/** Row padding. */
export type ActionListDensity = 'default' | 'compact'

export interface ActionListItemProps {
  disabled?: boolean
  density?: ActionListDensity
}

export interface ActionListItemAPI {
  /** ARIA attributes for the row button. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic props for one ActionList row. Each row is ONE
 * action (open, select, go to) rendered as a native button, so it is reachable
 * by Tab and activated by Enter / Space — unlike a clickable table row.
 */
export function createActionListItem(props: ActionListItemProps = {}): ActionListItemAPI {
  const { disabled = false, density = 'default' } = props
  const dataAttributes: Record<string, string> = {
    'data-slot': 'action-list-item',
    'data-density': density,
  }
  if (disabled) dataAttributes['data-disabled'] = ''
  const ariaProps: Record<string, string | number | boolean> = {}
  if (disabled) ariaProps['aria-disabled'] = true
  return { ariaProps, dataAttributes }
}
