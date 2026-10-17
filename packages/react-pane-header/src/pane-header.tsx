import * as React from 'react'
import {
  createPaneHeader,
  paneHeaderClass,
  paneHeaderLeadingClass,
  paneHeaderTitleBlockVariants,
  paneHeaderHeadingClass,
  paneHeaderAvatarClass,
  paneHeaderTextClass,
  paneHeaderTitleClass,
  paneHeaderSubtitleClass,
  paneHeaderHintClass,
  paneHeaderActionsClass,
  paneHeaderHeightStyle as corePaneHeaderHeightStyle,
  type PaneHeaderHeadingLevel,
  type PaneHeaderHeight,
  type PaneHeaderIds,
} from '@refraction-ui/pane-header'
import { cn } from '@refraction-ui/shared'

export type { PaneHeaderHeadingLevel, PaneHeaderHeight }

export interface PaneHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The pane title. Truncates on one line when space runs out. */
  title: React.ReactNode
  /** Secondary line under the title (presence, member count…). Truncates. */
  subtitle?: React.ReactNode
  /** Leading control, typically a back button. Never shrinks. */
  leading?: React.ReactNode
  /** Avatar shown before the title; part of the title button when `onTitleTap` is set. */
  avatar?: React.ReactNode
  /** Trailing actions (icon buttons, menus). Never shrink. */
  actions?: React.ReactNode
  /** Makes avatar + title + subtitle one button (e.g. "open details"). */
  onTitleTap?: () => void
  /** Visually hidden description for the title button, e.g. "Show contact details". */
  titleTapHint?: string
  /**
   * Header height: a CSS length, or a number of pixels. Omit it to inherit the
   * shared `--pane-header-height` (default `3.5rem`) so neighbouring panes match.
   */
  height?: PaneHeaderHeight
  /** Heading level for the title (1–6). Defaults to 2. */
  headingLevel?: PaneHeaderHeadingLevel
}

/**
 * Style that shares one header height across side-by-side panes: spread it on
 * the split-view container, `<div style={paneHeaderHeightStyle('4rem')}>`, and
 * every PaneHeader inside inherits it. Typed for React's `style` prop.
 */
export function paneHeaderHeightStyle(height: PaneHeaderHeight | undefined): React.CSSProperties {
  // CSSProperties does not type CSS custom properties; the core returns only one.
  return corePaneHeaderHeightStyle(height) as React.CSSProperties
}

interface TitleContentProps {
  ids: PaneHeaderIds
  title: React.ReactNode
  subtitle: React.ReactNode
  hint?: string
}

/** Title + subtitle (+ hint) as phrasing content, valid inside the title button. */
function InteractiveTitleText({ ids, title, subtitle, hint }: TitleContentProps) {
  return (
    <span className={paneHeaderTextClass}>
      <span id={ids.titleId} className={paneHeaderTitleClass}>
        {title}
      </span>
      {subtitle != null && (
        <span id={ids.subtitleId} className={paneHeaderSubtitleClass}>
          {subtitle}
        </span>
      )}
      {hint && (
        <span id={ids.hintId} className={paneHeaderHintClass}>
          {hint}
        </span>
      )}
    </span>
  )
}

/**
 * PaneHeader — the fixed-height bar across the top of one pane of a split view:
 * an optional leading (back) control, avatar, title with subtitle, and trailing
 * actions. Every header reads the shared `--pane-header-height` custom property
 * so the rule under side-by-side panes runs straight across.
 *
 * Renders a `<header>` with no explicit role: inside a pane's sectioning
 * element (`<section>`, `<aside>`, `<main>`…) it is a plain group, so several
 * panes never produce several `banner` landmarks. The title is a real heading
 * (`headingLevel`, default 2). With `onTitleTap` the avatar + title + subtitle
 * become one `<button>` inside the heading — never a button nested in another
 * control — named by the title and described by the subtitle.
 */
export const PaneHeader = React.forwardRef<HTMLElement, PaneHeaderProps>(function PaneHeader(
  {
    title,
    subtitle,
    leading,
    avatar,
    actions,
    onTitleTap,
    titleTapHint,
    height,
    headingLevel,
    id,
    className,
    style,
    ...props
  },
  ref,
) {
  const generatedId = React.useId()
  const interactive = onTitleTap != null
  const api = createPaneHeader({
    baseId: id ?? generatedId,
    height,
    headingLevel,
    interactive,
    hasSubtitle: subtitle != null,
    hasHint: Boolean(titleTapHint),
  })
  const Heading = api.headingTag
  const { ids } = api
  const avatarSlot = avatar != null && <span className={paneHeaderAvatarClass}>{avatar}</span>

  return (
    <header
      ref={ref}
      id={id}
      className={cn(paneHeaderClass, className)}
      // The core's style carries the CSS custom property, which CSSProperties does not type.
      style={{ ...(api.style as React.CSSProperties), ...style }}
      {...api.dataAttributes}
      {...props}
    >
      {leading != null && <div className={paneHeaderLeadingClass}>{leading}</div>}

      {interactive ? (
        <Heading className={paneHeaderHeadingClass}>
          <button
            type="button"
            className={paneHeaderTitleBlockVariants({ interactive: 'true' })}
            onClick={onTitleTap}
            {...api.titleButtonAriaProps}
          >
            {avatarSlot}
            <InteractiveTitleText ids={ids} title={title} subtitle={subtitle} hint={titleTapHint} />
          </button>
        </Heading>
      ) : (
        <div className={paneHeaderTitleBlockVariants({ interactive: 'false' })}>
          {avatarSlot}
          <div className={paneHeaderTextClass}>
            <Heading id={ids.titleId} className={paneHeaderTitleClass}>
              {title}
            </Heading>
            {subtitle != null && (
              <p id={ids.subtitleId} className={paneHeaderSubtitleClass}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {actions != null && <div className={paneHeaderActionsClass}>{actions}</div>}
    </header>
  )
})
