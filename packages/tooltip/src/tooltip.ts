import type { AccessibilityProps, Side } from '@elloloop/shared'
import { generateId } from '@elloloop/shared'

export interface TooltipProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: Side
  delayDuration?: number
}

export interface TooltipAPI {
  /** Current open state */
  state: { open: boolean }
  /** Props to spread on the trigger element */
  triggerProps: Partial<AccessibilityProps> & {
    'aria-describedby': string
  }
  /** Props to spread on the content element */
  contentProps: {
    role: 'tooltip'
    id: string
  }
  /** Resolved placement */
  placement: Side
  /** Open the tooltip */
  open: () => void
  /** Close the tooltip (and clear any pending delay) */
  close: () => void
  /** Open with delay */
  openWithDelay: () => void
  /** The configured delay duration */
  delayDuration: number
  /** Cancel any pending delay timer */
  cancelDelay: () => void
}

export function createTooltip(props: TooltipProps = {}): TooltipAPI {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    placement = 'top',
    delayDuration = 300,
  } = props

  const contentId = generateId('rfr-tooltip')

  let isOpen = controlledOpen ?? defaultOpen
  let delayTimer: ReturnType<typeof setTimeout> | null = null

  const state = { open: isOpen }

  function setOpen(value: boolean) {
    isOpen = value
    state.open = value
    onOpenChange?.(value)
  }

  function cancelDelay() {
    if (delayTimer !== null) {
      clearTimeout(delayTimer)
      delayTimer = null
    }
  }

  function open() {
    cancelDelay()
    setOpen(true)
  }

  function close() {
    cancelDelay()
    setOpen(false)
  }

  function openWithDelay() {
    cancelDelay()
    if (delayDuration <= 0) {
      setOpen(true)
      return
    }
    delayTimer = setTimeout(() => {
      setOpen(true)
      delayTimer = null
    }, delayDuration)
  }

  const triggerProps = {
    'aria-describedby': contentId,
  }

  const contentProps = {
    role: 'tooltip' as const,
    id: contentId,
  }

  return {
    state,
    triggerProps,
    contentProps,
    placement,
    open,
    close,
    openWithDelay,
    delayDuration,
    cancelDelay,
  }
}
