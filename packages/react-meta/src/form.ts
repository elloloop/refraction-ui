/**
 * @refraction-ui/react/form
 *
 * RSC client boundary (RHF-backed primitives use React context + hooks).
 * Do NOT add a `'use client'` directive here — it is injected post-build by
 * scripts/ensure-use-client.mjs (bundling strips a source/banner directive).
 * This subpath is safe to import from a Next.js App Router Server Component.
 *
 * Opt-in subpath for React Hook Form-backed primitives. Keeping these exports
 * out of the root entry prevents ordinary component consumers from having to
 * install or resolve react-hook-form.
 *
 *   import { Form, FormField, useForm } from '@refraction-ui/react/form'
 */

export * from '@refraction-ui/react-form'
