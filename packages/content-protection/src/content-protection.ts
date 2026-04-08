export interface ContentProtectionProps {
  /** Enable content protection. Default: true */
  enabled?: boolean
  /** Disable copy/cut. Default: true */
  disableCopy?: boolean
  /** Disable right-click context menu. Default: true */
  disableContextMenu?: boolean
  /** Watermark text overlay */
  watermarkText?: string
}

export interface WatermarkConfig {
  text: string
  opacity: number
  angle: number
}

export interface ContentProtectionAPI {
  eventHandlers: {
    onCopy?: (e: { preventDefault(): void }) => void
    onCut?: (e: { preventDefault(): void }) => void
    onContextMenu?: (e: { preventDefault(): void }) => void
    onSelectStart?: (e: { preventDefault(): void }) => void
  }
  watermarkConfig: WatermarkConfig | null
  dataAttributes: Record<string, string>
}

export function createContentProtection(
  props: ContentProtectionProps = {},
): ContentProtectionAPI {
  const {
    enabled = true,
    disableCopy = true,
    disableContextMenu = true,
    watermarkText,
  } = props

  const eventHandlers: ContentProtectionAPI['eventHandlers'] = {}

  if (enabled) {
    if (disableCopy) {
      const prevent = (e: { preventDefault(): void }) => e.preventDefault()
      eventHandlers.onCopy = prevent
      eventHandlers.onCut = prevent
      eventHandlers.onSelectStart = prevent
    }
    if (disableContextMenu) {
      eventHandlers.onContextMenu = (e: { preventDefault(): void }) =>
        e.preventDefault()
    }
  }

  const watermarkConfig: WatermarkConfig | null = watermarkText
    ? { text: watermarkText, opacity: 0.08, angle: -45 }
    : null

  const dataAttributes: Record<string, string> = {}
  if (enabled) {
    dataAttributes['data-protected'] = 'true'
  }

  return {
    eventHandlers,
    watermarkConfig,
    dataAttributes,
  }
}
