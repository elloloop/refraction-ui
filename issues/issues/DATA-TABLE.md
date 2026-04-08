---
id: DATA-TABLE
track: data-display
depends_on: ["PKG-CORE", "COMP-BADGE"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build DataTable — full-featured data table with column filtering, status badges, and action buttons.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/data-table` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-data-table` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-data-table` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-data-table` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/featuredocs** | `src/components/AdminFeedbackTable.tsx` | Filter dropdowns (product, status, type). Table with columns (Date, Product, Feature, Locale, Type, Content, Status, Actions). Action buttons (Ack, Fix, Dismiss). Sub-components: TypeBadge, StatusBadge, ActionButton, formatDate. |
| **elloloop/learnloop** | `components/tutoring/blocks/TableRenderer.tsx` | HTML table with optional headers, highlighted cells, captions. |

## Acceptance Criteria

- [ ] Column definitions with header, accessor, and optional render function
- [ ] Filter controls per column (dropdown, text search)
- [ ] Sortable columns (click header to toggle asc/desc)
- [ ] Status badge cells with color-coded variants
- [ ] Action button column with configurable actions
- [ ] Responsive: horizontal scroll on mobile
- [ ] Empty state message
- [ ] Loading state (skeleton rows)
- [ ] Highlighted cells support
- [ ] ARIA: `role="table"`, proper header/cell relationships
- [ ] Keyboard: Tab through interactive cells
- [ ] Unit tests + Storybook stories
