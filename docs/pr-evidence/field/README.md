# Field review captures

Docs-site pages at 1440px and 375px wide, in light and dark, rendered by the Next.js dev server with Chromium. `before-*` is the Form page at the parent revision: until now, a labelled control with a hint came from the react-hook-form primitives, which need a form context. `after-*` is the new Field page: the same label-and-hint pattern for any control and any form library, in the stacked, inline, filter-row and nested-control examples. Form is unchanged.

Each capture is the page heading plus its example sections. `browser-proof.json` records, for every capture, page overflow and browser errors, and on the Field page what the browser itself resolved: all 7 labels name a control (`label.control`), all 3 hints describe a control through `aria-describedby`, the nested Password label names the input rather than its wrapper, clicking the inline "Show archived projects" label toggles the checkbox, and no id is duplicated.

The one browser error, in dark mode only, is a hydration mismatch in the docs site's own colour-mode toggle; it appears on the parent revision too and is not part of this change.
