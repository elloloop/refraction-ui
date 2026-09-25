---
'@refraction-ui/tailwind-config': minor
---

Accessible feedback, highlight, surface and focus color roles (parity with the Flutter `refraction_ui` tokens). Additive: `success|warning|info|destructive` gain `soft` / `soft-foreground`; new `mention` (+ `foreground`, `self`, `self-foreground`), `highlight`, `selection`, `surface-sunken|raised|overlay`, `scrim` and `focus-ring`. Every new utility falls back to an existing variable, so stylesheets that don't define the new CSS vars render exactly as before.
