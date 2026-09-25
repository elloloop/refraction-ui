---
'@refraction-ui/react': patch
---

Fix `Tabs` keyboard access: `TabsList` now implements WAI-ARIA roving focus — Arrow keys (Left/Right, or Up/Down when `orientation="vertical"`) and Home/End move focus between tabs and select them, skipping disabled tabs. When no tab is selected the first enabled tab is the tab stop, so the list is always reachable with Tab. A consumer `onKeyDown` that calls `preventDefault()` opts out.
