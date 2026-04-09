---
id: MIGRATE-TELL-A-TALE
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "COMP-BUTTON", "COMP-CALENDAR"]
size: M
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/tell-a-tale to use @elloloop/* packages.

## Repository Details

- **Repo**: `elloloop/tell-a-tale` (public)
- **Stack**: Next.js 15, React 18, Tailwind CSS v3, shadcn, Radix, Redux Toolkit, date-fns
- **Pages**: Home, Stories, About, Admin (calendar dashboard)

## Components to Replace

| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/components/ui/button.tsx` | `@elloloop/react/button` |
| `src/shared/lib/utils.ts` (cn) | `@elloloop/react/utils/cn` |
| `src/features/admin/components/Calendar.tsx` | `@elloloop/react/calendar` |
| `src/shared/components/Header.tsx` | `@elloloop/react/navbar` (adapt) |
| `src/shared/components/Footer.tsx` | `@elloloop/react/footer` |
| `src/app/globals.css` (CSS vars) | `@elloloop/tailwind-config` preset |
| `tailwind.config.ts` | Extend `@elloloop/tailwind-config` |
| `src/shared/lib/logger.ts` | `@elloloop/react/utils/logger` |

## Dependencies to Remove

- `@radix-ui/react-slot` (provided by refraction-ui)
- `class-variance-authority` (provided by refraction-ui)
- `clsx` (provided by refraction-ui)
- `tailwind-merge` (provided by refraction-ui)
- `tailwindcss-animate` (provided by refraction-ui tailwind preset)

## Tasks

- [ ] Add `@elloloop/react` and `@elloloop/tailwind-config`
- [ ] Replace Button import
- [ ] Replace cn() import
- [ ] Replace Calendar with refraction-ui version
- [ ] Adapt Header/Footer to use refraction-ui layout components
- [ ] Update Tailwind config to extend refraction preset
- [ ] Remove unused dependencies
- [ ] Test all pages
