---
'@refraction-ui/react': minor
---

Add `StepCard` and `InstructionList` to `@refraction-ui/react`: a setup step with an icon, title, reason, a live `status` (`'notDetermined' | 'needed' | 'checking' | 'granted' | 'failed'`, icon + text, announced politely on change), one action, numbered MarkupText `instructions`, collapsible `troubleshooting`, a `liveHint` while checking and `expanded`; `InstructionList` is the numbered list in a muted well. Props match Flutter's `RefractionStepCard` / `RefractionInstructionList`. (#592)
