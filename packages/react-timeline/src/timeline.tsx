import * as React from 'react'
import {
  createTimeline,
  getTimelineItemAria,
  resolveTimelineItems,
  timelineVariants,
  timelineItemVariants,
  timelineMarkerVariants,
  timelineConnectorVariants,
  timelineGutterClass,
  timelineTimeClass,
  timelineTitleClass,
  timelineDescriptionClass,
  timelineContentClass,
  type TimelineOrientation,
  type TimelineItemData,
  type TimelineItemStatus,
} from '@refraction-ui/timeline'
import { cn } from '@refraction-ui/shared'

export type { TimelineOrientation, TimelineItemData, TimelineItemStatus }

export interface TimelineItemProps {
  /** The normalised item data. */
  item: Required<TimelineItemData>
  /** Orientation inherited from the parent Timeline. */
  orientation: TimelineOrientation
  /** True when this is the last item (hides the trailing connector). */
  isLast: boolean
}

/** A single event entry inside a Timeline. */
export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ item, orientation, isLast }, ref) => {
    const itemAria = getTimelineItemAria()
    return (
      <li
        ref={ref}
        {...itemAria}
        className={timelineItemVariants({ orientation })}
        data-status={item.status}
      >
        {/* Gutter: marker dot + connector line */}
        <div className={timelineGutterClass}>
          <div className={timelineMarkerVariants({ status: item.status })} />
          {!isLast && (
            <div className={timelineConnectorVariants({ orientation })} />
          )}
        </div>

        {/* Content */}
        <div className={timelineContentClass}>
          {item.time && (
            <span className={timelineTimeClass}>{item.time}</span>
          )}
          <span className={timelineTitleClass}>{item.title}</span>
          {item.description && (
            <p className={timelineDescriptionClass}>{item.description}</p>
          )}
        </div>
      </li>
    )
  },
)

TimelineItem.displayName = 'TimelineItem'

export interface TimelineProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Ordered list of events to render. */
  items: TimelineItemData[]
  /** Layout direction. Defaults to `'vertical'`. */
  orientation?: TimelineOrientation
  /**
   * Optional render-prop override for a single item.
   * Receives the normalised item and its index; return a React node.
   */
  renderItem?: (
    item: Required<TimelineItemData>,
    index: number,
    isLast: boolean,
  ) => React.ReactNode
}

/**
 * Timeline — a time-ordered list of events with a marker rail.
 *
 * Renders `role="list"`; each item carries `role="listitem"`.
 * Supports vertical (default) and horizontal orientations.
 * Pass `renderItem` to take full control of individual entries.
 */
export const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ items, orientation = 'vertical', renderItem, className, ...props }, ref) => {
    const resolved = React.useMemo(() => resolveTimelineItems(items), [items])
    const api = createTimeline({ orientation })

    return (
      <ul
        ref={ref}
        className={cn(timelineVariants({ orientation }), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {resolved.map((item, index) => {
          const isLast = index === resolved.length - 1
          if (renderItem) {
            return (
              <React.Fragment key={item.id}>
                {renderItem(item, index, isLast)}
              </React.Fragment>
            )
          }
          return (
            <TimelineItem
              key={item.id}
              item={item}
              orientation={orientation}
              isLast={isLast}
            />
          )
        })}
      </ul>
    )
  },
)

Timeline.displayName = 'Timeline'
