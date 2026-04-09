---
id: COMP-COMMAND
track: components
depends_on: ["COMP-API-CONTRACT", "COMP-DIALOG"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build Command palette — searchable command/combobox built on cmdk for keyboard-driven navigation, searchable dropdowns, and command palettes.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/command` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-command` | React wrapper | React component with hooks binding |
| `@elloloop/angular-command` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-command` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/stream-mind** | `frontend/src/components/ui/command.tsx` | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`. Built on `cmdk`. Used for RegionPicker (searchable country/language selection). |

## Acceptance Criteria

- [ ] `<Command>` — root container with search filtering
- [ ] `<CommandDialog>` — command palette in a dialog overlay
- [ ] `<CommandInput>` — search input with icon
- [ ] `<CommandList>` — scrollable results list
- [ ] `<CommandEmpty>` — empty state when no results match
- [ ] `<CommandGroup>` — labeled group of items
- [ ] `<CommandItem>` — selectable item with keyboard highlight
- [ ] `<CommandShortcut>` — right-aligned keyboard shortcut hint
- [ ] `<CommandSeparator>` — visual separator between groups
- [ ] Keyboard: arrow keys navigate, Enter selects, Escape closes
- [ ] Fuzzy search filtering built-in
- [ ] ARIA: combobox pattern, `role="listbox"`, `aria-selected`
- [ ] Unit tests + Storybook stories
- [ ] Bundle size < 5KB gzipped (cmdk is ~3KB)

## Dependencies

- `cmdk` (peer dependency)
