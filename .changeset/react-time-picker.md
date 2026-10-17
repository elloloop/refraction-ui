---
'@refraction-ui/react': minor
---

Add `TimePicker` to `@refraction-ui/react`: an ARIA combobox time-of-day field (value in minutes since midnight) with forgiving typed entry ("930", "9:30pm", "21:30"), a locale-driven 12/24-hour clock, `min`/`max`/`step` with arrow-key stepping, and suggestions that show durations from a `start` for end times. The pure `parseTime`, `formatTime`, `suggestTimes` and `stepTime` helpers are exported too. (#586)
