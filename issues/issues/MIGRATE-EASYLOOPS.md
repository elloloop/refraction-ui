---
id: MIGRATE-EASYLOOPS
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "THEME-PROVIDER", "AUTH-PROVIDER", "HOOKS-CORE"]
size: XL
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/easyloops to use @refraction-ui/* packages. Large migration — easyloops has the best theme system, many hooks, and unique components.

## Repository Details

- **Repo**: `elloloop/easyloops` (private)
- **Stack**: Next.js 15, React 18, Tailwind CSS v3, Firebase (Google auth), Monaco Editor, Pyodide
- **Pages**: Landing, Questions, Courses, Wiki, About, Vision, Mission, Help

## Components to Replace

### Theme → `@refraction-ui/react/theme`
| Current Location | Replace With |
|-----------------|-------------|
| `src/features/editor/hooks/useTheme.ts` | `@refraction-ui/react/theme` |
| `src/shared/components/ThemeProvider.tsx` | `@refraction-ui/react/theme-provider` |
| `src/shared/components/ThemeToggle.tsx` | `@refraction-ui/react/theme-toggle` |

### Auth → `@refraction-ui/react/auth`
| Current Location | Replace With |
|-----------------|-------------|
| `src/features/auth/hooks/useAuth.ts` | `@refraction-ui/react/auth` |
| `src/features/auth/components/AuthButton.tsx` | `@refraction-ui/react/auth` (adapt) |
| `src/shared/lib/firebase.ts` | `@refraction-ui/react/auth` |

### Layout → `@refraction-ui/react/layout`
| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/components/Header.tsx` | `@refraction-ui/react/navbar` |
| `src/shared/components/SimpleHeader.tsx` | `@refraction-ui/react/navbar` (variant) |
| `src/shared/components/Navigation.tsx` | `@refraction-ui/react/navbar` (links) |
| `src/shared/components/MobileNavigation.tsx` | `@refraction-ui/react/mobile-navigation` |
| `src/shared/components/MainLayout.tsx` | `@refraction-ui/react/resizable-layout` |
| `src/shared/components/DraggableDivider.tsx` | `@refraction-ui/react/draggable-divider` |

### Components → `@refraction-ui/react`
| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/components/CollapsibleSection.tsx` | `@refraction-ui/react/collapsible` |
| `src/shared/components/AnimatedText.tsx` | `@refraction-ui/react/animated-text` |
| `src/shared/components/ContentProtection.tsx` | `@refraction-ui/react/content-protection` |
| `src/shared/components/MarkdownRenderer.tsx` | `@refraction-ui/react/markdown-renderer` |
| `src/shared/components/SlideViewer.tsx` | `@refraction-ui/react/slide-viewer` |
| `src/shared/components/MobileUsageTip.tsx` | `@refraction-ui/react/mobile-usage-tip` |
| `src/shared/components/Logo.tsx` | Keep (app-specific) |

### Code Editor → `@refraction-ui/react/media`
| Current Location | Replace With |
|-----------------|-------------|
| `src/features/editor/components/MonacoEditor.tsx` | `@refraction-ui/react/code-editor` |
| `src/features/editor/components/CodeEditor.tsx` | `@refraction-ui/react/code-editor` |
| `src/shared/components/PythonPlayground.tsx` | `@refraction-ui/react/code-editor` (playground variant) |

### Hooks → `@refraction-ui/react/hooks`
| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/hooks/useResizableLayout.ts` | `@refraction-ui/react/hooks/use-resizable-layout` |
| `src/shared/hooks/useWindowSize.ts` | `@refraction-ui/react/hooks/use-window-size` |

### Utilities
| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/lib/isTauri.ts` | `@refraction-ui/react/utils/identity` |
| `src/shared/lib/formatters.ts` | `@refraction-ui/react/utils/format` |
| `src/shared/lib/shortCodes.ts` | `@refraction-ui/react/utils/short-codes` |

## Tasks

- [ ] Add all @refraction-ui/* packages
- [ ] Replace theme system (ThemeProvider, ThemeToggle, useTheme)
- [ ] Replace auth system (useAuth, AuthButton, firebase utils)
- [ ] Replace layout components (Header, Navigation, MainLayout, DraggableDivider)
- [ ] Replace shared components (CollapsibleSection, AnimatedText, etc.)
- [ ] Replace code editor components
- [ ] Replace hooks and utilities
- [ ] Update Tailwind config
- [ ] Remove replaced files
- [ ] Clean up unused dependencies
- [ ] Test all pages and code execution flow
