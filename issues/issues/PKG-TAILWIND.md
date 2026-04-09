---
id: PKG-TAILWIND
track: packages
depends_on: ["TOKENS-SCHEMA"]
size: M
labels: [feat]
status: pending
---

## Summary

Create `@elloloop/tailwind-config` package — shared Tailwind CSS preset with unified color tokens (light + dark), animations, typography, and utilities. Consolidates Tailwind configuration from all 7+ elloloop Next.js projects.

## Source References

### Color Systems
- **elloloop/stream-mind** `frontend/src/app/globals.css` — oklch dark theme with CSS custom properties (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1..5, sidebar, surface)
- **elloloop/tell-a-tale** `src/app/globals.css` — HSL CSS variable theme (shadcn-style, light mode only)
- **elloloop/one-mission** `src/app/globals.css` — HSL CSS variables with both light AND dark mode (slate base)
- **elloloop/easyloops** `src/app/globals.css` — CSS variables for light/dark with body transition
- **elloloop/learnloop** `app/globals.css` — `--color-brand: indigo-500`, component classes (.card, .btn-primary, .badge, .glass)
- **elloloop/featuredocs** `src/app/globals.css` — Warm off-white palette (`#FAF9F6`), serif headings
- **tinykite/technical-interview-star-trib** `globals.css` — Tailwind v4 theme tokens, emerald green primary

### Animations (union of all)
- **stream-mind**: fadeIn, slideUp, fadeInScale, slideInRight, toastIn, toastOut, stagger-fade
- **tell-a-tale / one-mission**: accordion-down, accordion-up
- **easyloops**: dblclick-arrow-bounce, theme transition (0.3s), layout transition (0.15s)
- **learnloop**: fadeIn, slideUp, scaleIn
- **auteur.one**: fade-in, fade-in-up, pulse-red

### Typography
- **stream-mind**: Geist + Inter, `--font-heading`, `--font-sans`
- **tell-a-tale**: Inter + Caveat (handwriting)
- **easyloops**: Geist Sans + Geist Mono + Comfortaa
- **learnloop**: Inter + system fallbacks
- **featuredocs**: Georgia (serif headings) + system sans

### Custom Utilities
- **stream-mind**: `.scrollbar-hide`, `.safe-top`, `.safe-bottom`, `.snap-lane`, `.momentum-scroll`, `.press-scale`, `.drag-handle`
- **learnloop**: `.scrollbar-hide`, `.text-gradient` (indigo-to-purple), `.glass` (frosted glass backdrop-blur)
- **easyloops**: dark scrollbar styles, selection colors

### Tailwind Configs
- **stream-mind** `frontend/components.json` — shadcn v4, base-nova style
- **tell-a-tale** `tailwind.config.ts` — shadcn default, container config
- **one-mission** `tailwind.config.ts` — identical to tell-a-tale
- **easyloops** `tailwind.config.js` — custom sans/mono/comfortaa fonts
- **learnloop** `tailwind.config.js` — custom animation keyframes

## Acceptance Criteria

- [ ] Preset exports a Tailwind config object usable via `presets: [refractionPreset]`
- [ ] Unified CSS custom property system covering all semantic tokens
- [ ] Light + dark mode support via `.dark` class strategy
- [ ] All animations from all projects available as utility classes
- [ ] Typography scale with font family tokens (sans, mono, serif, heading)
- [ ] Custom utilities: scrollbar-hide, safe-area, snap-lane, glass, text-gradient, press-scale
- [ ] Works with both Tailwind v3 and v4
- [ ] Container config (centered, 2rem padding, 1400px max at 2xl)
- [ ] Unit tests for preset generation
- [ ] Documentation with token reference

## Package Structure

```
packages/tailwind-config/
  src/
    preset.ts         # Main Tailwind preset export
    colors.ts         # Unified color token system
    animations.ts     # All keyframes and animation utilities
    typography.ts     # Font family and scale tokens
    utilities.ts      # Custom utility classes
    index.ts
  package.json
```

## Dependencies

- `tailwindcss` (peer)
- `@elloloop/tokens-core` (for token resolution)
