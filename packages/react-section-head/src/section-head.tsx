import * as React from 'react'
import {
  createSectionHead,
  sectionHeadVariants,
  sectionHeadKickerClass,
  sectionHeadTitleClass,
  sectionHeadLedeClass,
  type SectionHeadAlign,
} from '@refraction-ui/section-head'
import { cn } from '@refraction-ui/shared'

export type { SectionHeadAlign }

export interface SectionHeadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional eyebrow / kicker rendered above the title. */
  kicker?: React.ReactNode
  /** Primary heading content (required). */
  title: React.ReactNode
  /** Optional lede paragraph rendered below the title. */
  lede?: React.ReactNode
  /** Horizontal alignment of the cluster. */
  align?: SectionHeadAlign
  /** Override the heading element rendered for the title. Defaults to `h2`. */
  as?: 'h1' | 'h2' | 'h3'
}

/**
 * SectionHead — marketing section heading cluster.
 *
 * Renders an optional small-caps kicker above an `<h2>` title (configurable
 * via `as`) with an optional lede paragraph below. Alignment is controlled via
 * the `align` prop; layout classes come from the headless
 * `@refraction-ui/section-head` core.
 */
export const SectionHead = React.forwardRef<HTMLDivElement, SectionHeadProps>(
  (
    {
      kicker,
      title,
      lede,
      align = 'center',
      as: Tag = 'h2',
      className,
      ...props
    },
    ref,
  ) => {
    const { dataAttributes } = createSectionHead({ align })

    return (
      <div
        ref={ref}
        className={cn(sectionHeadVariants({ align }), className)}
        {...dataAttributes}
        {...props}
      >
        {kicker != null && (
          <p className={sectionHeadKickerClass}>{kicker}</p>
        )}
        <Tag className={sectionHeadTitleClass}>{title}</Tag>
        {lede != null && (
          <p className={sectionHeadLedeClass}>{lede}</p>
        )}
      </div>
    )
  },
)

SectionHead.displayName = 'SectionHead'
