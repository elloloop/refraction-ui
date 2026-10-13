# Dependency audit compiler comparison

Before: exact PR merge base cc2765c250178ab58db0babd99f1dd7c8c9a211b.
After: source/tooling update in this PR, before committing these captures.

Actual built React Storybook FormDialog uses the same synthetic John Doe profile at 375, 768 and 1440 pixels, height900, in light/dark. A local fixture supplies System/Light/Dark selection and disables capture-only animation/transitions. Viewport DOM dimensions were checked and captures taken after layout applied. The fixture changes no component source or data. The newer compiler slightly changes preview spacing; component class strings/public API are unchanged.

Documentation captures use the exact built Next static SSR home HTML and emitted CSS at1440x900, with relative asset links. Hydration scripts are omitted solely in this local capture fixture because the shared path proxy cannot serve Next root asset URLs. The surrounding fixture explicitly labels this as static SSR and supplies theme class selection. These captures prove CSS/layout only, not client navigation/hydration. Both real documentation builds and the full lint/typecheck/test/build gate pass.

PNG captures are synthetic public-library review evidence, not production People data. No screenshot is edited.

## Ubuntu baseline review

The existing `Update Visual Baselines` run 38324246470 completed on source
`e42c1a6e58d9dc47859450c5d863e083f54d42e6`: 393 tests passed and one was
skipped. Its generated commit `24df3d79a9b44dbc62f0f258cfa53ffd9f3f9ae9`
changes 359 PNG files only. Test source, assertions and screenshot tolerances are
unchanged. These are the workflow's original Ubuntu images, not macOS refreshes
or edited screenshots.

Review covered an overview of every changed capture plus full before/after
comparisons for mobile Dialog, Form, Input, Button, Composer, Select-open,
desktop Popover-open and Steps, and the mobile InsightIQ landing page. The
compiler produces tighter spacing while the sampled controls, labels, sections
and state cues remain present. The largest Steps change is explained by its
horizontal example now rendering horizontally instead of vertically. The
mobile documentation tables already scroll/clip to their container in the old
captures; this update does not introduce that layout. The overview is a broad
rendering check, not a claim to have inspected every pixel of all 359 images.

The paired Storybook Dialog and documentation evidence above separately covers
light/dark appearances. The complete new head still needs a fresh ordinary
Test Matrix, audit and visual regression verdict before merge; the successful
baseline generation does not replace that gate.

## Lost Pixel references

At `47adb57223212036ee5bb210d6284b157556465c`, the complete Test Matrix
passed. The visual workflow 38328866591 completed its Playwright stage with
393 passes plus one mobile live-captions navigation timeout that passed on
retry. Its separate Lost Pixel comparison then found differences in all 26
older reference images.

The 26 replacement PNGs come byte-for-byte from that workflow's original
`visual-diffs` artifact 11783236656, `.lostpixel/current`. All 26 before/after
pairs were checked in overview, with full-size Dialog, Config Editor and Theme
Playground inspected. Controls, sections, colors and example content remain
present; the differences include the reviewed compiler spacing and sidebar
height changes. The dark StudioX example remains readable. No source, fonts,
comparison threshold, error guard or test assertion changes accompany this
reference update.

These references require a new ordinary current-head visual comparison; the
failed older run is not retried unchanged and baseline generation is not
requested again.
