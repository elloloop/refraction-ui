---
id: FORM-SEARCH-BAR
track: forms
depends_on: ["COMP-INPUT", "PKG-CORE"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build SearchBar — search input with mode toggle, suggestions, loading state, and autocomplete integration.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/search-bar` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-search-bar` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-search-bar` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-search-bar` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/stream-mind** | `frontend/src/features/discover/SearchBar.tsx` | Two modes: "Discover" (semantic AI search) and "Title" (exact autocomplete). Pre-built suggestion dropdown. Loading spinner. Mode toggle pills. |
| **elloloop/stream-mind** | `frontend/src/features/discover/SearchAutocomplete.tsx` | Debounced API calls (300ms), poster thumbnails + title + year + rating. Click-outside and Escape to dismiss. |

## Acceptance Criteria

- [ ] Text input with search icon
- [ ] Optional mode toggle (e.g., "Semantic" vs "Title" search)
- [ ] Pre-built suggestions dropdown
- [ ] Loading spinner during search
- [ ] Debounced `onSearch` callback (configurable delay, default 300ms)
- [ ] Autocomplete dropdown with custom result rendering
- [ ] Click-outside and Escape to dismiss results
- [ ] Keyboard: arrow keys navigate results, Enter selects
- [ ] ARIA: `role="combobox"`, `aria-expanded`, `aria-activedescendant`
- [ ] Unit tests + Storybook stories
