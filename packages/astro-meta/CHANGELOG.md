# @refraction-ui/astro

## 0.23.0

### Minor Changes

- ea602b0: The Astro toasts catch up with the React ones: a title, an action, live-region announcements and a keyboard focus ring.
  
  - `Toast.astro` takes `title` (a heading above the message), `actionLabel` (an action button such as Undo) and `dismissLabel` (the dismiss button's accessible name). Choosing the action closes the toast, then dispatches a bubbling `rfr-toast-action` event from it. The `title` prop is now this heading; it is no longer passed through as the HTML `title` attribute.
  - `window.__rfr_toast({ message, title, variant, duration, action: { label, onClick } })` shows the same toast from a script; the callback runs once, after the toast starts to close. A bare `window.__rfr_toast('Saved')` works as before.
  - `Toaster.astro` is a labelled landmark region (`aria-label`, default "Notifications") with a polite and an assertive live region that exist before any toast. Each toast in it is announced once, errors assertively and the rest politely, and loses its own `role="alert"` so it is not announced twice. A toast outside a toaster keeps `role="alert"`. `dismissLabel` on the toaster names the dismiss button of scripted toasts.
  - The countdown pauses while a toast is hovered or holds focus. Escape closes the focused toast, and focus returns to where it was before it entered the toaster. The action and dismiss buttons get the keyboard-only focus ring, the dismiss glyph is hidden from assistive technology, and toasts close without the exit animation for users who prefer reduced motion.
- ea602b0: AvatarGroup: whole presence dots, a fallback for missing photos, and a "+N" badge that can be a real button.
  
  - The presence dot is no longer cut off by its avatar's edge or hidden under the next avatar in the stack: it sits on top (`z-10`), and the group keeps it within itself (`isolate`).
  - A photo is laid over the initials, which show while it loads and stay when it fails, including a photo that failed before the page hydrated or the Astro script ran. The photo is decoration (`alt=""`); the avatar already carries the name.
  - `onOverflowClick` (React) and `overflowButton` (Astro) make the "+N" badge a button with a visible focus ring, e.g. to open a list of everyone. React passes the button, to anchor a popover to it; in Astro, listen for `click` on `[data-rfr-avatar-group-overflow]`.
  - The group's ids come from `useId` in React, so a server-rendered group hydrates without a mismatch.
  - The `xs` size's text is `0.625rem` instead of `10px`, so it follows the user's font size.
  - `@refraction-ui/astro` now exports `AvatarGroup` (before, the meta exported nothing for it), and `@refraction-ui/react` now exports the `AvatarUser` type.
  
  **Changed:** without a handler, the "+N" badge is labelled as an image ("2 more users"), not as a button that did nothing when pressed. The avatar root no longer clips (`overflow-hidden` is gone from `avatarVariants`); the photo and the initials round and clip themselves (`rounded-[inherit]`). Other content placed in a styled avatar is no longer clipped to its shape.
- ea602b0: Avatar: show presence.
  
  - `presence` (`'online' | 'away' | 'busy' | 'dnd' | 'offline'`) draws a dot at the avatar's bottom end corner, in the same colours as `PresenceIndicator` (both now read one status-to-colour map). `avatarPresenceVariants` exposes its classes. It sits over the edge with a ring in the page background, scales with `size` and sits just off the corner of a `square` avatar.
  - A named avatar (`aria-label`) adds the status to its name, "Ada Lovelace (Away)", and hides the dot from assistive tech; an unnamed avatar names the dot itself ("Away"). `presenceLabel` sets the status words, e.g. for another language. `data-presence` on the root and `data-status` on the dot are styling hooks.
  - `@refraction-ui/astro` now exports `Avatar`, `AvatarImage` and `AvatarFallback` (before, the meta exported nothing for them), and the Astro `Avatar` takes the same `presence` and `presenceLabel`.
  
  **Changed:** so the dot is not cut off, the avatar root no longer clips (`overflow-hidden` is gone from `avatarVariants`). The image and the fallback round and clip themselves instead (`rounded-[inherit]`), and the image is laid over the fallback (`absolute inset-0`), so the initials show while a photo loads. Content other than `AvatarImage` and `AvatarFallback` placed inside an avatar is no longer clipped to its shape; give it `rounded-[inherit] overflow-hidden` to keep that.
- ea602b0: Add an opt-in `touchTarget` prop to Button. It grows the clickable area to at least 44×44 CSS px (the WCAG 2.5.5 target size, and larger when the reader's root text size is larger) with an invisible centred pseudo-element, so the small icon sizes (`icon`, `icon-sm`, `icon-xs`) can meet the target without changing how the button looks or the space it takes. It is off by default, so existing layouts do not shift. The button gets `data-touch-target`, and the class string is exported from the core as `buttonTouchTargetStyles` for custom controls. Keep neighbouring targets' centres at least 44px apart; an ancestor with `overflow: hidden` clips the extension.
- ea602b0: `DatePicker` takes `presets`: one-click dates shown as buttons after the input, such as "Today", "Tomorrow" and "Next week".
  
  - `createDefaultDatePresets({ labels, weekStartsOn })` gives those three, with translated labels and the locale's first day of the week ("Next week" is the next one). Add your own presets as data: `{ id, label, weekday?, days? }` moves to the next `weekday` after today, then adds `days`.
  - Each preset is a native button in the tab order after the input, chosen with Enter or Space, inside a group named by `presetsLabel` (default "Date shortcuts"). Labels are shown as given.
  - A preset outside `minDate` or `maxDate` is disabled. Each resolves again when chosen, so a page left open past midnight picks the right day. With `showTime`, the time already chosen is kept.
  - React calls `onChange` with the chosen day. Pass `today` when server-rendering presets with `minDate` or `maxDate` so the server and the browser agree on which are disabled.
  - Astro resolves presets in the browser, so a statically built page stays correct, and fills the input with `input` and `change` events like a typed date. `DatePicker` is now exported by name from `@refraction-ui/astro`.
- ea602b0: Add `Field`: a labelled form control with an optional hint that works with any control and any (or no) form library. The label names the control by id, the hint describes it, and a render-function child wires a control nested inside a wrapper. Stacked and inline layouts, `labelTone` for a regular or eyebrow label, and `grow` for wrapping rows.
- ea602b0: LiveTranscript shows both sides of a call, interim lines that settle into their finals, and can follow the live line.
  
  - `TranscriptEntry` gains `side` (`'me' | 'them'`), `interim` and `startMs`. Your lines sit at the end edge and theirs at the start edge, each in its own bubble. Interim lines are muted with a dotted underline, carry a screen-reader "still listening" suffix (`interimLabel`) and are kept out of the log's announcements until their final replaces them.
  - New `applyTranscriptUpdate(entries, result)`: each side keeps one interim line, a final replaces it, and finals from both sides are ordered by `startMs`.
  - The panel is focusable by default (`tabIndex` 0) so it can be scrolled from the keyboard; pass `tabIndex={-1}` (React) or `tabindex={-1}` (Astro) to opt out.
  - React only: `autoFollow` keeps the newest line in view, pauses when the reader scrolls up, and shows a "Jump to live" control (`jumpToLiveLabel`) that resumes it, without animation under reduced motion.
  
  Breaking for direct users of the core helpers only: `TranscriptBlock.texts` is now `lines` (`{ id, text, interim }`), and `transcriptTextLineClass` is now `transcriptTextLineVariants`. Neither is exported by `@refraction-ui/react` or `@refraction-ui/astro`.
- ea602b0: Add `MediaFrame`: a fixed-aspect box for an image, a video or a live preview on a letterbox surface, with an optional corner caption. `ratio` takes a number, `"w:h"` or `"w/h"` and falls back to a square (with a development warning) when it is unusable; the frame exposes `data-orientation`. `labelPosition` corners are logical, so they follow the writing direction, and `tone` switches the letterbox between the neutral surface and the theme's tertiary accent.
- ea602b0: ReactionBar: show who reacted, fold long bars behind "+N", and hand the add button to a picker.
  
  - A `Reaction` takes an optional `label` (its accessible name; defaults to the emoji) and `reactors` (who reacted). A pill with reactors gets a tooltip, "Ana, Sam and 3 others reacted with Agree", on hover and keyboard focus but not on touch; Escape dismisses it before an enclosing dialog sees the key, and the pill references it with `aria-describedby`. The tooltip lines up with the pill's start edge, or its end edge when that keeps it on screen (`getReactorsTooltipAlign`). `formatReactorNames` is exported for the same sentence elsewhere.
  - `maxVisible` shows that many reactions and a "+N" button (`aria-expanded`, "Show N more reactions") that expands the bar in place and collapses it again.
  - `strings` overrides every user-facing string: the group label, the add label, the overflow text and labels, each pill's name and the who-reacted sentence.
  - Pills, the add button and the overflow button show a focus-visible ring, and drop their colour transition under reduced motion.
  - The Astro bar now toggles, expands and shows who reacted in the browser too, with every string resolved on the server, and `@refraction-ui/astro` exports it: `import { ReactionBar } from '@refraction-ui/astro'` (before, the meta exported nothing for it).
  
  **Breaking change:** the add button no longer reports a hard-coded 👍. (This is technically a breaking change but is being shipped as a `minor` per `0.x` semver convention.)
  
  Migration:
  
  - React: `onAdd(emoji)` is now `onAddReaction(trigger)`, called with the add button so a picker can anchor to it and return focus to it. The add button renders only when `onAddReaction` is given; `showAddButton={false}` still hides it.
  - Headless core: `createReactionBar` no longer takes `onAdd` or returns `add()`; open your picker from the add button and call `toggle(emoji)` or update `reactions` with the choice.
  - Astro: the `rfr-reaction-add` event's detail is `{ trigger }` (the add button) instead of `{ emoji }`.
- ea602b0: Show live media and call state on video tiles. `VideoGrid` gains `renderMedia` (a participant's `<video>`, transport-agnostic) and `renderTile` (custom or extended tiles, with the region and default tile props), and its participant type is generic so your own fields reach both. Grid rows now pack to the top instead of stretching into each other when the parent is shorter than the grid, and the speaker-view spotlight tile fills its area instead of overflowing it.
  
  `VideoTile` gains `handRaised`, `screenShare` (a "Presenting" qualifier on the name, a screen icon and letterboxed media), a `menu` slot for tile options, `fill` and localisable `labels`. The speaking and pinned highlights move from an outer ring, which a clipping parent cut off, to an inset edge drawn above the media with the success and primary tokens, plus a sound-wave icon and a pin badge so neither cue is colour-only. Media children now fill the tile, a long name truncates inside the chip, and the avatar circle and its initials shrink with the tile so they never run under the name chip. The Astro `VideoTile` matches and is exported by name.

### Patch Changes

- ea602b0: `FloatingReactions` now ships its own motion. The overlay renders the keyframes it animates with, so reactions rise and fade without any global CSS; before, they stayed still unless the app defined a `float-up` keyframe itself (that rule is no longer used and can be removed). Each reaction animates for exactly `REACTION_LIFETIME_MS`, the time `useFloatingReactions` removes it after. Under `prefers-reduced-motion: reduce` a reaction no longer moves: it stays where it appeared and fades out. In React 19 the stylesheet is hoisted into the document head once, however many overlays render. `ReactionBurst` stays a still preview of one reaction in its lane and never floats away.
- ea602b0: Show a keyboard focus ring on every ThreadView, Calendar and AppShell control without relying on a global `:focus-visible` rule in the host app. ThreadView reaction pills and the Reply action, Calendar days and month buttons, and the AppShell sidebar toggle now carry the shared `focus-visible` ring, and ThreadView reveals its hover-only actions while one of them has focus. The Astro calendar's client re-render now uses the core day styles, so its days keep the ring after a month change.
- ea602b0: Size small text in rem instead of pixels so it follows the reader's browser text-size setting. Badge (`sm`), SocialAuthButton's "Last used" badge, SectionHead, PageHeader and AudienceFeatureCard kickers, the Table eyebrow header, AudioRoom badges, the CallControls label, BrowserChromeMock, FunnelChart, LineChart, DiffViewer and the Composer trigger menu heading now use rem values equal to their former pixel sizes at the default 16px root, so nothing moves for readers who keep the default. DiffViewer's file tabs and status bar heights are in rem too, so they grow with their text instead of clipping it.
- ea602b0: Toasts can carry a title and an action such as Undo: `toast(message, { title, action: { label, onClick } })`. Choosing the action closes the toast, then runs the callback once. `toast(message)` and `toast(message, { variant, duration })` work as before.
  
  The React `Toaster` is now a labelled landmark region (`aria-label`, default "Notifications") with a polite and an assertive live region that exist before any toast, so each new toast is announced once: errors assertively, other variants politely. Toasts inside a `Toaster` are no longer `role="alert"` themselves, so no toast is announced twice; a standalone `Toast` still is. Select rendered toasts with `[data-rfr-toast]`.
  
  The auto-dismiss countdown now really pauses while a toast is hovered or holds focus, and resumes with the time it had left (the manager gains `pause(id)` and `resume(id)`). Escape closes the focused toast, and focus returns to where it was before it entered the toasts. The action and dismiss buttons get a keyboard-only focus ring, the dismiss button's name can be set with `dismissLabel`, and toast transitions are off for users who prefer reduced motion (in Astro too).
- ea602b0: Toasts no longer let the page show through or spill off small screens.
  
  - The tinted variants (success, error, warning) paint their tint over an opaque background, so content behind a toast no longer shows through.
  - The toaster keeps a 16px gutter on both sides. On a phone it spans the screen minus the gutters instead of overflowing the left edge; on wider screens it stays at the bottom right, capped at `max-w-sm`.
  - A long unbroken message, such as a URL, wraps instead of pushing the dismiss button out of the toast.
  - The React `Toaster` and `Toast` carry the `data-rfr-toaster` and `data-rfr-toast` hooks the Astro ones already had.
  - The Astro programmatic toast uses the shared variant classes instead of its own copy, and an unknown variant falls back to `default`.

## 0.22.1

### Patch Changes

- 3f2927e: Activate focus containment and restoration for React modal dialogs. Skip hidden, disabled and negative-tabindex controls in the shared focus utility, focus empty panels, and keep nested Escape handling and consumer cancellation scoped to their dialog.

## 0.22.0

### Minor Changes

- e9eb007: Paint complete supported Unicode in the existing interactive Astro composer mirror while preserving its real textarea, shared core, image-paste handoff, native IME composition, clipboard and undo.

  Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
  with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
  custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
  to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
  CC-BY 4.0: retain attribution and the graphics license when self-hosting:
  https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS

- e9eb007: Restore menu trigger focus after Escape/selection and focus enabled items for keyboard navigation in React dropdowns. Export shared button classes for native Astro trigger composition without nested buttons. Add leading and trailing action slots to the read-only Astro composer shell. Document native named icon actions and the existing React stacked-editor composition; interactive editing still requires a hydrated adapter.
- e9eb007: Add opt-in PNG/JPEG clipboard handoff with original files, atomic size validation, mixed-text selection preservation and visible errors. React preserves generic file staging with an additive raw File callback; Astro gains an opt-in interactive composer backed by the same headless core. Paste never sends or uploads.
- e9eb007: Add leading and trailing action slots to the interactive composer, retaining the same editable field and host-owned recording and upload boundaries.
- e9eb007: Paint complete supported Unicode artwork in the React composer mirror while preserving the real textarea and native IME composition. Add a canonical read-only Unicode value to the Astro composer shell.

  Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
  with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
  custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
  to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
  CC-BY 4.0: retain attribution and the graphics license when self-hosting:
  https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS

- e9eb007: Add EmojiText for complete keyboard Unicode graphemes with shared Flutter artwork coverage, canonical selectable text, and native load/error fallback. Astro picker SSR and client search now use the same artwork matching as React.

  Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
  with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
  custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
  to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
  CC-BY 4.0: retain attribution and the graphics license when self-hosting:
  https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS

- e9eb007: Enhance sanitized markdown and conversation display text with complete Unicode artwork while preserving canonical selectable text, links, literal code, and editing nodes.

  Use linear heading/list/rule block scans to eliminate polynomial whitespace matching exposed by message input.

  Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
  with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
  custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
  to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
  CC-BY 4.0: retain attribution and the graphics license when self-hosting:
  https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS

## 0.21.0

### Minor Changes

- e390dca: Restore menu trigger focus after Escape/selection and focus enabled items for keyboard navigation in React dropdowns. Export shared button classes for native Astro trigger composition without nested buttons. Add leading and trailing action slots to the read-only Astro composer shell. Document native named icon actions and the existing React stacked-editor composition; interactive editing still requires a hydrated adapter.
- e390dca: Add opt-in PNG/JPEG clipboard handoff with original files, atomic size validation, mixed-text selection preservation and visible errors. React preserves generic file staging with an additive raw File callback; Astro gains an opt-in interactive composer backed by the same headless core. Paste never sends or uploads.
- e390dca: Add leading and trailing action slots to the interactive composer, retaining the same editable field and host-owned recording and upload boundaries.

## 0.20.1

### Patch Changes

- f5506f4: Wrap PageHeader actions below the text in narrow containers instead of squeezing the title into broken words.
- f5506f4: Keep VideoTile conditional branches compatible with the Astro 7 compiler by removing HTML comments inside JavaScript expressions.

## 0.20.0

### Minor Changes

- e6f567a: `Avatar` gains `shape` (`circle` default, `square`). The root no longer has an unnamed `role="img"` (which hid the inner image's alt and fallback text); it becomes `role="img"` only when given an `aria-label`.
- 397f6ba: `DataTable` renders real content: columns take `cell` (`(row, index) => ReactNode`), a ReactNode `header`, `align` (`start | center | end`), `numeric` (tabular figures, end-aligned), `className` and `headerClassName`; `accessor` is now optional for display-only columns. New table props `getRowKey`, `getRowProps`, `onRowClick` (rows become focusable and activate with click/Enter/Space), `caption`, `wrapperClassName`, and table attributes pass through. Sortable headers are now buttons, so sorting works from the keyboard. New core helpers `resolveColumnAlign`, `resolveRowKey`, `getColumnValue`; new type `DataTableColumn`.
- 0a74513: Add `NativeSelect`: a styled native `<select>` (`size` `sm | default | lg`, `containerClassName`, every native attribute, ref to the select) for forms and filter bars that want platform pickers and native `change` semantics.
- 076b89f: `StatGrid` reflows: columns are responsive classes (1 on phones, up to the requested count) instead of a fixed inline `grid-template-columns`, and `columns="auto"` fits as many ~12rem items as the width allows. New `variant` (`plain` callouts | `card` KPI cards), `layout` (`value-first` | `label-first`), and per-item `id`, `description`, `tone` (`default | positive | negative | caution`) and `props` (item attributes).
- 5bdf4fb: Add composable `Table` primitives — `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` — mapping one-to-one to the HTML table elements so cells can hold components. `Table` takes `density` (`compact | default`), `headTone` (`default | eyebrow`), `fixed` and `containerClassName` (horizontal scroll container); `TableHead`/`TableCell` take `align` (`start | center | end`), `TableCell` takes `numeric`, and `TableHead` defaults `scope="col"`.

### Patch Changes

- 19fb58d: `LineChart` fixes: y-axis ticks are now round numbers on a "nice" 1-2-5 scale (e.g. 0, 2000, 4000, 6000) instead of fractions of `max × headroom` (e.g. 5999.9999), so tick formatters print clean labels; `niceScale` is exported. In React the chart measures its container (ResizeObserver, SSR falls back to `width`) and draws at that width, so axis text and `height` stay at their authored size in narrow panels instead of being scaled down; x labels thin automatically to fit.

## 0.19.0

### Minor Changes

- b1a5348: Add four app-surface components:

  - `PageHeader` — heading cluster for an application page: `kicker`, `title`, `description`, trailing `actions`, `as` (`h1`–`h3`). App-sized, never centred (use `SectionHead` for marketing sections).
  - `ActionList` + `ActionListItem` — a vertical list whose rows are each one keyboard-reachable action (a full-width native button with `title`, `description`, `meta`, `trailing`, `density`, `disabled`).
  - `LineChart` — responsive multi-series line chart on one shared y-scale with gridlines, category labels, hover/keyboard crosshair + tooltip, legend and optional area fill; series colours default to the `--chart-N` tokens.
  - `FunnelChart` — stepped conversion funnel with each step's share of the top step, continue-rate and drop-off, all copy and number formatting overridable.

- c243df1: `Card` gains a `padding` prop in React (`'none' | 'default' | 'compact'`, already in the core and Astro) and `variant` in Astro; `CardTitle` gains `as` (`h1`–`h6`, default `h3`) in both. New types `CardPadding`, `CardTitleLevel`, `CardTitleProps`.

### Patch Changes

- 2e9d116: `Callout` no longer defaults to an unnamed `role="region"` landmark (an axe violation). Non-destructive callouts get no role unless named with `aria-label`/`aria-labelledby` (then `region`); `destructive` stays `alert`; an explicit `role` always wins.
- 9a70dc4: Size variants now actually apply. `cn` does not merge Tailwind conflicts, so size-owned utilities in a cva `base` (e.g. `h-9 text-sm`) beat the variant (`h-8 text-xs`) by stylesheet order. Moved them into the variants for `Input`, `Textarea`, `Button`, `Badge` and `ProgressBar`. `Button` also gains `icon-sm` and `icon-xs` sizes.

## 0.18.1

### Patch Changes

- c7d825f: Add `pending` (orange) and `neutral` (gray) status tokens end-to-end (vars in all themes + light/dark, preset utilities), and route status-indicator pending/neutral, presence-indicator offline, and avatar-group offline through them (offline now shares the neutral token). Completes the status token set — no status colors remain hardcoded.

## 0.18.0

### Minor Changes

- c71439d: feat(astro): real Pagination, FileTree, Slider, SkipToContent and Steps components

  Replaces the placeholder astro adapters with real SSR implementations on the
  shared headless cores, mirroring the React adapters' markup and ARIA:

  - **Pagination** — `role="navigation"` landmark with windowed page ranges,
    ellipses, `aria-current="page"` and prev/next edge semantics from
    `@refraction-ui/pagination`. Activation is delivered as a bubbling
    `rfr-page-change` CustomEvent; consumers re-render (or navigate) with the
    requested page.
  - **FileTree** — nested `role="tree"` / `treeitem` / `group` markup with
    level/expansion/selection ARIA from `@refraction-ui/file-tree`. Expansion and
    selection are static SSR props (`expandedIds` / `selectedId`); activation is
    delivered as `rfr-file-tree-select` / `rfr-file-tree-toggle` CustomEvents.
  - **Slider** — new `Slider.astro` (the package previously shipped no
    component): a native `<input type="range">` with core-normalized value and
    slider ARIA; value changes are delivered as `rfr-value-change` CustomEvents.
  - **SkipToContent** — visually-hidden-until-focused skip link from
    `@refraction-ui/skip-to-content`.
  - **Steps** — real `Steps` / `Step` wrappers consuming `@refraction-ui/steps`
    variants and data-slot hooks, alongside the existing step partials.

  Prop-parity fixes: `Calendar` accepts a `today` ISO string (injected reference
  date for `isToday` / `aria-current` and the initial month, keeping SSR and
  client hydration in agreement), and `DatePicker` renders the formatted-date
  text next to the native input when `format` is set, matching the React
  adapter.

### Patch Changes

- 59d1965: fix(astro): consumer builds no longer fail on optional analytics vendor SDKs

  Measuring the Astro meta's tree-shaking (mirroring yesterday's React meta
  probe) showed the output-side story was already healthy — a scratch Astro site
  importing a single component ships only that component plus its headless core
  in the server bundle, with zero code from the other 251 embedded packages —
  but the build itself was broken for real consumers: the embedded analytics
  sinks dynamically imported `posthog-js` and `@microsoft/applicationinsights-web`
  via statically-analyzable string literals. Those are optional peers of the
  private sink packages, so consumers don't have them installed, and vite/rollup
  fails the whole `astro build` at module-graph resolution time — long before
  tree-shaking can drop the unused modules. The repo never noticed because
  `auto-install-peers` makes the peers resolvable inside the workspace.

  The sink sources now route those specifiers through module-level consts
  (`posthogJsSpecifier`, `appInsightsWebSpecifier`), keeping the imports
  runtime-only — the same idiom `logger`'s faro engine already uses. A
  `/* @vite-ignore */` annotation (previously present on the App Insights
  import) does not help: vite still resolves literal dynamic-import specifiers
  in SSR builds.

  React ripple: the React meta previously _vendored_ both vendor SDKs into its
  published chunks (resolvable at build time via workspace auto-installed
  peers). Its dist now also keeps them as runtime imports, matching the
  documented "fully optional peer" contract — consumers who opt into
  `client-sdk` mode or session replay install the SDK themselves; everyone else
  never resolves it.

  Adds `packages/astro-meta/__tests__/treeshake.test.ts` guardrails: the shipped
  entry must stay a pure re-export module, no shipped module may reference a
  bare specifier besides the `astro` peer, and a real `astro build` of a
  one-component consumer site (without the optional peers) must succeed and
  bundle only that component.

- 5cfcf9d: fix(react,astro): route hardcoded status colors through theme tokens

  Status-semantic variants in the shared headless cores now use the semantic
  token utilities instead of fixed Tailwind palette classes, so they follow
  the active theme's CSS variables in both frameworks:

  - **Toast** — `success`/`error`/`warning` use the `success`/`destructive`/
    `warning` tokens (dropping the per-mode `dark:` overrides; the variables
    flip per mode). Astro's programmatic `showToast` variant map matches.
  - **Callout** — `info` uses the new `info` token (`bg-info/10`,
    `border-info/20`, `text-info`).
  - **StatusIndicator** — dot/pulse `success`/`error`/`warning`/`info` use
    the matching tokens (`pending`/`neutral` keep their fixed orange/gray —
    no tokens exist for them).
  - **ProgressDisplay** stat cards — `success`/`warning` tints use tokens.
  - **PresenceIndicator** / **AvatarGroup** presence dots — online→`success`,
    away→`warning`, busy/dnd→`destructive` (`offline` stays gray).
  - **EmptyState** icon chip — `success`/`warning` tones use tokens.
  - **Input** — `valid` state uses `border-success`/`ring-success`, and the
    React valid-state check icon uses `text-success`.

  Rendered hues shift slightly from the old fixed palette values, matching
  the earlier Badge/Callout `success`/`warning` token change.

## 0.17.4

### Patch Changes

- cdd92bc: Badge and Callout `success`/`warning` variants now use the theme token utilities (`bg-success`, `text-success-foreground`, `bg-success/10`, …) instead of hardcoded `green-500`/`yellow-500` palette classes, so they follow the active theme's `--success`/`--warning` variables. Rendered hues shift slightly from the old fixed palette values.

## 0.17.3

### Patch Changes

- b81af1d: Fix name collisions in the meta package's public entry.

  `astro-logger` and `astro-analytics` both re-exported `createConsoleSink`,
  `createMockSink` and the `ConsoleSinkOptions` type from their respective
  headless cores. Under plain `export *` in the meta entry that is a TS2308
  for consumers, and at runtime the ambiguous star exports were dropped from
  the ESM namespace entirely — so none of the three names was actually
  reachable from `@refraction-ui/astro`. Following the react-meta pattern,
  the pre-existing logger names stay canonical and the analytics variants are
  now surfaced under aliases: `createAnalyticsConsoleSink`,
  `createAnalyticsMockSink` and `AnalyticsConsoleSinkOptions`.

  The shipped `dist/index.ts` is now generated from the hand-maintained
  `src/index.ts` (single source of truth — selective re-exports and their
  why-comments can no longer drift between source and artifact), and the meta
  entry is typechecked in CI via the new `tsconfig.json`.

  Also fixes two adapter re-exports that were broken at source level
  (`export *` pointing at a `.astro` file, which has no wildcard surface):
  `@refraction-ui/astro-file-tree` now exports `FileTree` and
  `@refraction-ui/astro-icon-system` exports `IconSystem` — the same named
  exports the meta build previously synthesized for them.

  Story fixtures for the Astro DataTable, DiffViewer, SlideViewer and
  VersionSelector stories were corrected to match their headless core
  contracts (`ColumnDef`, `DiffFile`, `SlideData`, `VersionOption`). Stories
  are not part of the published artifact; the meta export fix is what ships.

## 0.17.2

### Patch Changes

- 5992000: - **Core determinism**: headless cores no longer hard-depend on ambient time/randomness — each now accepts an optional, injectable clock/rng at its config seam (defaults stay ambient, so existing usage is unchanged):
  - **Conversation**: `now?: () => Date` for conversation/message timestamps.
  - **Calendar** / **DatePicker**: `today?: Date` reference date — fixes SSR/CSR hydration mismatch when server and client render on different days (also drives time-default fallbacks in DatePicker).
  - **Toast**: `now?: () => number` for timer pause/resume math and manager `createdAt` stamps.
  - **Analytics**: `now?: () => Date` (default event `timestamp`, HTTP-sink `sentAt`) and `random?: () => number` (sample-rate decisions); per-call `timestamp` override still wins.
  - **Logger**: `now?: () => number` (record timestamps, span timing) and `random?: () => number` (sampling).
  - **Footer**: `year?: number` for the default copyright text — fixes year-boundary SSR/CSR mismatch.
  - **Calendar**: ARIA prop returns are now typed `Record<string, string | number | boolean>` (spread-safe), with `aria-current` omitted rather than `undefined` on non-today cells.

## 0.17.1

### Patch Changes

- 0a1d8a9: Wire previously missing component packages into the framework metas so they actually reach consumers:

  - Both metas: wire in `location-selector` (devDependency + re-export) for the first time — `LocationSelector` is now available from `@refraction-ui/react` and `@refraction-ui/astro`.
  - `@refraction-ui/react`: re-export `react-ai` (`AIProvider`/`useAI`/`TTSProvider`/`useTTS`) and `react-charts` (`Chart`/`Bars`/`Line`/`Circles`/`XAxis`/`YAxis`/`Gradient`/`Histogram`/`ScatterPlot`/`PieChart`/`ChartContext`), removing the stale "stubs with no exports yet" comment.
  - `@refraction-ui/react`: re-export `react-command-input` — its `CommandInput`/`CommandInputProps` clash with `react-command`'s compound palette input (which keeps the stable public name), so the standalone trigger-detection input is exposed as `StandaloneCommandInput`/`StandaloneCommandInputProps`.
  - `@refraction-ui/react`: re-export `react-diff-viewer` (`DiffViewer` and its headless API); its `sidebarVariants`/`sidebarItemVariants` clash with `react-sidebar`, so they are exposed as `diffViewerSidebarVariants`/`diffViewerSidebarItemVariants` following the established alias pattern.

  Also includes two patch fixes affecting `@refraction-ui/react`:

  - fix command-input trigger detection after whitespace (broken `\s` regex in the core)
  - fix ThemeToggle conditional hook calls when variant changes

## 0.17.0

### Minor Changes

- f5a21d7: Composer: full emoji experience, WhatsApp-style expression panel, and motion polish.

  - **Full emoji set** — the composer's `:` trigger and the emoji picker now share one generated Unicode 16.0 dataset (~1,900 emoji) sourced from `@refraction-ui/emoji-picker`; `rich-editor`'s shortcode map is built from the same source (no more divergent hand-lists).
  - **Uniform rendering** — default `emojiRenderer` is Twemoji (uniform across platforms; CC-BY 4.0, attribution in NOTICE/README), lazy per-glyph and swappable to native or a self-hosted base URL with one prop.
  - **Stickers** — sticker types + a starter set (with one animated example) + a `stickerRenderer` seam (svg/image/lottie); hidden when no sticker sets are supplied.
  - **Inline expression panel** — `accessoryPanel` docks host content directly below the field (never a portal/overlay that covers the message you're typing), with an animated toggle.
  - **Surface variant** — `surface="outlined" | "filled"`; filled uses a muted fill + hairline and keeps a tasteful focus ring.
  - **Motion** — attachment chips animate in/out, the `@`/`:` menus and send⇄stop swap animate, all reduced-motion and SSR safe.

## 0.16.1

### Patch Changes

- 7cf3572: Composer: use the theme `ring` token for the focus indicator (single focus ring on the pill surface) instead of a foreground-tint border, so keyboard focus is clearly visible and consistent with other Refraction inputs.

## 0.16.0

### Minor Changes

- c443a6c: Add Composer — a headless-core chat composer (`RefractionComposer`) with auto-grow and viewport cap, IME-safe Enter-to-send with Shift+Enter newline, `@`/`/`/`:`/`#`/custom trigger suggestion menus with atomic mention/emoji/tag tokens and structured output, grapheme-safe max-length clamping, typed attachments with paste/drag-drop capture, draft persistence, edit-in-place, busy/stop state for AI surfaces, density-aware theming, RTL, and full combobox/listbox ARIA. Also generalizes trigger detection into a single `detectTriggerInText` in `rich-editor` (consumed by mentions, slash commands, and the conversation composer).

## 0.15.2

### Patch Changes

- c7c6ba4: Fix React DatePicker calendar day updating bug. Changed DatePicker API to accept currentMonth prop to support controlled updates from the React adapter.

## 0.15.1

### Patch Changes

- c3158d7: feat: add Mascot component (Tobi the Tortoise) supporting interactive bobbing, sprout swaying, and blinking states across React and Astro adapters.

## 0.15.0

### Minor Changes

- 69f42ee: Add 3 components from the loopwyse Interview Loops design: `KanbanBoard`
  (stage-column board with cards, counts, and overflow), `SortableList`
  (drag-to-reorder list with a grip handle and keyboard reordering), and
  `SlotPicker` (Calendly-style day + time-slot booking picker). Each ships as a
  headless core plus React and Astro adapters, with a docs-site page and
  Storybook story. Available from the `@refraction-ui/react` and
  `@refraction-ui/astro` metas.

## 0.14.0

### Minor Changes

- 3fb0f32: Add 9 marketing / landing components: `SectionHead`, `StatGrid`,
  `NumberedSteps`, `PricingCard`, `BrandNetworkCell`, `MarqueeStrip`,
  `BrowserChromeMock`, `MasteryBar` (a standalone labelled linear progress bar),
  and `AudienceFeatureCard`. Each ships as a headless core plus React and Astro
  adapters, with a docs-site page and Storybook story. Available from the
  `@refraction-ui/react` and `@refraction-ui/astro` metas.

## 0.13.0

### Minor Changes

- 342214a: Add 23 net-new components from the easyloops design-parity audit, across three
  product surfaces:

  - **Video conferencing**: `VideoTile`, `VideoGrid`, `CallControls`,
    `LiveCaptions`, `LiveTranscript`, `AudioRoom`, `FloatingReactions`,
    `PreCallLobby`.
  - **Canvas / diagramming**: `InfiniteCanvas`, `StickyNote`, `FlowEditor`,
    `GraphView`, `LiveCursors`, `MiniMap`.
  - **Code-IDE chrome**: `EditorTabs`, `Terminal`, `TestResults`,
    `EditorStatusBar`.
  - **Forms / assessment**: `RatingScale`, `Wizard`, `RadialGauge`, `Timeline`,
    `Checklist`.

  Each ships as a headless core plus React and Astro adapters, with a docs-site
  page and Storybook story. Available from the `@refraction-ui/react` and
  `@refraction-ui/astro` metas.

## 0.12.0

### Minor Changes

- 117fad0: Add auth-surface components (#330–#334), each as a headless core + React and Astro adapters wired into the metas:

  - **SegmentedControl / SegmentedControlItem** — compact, radio-semantics single-choice value picker (roving focus, arrow keys, `sm|md`, controlled/uncontrolled).
  - **PasswordInput** — `Input` wrapper with a show/hide toggle; plus a new `validationState` (`valid|invalid`) affordance and `leadingIcon` slot on **Input** itself.
  - **SocialAuthButton / SocialAuthRow** — OAuth provider buttons with bundled brand icons, `loading`, and a "Last used" badge.
  - **Separator** — horizontal/vertical rule with an optional centered label (the `──── or ────` divider).
  - **EmptyState / ConfirmationCard** — centered icon-chip + title + body + actions stack with `tone` tints and an optional bordered surface.

## 0.11.1

### Patch Changes

- 69bb85c: API ergonomics + parity:

  - **Button** — `<Button variant="primary">` now renders as the default (most-emphasized) button instead of silently falling through to the unstyled base. `primary` is a typed alias of `default`; behaviour is identical. Fixes muscle-memory regressions seen migrating from MUI/Chakra/Mantine. (issue #201)
  - **StatusIndicator** — accepts composable `children` as a fallback for `label`, matching every other refraction-ui primitive. `<StatusIndicator type="success">Microphone · ready</StatusIndicator>` now renders the children instead of dropping them. `aria-label` is derived from children when they are a string. (issue #200)
  - **ThemeScript** — gains `defaultMode` and `enableSystem` props so the pre-paint inline script stays in sync with `ThemeProvider` on the no-storage path. Setting `defaultMode="light"` (or `enableSystem={false}`) now skips the `prefers-color-scheme` fall-through, fixing dark→light flashes for brand-consistent apps. Defaults preserve the prior behaviour. (issue #317)
  - **Astro meta** — wires up `@refraction-ui/astro-voice-pill` and `@refraction-ui/astro-waveform` so they're reachable from `@refraction-ui/astro` (they were listed as deps but not re-exported). (issues #191, #192)

- bcb7b78: Docs + Storybook follow-up to the API ergonomics fixes:

  - **Button** — new `PrimaryAlias` story + dedicated docs section showing `variant="primary"` renders identically to `variant="default"`. Variants table updated.
  - **StatusIndicator** — fixed broken docs example (was passing `status=` instead of the real prop `type=`). Added `WithChildren` and `DotOnly` stories + new docs sections for the children-fallback and dot-only patterns. Props table now lists `children` and `pulse`'s pending-default behaviour.
  - **Theme** — Storybook stories expanded to three doc cards (Overview / `defaultMode` / Resolution Order). New `/theme/api` docs page documents `ThemeProvider`, `ThemeScript`, and `useTheme` together with the full SSR-safe setup pattern (mirrors `defaultMode` between head script and provider).

  No runtime/source changes — pure docs + Storybook.

## 0.11.0

### Minor Changes

- 60ddb5a: Visual redesign of the Chat composer and the CookieConsent banner. The Chat composer is now a unified rounded input card (textarea + bottom bar with attach / formatting toolbar / send), with the inline error + retry banner restored (new optional `error`/`onRetry` props on `Composer`). The CookieConsent banner gets a cookie-icon header, a clearer button hierarchy (Customize / Reject all / Accept all), and switch-style category toggles in the settings view; the Astro `CookieConsent` mirrors the new look.

## 0.10.0

### Minor Changes

- 24c5a7b: Conversation — refine the reply-threading strategy. Replies to _any_ message in a thread (the root or a mid-thread reply) now group under the originating root (one level deep) while remembering the specific message replied to via `replyToId` (used for the quote). The "💬 N replies" count now shows on the originating message in **both** inline and panel modes, and a new `replyTo(messageId)` action + `replyTarget` state lets a reply target a specific mid-thread message while still grouping under the root.

## 0.9.0

### Minor Changes

- 73e3632: Add Conversation / Chat.

  A headless multi-conversation chat store (`createConversation`) with reply-threads, two threading modes (`inline` — replies quote their parent in the timeline and open a thread panel; `panel` — Slack-style, only roots in the timeline), reactions, edit/delete, retry/stop, and streaming through a backend-agnostic `ChatTransport` (SSE / WebSocket / fetch — the consumer's choice; nothing about the backend leaks into the UI).

  - **React** (`@refraction-ui/react`): `useConversation()` hook + a batteries-included `Chat` component — conversation sidebar, mode toggle, thread side panel, rich content (markdown / code / gifs / attachments), reactions, edit/delete, and a streaming typing indicator.
  - **Astro** (`@refraction-ui/astro`): a server-rendered `Chat` that renders both modes from the headless store and surfaces interactivity as semantic `rfr:*` CustomEvents the host app wires to its backend.

- 0cf2f56: Add CookieConsent — a headless, GDPR-style cookie-consent store (categories, accept all / reject all / save preferences, versioned persistence via a swappable storage adapter) with a React banner (`useCookieConsent` + `CookieConsent`, localStorage by default) and a server-rendered Astro `CookieConsent` banner that persists via localStorage and emits `rfr:cookie-consent`.

## 0.8.1

### Patch Changes

- 3be83e5: Remove Angular support entirely and make `@refraction-ui/shared` private.

  - Deleted all `packages/angular-*` packages, including the `@refraction-ui/angular` meta (`angular-meta`), `angular-logger`, and `angular-analytics`. `@refraction-ui/angular` is no longer published.
  - Removed Angular wiring from `update-meta-packages.cjs`, the now-dead `update-angular-meta.cjs` script, the root `@angular/*` pnpm overrides, and the root `zone.js` devDependency/override.
  - Removed all Angular pages, framework tabs, code samples, and references from the docs site, README, instrumentation policy, and the Flutter package README/comments.
  - `@refraction-ui/shared` is now `private: true` (no `publishConfig`). It is embedded into the published `@refraction-ui/react` and `@refraction-ui/astro` metas and is never published standalone. Both metas remain fully self-contained — verified by the meta self-containment tests and a pack-test (0 `@refraction-ui/*` import/require/export references in the packed runtime/declaration/shipped-source output).

  The published npm packages are now exactly: `@refraction-ui/react`, `@refraction-ui/astro`, and `@refraction-ui/tailwind-config`. The patch bump on the metas reflects the changed embedded `@refraction-ui/shared` source.

## 0.8.0

### Minor Changes

- 6c85463: feat: re-surface the GA4 / Azure App Insights / PostHog analytics sinks through the per-framework metas, embedded so no meta ships a private package reference

  The framework analytics adapters again re-export `createGA4Sink`,
  `createAppInsightsSink`, and `createPostHogSink` (plus their direct-mode
  factories, option/type contracts, and the optional lazy PostHog
  `startSessionReplay`). Consumers of `@refraction-ui/react|astro|angular`
  can fan analytics out to GA4 / Azure / PostHog without depending on the
  private sink packages directly.

  Unlike the reverted attempt, the sinks are now genuinely **embedded** by the
  metas:

  - `@refraction-ui/react`: `embed-internal-types` now rewrites subpath
    specifiers (e.g. `@refraction-ui/analytics-sink-posthog/replay`) to the
    embedded declaration entry, so the shipped `.d.ts`/`.d.cts` and bundled JS
    contain zero `@refraction-ui/*` references.
  - `@refraction-ui/astro`: the meta build now rewrites subpath specifiers to
    the copied source, so the shipped `dist/` contains zero bare
    `@refraction-ui/*` import/export/require references (Astro components ship
    as raw `.astro`/`.ts` source by necessity — the consumer's Astro toolchain
    compiles them).

  Each meta now carries a `__tests__/meta.test.ts` self-contained guardrail to
  prevent this drift from recurring.

## 0.7.0

### Minor Changes

- 7ecb568: feat: surface the GA4, Azure App Insights, and PostHog analytics sink factories through the per-framework meta packages

  The framework analytics adapters now re-export `createGA4Sink`,
  `createAppInsightsSink`, and `createPostHogSink` (plus their direct-mode
  factories, option/type contracts, and the optional lazy PostHog
  `startSessionReplay`), so consumers of `@refraction-ui/react|astro|angular`
  can fan analytics out to GA4 / Azure / PostHog without depending on the
  private sink packages directly.

## 0.6.0

### Minor Changes

- f31e058: feat: surface telemetry (logger) and analytics adapters through the per-framework meta packages

## 0.5.1

### Patch Changes

- 01c7f71: Fix VoicePill and Waveform docs behavior, add inline VoicePill placement and Waveform amplitude control, smooth generated waveform animation, and patch audited dependency versions.

## 0.5.0

### Minor Changes

- Add VoicePill and Waveform primitives to the Astro and Angular framework packages.

## 0.4.7

### Patch Changes

- 6319dc8: Trigger full publish cycle to synchronize npm latest tag

## 0.4.6

### Patch Changes

- fix: trigger fresh release for select component fixes

  - Fixed select keyboard navigation and hover styles that were missed in the previous force-pushed release.

## 0.4.5

### Patch Changes

- fix: direct version bump to bypass canary tag and publish to latest

## 0.4.4

### Patch Changes

- 5f12c8a: fix(astro): bundle transitive workspace dependencies in astro-meta to resolve missing core logic

  - Updated custom build script for astro-meta to dynamically traverse and bundle all internal `@refraction-ui/*` dependencies (e.g. `app-shell`, `ai`, `auth`, `charts`) that are required by the Astro components.
  - Ensures the single-package distribution is completely standalone and does not throw 404s when attempting to resolve internal core packages.

## 0.4.3

### Patch Changes

- d6c99d0: fix: force version bump to resolve npm registry canary conflict

## 0.4.2

### Patch Changes

- dff56a1: fix: implement source copier build strategy for astro meta-package

  - Added a custom build script that consolidates all private `astro-*` workspace components into a single `dist` directory.
  - Updated internal imports to relative paths.
  - Configured the meta-package to export the unified `dist` folder.
  - Ensures consumers can use the library as a single package while retaining Astro's native component optimizations.

## 0.4.1

### Patch Changes

- a1bbf02: fix: move all internal workspace package references to devDependencies to prevent EUNSUPPORTEDPROTOCOL during npm install of meta-packages

## 0.4.0

### Minor Changes

- 29a896e: feat(command-input): add robust headless rich text command input primitive (like Slack/ChatGPT) for complex mentions and slashed commands
- 29a896e: feat: add robust HTTP wrapper client with auth interceptors and type safety
  feat: add location-selector component featuring independent, autocomplete-enabled Country and Language selection dropdowns (powered by core i18n logic)

### Patch Changes

- @refraction-ui/astro-command-input@0.1.1
- @refraction-ui/astro-payment@0.1.3

## 0.3.1

### Patch Changes

- dabcbd6: chore: force release to update latest npm tags
  - @refraction-ui/astro-callout@0.1.2
  - @refraction-ui/astro-card-grid@0.1.2
  - @refraction-ui/astro-carousel@0.1.2
  - @refraction-ui/astro-code-block@0.1.2
  - @refraction-ui/astro-link-card@0.1.2
  - @refraction-ui/astro-pagination@0.1.2
  - @refraction-ui/astro-payment@0.1.2
  - @refraction-ui/astro-skip-to-content@0.1.2
  - @refraction-ui/astro-slider@0.1.2
  - @refraction-ui/astro-steps@0.1.2
  - @refraction-ui/astro-table-of-contents@0.1.2

## 0.3.0

### Minor Changes

- f7c05bb: feat: Massive multi-framework expansion! Added Table of Contents, Carousel, Slider, and Pagination components across React, Astro, Angular, and Vue. Updated all documentation pages to natively display code tabs for every supported framework. Implemented Design Tokens Zod Schema and EngineAdapter interface with a proof-of-concept Radix Dialog wrapper.
- 871b0cc: feat: add payment component wrapper for Stripe integration
- b6293a6: feat: add remaining requested components (Callout, Steps, FileTree, Icon System, SkipToContent, CodeBlock, LinkCard, CardGrid) across all supported frameworks

### Patch Changes

- 89882b5: feat: add accordion component
- ec93176: chore: verify automated canary publish from GitHub Actions
- 33d3a5e: fix: resolve horizontal scrollbar/overflow issues on mobile viewports for DataTable, Tabs, and Breadcrumbs components
- c083c7d: docs: update readme to reflect supported and planned frameworks and trigger a final release test
- 4bd4185: chore: final verification of per-package OIDC publishing logic
  - @refraction-ui/astro-table-of-contents@0.1.1
  - @refraction-ui/astro-carousel@0.1.1
  - @refraction-ui/astro-slider@0.1.1
  - @refraction-ui/astro-pagination@0.1.1
  - @refraction-ui/astro-payment@0.1.1
  - @refraction-ui/astro-callout@0.1.1
  - @refraction-ui/astro-steps@0.1.1
  - @refraction-ui/astro-skip-to-content@0.1.1
  - @refraction-ui/astro-code-block@0.1.1
  - @refraction-ui/astro-link-card@0.1.1
  - @refraction-ui/astro-card-grid@0.1.1

## 0.2.0

### Minor Changes

- 370a1c7: feat: add Astro component wrappers for all UI components

  Added Astro versions of all 60 refraction-ui components, wrapping the
  headless core packages with native .astro component files.
