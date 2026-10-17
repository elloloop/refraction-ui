import type * as React from 'react'
import { moveCallControlsFocus } from '@refraction-ui/call-controls'

/** Marks the "More controls" panel, whose rows move with the up and down arrows instead. */
export const PANEL_ATTRIBUTE = 'data-call-controls-panel'

function isShown(element: HTMLElement): boolean {
  // A control hidden by the collapse rule must not take focus.
  return typeof element.checkVisibility === 'function' ? element.checkVisibility() : true
}

/** The toolbar's buttons that the arrow keys move between, in DOM order. */
export function toolbarButtons(toolbar: HTMLElement): HTMLElement[] {
  return Array.from(toolbar.querySelectorAll<HTMLElement>('button')).filter(
    (button) => !button.closest(`[${PANEL_ATTRIBUTE}]`) && !button.hasAttribute('disabled') && isShown(button),
  )
}

/**
 * Arrow-key movement between a toolbar's buttons (left/right, Home, End),
 * following the toolbar's writing direction. Every button keeps its own tab
 * stop; the arrows are a shortcut on top. Keys from anything that is not one
 * of the toolbar's own buttons — a text field, a portalled menu, the "More
 * controls" panel — are left alone.
 */
export function handleToolbarArrowKeys(event: React.KeyboardEvent<HTMLElement>): void {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
  const toolbar = event.currentTarget
  const target = event.target
  if (!(target instanceof HTMLElement) || target.tagName !== 'BUTTON' || !toolbar.contains(target)) return
  const buttons = toolbarButtons(toolbar)
  const current = buttons.indexOf(target)
  if (current < 0) return
  const rtl = getComputedStyle(toolbar).direction === 'rtl'
  const next = moveCallControlsFocus(current, buttons.length, event.key, { rtl })
  if (next === null) return
  event.preventDefault()
  buttons[next]?.focus()
}
