# @refraction-ui/angular

## 0.3.1

### Patch Changes

- a1bbf02: fix: move all internal workspace package references to devDependencies to prevent EUNSUPPORTEDPROTOCOL during npm install of meta-packages

## 0.3.0

### Minor Changes

- 29a896e: feat(command-input): add robust headless rich text command input primitive (like Slack/ChatGPT) for complex mentions and slashed commands
- 29a896e: feat: add robust HTTP wrapper client with auth interceptors and type safety
  feat: add location-selector component featuring independent, autocomplete-enabled Country and Language selection dropdowns (powered by core i18n logic)

### Patch Changes

- @refraction-ui/angular-command-input@0.1.1
- @refraction-ui/angular-payment@0.1.3

## 0.2.1

### Patch Changes

- dabcbd6: chore: force release to update latest npm tags
  - @refraction-ui/angular-accordion@0.1.2
  - @refraction-ui/angular-breadcrumbs@0.1.2
  - @refraction-ui/angular-carousel@0.1.2
  - @refraction-ui/angular-code-block@0.1.2
  - @refraction-ui/angular-dialog@0.1.2
  - @refraction-ui/angular-pagination@0.1.2
  - @refraction-ui/angular-payment@0.1.2
  - @refraction-ui/angular-popover@0.1.2
  - @refraction-ui/angular-progress-display@0.1.2
  - @refraction-ui/angular-skeleton@0.1.2
  - @refraction-ui/angular-skip-to-content@0.1.2
  - @refraction-ui/angular-table-of-contents@0.1.2
  - @refraction-ui/angular-tabs@0.1.2
  - @refraction-ui/angular-tooltip@0.1.2
  - @refraction-ui/angular-avatar@0.1.2
  - @refraction-ui/angular-badge@0.1.2
  - @refraction-ui/angular-button@0.1.2
  - @refraction-ui/angular-callout@0.1.2
  - @refraction-ui/angular-card@0.1.2
  - @refraction-ui/angular-card-grid@0.1.2
  - @refraction-ui/angular-checkbox@0.1.3
  - @refraction-ui/angular-input@0.1.3
  - @refraction-ui/angular-link-card@0.1.2
  - @refraction-ui/angular-slider@0.1.2
  - @refraction-ui/angular-steps@0.1.2
  - @refraction-ui/angular-switch@0.1.3
  - @refraction-ui/angular-textarea@0.1.3

## 0.2.0

### Minor Changes

- b1192f3: feat: add empty meta packages for future framework support
- f7c05bb: feat: Massive multi-framework expansion! Added Table of Contents, Carousel, Slider, and Pagination components across React, Astro, Angular, and Vue. Updated all documentation pages to natively display code tabs for every supported framework. Implemented Design Tokens Zod Schema and EngineAdapter interface with a proof-of-concept Radix Dialog wrapper.
- 871b0cc: feat: add payment component wrapper for Stripe integration
- b6293a6: feat: add remaining requested components (Callout, Steps, FileTree, Icon System, SkipToContent, CodeBlock, LinkCard, CardGrid) across all supported frameworks

### Patch Changes

- 675147f: feat: initialize foundational Angular wrappers and update documentation site tabs
- c083c7d: docs: update readme to reflect supported and planned frameworks and trigger a final release test
- 4bd4185: chore: final verification of per-package OIDC publishing logic
  - @refraction-ui/angular-accordion@0.1.1
  - @refraction-ui/angular-tabs@0.1.1
  - @refraction-ui/angular-breadcrumbs@0.1.1
  - @refraction-ui/angular-table-of-contents@0.1.1
  - @refraction-ui/angular-carousel@0.1.1
  - @refraction-ui/angular-slider@0.1.1
  - @refraction-ui/angular-pagination@0.1.1
  - @refraction-ui/angular-payment@0.1.1
  - @refraction-ui/angular-callout@0.1.1
  - @refraction-ui/angular-steps@0.1.1
  - @refraction-ui/angular-skip-to-content@0.1.1
  - @refraction-ui/angular-code-block@0.1.1
  - @refraction-ui/angular-link-card@0.1.1
  - @refraction-ui/angular-card-grid@0.1.1
  - @refraction-ui/angular-dialog@0.1.1
  - @refraction-ui/angular-popover@0.1.1
  - @refraction-ui/angular-progress-display@0.1.1
  - @refraction-ui/angular-skeleton@0.1.1
  - @refraction-ui/angular-tooltip@0.1.1
  - @refraction-ui/angular-avatar@0.1.1
  - @refraction-ui/angular-badge@0.1.1
  - @refraction-ui/angular-button@0.1.1
  - @refraction-ui/angular-card@0.1.1
  - @refraction-ui/angular-checkbox@0.1.2
  - @refraction-ui/angular-input@0.1.2
  - @refraction-ui/angular-switch@0.1.2
  - @refraction-ui/angular-textarea@0.1.2
