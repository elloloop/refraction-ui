---
id: PKG-SHARED
track: architecture
depends_on: ["PKG-CORE"]
size: M
labels: [feat, infra]
status: pending
---

## Summary

Create `@refraction-ui/shared` — common types, utilities, and contracts used by every headless core and framework wrapper package.

## Exports

```typescript
// Types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
export type Orientation = 'horizontal' | 'vertical'
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'

// CSS token contract
export interface TokenContract {
  name: string
  tokens: Record<string, { variable: string; fallback: string }>
}

// ARIA helpers
export function mergeAriaProps(...props: Record<string, string>[]): Record<string, string>
export function generateId(prefix?: string): string

// Keyboard
export type KeyboardHandlerMap = Record<string, (e: KeyboardEvent) => void>
export const Keys = { Enter: 'Enter', Space: ' ', Escape: 'Escape', ArrowUp: 'ArrowUp', ... }

// State machine
export interface StateMachine<S, E> { state: S; send(event: E): void; subscribe(fn: (s: S) => void): () => void }
export function createMachine<S, E>(config: MachineConfig<S, E>): StateMachine<S, E>

// Class merge
export function cn(...inputs: ClassValue[]): string
```

## Acceptance Criteria

- [ ] All types exported and documented
- [ ] `createMachine()` — minimal state machine (< 1KB, no external deps)
- [ ] `cn()` — canonical clsx + tailwind-merge implementation
- [ ] `generateId()` — SSR-safe unique ID generation
- [ ] ARIA merge utility
- [ ] Keyboard constants
- [ ] Zero runtime dependencies (clsx and tailwind-merge are the only deps)
- [ ] Unit tests for all utilities
- [ ] Published as `@refraction-ui/shared`
