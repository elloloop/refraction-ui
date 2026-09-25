import * as React from 'react'
import {
  createPageHeader,
  pageHeaderClass,
  pageHeaderTextClass,
  pageHeaderKickerClass,
  pageHeaderTitleClass,
  pageHeaderDescriptionClass,
  pageHeaderActionsClass,
  type PageHeaderTitleLevel,
} from '@refraction-ui/page-header'
import { cn } from '@refraction-ui/shared'

export type { PageHeaderTitleLevel }

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Optional eyebrow rendered above the title. */
  kicker?: React.ReactNode
  /** The page title (required). */
  title: React.ReactNode
  /** Optional supporting copy under the title. */
  description?: React.ReactNode
  /** Optional actions (buttons, menus) on the trailing edge. */
  actions?: React.ReactNode
  /** Heading element for the title. Defaults to `h1`. */
  as?: PageHeaderTitleLevel
}

/**
 * PageHeader — the heading cluster at the top of an application page: kicker,
 * title, description and a trailing actions row. Renders a `<header>`.
 */
export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { kicker, title, description, actions, as: Title = 'h1', className, ...props },
  ref,
) {
  const { dataAttributes } = createPageHeader({ hasActions: actions != null })
  return (
    <header ref={ref} className={cn(pageHeaderClass, className)} {...dataAttributes} {...props}>
      <div className={pageHeaderTextClass}>
        {kicker != null && <p className={pageHeaderKickerClass}>{kicker}</p>}
        <Title className={pageHeaderTitleClass}>{title}</Title>
        {description != null && <div className={pageHeaderDescriptionClass}>{description}</div>}
      </div>
      {actions != null && <div className={pageHeaderActionsClass}>{actions}</div>}
    </header>
  )
})
