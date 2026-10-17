---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

LiveTranscript shows both sides of a call, interim lines that settle into their finals, and can follow the live line.

- `TranscriptEntry` gains `side` (`'me' | 'them'`), `interim` and `startMs`. Your lines sit at the end edge and theirs at the start edge, each in its own bubble. Interim lines are muted with a dotted underline, carry a screen-reader "still listening" suffix (`interimLabel`) and are kept out of the log's announcements until their final replaces them.
- New `applyTranscriptUpdate(entries, result)`: each side keeps one interim line, a final replaces it, and finals from both sides are ordered by `startMs`.
- The panel is focusable by default (`tabIndex` 0) so it can be scrolled from the keyboard; pass `tabIndex={-1}` (React) or `tabindex={-1}` (Astro) to opt out.
- React only: `autoFollow` keeps the newest line in view, pauses when the reader scrolls up, and shows a "Jump to live" control (`jumpToLiveLabel`) that resumes it, without animation under reduced motion.

Breaking for direct users of the core helpers only: `TranscriptBlock.texts` is now `lines` (`{ id, text, interim }`), and `transcriptTextLineClass` is now `transcriptTextLineVariants`. Neither is exported by `@refraction-ui/react` or `@refraction-ui/astro`.
