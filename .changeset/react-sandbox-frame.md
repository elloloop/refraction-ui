---
'@refraction-ui/react': minor
---

Add `SandboxFrame` to `@refraction-ui/react`: shows untrusted `html` in a `srcdoc` iframe with an opaque-origin `sandbox` (scripts opt-in via `allowScripts`, refused together with `allow-same-origin`) and an injected `default-src 'none'` CSP (`csp` overrides), forwarding theme tokens, with nonce-reporter auto-height, a `maxHeight` cap with a Show more control, loading/error states and a required `title`. (#580)
