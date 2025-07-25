# Token Schema Contract

We support **multiple named themes**, and **each theme must include light and dark modes**. All tokens resolve to CSS variables for runtime switching.

---

## Layers

1. **Global tokens**: raw values (colors, spacing, radii, typography).
2. **Semantic tokens**: meaning-based roles (fg.default, bg.muted, border.focus).
3. **Component tokens**: slots scoped to a component (button.primary.bg).

---

## Themes and modes

Tokens are grouped per **theme** and inside each theme by **mode** (light, dark at minimum).

```json
{
  "$schema": "./tokens.schema.json",
  "themes": {
    "default": {
      "modes": {
        "light": {
          "global": { "color": { "blue-500": "#3b82f6" } },
          "semantic": { "fg": { "default": "{global.color.gray-900}" } },
          "components": {
            "button": { "primary": { "bg": "{semantic.fg.default}" } }
          }
        },
        "dark": {
          "global": { "color": { "blue-500": "#3b82f6" } },
          "semantic": { "fg": { "default": "{global.color.gray-100}" } },
          "components": {
            "button": { "primary": { "bg": "{semantic.fg.default}" } }
          }
        }
      }
    },
    "acme": {
      "modes": {
        "light": { "...": "..." },
        "dark":  { "...": "..." }
      }
    }
  }
}
```

- References use Style Dictionary style `{path.to.token}`.
- CSS variables are generated as `--rf-<theme>-<mode>-<path>` or scoped shorter when a theme is active.
- The runtime switcher swaps the active `data-theme` and `data-mode` attributes (or a CSS class) to apply the correct var set.

---

## Build outputs

- **CSS variables file(s)**: `/styles/tokens.css` (can split per theme for code splitting).
- **Tailwind plugin fragment**: injects semantic tokens into `theme.extend.colors`, spacing, etc.
- Optional **JSON maps** for non-Tailwind consumers.

---

## Validation

- Zod schema lives in `@refraction-ui/tokens-core`.
- `refraction-ui tokens import`:
  - Detects input format (Style Dictionary, Figma Tokens, Token Studio).
  - Normalizes into the schema above.
  - Validates that each theme has both `light` and `dark`.

---

## Runtime switching

- `<ThemeProvider>` exposes `theme`, `mode`, and `setTheme/setMode`.
- Switching should not trigger a full reload. It only flips the root attributes to change CSS vars.
- Persist selection in localStorage or cookies (SSR safe).

---

## Constraints and rules

- No hardcoded hex values in component code. Always reference tokens.
- Component tokens may override semantic tokens but must fall back to semantic/global.
- Adding a new theme or mode is additive and non-breaking.
- Removing or renaming token paths is a breaking change (see versioning policy).
