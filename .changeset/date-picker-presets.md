---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

`DatePicker` takes `presets`: one-click dates shown as buttons after the input, such as "Today", "Tomorrow" and "Next week".

- `createDefaultDatePresets({ labels, weekStartsOn })` gives those three, with translated labels and the locale's first day of the week ("Next week" is the next one). Add your own presets as data: `{ id, label, weekday?, days? }` moves to the next `weekday` after today, then adds `days`.
- Each preset is a native button in the tab order after the input, chosen with Enter or Space, inside a group named by `presetsLabel` (default "Date shortcuts"). Labels are shown as given.
- A preset outside `minDate` or `maxDate` is disabled. Each resolves again when chosen, so a page left open past midnight picks the right day. With `showTime`, the time already chosen is kept.
- React calls `onChange` with the chosen day. Pass `today` when server-rendering presets with `minDate` or `maxDate` so the server and the browser agree on which are disabled.
- Astro resolves presets in the browser, so a statically built page stays correct, and fills the input with `input` and `change` events like a typed date. `DatePicker` is now exported by name from `@refraction-ui/astro`.
