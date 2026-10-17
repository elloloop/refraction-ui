---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

AvatarGroup: whole presence dots, a fallback for missing photos, and a "+N" badge that can be a real button.

- The presence dot is no longer cut off by its avatar's edge or hidden under the next avatar in the stack: it sits on top (`z-10`), and the group keeps it within itself (`isolate`).
- A photo is laid over the initials, which show while it loads and stay when it fails, including a photo that failed before the page hydrated or the Astro script ran. The photo is decoration (`alt=""`); the avatar already carries the name.
- `onOverflowClick` (React) and `overflowButton` (Astro) make the "+N" badge a button with a visible focus ring, e.g. to open a list of everyone. React passes the button, to anchor a popover to it; in Astro, listen for `click` on `[data-rfr-avatar-group-overflow]`.
- The group's ids come from `useId` in React, so a server-rendered group hydrates without a mismatch.
- The `xs` size's text is `0.625rem` instead of `10px`, so it follows the user's font size.
- `@refraction-ui/astro` now exports `AvatarGroup` (before, the meta exported nothing for it), and `@refraction-ui/react` now exports the `AvatarUser` type.

**Changed:** without a handler, the "+N" badge is labelled as an image ("2 more users"), not as a button that did nothing when pressed. The avatar root no longer clips (`overflow-hidden` is gone from `avatarVariants`); the photo and the initials round and clip themselves (`rounded-[inherit]`). Other content placed in a styled avatar is no longer clipped to its shape.
