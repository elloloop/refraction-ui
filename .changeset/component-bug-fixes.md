---
'@refraction-ui/react': patch
---

- **DropdownMenu**: `DropdownMenuTrigger` now implements `asChild` — it merges the trigger's props and toggle behavior onto the child element instead of rendering a `<button>` around it (nested buttons are invalid HTML and caused a hydration error on the docs page). The `asChild` prop no longer leaks to the DOM.
- **FeedbackDialog**: `children` (the trigger) now render in every state instead of being silently dropped when the dialog is closed, and a new `defaultOpen` prop gives uncontrolled initial-open (the docs story's `defaultOpen` previously did nothing and rendered a blank page).
- **Conversation**: the message timestamp `title` tooltip uses a deterministic `toISOString()` instead of `toLocaleString()`, which differs between the SSR server and the browser's timezone and broke hydration on the docs page.
