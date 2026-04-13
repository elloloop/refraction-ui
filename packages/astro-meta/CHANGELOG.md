# @refraction-ui/astro

## 0.3.1

### Patch Changes

- dabcbd6: chore: force release to update latest npm tags
  - @refraction-ui/astro-callout@0.1.2
  - @refraction-ui/astro-card-grid@0.1.2
  - @refraction-ui/astro-carousel@0.1.2
  - @refraction-ui/astro-code-block@0.1.2
  - @refraction-ui/astro-link-card@0.1.2
  - @refraction-ui/astro-pagination@0.1.2
  - @refraction-ui/astro-payment@0.1.2
  - @refraction-ui/astro-skip-to-content@0.1.2
  - @refraction-ui/astro-slider@0.1.2
  - @refraction-ui/astro-steps@0.1.2
  - @refraction-ui/astro-table-of-contents@0.1.2

## 0.3.0

### Minor Changes

- f7c05bb: feat: Massive multi-framework expansion! Added Table of Contents, Carousel, Slider, and Pagination components across React, Astro, Angular, and Vue. Updated all documentation pages to natively display code tabs for every supported framework. Implemented Design Tokens Zod Schema and EngineAdapter interface with a proof-of-concept Radix Dialog wrapper.
- 871b0cc: feat: add payment component wrapper for Stripe integration
- b6293a6: feat: add remaining requested components (Callout, Steps, FileTree, Icon System, SkipToContent, CodeBlock, LinkCard, CardGrid) across all supported frameworks

### Patch Changes

- 89882b5: feat: add accordion component
- ec93176: chore: verify automated canary publish from GitHub Actions
- 33d3a5e: fix: resolve horizontal scrollbar/overflow issues on mobile viewports for DataTable, Tabs, and Breadcrumbs components
- c083c7d: docs: update readme to reflect supported and planned frameworks and trigger a final release test
- 4bd4185: chore: final verification of per-package OIDC publishing logic
  - @refraction-ui/astro-table-of-contents@0.1.1
  - @refraction-ui/astro-carousel@0.1.1
  - @refraction-ui/astro-slider@0.1.1
  - @refraction-ui/astro-pagination@0.1.1
  - @refraction-ui/astro-payment@0.1.1
  - @refraction-ui/astro-callout@0.1.1
  - @refraction-ui/astro-steps@0.1.1
  - @refraction-ui/astro-skip-to-content@0.1.1
  - @refraction-ui/astro-code-block@0.1.1
  - @refraction-ui/astro-link-card@0.1.1
  - @refraction-ui/astro-card-grid@0.1.1

## 0.2.0

### Minor Changes

- 370a1c7: feat: add Astro component wrappers for all UI components

  Added Astro versions of all 60 refraction-ui components, wrapping the
  headless core packages with native .astro component files.
