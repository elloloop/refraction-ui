---
id: MIGRATE-AUTEUR
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND", "PKG-MEDIA-ENGINES"]
size: L
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/auteur.one frontend to use @refraction-ui/* packages. Audio/video engines MOVE from auteur.one INTO @refraction-ui/media.

## Repository Details

- **Repo**: `elloloop/auteur.one` (public)
- **Stack**: Next.js 14 (static export), React 18, Tailwind CSS v3, FFmpeg WASM, Web Audio API, Firebase Hosting
- **Pages**: Single page (editor + landing)

## Components / Code to Move INTO refraction-ui

These are the PRIMARY source for `@refraction-ui/media`:

| Current Location | Moves To |
|-----------------|----------|
| `frontend/lib/audio-engine.ts` | `@refraction-ui/media/audio/` |
| `frontend/lib/audio-engine.refactored.ts` | `@refraction-ui/media/audio/` |
| `frontend/lib/video-export.ts` | `@refraction-ui/media/video/` |
| `frontend/lib/effects.ts` | `@refraction-ui/media/effects/` |
| `frontend/lib/templates.ts` | `@refraction-ui/media/templates/` |
| `frontend/lib/types.ts` | `@refraction-ui/media/types` |
| `frontend/lib/errors.ts` | `@refraction-ui/react/utils/errors` |
| `frontend/lib/logger.ts` | `@refraction-ui/react/utils/logger` |
| `frontend/lib/validation.ts` | `@refraction-ui/react/utils/validation` |

## Components to Replace (after packages exist)

| Current Location | Replace With |
|-----------------|-------------|
| `frontend/lib/audio-engine.ts` | `@refraction-ui/media/audio-engine` |
| `frontend/lib/video-export.ts` | `@refraction-ui/media/video-export` |
| `frontend/lib/effects.ts` | `@refraction-ui/media/effects` |
| `frontend/lib/errors.ts` | `@refraction-ui/react/utils/errors` |
| `frontend/lib/logger.ts` | `@refraction-ui/react/utils/logger` |
| `frontend/lib/validation.ts` | `@refraction-ui/react/utils/validation` |
| `frontend/app/globals.css` | `@refraction-ui/tailwind-config` preset |

## Tasks

- [ ] FIRST: Move audio engine, video export, effects, templates INTO refraction-ui
- [ ] FIRST: Move errors, logger, validation INTO refraction-ui
- [ ] Add @refraction-ui/* packages as dependencies
- [ ] Replace lib imports with package imports
- [ ] Update Tailwind config
- [ ] Remove unused local files
- [ ] Test editor: playback, recording, export still work
