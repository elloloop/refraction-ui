---
"@refraction-ui/react": patch
---

Adapter standards fixes across the React adapter packages (all ride the `@refraction-ui/react` meta):

- **forwardRef coverage**: root components in avatar-group, calendar (Calendar + CalendarHeader), conversation (Chat + Composer), cookie-consent, device-frame, emoji-picker, file-upload, inline-editor, language-selector, location-selector, app-shell (root + all subcomponents), keyboard-shortcut (ShortcutHint), radio (RadioGroup + RadioItem), search-bar (ref to the input), version-selector, reaction-bar, thread-view, presence-indicator, status-indicator, and tabs now forward refs to their root element; `TabsProps` now extends `React.HTMLAttributes<HTMLDivElement>` and spreads rest props.
- **charts**: all chart components (Chart, Bars, Circles, Gradient, Histogram, Line, PieChart, ScatterPlot, XAxis, YAxis) accept `className`, forwarded to the root `<svg>`/`<g>`.
- **call-controls**: core `ariaProps` retyped from `Partial<AccessibilityProps>` to `Record<string, string | number | boolean>`; the adapter spreads `{...api.ariaProps}` directly without an `as React.AriaAttributes` cast.
- **command / dropdown-menu**: `CommandItemProps`/`DropdownMenuItemProps` now `Omit` the DOM-colliding `onSelect` from `React.HTMLAttributes`, fixing a consumer-facing type break.
- **diff-viewer**: status-bar strings render as single template literals (SSR-safe composed output).
- **core ARIA typing**: thread-view, voice-pill, device-frame, reaction-bar, emoji-picker, presence-indicator, and status-indicator cores return `Record<string, string | number | boolean>` instead of `Record<string, unknown>`.
- **payment**: added missing vitest wiring (test script + config) and an SSR renderToString test.
