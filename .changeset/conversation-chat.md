---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

Add Conversation / Chat.

A headless multi-conversation chat store (`createConversation`) with reply-threads, two threading modes (`inline` — replies quote their parent in the timeline and open a thread panel; `panel` — Slack-style, only roots in the timeline), reactions, edit/delete, retry/stop, and streaming through a backend-agnostic `ChatTransport` (SSE / WebSocket / fetch — the consumer's choice; nothing about the backend leaks into the UI).

- **React** (`@refraction-ui/react`): `useConversation()` hook + a batteries-included `Chat` component — conversation sidebar, mode toggle, thread side panel, rich content (markdown / code / gifs / attachments), reactions, edit/delete, and a streaming typing indicator.
- **Astro** (`@refraction-ui/astro`): a server-rendered `Chat` that renders both modes from the headless store and surfaces interactivity as semantic `rfr:*` CustomEvents the host app wires to its backend.
