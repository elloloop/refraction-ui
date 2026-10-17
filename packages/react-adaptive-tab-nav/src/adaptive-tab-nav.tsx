import * as React from 'react'
import {
  adaptiveTabNavItemVariants,
  adaptiveTabNavVariants,
  createAdaptiveTabNav,
  type AdaptiveTabNavEntry,
} from '@refraction-ui/adaptive-tab-nav'
import { cn, devWarn } from '@refraction-ui/shared'

export interface AdaptiveTabNavItem<Id extends string = string> extends AdaptiveTabNavEntry<Id> {
  /** Drawn before the label (above it when docked); hidden from assistive tech, as the label names the tab. */
  icon?: React.ReactNode
}

export interface AdaptiveTabNavProps<Id extends string = string>
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** The sections, in order. Ids must be unique. */
  items: readonly AdaptiveTabNavItem<Id>[]
  /** The section on screen, or `null` when the page belongs to none. */
  active: Id | null
  /**
   * Called with the chosen tab's id. The caller navigates, so a client-side
   * router can keep the page alive instead of reloading it.
   */
  onSelect: (id: Id) => void
}

function AdaptiveTabNavInner<Id extends string>(
  { items, active, onSelect, className, ...props }: AdaptiveTabNavProps<Id>,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const api = createAdaptiveTabNav(items, active)
  if (api.duplicateIds.length > 0) {
    devWarn(
      'react-adaptive-tab-nav/duplicate-id',
      'AdaptiveTabNav items share an id, so selecting one is ambiguous. Give every item its own id.',
      { ids: api.duplicateIds },
    )
  }
  return (
    <nav ref={ref} data-slot="adaptive-tab-nav" className={cn(adaptiveTabNavVariants(), className)} {...props}>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={adaptiveTabNavItemVariants({ active: index === api.activeIndex ? 'true' : 'false' })}
          {...api.itemAttributes(index)}
          onClick={() => onSelect(item.id)}
        >
          {item.icon != null && item.icon !== false ? (
            <span aria-hidden="true" className="inline-flex shrink-0">
              {item.icon}
            </span>
          ) : null}
          <span className="max-w-full truncate">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

/**
 * AdaptiveTabNav — one primary navigation for a handful of top-level sections:
 * pill tabs inline in your top bar on a wide viewport, and a tab bar docked to
 * the bottom of the screen below 768px. Each tab is a native button, so Tab,
 * Enter and Space work as everywhere else; the active one is
 * `aria-current="page"`.
 */
export const AdaptiveTabNav = React.forwardRef(AdaptiveTabNavInner) as <Id extends string = string>(
  props: AdaptiveTabNavProps<Id> & { ref?: React.ForwardedRef<HTMLElement> },
) => React.ReactElement | null
