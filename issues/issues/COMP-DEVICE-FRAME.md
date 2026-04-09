---
id: COMP-DEVICE-FRAME
track: components
depends_on: ["COMP-API-CONTRACT"]
size: S
labels: [feat]
status: pending
---

## Summary

Build DeviceFrame — device mockup frames (iPhone, iPad, Android phone/tablet) for displaying content previews.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/device-frame` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-device-frame` | React wrapper | React component with hooks binding |
| `@elloloop/angular-device-frame` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-device-frame` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/featuredocs** | `src/components/DeviceFrame.tsx` | Renders children inside a styled device container. Supports iPhone, iPad, Android phone, Android tablet. Portrait or landscape orientation. Correct aspect ratios, border-radius, decorative elements (notch, home indicator). Uses `DeviceType` and `Orientation` types. |
| **elloloop/learnloop** | `components/settings/` | (Conceptually similar — device-aware rendering for mobile preview) |

## Acceptance Criteria

- [ ] Device types: `iphone`, `ipad`, `android-phone`, `android-tablet`
- [ ] Orientation: `portrait`, `landscape`
- [ ] Correct aspect ratios per device
- [ ] Decorative elements: notch (iPhone), home indicator, status bar
- [ ] Children rendered inside the device screen area
- [ ] Responsive: device frame scales to fit container
- [ ] Custom className support
- [ ] TypeScript types for `DeviceType` and `Orientation`
- [ ] Unit tests + Storybook stories (one story per device type)
