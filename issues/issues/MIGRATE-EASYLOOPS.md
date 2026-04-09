---
id: MIGRATE-EASYLOOPS
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "THEME-PROVIDER", "AUTH-PROVIDER", "HOOKS-CORE"]
size: XL
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/easyloops to use @elloloop/* packages. Large migration — easyloops has the best theme system, many hooks, and unique components.

## Repository Details

- **Repo**: `elloloop/easyloops` (private)
- **Stack**: Next.js 15, React 18, Tailwind CSS v3, Firebase (Google auth), Monaco Editor, Pyodide
- **Pages**: Landing, Questions, Courses, Wiki, About, Vision, Mission, Help

## Components to Replace

### Theme → `@elloloop/react/theme`
| Current Location | Replace With |
|-----------------|-------------|
| `src/features/editor/hooks/useTheme.ts` | `@elloloop/react/theme` |
| `src/shared/components/ThemeProvider.tsx` | `@elloloop/react/theme-provider` |
| `src/shared/components/ThemeToggle.tsx` | `@elloloop/react/theme-toggle` |

### Auth → `@elloloop/react/auth`
| Current Location | Replace With |
|-----------------|-------------|
| `src/features/auth/hooks/useAuth.ts` | `@elloloop/react/auth` |
| `src/features/auth/components/AuthButton.tsx` | `@elloloop/react/auth` (adapt) |
| `src/shared/lib/firebase.ts` | `@elloloop/react/auth` |

### Layout → `@elloloop/react/layout`
| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/components/Header.tsx` | `@elloloop/react/navbar` |
| `src/shared/components/SimpleHeader.tsx` | `@elloloop/react/navbar` (variant) |
| `src/shared/components/Navigation.tsx` | `@elloloop/react/navbar` (links) |
| `src/shared/components/MobileNavigation.tsx` | `@elloloop/react/mobile-navigation` |
| `src/shared/components/MainLayout.tsx` | `@elloloop/react/resizable-layout` |
| `src/shared/components/DraggableDivider.tsx` | `@elloloop/react/draggable-divider` |

### Components → `@elloloop/react`
| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/components/CollapsibleSection.tsx` | `@elloloop/react/collapsible` |
| `src/shared/components/AnimatedText.tsx` | `@elloloop/react/animated-text` |
| `src/shared/components/ContentProtection.tsx` | `@elloloop/react/content-protection` |
| `src/shared/components/MarkdownRenderer.tsx` | `@elloloop/react/markdown-renderer` |
| `src/shared/components/SlideViewer.tsx` | `@elloloop/react/slide-viewer` |
| `src/shared/components/MobileUsageTip.tsx` | `@elloloop/react/mobile-usage-tip` |
| `src/shared/components/Logo.tsx` | Keep (app-specific) |

### Code Editor → `@elloloop/react/media`
| Current Location | Replace With |
|-----------------|-------------|
| `src/features/editor/components/MonacoEditor.tsx` | `@elloloop/react/code-editor` |
| `src/features/editor/components/CodeEditor.tsx` | `@elloloop/react/code-editor` |
| `src/shared/components/PythonPlayground.tsx` | `@elloloop/react/code-editor` (playground variant) |

### Hooks → `@elloloop/react/hooks`
| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/hooks/useResizableLayout.ts` | `@elloloop/react/hooks/use-resizable-layout` |
| `src/shared/hooks/useWindowSize.ts` | `@elloloop/react/hooks/use-window-size` |

### Utilities
| Current Location | Replace With |
|-----------------|-------------|
| `src/shared/lib/isTauri.ts` | `@elloloop/react/utils/identity` |
| `src/shared/lib/formatters.ts` | `@elloloop/react/utils/format` |
| `src/shared/lib/shortCodes.ts` | `@elloloop/react/utils/short-codes` |

## Tasks

- [ ] Add all @elloloop/* packages
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
