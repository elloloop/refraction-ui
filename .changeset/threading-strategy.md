---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

Conversation — refine the reply-threading strategy. Replies to *any* message in a thread (the root or a mid-thread reply) now group under the originating root (one level deep) while remembering the specific message replied to via `replyToId` (used for the quote). The "💬 N replies" count now shows on the originating message in **both** inline and panel modes, and a new `replyTo(messageId)` action + `replyTarget` state lets a reply target a specific mid-thread message while still grouping under the root.
