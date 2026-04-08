---
id: AUTH-FIREBASE
track: auth
depends_on: ["AUTH-PROVIDER"]
size: M
labels: [feat]
status: superseded
---

## Summary

~~Create `@refraction-ui/auth-firebase` as a separate adapter package.~~

**SUPERSEDED** — Firebase adapter is now an **internal module** within `@refraction-ui/auth`, not a separate package. See AUTH-PROVIDER for details.

The consumer never imports or knows about Firebase. Provider selection happens via env vars or `.refractionrc` config. The auth package auto-detects which adapter to use.

See **ADR 0003** for the full rationale.
