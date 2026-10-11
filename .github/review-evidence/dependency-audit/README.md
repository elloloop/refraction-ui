# Dependency audit compiler comparison

Before: exact PR merge base cc2765c250178ab58db0babd99f1dd7c8c9a211b.
After: source/tooling update in this PR, before committing these captures.

Actual built React Storybook FormDialog uses the same synthetic John Doe profile at 375, 768 and 1440 pixels, height900, in light/dark. A local fixture supplies System/Light/Dark selection and disables capture-only animation/transitions. Viewport DOM dimensions were checked and captures taken after layout applied. The fixture changes no component source or data. The newer compiler slightly changes preview spacing; component class strings/public API are unchanged.

Documentation captures use the exact built Next static SSR home HTML and emitted CSS at1440x900, with relative asset links. Hydration scripts are omitted solely in this local capture fixture because the shared path proxy cannot serve Next root asset URLs. The surrounding fixture explicitly labels this as static SSR and supplies theme class selection. These captures prove CSS/layout only, not client navigation/hydration. Both real documentation builds and the full lint/typecheck/test/build gate pass.

PNG captures are synthetic public-library review evidence, not production People data. No screenshot is edited.
