---
id: MIGRATE-STREAM-MIND
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "THEME-PROVIDER", "AUTH-PROVIDER"]
size: XL
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/stream-mind frontend to use @refraction-ui/* packages. This is the largest migration — stream-mind is the most component-rich project and the primary source for many refraction-ui components.

## Repository Details

- **Repo**: `elloloop/stream-mind` (private)
- **Path**: `frontend/` (monorepo)
- **Stack**: Next.js 15.5.12, React 19, Tailwind CSS v4, @base-ui/react, shadcn v4, cmdk, Firebase 12
- **Pages**: 6 routes (/, /watchlist, /history, /profile, /movie/[slug], /tv, /circle/join)

## Components to Replace

### UI Primitives → `@refraction-ui/react`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/components/ui/button.tsx` | `@refraction-ui/react/button` |
| `frontend/src/components/ui/input.tsx` | `@refraction-ui/react/input` |
| `frontend/src/components/ui/textarea.tsx` | `@refraction-ui/react/textarea` |
| `frontend/src/components/ui/dialog.tsx` | `@refraction-ui/react/dialog` |
| `frontend/src/components/ui/command.tsx` | `@refraction-ui/react/command` |
| `frontend/src/components/ui/dropdown-menu.tsx` | `@refraction-ui/react/dropdown-menu` |
| `frontend/src/components/ui/popover.tsx` | `@refraction-ui/react/popover` |
| `frontend/src/components/ui/tooltip.tsx` | `@refraction-ui/react/tooltip` |
| `frontend/src/components/ui/input-group.tsx` | `@refraction-ui/react/input-group` |

### App-Level Components → `@refraction-ui/react`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/packages/ui/Toast.tsx` | `@refraction-ui/react/toast` |
| `frontend/src/packages/ui/Navbar.tsx` | `@refraction-ui/react/navbar` |
| `frontend/src/packages/ui/BottomNav.tsx` | `@refraction-ui/react/bottom-nav` |
| `frontend/src/packages/ui/InstallPrompt.tsx` | `@refraction-ui/react/install-prompt` |

### Auth → `@refraction-ui/react/auth`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/lib/auth.tsx` | `@refraction-ui/react/auth-provider` |
| `frontend/src/lib/firebase.ts` | `@refraction-ui/react/auth` (Firebase adapter) |
| `frontend/src/features/circle/RegisterFlow.tsx` | `@refraction-ui/react/signup-form` |
| `frontend/src/features/circle/RecoverFlow.tsx` | `@refraction-ui/react/login-form` |

### Video Player → `@refraction-ui/media`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/packages/video-player/*` | `@refraction-ui/media/video` |

### Utilities → `@refraction-ui/react/utils`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/lib/utils.ts` (cn) | `@refraction-ui/react/utils/cn` |
| `frontend/src/lib/slugify.ts` | `@refraction-ui/react/utils/slugify` |
| `frontend/src/lib/cache.ts` | `@refraction-ui/react/utils/cache` |
| `frontend/src/lib/identity.ts` | `@refraction-ui/react/utils/identity` |
| `frontend/src/lib/sync.ts` | `@refraction-ui/react/utils/sync` |

### Theme → `@refraction-ui/tailwind-config`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/app/globals.css` (CSS vars) | `@refraction-ui/tailwind-config` preset |

### i18n → `@refraction-ui/i18n`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/lib/detect-region.ts` | `@refraction-ui/i18n/detect-region` |
| `frontend/src/lib/languages.ts` | `@refraction-ui/i18n/languages` |

## Dependencies to Remove After Migration

- `@base-ui/react` (provided by refraction-ui)
- `class-variance-authority` (provided by refraction-ui)
- `clsx` (provided by refraction-ui)
- `tailwind-merge` (provided by refraction-ui)
- `cmdk` (provided by refraction-ui)
- `shadcn` (replaced by refraction-ui CLI)

## Tasks

- [ ] Add `@refraction-ui/react`, `@refraction-ui/media`, `@refraction-ui/i18n`, `@refraction-ui/tailwind-config` as dependencies
- [ ] Replace UI primitives imports
- [ ] Replace auth components imports
- [ ] Replace video player imports
- [ ] Replace utility imports
- [ ] Update Tailwind config to use refraction preset
- [ ] Replace i18n imports
- [ ] Remove replaced local component files
- [ ] Remove unused dependencies from package.json
- [ ] Run all tests and verify no regressions
- [ ] Update CI to use refraction-ui packages
