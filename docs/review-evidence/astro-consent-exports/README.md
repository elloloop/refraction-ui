# Astro control export comparison

These are SSR consumer fixtures, not a deployed application or a grant flow.
Both sides use the same Card, Input and Radio implementations, shared docs CSS,
content, focused email input and unselected agent choice.

- Before: base `5602fbb1eacb21574e7493418a15acb4ea6e8ee0`; the existing
  components are imported directly from their source files because the public
  meta entry points do not export them. Each component source and the common
  docs stylesheet/config were verified byte-for-byte against this base.
- After: implementation commit `d91cf423264af2126af4b7436e819b0fca3361bd`;
  the same fixture imports every component through the supported built public
  meta entry point. The later evidence commit does not modify that source.

Desktop is 1180 × 900; phone is 390 × 844. Each viewport has light and dark
screenshots. Both sides intentionally render identical pixels: this fixes
public import reachability without changing the component implementation.
The compiled SSR named-import regression and full CI verify that reachability.
These still images do not claim browser interaction or accessibility coverage.
