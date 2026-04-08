---
id: MIGRATE-LEARNLOOP
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "PKG-BLOCKS", "PKG-AI", "PKG-I18N", "THEME-PROVIDER", "AUTH-PROVIDER"]
size: XL
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/learnloop to use @refraction-ui/* packages. The largest source of domain packages (blocks, AI, i18n, TTS). Many components MOVE from learnloop INTO refraction-ui packages.

## Repository Details

- **Repo**: `elloloop/learnloop` (private)
- **Stack**: Next.js 14, React 18, Tailwind CSS v3, next-themes, Firebase (client+admin), MongoDB, PostHog, react-three-fiber, ConnectRPC
- **Pages**: Auth, Student portal, Parent portal, Admin portal, Reviewer portal, Landing

## Components to Replace

### Theme → `@refraction-ui/react/theme`
| Current Location | Replace With |
|-----------------|-------------|
| `components/ThemeProvider.tsx` | `@refraction-ui/react/theme-provider` |
| `components/ThemeToggle.tsx` | `@refraction-ui/react/theme-toggle` |

### Auth → `@refraction-ui/react/auth`
| Current Location | Replace With |
|-----------------|-------------|
| `components/Auth.tsx` | `@refraction-ui/react/login-form` + `signup-form` + `forgot-password-form` |
| `lib/auth.ts` (RBAC) | `@refraction-ui/react/auth` (role utilities) |
| `lib/auth-server.ts` | `@refraction-ui/react/auth` (server adapter) |
| `lib/firebase.ts` | `@refraction-ui/react/auth` (Firebase adapter) |
| `lib/clear-auth.ts` | `@refraction-ui/react/auth` (clearAuth) |

### Layout → `@refraction-ui/react/layout`
| Current Location | Replace With |
|-----------------|-------------|
| `components/nav/AppHeader.tsx` | `@refraction-ui/react/navbar` |
| `components/nav/Sidebar.tsx` | `@refraction-ui/react/sidebar` |
| `components/nav/ParentNav.tsx` | `@refraction-ui/react/sidebar` (variant) |
| `components/nav/Breadcrumbs.tsx` | `@refraction-ui/react/breadcrumbs` |
| `components/nav/StudentBottomNav.tsx` | `@refraction-ui/react/bottom-nav` |

### Blocks → `@refraction-ui/blocks` (MOVE source code)
| Current Location | Moves To |
|-----------------|----------|
| `components/tutoring/blocks/*` (26+ renderers) | `@refraction-ui/blocks/renderers/` |
| `lib/blocks/*` (engine, handlers) | `@refraction-ui/blocks/engine/` |
| `components/blocks/three/*` (8 3D components) | `@refraction-ui/blocks/three/` |
| `lib/canvas/*` (whiteboard engine) | `@refraction-ui/blocks/canvas/` |

### AI → `@refraction-ui/ai` (MOVE source code)
| Current Location | Moves To |
|-----------------|----------|
| `lib/ai/*` (providers, safety, fallback) | `@refraction-ui/ai/` |
| `lib/tts/*` (TTS providers) | `@refraction-ui/ai/tts/` |
| `lib/tutoring/tts-sanitizer.ts` | `@refraction-ui/ai/tts/` |

### i18n → `@refraction-ui/i18n` (MOVE source code)
| Current Location | Moves To |
|-----------------|----------|
| `lib/i18n/language-config.ts` | `@refraction-ui/i18n/` |
| `lib/i18n/voice-registry.ts` | `@refraction-ui/i18n/` |

### Hooks → `@refraction-ui/react/hooks`
| Current Location | Replace With |
|-----------------|-------------|
| `hooks/useBlockTimeline.ts` | `@refraction-ui/react/hooks` |
| `hooks/useOnlineStatus.ts` | `@refraction-ui/react/hooks` |
| `hooks/usePanning.ts` | `@refraction-ui/react/hooks` |
| `hooks/useTutoringTTS.ts` | `@refraction-ui/react/hooks` |
| `hooks/useViewportLayout.ts` | `@refraction-ui/react/hooks` |

### Data Display → `@refraction-ui/react`
| Current Location | Replace With |
|-----------------|-------------|
| `components/achievements/BadgeDisplay.tsx` | `@refraction-ui/react/badge-display` |
| `components/practice/ProgressDashboard.tsx` | `@refraction-ui/react/progress-dashboard` |

## Dependencies to Remove

- `next-themes` (replaced by refraction-ui ThemeProvider)

## Tasks

- [ ] FIRST: Move block renderers, AI providers, i18n INTO refraction-ui packages
- [ ] Add all @refraction-ui/* packages as dependencies
- [ ] Replace theme system (ThemeProvider, ThemeToggle)
- [ ] Replace auth system (Auth component, RBAC, Firebase)
- [ ] Replace layout components (AppHeader, Sidebar, Breadcrumbs, BottomNav)
- [ ] Replace hooks and data display components
- [ ] Update learnloop imports to use @refraction-ui/blocks, @refraction-ui/ai, @refraction-ui/i18n
- [ ] Update Tailwind config
- [ ] Remove next-themes and other replaced dependencies
- [ ] Test all portals (student, parent, admin, reviewer)
