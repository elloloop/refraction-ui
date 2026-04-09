---
id: MIGRATE-STREAM-MIND
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "THEME-PROVIDER", "AUTH-PROVIDER"]
size: XL
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/stream-mind frontend to use @elloloop/* packages. This is the largest migration — stream-mind is the most component-rich project and the primary source for many refraction-ui components.

## Repository Details

- **Repo**: `elloloop/stream-mind` (private)
- **Path**: `frontend/` (monorepo)
- **Stack**: Next.js 15.5.12, React 19, Tailwind CSS v4, @base-ui/react, shadcn v4, cmdk, Firebase 12
- **Pages**: 6 routes (/, /watchlist, /history, /profile, /movie/[slug], /tv, /circle/join)

## Components to Replace

### UI Primitives → `@elloloop/react`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/components/ui/button.tsx` | `@elloloop/react/button` |
| `frontend/src/components/ui/input.tsx` | `@elloloop/react/input` |
| `frontend/src/components/ui/textarea.tsx` | `@elloloop/react/textarea` |
| `frontend/src/components/ui/dialog.tsx` | `@elloloop/react/dialog` |
| `frontend/src/components/ui/command.tsx` | `@elloloop/react/command` |
| `frontend/src/components/ui/dropdown-menu.tsx` | `@elloloop/react/dropdown-menu` |
| `frontend/src/components/ui/popover.tsx` | `@elloloop/react/popover` |
| `frontend/src/components/ui/tooltip.tsx` | `@elloloop/react/tooltip` |
| `frontend/src/components/ui/input-group.tsx` | `@elloloop/react/input-group` |

### App-Level Components → `@elloloop/react`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/packages/ui/Toast.tsx` | `@elloloop/react/toast` |
| `frontend/src/packages/ui/Navbar.tsx` | `@elloloop/react/navbar` |
| `frontend/src/packages/ui/BottomNav.tsx` | `@elloloop/react/bottom-nav` |
| `frontend/src/packages/ui/InstallPrompt.tsx` | `@elloloop/react/install-prompt` |

### Auth → `@elloloop/react/auth`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/lib/auth.tsx` | `@elloloop/react/auth-provider` |
| `frontend/src/lib/firebase.ts` | `@elloloop/react/auth` (Firebase adapter) |
| `frontend/src/features/circle/RegisterFlow.tsx` | `@elloloop/react/signup-form` |
| `frontend/src/features/circle/RecoverFlow.tsx` | `@elloloop/react/login-form` |

### Video Player → `@elloloop/media`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/packages/video-player/*` | `@elloloop/media/video` |

### Utilities → `@elloloop/react/utils`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/lib/utils.ts` (cn) | `@elloloop/react/utils/cn` |
| `frontend/src/lib/slugify.ts` | `@elloloop/react/utils/slugify` |
| `frontend/src/lib/cache.ts` | `@elloloop/react/utils/cache` |
| `frontend/src/lib/identity.ts` | `@elloloop/react/utils/identity` |
| `frontend/src/lib/sync.ts` | `@elloloop/react/utils/sync` |

### Theme → `@elloloop/tailwind-config`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/app/globals.css` (CSS vars) | `@elloloop/tailwind-config` preset |

### i18n → `@elloloop/i18n`
| Current Location | Replace With |
|-----------------|-------------|
| `frontend/src/lib/detect-region.ts` | `@elloloop/i18n/detect-region` |
| `frontend/src/lib/languages.ts` | `@elloloop/i18n/languages` |

## Dependencies to Remove After Migration

- `@base-ui/react` (provided by refraction-ui)
- `class-variance-authority` (provided by refraction-ui)
- `clsx` (provided by refraction-ui)
- `tailwind-merge` (provided by refraction-ui)
- `cmdk` (provided by refraction-ui)
- `shadcn` (replaced by refraction-ui CLI)

## Tasks

- [ ] Add `@elloloop/react`, `@elloloop/media`, `@elloloop/i18n`, `@elloloop/tailwind-config` as dependencies
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
