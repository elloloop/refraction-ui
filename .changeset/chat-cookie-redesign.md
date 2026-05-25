---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

Visual redesign of the Chat composer and the CookieConsent banner. The Chat composer is now a unified rounded input card (textarea + bottom bar with attach / formatting toolbar / send), with the inline error + retry banner restored (new optional `error`/`onRetry` props on `Composer`). The CookieConsent banner gets a cookie-icon header, a clearer button hierarchy (Customize / Reject all / Accept all), and switch-style category toggles in the settings view; the Astro `CookieConsent` mirrors the new look.
