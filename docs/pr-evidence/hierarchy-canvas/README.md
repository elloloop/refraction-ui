# Hierarchy canvas review captures

The same six-team sample is shown at 375px, 768px and 1440px in light and dark appearances. `before-*` renders the existing FileTree outline from parent revision cc2765c250178ab58db0babd99f1dd7c8c9a211b. `after-*` renders the new HierarchyCanvas example in each orientation. FileTree remains available; these captures compare the existing outline pattern with the newly available diagram pattern.

Captures use the real adapters and Storybook tokens in an isolated Vite harness, with system-color media emulation and a fixed 960px viewport height. They are static light/dark variants, not adaptive images. The harness exercised direction selection, zoom and keyboard expansion with focus retention in all six size/appearance combinations (6 passed). SSR/unit tests cover structure and deterministic geometry separately.
