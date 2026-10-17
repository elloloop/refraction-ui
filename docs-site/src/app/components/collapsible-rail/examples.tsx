'use client'

import * as React from 'react'
import {
  CollapsibleRail,
  RailBackdrop,
  RailEdgeToggle,
  useCollapsibleRail,
  type RailTone,
} from '@refraction-ui/react-collapsible-rail'

interface CollapsibleRailExamplesProps {
  section: 'default' | 'tertiary'
}

const ITEMS = [
  { label: 'Home', path: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
  { label: 'Inbox', path: 'M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z' },
  { label: 'Calendar', path: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4' },
  { label: 'Settings', path: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12h2M3 12h2M12 3v2M12 19v2' },
]

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <path d={path} />
    </svg>
  )
}

/** A rail beside a content pane, in a bounded frame so the docs page keeps its own layout. */
function RailDemo({ tone, storageKey }: { tone: RailTone; storageKey: string }) {
  const rail = useCollapsibleRail({ storageKey })
  const { collapsed, open, mobile } = rail.state
  const [current, setCurrent] = React.useState(ITEMS[0].label)
  const surface =
    tone === 'tertiary'
      ? 'bg-tertiary text-tertiary-foreground'
      : 'border-e border-border bg-card text-card-foreground'
  const itemActive =
    tone === 'tertiary' ? 'bg-tertiary-foreground/15' : 'bg-primary-soft text-primary-soft-foreground'
  const itemIdle = tone === 'tertiary' ? 'hover:bg-tertiary-foreground/10' : 'hover:bg-muted'

  return (
    <div className="relative flex h-80 overflow-hidden rounded-lg border border-border bg-background text-foreground">
      {mobile && open && <RailBackdrop aria-label="Close navigation" onClick={rail.closeMobile} />}
      <CollapsibleRail
        collapsed={collapsed}
        open={open}
        mobile={mobile}
        expandedWidth="13rem"
        collapsedWidth="3.5rem"
        className={surface}
        onClick={rail.onChromeClick}
      >
        <RailEdgeToggle tone={tone} collapsed={collapsed} open={open} onClick={rail.toggle} />
        <nav aria-label="Workspace" className="flex flex-col gap-1 p-2 pt-12">
          {ITEMS.map((item) => (
            <a
              key={item.label}
              href={`#${item.label.toLowerCase()}`}
              title={collapsed ? item.label : undefined}
              aria-current={current === item.label ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault()
                setCurrent(item.label)
                rail.closeMobile()
              }}
              className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-sm font-medium ${
                current === item.label ? itemActive : itemIdle
              }`}
            >
              <Icon path={item.path} />
              <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
            </a>
          ))}
        </nav>
      </CollapsibleRail>
      <div className="min-w-0 flex-1 space-y-3 p-6">
        {mobile && (
          <button
            type="button"
            onClick={rail.openMobile}
            className="inline-flex min-h-10 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
          >
            Open navigation
          </button>
        )}
        <h3 className="text-base font-semibold">{current}</h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {mobile
            ? 'On a narrow screen the rail is an overlay. Open it, then close it with the backdrop, Escape or a link.'
            : 'Use the round control on the rail’s edge, or click the rail’s empty space, to switch between the full and the collapsed width. The width is remembered on this device.'}
        </p>
      </div>
    </div>
  )
}

export function CollapsibleRailExamples({ section }: CollapsibleRailExamplesProps) {
  if (section === 'default') {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-8">
        <RailDemo tone="default" storageKey="rfr-docs-collapsible-rail" />
      </div>
    )
  }

  if (section === 'tertiary') {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-8">
        <RailDemo tone="tertiary" storageKey="rfr-docs-collapsible-rail-tertiary" />
      </div>
    )
  }

  return null
}
