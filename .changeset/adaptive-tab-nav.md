---
'@refraction-ui/react': minor
---

Add `AdaptiveTabNav`: one primary navigation for a handful of top-level sections, drawn as pill tabs inside a top bar on a wide viewport and docked to the bottom of the screen as a tab bar below 768px (clear of the home indicator), from a single element. Tabs are native buttons with ReactNode icons hidden from assistive tech; `active` (or `null` for a page outside every section) marks one `aria-current="page"`, and `onSelect` hands the chosen id to the caller so a client-side router can navigate. Tabs are at least 2.75rem tall, adjustable with `--rfr-tab-nav-target`; `ADAPTIVE_TAB_NAV_DOCK_MEDIA_QUERY` is the docking breakpoint for padding content.
