# @refraction-ui/react-theme

## 0.2.0

### Minor Changes

- 15676eb: feat: devWarn footgun rollout — Batch 1A (epic #254 Wave 1, issue #256)

  Add dev-only, warn-once `devWarn` (from `@refraction-ui/shared`) at every
  provider/required-context misuse seam in the React provider-context-throw
  footgun packages, per `docs/instrumentation/policy.md`. The existing `throw`
  is KEPT in every case — runtime behavior is unchanged, and `devWarn` is
  env-guarded so it is stripped in production.

  Seams instrumented:

  - `@refraction-ui/react-ai`: `useAI` / `useTTS` called outside their providers.
  - `@refraction-ui/react-auth`: `<AuthProvider>` rendered without the required
    `adapter`; `useAuth` called outside `<AuthProvider>`.
  - `@refraction-ui/react-analytics`: `useAnalytics` called outside
    `<AnalyticsProvider>`.
  - `@refraction-ui/react-theme`: `useTheme` called outside `<ThemeProvider>`.
  - `@refraction-ui/react-toast`: `useToast` called outside `<ToastProvider>`.
  - `@refraction-ui/react-logger`: `useTelemetry` / `useSpan` called outside
    `<TelemetryProvider>`.

### Patch Changes

- Updated dependencies [cf1d82e]
- Updated dependencies [bfeeb83]
  - @refraction-ui/shared@0.2.0
  - @refraction-ui/theme@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies [6319dc8]
  - @refraction-ui/shared@0.1.4
  - @refraction-ui/theme@0.1.5

## 0.1.4

### Patch Changes

- f98992f: fix: update component configurations and dependencies
- Updated dependencies [f98992f]
  - @refraction-ui/theme@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [dabcbd6]
  - @refraction-ui/shared@0.1.3
  - @refraction-ui/theme@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [c083c7d]
  - @refraction-ui/shared@0.1.2
  - @refraction-ui/theme@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [30d38ee]
  - @refraction-ui/shared@0.1.1
  - @refraction-ui/theme@0.1.1
