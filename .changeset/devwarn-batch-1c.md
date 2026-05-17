---
"@refraction-ui/react-dialog": minor
"@refraction-ui/react-tabs": minor
"@refraction-ui/react-popover": minor
"@refraction-ui/react-tooltip": minor
"@refraction-ui/react-dropdown-menu": minor
"@refraction-ui/react-command": minor
"@refraction-ui/react-combobox": minor
"@refraction-ui/react-form": minor
"@refraction-ui/react-accordion": minor
"@refraction-ui/react-collapsible": minor
---

feat: add dev-only `devWarn` at compound-context misuse seams (epic #254 Wave 1, issue #256, batch 1C)

Adds a warn-once, env-guarded `devWarn` from `@refraction-ui/shared` immediately
before each existing compound-component context guard `throw` in the high-traffic
compound-context-throw footgun primitives (Dialog, Tabs, Popover, Tooltip,
DropdownMenu, Command, Combobox, Form, Accordion, Collapsible). The existing
`throw` is preserved unchanged — `devWarn` augments it with an actionable,
greppable message and is fully stripped in production. Per the instrumentation
policy this is the footgun minority only; no blanket logging, no new deps.
