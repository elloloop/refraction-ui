/**
 * Browser behaviour of the Astro `ReactionBar`, driven entirely by the data
 * attributes the component renders: every string and class it applies was
 * resolved on the server, so custom strings survive a toggle.
 *
 * Events, dispatched on the bar and bubbling:
 * - `rfr-reaction-toggle` — `{ emoji, userReacted, count }` after a pill toggles.
 * - `rfr-reaction-add` — `{ trigger }`, the add button, to anchor a picker.
 */

import { getReactorsTooltipAlign } from '@refraction-ui/reaction-bar'

export interface ReactionToggleDetail {
  emoji: string
  userReacted: boolean
  count: number
}

export interface ReactionAddDetail {
  trigger: HTMLButtonElement
}

const BAR = '[data-rfr-reaction-bar]'
const INITIALIZED = 'data-rfr-rb-init'
const OPEN_TOOLTIP = `${BAR} [role="tooltip"]:not([hidden])`

function hideOpenTooltips(scope: ParentNode): void {
  scope.querySelectorAll<HTMLElement>(OPEN_TOOLTIP).forEach((tooltip) => {
    tooltip.hidden = true
  })
}

const documentsWithEscapeListener = new WeakSet<Document>()

/** Escape closes a hovered tooltip wherever focus is. Installed once per document. */
function installEscapeListener(doc: Document): void {
  if (documentsWithEscapeListener.has(doc)) return
  documentsWithEscapeListener.add(doc)
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideOpenTooltips(doc)
  })
}

function initPill(bar: HTMLElement, pill: HTMLButtonElement): void {
  pill.addEventListener('click', () => {
    const emoji = pill.dataset.rfrRbEmoji
    if (emoji === undefined) return
    const on = pill.getAttribute('aria-pressed') !== 'true'
    const state = on ? 'on' : 'off'
    const count = Number(pill.getAttribute(`data-rfr-rb-count-${state}`))

    pill.setAttribute('aria-pressed', String(on))
    pill.setAttribute('aria-label', pill.getAttribute(`data-rfr-rb-label-${state}`) ?? '')
    pill.className = pill.getAttribute(`data-rfr-rb-class-${state}`) ?? pill.className
    const countEl = pill.querySelector<HTMLElement>('[data-rfr-rb-count]')
    if (countEl) countEl.textContent = String(count)

    const detail: ReactionToggleDetail = { emoji, userReacted: on, count }
    bar.dispatchEvent(new CustomEvent('rfr-reaction-toggle', { detail, bubbles: true }))
  })
}

function initChip(bar: HTMLElement, chip: HTMLElement): void {
  const pill = chip.querySelector<HTMLButtonElement>('[data-rfr-rb-emoji]')
  const tooltip = chip.querySelector<HTMLElement>('[role="tooltip"]')
  if (!pill || !tooltip) return

  // Focus that follows a pointer press is not keyboard focus: it should not
  // open a tooltip on touch, where there is no hover to close it again.
  let pointerPressed = false
  const show = () => {
    hideOpenTooltips(bar)
    tooltip.hidden = false
    // Line it up with whichever pill edge keeps it on screen.
    tooltip.dataset.align = getReactorsTooltipAlign({
      anchor: chip.getBoundingClientRect(),
      tooltipWidth: tooltip.getBoundingClientRect().width,
      viewportWidth: chip.ownerDocument.documentElement.clientWidth,
      direction: getComputedStyle(chip).direction === 'rtl' ? 'rtl' : 'ltr',
    })
  }
  const hide = () => {
    tooltip.hidden = true
  }

  chip.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') show()
  })
  chip.addEventListener('pointerleave', hide)
  pill.addEventListener('pointerdown', () => {
    pointerPressed = true
  })
  pill.addEventListener('focus', () => {
    if (!pointerPressed) show()
    pointerPressed = false
  })
  pill.addEventListener('blur', () => {
    pointerPressed = false
    hide()
  })
  pill.addEventListener('keydown', (event) => {
    // Escape belongs to the open tooltip first, not to an enclosing dialog.
    if (event.key === 'Escape' && !tooltip.hidden) {
      event.stopPropagation()
      hide()
    }
  })
}

function initOverflow(bar: HTMLElement, button: HTMLButtonElement): void {
  button.addEventListener('click', () => {
    const expand = button.getAttribute('aria-expanded') !== 'true'
    const state = expand ? 'less' : 'more'
    bar.querySelectorAll<HTMLElement>('[data-rfr-rb-overflow-item]').forEach((item) => {
      item.hidden = !expand
    })
    button.setAttribute('aria-expanded', String(expand))
    button.setAttribute('aria-label', button.getAttribute(`data-rfr-rb-${state}-label`) ?? '')
    button.textContent = button.getAttribute(`data-rfr-rb-${state}-text`) ?? ''
  })
}

function initAdd(bar: HTMLElement, button: HTMLButtonElement): void {
  button.addEventListener('click', () => {
    const detail: ReactionAddDetail = { trigger: button }
    bar.dispatchEvent(new CustomEvent('rfr-reaction-add', { detail, bubbles: true }))
  })
}

/** Wire one rendered bar. Safe to call again: a bar is wired once. */
export function initReactionBar(bar: HTMLElement): void {
  if (bar.hasAttribute(INITIALIZED)) return
  bar.setAttribute(INITIALIZED, '')
  installEscapeListener(bar.ownerDocument)

  bar.querySelectorAll<HTMLButtonElement>('[data-rfr-rb-emoji]').forEach((pill) => initPill(bar, pill))
  bar.querySelectorAll<HTMLElement>('[data-rfr-rb-chip]').forEach((chip) => initChip(bar, chip))
  const overflow = bar.querySelector<HTMLButtonElement>('[data-rfr-rb-overflow]')
  if (overflow) initOverflow(bar, overflow)
  const add = bar.querySelector<HTMLButtonElement>('[data-rfr-rb-add]')
  if (add) initAdd(bar, add)
}

/** Wire every bar under `scope`. */
export function initReactionBars(scope: ParentNode): void {
  scope.querySelectorAll<HTMLElement>(BAR).forEach(initReactionBar)
}
