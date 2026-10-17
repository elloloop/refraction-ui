'use client'

import * as React from 'react'
import { AdaptiveTabNav, type AdaptiveTabNavItem } from '@refraction-ui/react-adaptive-tab-nav'

interface AdaptiveTabNavExamplesProps {
  section: 'top-bar'
}

type Section = 'home' | 'inbox' | 'settings'

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[1.125rem]"
    >
      <path d={path} />
    </svg>
  )
}

const ITEMS: readonly AdaptiveTabNavItem<Section>[] = [
  { id: 'home', label: 'Home', icon: <Icon path="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /> },
  { id: 'inbox', label: 'Inbox', icon: <Icon path="M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" /> },
  { id: 'settings', label: 'Settings', icon: <Icon path="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12h2M3 12h2M12 3v2M12 19v2" /> },
]

const TITLES: Record<Section, string> = {
  home: 'Home',
  inbox: 'Inbox',
  settings: 'Settings',
}

/** A top bar with the nav and a profile page that belongs to no section. */
function TopBarDemo() {
  const [active, setActive] = React.useState<Section | null>('home')
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background text-foreground">
      {/* The docs column is narrow beside the sidebar, so below lg the tabs take their own row. */}
      <header className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2">
        <span className="text-sm font-semibold">Workspace</span>
        <AdaptiveTabNav
          items={ITEMS}
          active={active}
          onSelect={setActive}
          aria-label="Sections"
          className="order-last w-full lg:order-none lg:w-auto lg:flex-1"
        />
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-current={active === null ? 'page' : undefined}
          className="ms-auto inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Profile
        </button>
      </header>
      <div className="space-y-2 p-6">
        <h3 className="text-base font-semibold">{active === null ? 'Profile' : TITLES[active]}</h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {active === null
            ? 'Profile belongs to no section, so no tab is lit.'
            : 'On a wide screen the tabs sit in this top bar; below 768px the same nav docks to the bottom of the screen as a tab bar.'}
        </p>
      </div>
    </div>
  )
}

export function AdaptiveTabNavExamples({ section }: AdaptiveTabNavExamplesProps) {
  if (section === 'top-bar') {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-8">
        <TopBarDemo />
      </div>
    )
  }

  return null
}
