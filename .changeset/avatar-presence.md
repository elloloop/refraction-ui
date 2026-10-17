---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

Avatar: show presence.

- `presence` (`'online' | 'away' | 'busy' | 'dnd' | 'offline'`) draws a dot at the avatar's bottom end corner, in the same colours as `PresenceIndicator` (both now read one status-to-colour map). `avatarPresenceVariants` exposes its classes. It sits over the edge with a ring in the page background, scales with `size` and sits just off the corner of a `square` avatar.
- A named avatar (`aria-label`) adds the status to its name, "Ada Lovelace (Away)", and hides the dot from assistive tech; an unnamed avatar names the dot itself ("Away"). `presenceLabel` sets the status words, e.g. for another language. `data-presence` on the root and `data-status` on the dot are styling hooks.
- `@refraction-ui/astro` now exports `Avatar`, `AvatarImage` and `AvatarFallback` (before, the meta exported nothing for them), and the Astro `Avatar` takes the same `presence` and `presenceLabel`.

**Changed:** so the dot is not cut off, the avatar root no longer clips (`overflow-hidden` is gone from `avatarVariants`). The image and the fallback round and clip themselves instead (`rounded-[inherit]`), and the image is laid over the fallback (`absolute inset-0`), so the initials show while a photo loads. Content other than `AvatarImage` and `AvatarFallback` placed inside an avatar is no longer clipped to its shape; give it `rounded-[inherit] overflow-hidden` to keep that.
