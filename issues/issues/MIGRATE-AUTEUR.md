---
id: MIGRATE-AUTEUR
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "PKG-MEDIA-ENGINES"]
size: L
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/auteur.one frontend to use @elloloop/* packages. Audio/video engines MOVE from auteur.one INTO @elloloop/media.

## Repository Details

- **Repo**: `elloloop/auteur.one` (public)
- **Stack**: Next.js 14 (static export), React 18, Tailwind CSS v3, FFmpeg WASM, Web Audio API, Firebase Hosting
- **Pages**: Single page (editor + landing)

## Components / Code to Move INTO refraction-ui

These are the PRIMARY source for `@elloloop/media`:

| Current Location | Moves To |
|-----------------|----------|
| `frontend/lib/audio-engine.ts` | `@elloloop/media/audio/` |
| `frontend/lib/audio-engine.refactored.ts` | `@elloloop/media/audio/` |
| `frontend/lib/video-export.ts` | `@elloloop/media/video/` |
| `frontend/lib/effects.ts` | `@elloloop/media/effects/` |
| `frontend/lib/templates.ts` | `@elloloop/media/templates/` |
| `frontend/lib/types.ts` | `@elloloop/media/types` |
| `frontend/lib/errors.ts` | `@elloloop/react/utils/errors` |
| `frontend/lib/logger.ts` | `@elloloop/react/utils/logger` |
| `frontend/lib/validation.ts` | `@elloloop/react/utils/validation` |

## Components to Replace (after packages exist)

| Current Location | Replace With |
|-----------------|-------------|
| `frontend/lib/audio-engine.ts` | `@elloloop/media/audio-engine` |
| `frontend/lib/video-export.ts` | `@elloloop/media/video-export` |
| `frontend/lib/effects.ts` | `@elloloop/media/effects` |
| `frontend/lib/errors.ts` | `@elloloop/react/utils/errors` |
| `frontend/lib/logger.ts` | `@elloloop/react/utils/logger` |
| `frontend/lib/validation.ts` | `@elloloop/react/utils/validation` |
| `frontend/app/globals.css` | `@elloloop/tailwind-config` preset |

## Tasks

- [ ] FIRST: Move audio engine, video export, effects, templates INTO refraction-ui
- [ ] FIRST: Move errors, logger, validation INTO refraction-ui
- [ ] Add @elloloop/* packages as dependencies
- [ ] Replace lib imports with package imports
- [ ] Update Tailwind config
- [ ] Remove unused local files
- [ ] Test editor: playback, recording, export still work
