---
id: PKG-MEDIA-ENGINES
track: packages
depends_on: ["PKG-REACT"]
size: L
labels: [feat]
status: pending
---

## Summary

Create `@refraction-ui/media` package — audio engine, video export, canvas effects, and project templates. Extracted from elloloop/auteur.one's browser-based video editor.

## Source References

All from **elloloop/auteur.one** `frontend/lib/`:

| Module | File | Description |
|--------|------|-------------|
| AudioEngine | `audio-engine.ts` | Web Audio API: load/cache audio, clip playback with speed/volume/gain, microphone recording (webm/opus with mp4 fallback), waveform peak generation, offline mixing via OfflineAudioContext |
| AudioEngine (refactored) | `audio-engine.refactored.ts` | Enhanced version with structured logging, SOLID design, echo cancellation/noise suppression/auto gain, 100ms chunk recording |
| VideoExporter | `video-export.ts` | FFmpeg WASM: render RGBA frames, encode H.264 MP4 (CRF 23, YUV420P), SRT subtitle generation, audio stem export (WebM/Opus) |
| Effects | `effects.ts` | 5 canvas rendering effects: video, picture, dialogue (captions with speaker name), text overlay, audio placeholder |
| Templates | `templates.ts` | 5 project templates: Blank, Podcast (30min), Tutorial (10min), Audiobook (1hr), Interview (20min) |
| Types | `types.ts` | ClipParams, Take, Transform, Speaker, Clip, Track, ProjectSettings, Marker, ExportOptions |
| Errors | `errors.ts` | 7 typed error classes: AppError, AudioError, ExportError, FileError, ValidationError, NetworkError, StateError |
| Logger | `logger.ts` | Structured logging: 5 levels, 8 categories, session tracking, ring buffer, scoped loggers, performance measurement |
| Validation | `validation.ts` | Model validators (clip, track, speaker, take, file), string sanitization, export validation |

Also incorporates from **elloloop/stream-mind** `frontend/src/packages/video-player/`:
- `use-youtube-player.ts` — YouTube IFrame API hook (singleton loader, mute preference, global video controller)
- `HeroVideoPlayer.tsx` — Hero video with poster fallback, brightness dimming, replay, mute/play controls
- `VideoControls.tsx` — Auto-hiding overlay controls, keyboard shortcuts (Space, M)
- `types.ts` — VideoTimeRange, VideoPlaybackState, HeroVideoPlayerProps

## Acceptance Criteria

- [ ] AudioEngine: load, play, record, generate waveforms, mix offline
- [ ] VideoExporter: render frames, encode to MP4, export audio stems, generate SRT
- [ ] Effects system: render to canvas context with configurable controls
- [ ] Templates: provide pre-configured project scaffolds
- [ ] YouTube player hook: singleton API, mute preference, global controller
- [ ] HeroVideoPlayer: poster fallback, dimming, controls
- [ ] Typed error hierarchy with user-friendly messages
- [ ] Structured logger with scoped instances and performance measurement
- [ ] Input validation and string sanitization
- [ ] Unit tests for all non-browser-API modules
- [ ] TypeScript strict types for all interfaces

## Package Structure

```
packages/media/
  src/
    audio/
      audio-engine.ts
    video/
      video-export.ts
      hero-video-player.tsx
      video-controls.tsx
      use-youtube-player.ts
    effects/
      effects.ts
      types.ts
    templates/
      templates.ts
    lib/
      errors.ts
      logger.ts
      validation.ts
    index.ts
```

## Dependencies

- `@ffmpeg/ffmpeg` (peer, for video export)
- `@refraction-ui/react` (for UI primitives used in player components)
