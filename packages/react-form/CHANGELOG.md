# @refraction-ui/react-form

## 0.2.0

### Minor Changes

- a41fd2f: Add `@refraction-ui/react-form` — opinionated wrappers around `react-hook-form` for consistent validation styling.

  Components: `Form` (alias of `FormProvider`), `FormField` (Controller wrapper), `FormItem`, `FormLabel`, `FormControl` (Slot that injects `id` / `aria-describedby` / `aria-invalid`), `FormDescription`, `FormMessage`. Plus the `useFormField()` hook for custom controls, and convenience re-exports of the most common RHF symbols (`useForm`, `Controller`, `useFormContext`, etc.).

  `react-hook-form` is an **optional peer dependency** (`>=7.43.0`). The `@refraction-ui/react` meta package adds the same optional peer so consumers who don't use the form helpers don't need to install it. A small inline `Slot` (~80 LOC) replaces the typical `@radix-ui/react-slot` dependency, keeping zero non-RHF runtime deps.
