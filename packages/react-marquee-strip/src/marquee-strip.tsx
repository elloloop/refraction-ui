import * as React from 'react'
import {
  createMarqueeStrip,
  marqueeStripVariants,
  marqueeStripInnerClass,
  marqueeStripScrollOuterClass,
  marqueeStripScrollTrackClass,
  marqueeStripLabelClass,
  marqueeStripItemClass,
} from '@refraction-ui/marquee-strip'
import { cn } from '@refraction-ui/shared'

export interface MarqueeStripProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** Eyebrow label shown before the items. */
  label?: string
  /** List of text items to display. */
  items: string[]
  /**
   * When `true` the items scroll continuously using a CSS `marquee` keyframe.
   * The keyframe must be defined in the consuming app's global CSS:
   *
   * ```css
   * @keyframes marquee {
   *   from { transform: translateX(0); }
   *   to   { transform: translateX(-50%); }
   * }
   * ```
   *
   * @default false
   */
  scroll?: boolean
}

/**
 * MarqueeStrip — a full-width label + tag strip, optionally scrolling.
 *
 * Static mode (`scroll={false}`, default): items flex-wrap in a row after the
 * label. Scroll mode: items loop continuously via a CSS marquee animation;
 * items are duplicated once internally for a seamless loop. Logic and
 * data attributes come from the headless `@refraction-ui/marquee-strip` core.
 */
export const MarqueeStrip = React.forwardRef<HTMLDivElement, MarqueeStripProps>(
  ({ label, items, scroll = false, className, ...props }, ref) => {
    const api = createMarqueeStrip({ scroll })

    return (
      <div
        ref={ref}
        className={cn(marqueeStripVariants({ scroll: scroll ? 'true' : 'false' }), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {scroll ? (
          <div className={marqueeStripScrollOuterClass}>
            <div className={marqueeStripScrollTrackClass}>
              {[...items, ...items].map((item, index) => (
                <span key={index} className={marqueeStripItemClass}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className={marqueeStripInnerClass}>
            {label != null && (
              <span className={marqueeStripLabelClass}>{label}</span>
            )}
            {items.map((item, index) => (
              <span key={index} className={marqueeStripItemClass}>
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  },
)

MarqueeStrip.displayName = 'MarqueeStrip'
