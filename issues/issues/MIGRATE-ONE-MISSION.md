---
id: MIGRATE-ONE-MISSION
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "COMP-BUTTON"]
size: S
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/one-mission to use @refraction-ui/* packages. Smallest migration — this is a scaffold with only Button and cn().

## Repository Details

- **Repo**: `elloloop/one-mission` (public)
- **Stack**: Next.js 14, React 18, Tailwind CSS v3, shadcn, Radix, Firebase (unused)
- **Pages**: Home page only

## Components to Replace

| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/components/ui/button.tsx` | `@refraction-ui/react/button` |
| `src/shared/lib/utils.ts` (cn) | `@refraction-ui/react/utils/cn` |
| `src/shared/config/firebase.ts` | `@refraction-ui/react/auth` (when needed) |
| `src/app/globals.css` (CSS vars) | `@refraction-ui/tailwind-config` preset |
| `tailwind.config.ts` | Extend `@refraction-ui/tailwind-config` |

## Dependencies to Remove

- `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`
- `@reduxjs/toolkit`, `react-redux` (unused)
- `firebase`, `firebase-admin` (unused)
- `date-fns`, `lucide-react` (unused)

## Tasks

- [ ] Add `@refraction-ui/react` and `@refraction-ui/tailwind-config`
- [ ] Replace Button and cn() imports
- [ ] Update Tailwind config
- [ ] Remove all unused dependencies (major cleanup)
- [ ] Test home page
