import * as React from 'react'
import {
  createMediaFrame,
  type MediaFrameLabelPosition,
  type MediaFrameRatio,
  type MediaFrameTone,
} from '@refraction-ui/media-frame'
import { cn, devWarn } from '@refraction-ui/shared'

export type { MediaFrameLabelPosition, MediaFrameRatio, MediaFrameTone }

export interface MediaFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width ÷ height: a number, `"16:9"` or `"16/9"`. Defaults to square. */
  ratio?: MediaFrameRatio
  /** Optional corner caption, such as a format, size or timestamp. */
  label?: React.ReactNode
  /** Corner the caption sits in. Defaults to `top-start`. */
  labelPosition?: MediaFrameLabelPosition
  /** Letterbox surface behind the media. Defaults to `default`. */
  tone?: MediaFrameTone
}

/**
 * MediaFrame — a fixed-aspect box for rendered media on a letterbox surface,
 * with an optional corner caption. Children fill it however they choose; an
 * `absolute inset-0` image or video with `object-cover` / `object-contain` is
 * the usual fit.
 */
export const MediaFrame = React.forwardRef<HTMLDivElement, MediaFrameProps>(function MediaFrame(
  { ratio, label, labelPosition, tone, className, style, children, ...props },
  ref,
) {
  const api = createMediaFrame({ ratio, tone, labelPosition })
  if (!api.ratioValid) {
    devWarn(
      'react-media-frame/invalid-ratio',
      'MediaFrame could not use its ratio and fell back to a square. Pass a positive number, "w:h" or "w/h".',
      { ratio },
    )
  }
  const hasLabel = label != null && label !== false
  return (
    <div
      ref={ref}
      className={cn(api.rootClass, className)}
      style={{ aspectRatio: api.aspectRatio, ...style }}
      {...api.dataAttributes}
      {...props}
    >
      {children}
      {hasLabel && (
        <span data-slot="media-frame-label" className={api.labelClass}>
          {label}
        </span>
      )}
    </div>
  )
})
