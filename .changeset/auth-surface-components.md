---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

Add auth-surface components (#330–#334), each as a headless core + React and Astro adapters wired into the metas:

- **SegmentedControl / SegmentedControlItem** — compact, radio-semantics single-choice value picker (roving focus, arrow keys, `sm|md`, controlled/uncontrolled).
- **PasswordInput** — `Input` wrapper with a show/hide toggle; plus a new `validationState` (`valid|invalid`) affordance and `leadingIcon` slot on **Input** itself.
- **SocialAuthButton / SocialAuthRow** — OAuth provider buttons with bundled brand icons, `loading`, and a "Last used" badge.
- **Separator** — horizontal/vertical rule with an optional centered label (the `──── or ────` divider).
- **EmptyState / ConfirmationCard** — centered icon-chip + title + body + actions stack with `tone` tints and an optional bordered surface.
