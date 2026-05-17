# @refraction-ui/react-analytics

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

- 25e712e: feat: add @refraction-ui/analytics events/sessions core and @refraction-ui/react-analytics adapter

### Patch Changes

- Updated dependencies [cf1d82e]
- Updated dependencies [bfeeb83]
- Updated dependencies [25e712e]
  - @refraction-ui/shared@0.2.0
  - @refraction-ui/analytics@0.2.0
