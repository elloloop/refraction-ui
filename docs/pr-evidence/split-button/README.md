# Split Button review captures

Docs-site pages from a production build (`next build` + `next start`) in Chromium (Playwright), with reduced motion. Desktop captures are 1280×900 at 1x; the phone capture is 390×844 at 2x. `before-*` is the merge base on `main`; `after-*` is this branch.

- `before-desktop-light.png`: `/components/split-button/` on `main` is a 404. The library has no split button.
- `after-desktop-light.png` / `after-desktop-dark.png`: the new Split Button page in light and dark: the Basic example and every Button variant, each a primary action and a caret.
- `after-menu-open-light.png`: the Basic caret focused and ArrowDown pressed. The menu opens under the control, its end edge on the caret's, with its first item focused.
- `after-sizes-dark.png`: every Button size, with the caret as tall as the action, in dark.
- `after-phone-light.png`: the page at phone width, with no horizontal scroll.
- `before-message-row-menu.png` / `after-message-row-menu.png`: the DropdownMenu fix in this branch, on an existing end-aligned menu (Message Row's "More actions", opened by a click). On `main` its first open lands at the left edge of the page, over the sidebar (menu at x 0, trigger at x 1124). On this branch it opens under its trigger, its end edge on the trigger's (menu at x 1013, width 143; trigger at x 1124, width 32).
