import * as React from 'react'
import {
  createContentProtection,
  contentProtectionVariants,
  watermarkVariants,
  type ContentProtectionProps as CoreContentProtectionProps,
} from '@refraction-ui/content-protection'
import { cn } from '@refraction-ui/shared'

export interface ContentProtectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable content protection. Default: true */
  enabled?: boolean
  /** Disable copy/cut. Default: true */
  disableCopy?: boolean
  /** Disable right-click context menu. Default: true */
  disableContextMenu?: boolean
  /** Watermark text overlay */
  watermarkText?: string
}

/**
 * ContentProtection component — wraps children to block copy/context menu
 * and optionally renders a watermark overlay.
 *
 * Uses the headless @refraction-ui/content-protection core for event handlers.
 */
export const ContentProtection = React.forwardRef<HTMLDivElement, ContentProtectionProps>(
  (
    {
      enabled,
      disableCopy,
      disableContextMenu,
      watermarkText,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const api = createContentProtection({
      enabled,
      disableCopy,
      disableContextMenu,
      watermarkText,
    })

    const classes = cn(contentProtectionVariants(), className)

    return (
      <div
        ref={ref}
        className={classes}
        {...api.dataAttributes}
        onCopy={api.eventHandlers.onCopy as React.ClipboardEventHandler}
        onCut={api.eventHandlers.onCut as React.ClipboardEventHandler}
        onContextMenu={api.eventHandlers.onContextMenu as React.MouseEventHandler}
        onSelect={api.eventHandlers.onSelectStart as React.ReactEventHandler}
        {...props}
      >
        {children}
        {api.watermarkConfig && (
          <div
            className={watermarkVariants()}
            aria-hidden="true"
            style={{
              opacity: api.watermarkConfig.opacity,
              transform: `rotate(${api.watermarkConfig.angle}deg)`,
              backgroundImage: `repeating-linear-gradient(
                ${api.watermarkConfig.angle}deg,
                transparent,
                transparent 80px,
                currentColor 80px,
                currentColor 80px
              )`,
            }}
          >
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="rfr-watermark"
                  x="0"
                  y="0"
                  width="200"
                  height="200"
                  patternUnits="userSpaceOnUse"
                  patternTransform={`rotate(${api.watermarkConfig.angle})`}
                >
                  <text
                    x="0"
                    y="100"
                    fill="currentColor"
                    fontSize="16"
                    fontFamily="sans-serif"
                  >
                    {api.watermarkConfig.text}
                  </text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#rfr-watermark)" />
            </svg>
          </div>
        )}
      </div>
    )
  },
)

ContentProtection.displayName = 'ContentProtection'
