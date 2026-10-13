---
"@refraction-ui/react": patch
---

Cancel pending SearchBar debounced searches on unmount so callbacks and loading updates do not run after the component is removed.
