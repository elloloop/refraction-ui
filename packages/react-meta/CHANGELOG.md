# @refraction-ui/react

## 0.2.0

### Minor Changes

- f7c05bb: feat: Massive multi-framework expansion! Added Table of Contents, Carousel, Slider, and Pagination components across React, Astro, Angular, and Vue. Updated all documentation pages to natively display code tabs for every supported framework. Implemented Design Tokens Zod Schema and EngineAdapter interface with a proof-of-concept Radix Dialog wrapper.
- 871b0cc: feat: add payment component wrapper for Stripe integration
- b6293a6: feat: add remaining requested components (Callout, Steps, FileTree, Icon System, SkipToContent, CodeBlock, LinkCard, CardGrid) across all supported frameworks

### Patch Changes

- 89882b5: feat: add accordion component
- ec93176: chore: verify automated canary publish from GitHub Actions
- 33d3a5e: fix: resolve horizontal scrollbar/overflow issues on mobile viewports for DataTable, Tabs, and Breadcrumbs components
- 6f4b3cd: fix: add trailingSlash to next config to fix Next.js 404 issue on GitHub Pages
  feat: implement Accordion interactive examples
- c083c7d: docs: update readme to reflect supported and planned frameworks and trigger a final release test
- 4bd4185: chore: final verification of per-package OIDC publishing logic
- Updated dependencies [8a746a4]
- Updated dependencies [ecacee5]
  - @refraction-ui/react-payment@0.2.0
  - @refraction-ui/react-table-of-contents@0.1.1
  - @refraction-ui/react-carousel@0.1.1
  - @refraction-ui/react-slider@0.1.1
  - @refraction-ui/react-pagination@0.1.1
  - @refraction-ui/react-callout@0.1.1
  - @refraction-ui/react-steps@0.1.1
  - @refraction-ui/react-skip-to-content@0.1.1
  - @refraction-ui/react-code-block@0.1.1
  - @refraction-ui/react-link-card@0.1.1
  - @refraction-ui/react-card-grid@0.1.1

## 0.1.2

### Patch Changes

- 30d38ee: chore: test new changesets + oidc release workflow
