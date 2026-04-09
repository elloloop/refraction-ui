---
id: MEDIA-VIDEO-PLAYER
track: media
depends_on: ["PKG-CORE"]
size: L
labels: [feat, a11y]
status: pending
---

## Summary

Build VideoPlayer components — custom HTML5 video player with controls, YouTube hero player with poster fallback, and video control overlay.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/video-player` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-video-player` | React wrapper | React component with hooks binding |
| `@elloloop/angular-video-player` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-video-player` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/featuredocs** | `src/components/VideoPlayer.tsx` | Custom player with play/pause overlay, title bar, "Report" button on hover. "Coming soon" placeholder when no video. |
| **elloloop/stream-mind** | `frontend/src/packages/video-player/HeroVideoPlayer.tsx` | YouTube player with poster fallback, brightness dimming for background mode, replay button, mute/play controls. |
| **elloloop/stream-mind** | `frontend/src/packages/video-player/VideoControls.tsx` | Auto-hiding overlay (3s idle). Center play icon when paused, corner mute button. Keyboard: Space = play/pause, M = mute. |
| **elloloop/stream-mind** | `frontend/src/packages/video-player/use-youtube-player.ts` | YouTube IFrame API: singleton loader, 2s delayed init, stop-time monitoring, mute preference, global video controller (only one plays at a time). |
| **elloloop/stream-mind** | `frontend/src/lib/video-controller.ts` | Singleton: `registerPlayer()`, `requestPlayback()`, `releasePlayback()`. Ensures single active video. |
| **elloloop/stream-mind** | `frontend/src/lib/mute-preference.ts` | Session-scoped mute preference. First play muted (autoplay policy). Records user intent. Mobile always muted. |

## Acceptance Criteria

- [ ] `<VideoPlayer>` — HTML5 video with custom controls overlay
- [ ] `<HeroVideoPlayer>` — YouTube-based hero with poster fallback layer
- [ ] `<VideoControls>` — auto-hiding overlay (configurable idle timeout)
- [ ] Play/pause, mute/unmute, replay controls
- [ ] Keyboard shortcuts: Space (play/pause), M (mute)
- [ ] `useYouTubePlayer()` hook for YouTube IFrame API
- [ ] Global video controller: only one video plays at a time
- [ ] Mute preference: first play muted, records user intent, mobile always muted
- [ ] Poster fallback when video not available
- [ ] Brightness dimming for background video mode
- [ ] "Coming soon" placeholder when no video source
- [ ] Reduced motion support (`prefers-reduced-motion`)
- [ ] ARIA: play/pause button labels, time announcements
- [ ] Unit tests + Storybook stories
