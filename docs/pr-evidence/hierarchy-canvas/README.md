# Hierarchy canvas review captures

The same six-team sample is shown at 375px, 768px and 1440px in light and dark appearances. `before-*` renders the existing FileTree outline from parent revision 00a3871d5dbda209f75e0f6b972f13bd2e961d3a. `after-*` renders the new HierarchyCanvas example in each orientation. FileTree remains available; these captures compare the existing outline pattern with the newly available diagram pattern.

Captures use the real adapters and Storybook tokens in an isolated Vite harness, with system-color media emulation and a fixed 960px viewport height. They are static light/dark variants, not adaptive images. The harness exercised direction selection, zoom and keyboard expansion with focus retention in all six size/appearance combinations (6 passed). SSR/unit tests cover structure and deterministic geometry separately.

Fresh captures use the repaired current toolchain and exact frozen lockfile. The real Storybook build provides the stylesheet; the generic harness imports the actual unchanged base FileTree and current HierarchyCanvas example. All18images were recaptured in both appearances. Six real browser cases pass both directions, keyboard collapse/expand with focus retention, root visibility, zoom and no page overflow. Full1116canonicaltasks and0high/critical audit pass. No source assertion, font or visual threshold was changed.

The first current-head visual gate captured the newly registered docs page but had no chromium/mobile page references. Those two full original Ubuntu PNGs from artifact11790886413 were inspected and adopted byte-identically.395other tests passed,1existing navigation retry was recorded. No existing reference, assertion, font or threshold is changed. Full fresh final-head CI remains required.
