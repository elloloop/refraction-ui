---
id: PKG-ANGULAR-META
track: frameworks
depends_on: ["PKG-CORE"]
size: M
labels: [feat, infra]
status: pending
---

## Summary

Create `@elloloop/angular` meta-package and the Angular wrapper infrastructure. Each headless core component gets an Angular wrapper (`@elloloop/angular-<component>`) using Angular signals, standalone components, and NgModules for backward compatibility.

## Source References

- **elloloop/angular-monorepo** — Nx Angular monorepo with `@angular/material` + `@angular/cdk`. Apps: creator, graphql-playground, passport-photo. Uses Angular Material extensively.
- The Angular CDK patterns from this repo inform how the Angular wrappers should work.

## Angular Wrapper Pattern

```typescript
// @elloloop/angular-button
import { Component, input, computed } from '@angular/core'
import { createButton, type ButtonVariant, type ButtonSize } from '@elloloop/button'

@Component({
  selector: 'rfr-button',
  standalone: true,
  template: `<button [attr.aria-disabled]="api().ariaProps['aria-disabled']" [class]="api().classes">
    <ng-content />
  </button>`
})
export class RfrButton {
  variant = input<ButtonVariant>('default')
  size = input<ButtonSize>('md')
  disabled = input(false)
  
  api = computed(() => createButton({
    variant: this.variant(),
    size: this.size(),
    disabled: this.disabled()
  }))
}
```

## Acceptance Criteria

- [ ] Angular wrapper template/generator for new components
- [ ] Standalone components (Angular 16+) as primary API
- [ ] NgModule exports for backward compatibility (Angular 14+)
- [ ] Uses Angular signals for reactivity binding to headless core
- [ ] `@elloloop/angular` meta-package re-exports all wrappers
- [ ] At least Button, Input, Dialog, Theme implemented as proof-of-concept
- [ ] Angular CLI schematic for `ng add @elloloop/angular-button`
- [ ] Unit tests with Angular TestBed
- [ ] Storybook for Angular (or Compodoc)
