---
id: HOOKS-CORE
track: hooks
depends_on: ["PKG-REACT"]
size: L
labels: [feat]
status: pending
---

## Summary

Build the complete hooks library — union of all custom React hooks across all elloloop and tinykite projects. Organized by domain: browser, layout, media, online, and ID generation.

## Source References

### Browser / Window Hooks
| Hook | Source | Description |
|------|--------|-------------|
| `useWindowSize` | **easyloops** `src/shared/hooks/useWindowSize.ts` | Returns `{ width, height, isMobile }`. Hydration-safe (1024x768 during SSR). Mobile breakpoint: 768px. |
| `useOnlineStatus` | **learnloop** `hooks/useOnlineStatus.ts` | Returns boolean `online`. Listens to `window.online/offline` events. |

### Layout Hooks
| Hook | Source | Description |
|------|--------|-------------|
| `useResizableLayout` | **easyloops** `src/shared/hooks/useResizableLayout.ts` | CSS-variable-driven drag resizing. Horizontal + vertical. Persists to localStorage. Min/max constraints. |
| `useViewportLayout` | **learnloop** `hooks/useViewportLayout.ts` | Measures container/content, computes scale-to-fit transform. Returns `scale`, `breakpoint`, `contentStyle`. |
| `usePanning` | **learnloop** `hooks/usePanning.ts` | Connects PanningEngine to container for vertical slide panning. Returns `containerRef`, CSS `style`, `currentSlide`, `snapToSlide()`. |

### Media Hooks
| Hook | Source | Description |
|------|--------|-------------|
| `useYouTubePlayer` | **stream-mind** `frontend/src/packages/video-player/use-youtube-player.ts` | YouTube IFrame API: singleton loader, delayed init, stop-time monitoring, mute preference, global video controller. Returns `containerRef`, `isMuted`, `playbackState`, `toggleMute`, `play`, `pause`. |

### Focus / Navigation Hooks
| Hook | Source | Description |
|------|--------|-------------|
| `useFocusManager` | **stream-mind** `frontend/src/features/tv/use-focus-manager.ts` | 2D D-pad/arrow-key navigation. Maintains rows x columns focus grid. Handles Arrow keys, Enter, Escape/Backspace. Auto-scrolls focused element. |

### Chart Hooks
| Hook | Source | Description |
|------|--------|-------------|
| `useChartDimensions` | **next-d3** `src/lib/chart.tsx` | ResizeObserver-based responsive sizing. Returns `[ref, dimensions]`. Merges settings with defaults. Computes `boundedWidth`/`boundedHeight`. |
| `useUniqueId` | **next-d3** `src/lib/chart.tsx` | Incremental unique ID generator for SVG elements. |

### TTS / Audio Hooks
| Hook | Source | Description |
|------|--------|-------------|
| `useTutoringTTS` | **learnloop** `hooks/useTutoringTTS.ts` | TTS lifecycle: `speak(text, onEnd)` and `stop()`. LaTeX sanitization, playback speed scaling, language-aware voice selection. |

### Timeline / Animation Hooks
| Hook | Source | Description |
|------|--------|-------------|
| `useBlockTimeline` | **learnloop** `hooks/useBlockTimeline.ts` | Manages block animation timeline state. Converts steps to typed actions. TTS-synced reveals, interactive input pausing/resumption. |

## Acceptance Criteria

- [ ] All hooks exported from `@refraction-ui/react/hooks`
- [ ] Each hook is independently importable (tree-shakeable)
- [ ] `useWindowSize` — hydration-safe, configurable breakpoint
- [ ] `useOnlineStatus` — real-time online/offline detection
- [ ] `useResizableLayout` — CSS-variable drag resize with persistence
- [ ] `useViewportLayout` — scale-to-fit transform computation
- [ ] `usePanning` — slide-based panning with snap
- [ ] `useYouTubePlayer` — YouTube API integration
- [ ] `useFocusManager` — 2D keyboard/D-pad navigation
- [ ] `useChartDimensions` — ResizeObserver-based responsive sizing
- [ ] `useUniqueId` — incremental SVG ID generation
- [ ] `useTutoringTTS` — TTS lifecycle with sanitization
- [ ] `useBlockTimeline` — step-by-step animation timeline
- [ ] TypeScript strict return types for all hooks
- [ ] Unit tests for each hook (using @testing-library/react-hooks)
- [ ] Storybook stories demonstrating usage
- [ ] JSDoc comments with usage examples

## Package Location

```
packages/react/src/hooks/
  use-window-size.ts
  use-online-status.ts
  use-resizable-layout.ts
  use-viewport-layout.ts
  use-panning.ts
  use-youtube-player.ts
  use-focus-manager.ts
  use-chart-dimensions.ts
  use-unique-id.ts
  use-tutoring-tts.ts
  use-block-timeline.ts
  index.ts
```
