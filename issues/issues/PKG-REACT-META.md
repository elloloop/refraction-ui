---
id: PKG-REACT-META
track: frameworks
depends_on: ["PKG-CORE"]
size: S
labels: [feat, infra]
status: pending
---

## Summary

Create `@elloloop/react` meta-package — a convenience bundle that re-exports all `@elloloop/react-*` packages. Users who want everything install one package; users who want granularity install individual `react-*` packages.

## Usage

```bash
# Install everything
pnpm add @elloloop/react

# Or pick what you need
pnpm add @elloloop/react-button @elloloop/react-dialog @elloloop/react-theme
```

```tsx
// Both work:
import { Button } from '@elloloop/react'
import { Button } from '@elloloop/react-button'
```

## Acceptance Criteria

- [ ] Re-exports all `@elloloop/react-*` packages
- [ ] package.json lists all react-* packages as dependencies
- [ ] Barrel index.ts with named re-exports (tree-shakeable)
- [ ] No own source code — pure re-export package
- [ ] Auto-updated when new react-* packages are added (script or CI check)
