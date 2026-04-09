---
id: MIGRATE-LEARNLOOP
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "PKG-BLOCKS", "PKG-AI", "PKG-I18N", "THEME-PROVIDER", "AUTH-PROVIDER"]
size: XL
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/learnloop to use @elloloop/* packages. The largest source of domain packages (blocks, AI, i18n, TTS). Many components MOVE from learnloop INTO refraction-ui packages.

## Repository Details

- **Repo**: `elloloop/learnloop` (private)
- **Stack**: Next.js 14, React 18, Tailwind CSS v3, next-themes, Firebase (client+admin), MongoDB, PostHog, react-three-fiber, ConnectRPC
- **Pages**: Auth, Student portal, Parent portal, Admin portal, Reviewer portal, Landing

## Components to Replace

### Theme → `@elloloop/react/theme`
| Current Location | Replace With |
|-----------------|-------------|
| `components/ThemeProvider.tsx` | `@elloloop/react/theme-provider` |
| `components/ThemeToggle.tsx` | `@elloloop/react/theme-toggle` |

### Auth → `@elloloop/react/auth`
| Current Location | Replace With |
|-----------------|-------------|
| `components/Auth.tsx` | `@elloloop/react/login-form` + `signup-form` + `forgot-password-form` |
| `lib/auth.ts` (RBAC) | `@elloloop/react/auth` (role utilities) |
| `lib/auth-server.ts` | `@elloloop/react/auth` (server adapter) |
| `lib/firebase.ts` | `@elloloop/react/auth` (Firebase adapter) |
| `lib/clear-auth.ts` | `@elloloop/react/auth` (clearAuth) |

### Layout → `@elloloop/react/layout`
| Current Location | Replace With |
|-----------------|-------------|
| `components/nav/AppHeader.tsx` | `@elloloop/react/navbar` |
| `components/nav/Sidebar.tsx` | `@elloloop/react/sidebar` |
| `components/nav/ParentNav.tsx` | `@elloloop/react/sidebar` (variant) |
| `components/nav/Breadcrumbs.tsx` | `@elloloop/react/breadcrumbs` |
| `components/nav/StudentBottomNav.tsx` | `@elloloop/react/bottom-nav` |

### Blocks → `@elloloop/blocks` (MOVE source code)
| Current Location | Moves To |
|-----------------|----------|
| `components/tutoring/blocks/*` (26+ renderers) | `@elloloop/blocks/renderers/` |
| `lib/blocks/*` (engine, handlers) | `@elloloop/blocks/engine/` |
| `components/blocks/three/*` (8 3D components) | `@elloloop/blocks/three/` |
| `lib/canvas/*` (whiteboard engine) | `@elloloop/blocks/canvas/` |

### AI → `@elloloop/ai` (MOVE source code)
| Current Location | Moves To |
|-----------------|----------|
| `lib/ai/*` (providers, safety, fallback) | `@elloloop/ai/` |
| `lib/tts/*` (TTS providers) | `@elloloop/ai/tts/` |
| `lib/tutoring/tts-sanitizer.ts` | `@elloloop/ai/tts/` |

### i18n → `@elloloop/i18n` (MOVE source code)
| Current Location | Moves To |
|-----------------|----------|
| `lib/i18n/language-config.ts` | `@elloloop/i18n/` |
| `lib/i18n/voice-registry.ts` | `@elloloop/i18n/` |

### Hooks → `@elloloop/react/hooks`
| Current Location | Replace With |
|-----------------|-------------|
| `hooks/useBlockTimeline.ts` | `@elloloop/react/hooks` |
| `hooks/useOnlineStatus.ts` | `@elloloop/react/hooks` |
| `hooks/usePanning.ts` | `@elloloop/react/hooks` |
| `hooks/useTutoringTTS.ts` | `@elloloop/react/hooks` |
| `hooks/useViewportLayout.ts` | `@elloloop/react/hooks` |

### Data Display → `@elloloop/react`
| Current Location | Replace With |
|-----------------|-------------|
| `components/achievements/BadgeDisplay.tsx` | `@elloloop/react/badge-display` |
| `components/practice/ProgressDashboard.tsx` | `@elloloop/react/progress-dashboard` |

## Dependencies to Remove

- `next-themes` (replaced by refraction-ui ThemeProvider)

## Tasks

- [ ] FIRST: Move block renderers, AI providers, i18n INTO refraction-ui packages
- [ ] Add all @elloloop/* packages as dependencies
- [ ] Replace theme system (ThemeProvider, ThemeToggle)
- [ ] Replace auth system (Auth component, RBAC, Firebase)
- [ ] Replace layout components (AppHeader, Sidebar, Breadcrumbs, BottomNav)
- [ ] Replace hooks and data display components
- [ ] Update learnloop imports to use @elloloop/blocks, @elloloop/ai, @elloloop/i18n
- [ ] Update Tailwind config
- [ ] Remove next-themes and other replaced dependencies
- [ ] Test all portals (student, parent, admin, reviewer)
