---
id: PWA-INSTALL-PROMPT
track: pwa
depends_on: ["PKG-CORE"]
size: S
labels: [feat]
status: pending
---

## Summary

Build InstallPrompt and MobileUsageTip — PWA install banner and dismissable mobile tip components.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/install-prompt` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-install-prompt` | React wrapper | React component with hooks binding |
| `@elloloop/angular-install-prompt` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-install-prompt` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/stream-mind** | `frontend/src/packages/ui/InstallPrompt.tsx` | Listens for `beforeinstallprompt` event. Shows dismissible banner after 3s delay. Install + "Not now" buttons. Remembers dismissal in localStorage. |
| **elloloop/easyloops** | `src/shared/components/MobileUsageTip.tsx` | Dismissable bottom-sheet tip on mobile after 2s. Persists dismissal to localStorage. `animate-in slide-in-from-bottom-4 duration-300`. |

## Acceptance Criteria

- [ ] `<InstallPrompt>` — PWA install banner
  - [ ] Listens for `beforeinstallprompt` browser event
  - [ ] Shows after configurable delay (default 3s)
  - [ ] Install and Dismiss buttons
  - [ ] Remembers dismissal in localStorage
  - [ ] Only renders when PWA install is available
- [ ] `<MobileUsageTip>` — dismissable info banner
  - [ ] Shows on mobile after configurable delay (default 2s)
  - [ ] Bottom-sheet style with slide-in animation
  - [ ] Dismiss button, persists to localStorage
  - [ ] Configurable content via children
  - [ ] Only shows once (until localStorage cleared)
- [ ] Unit tests + Storybook stories
