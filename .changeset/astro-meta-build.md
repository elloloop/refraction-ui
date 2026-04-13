---
"@refraction-ui/astro": patch
---

fix: implement source copier build strategy for astro meta-package

- Added a custom build script that consolidates all private `astro-*` workspace components into a single `dist` directory.
- Updated internal imports to relative paths.
- Configured the meta-package to export the unified `dist` folder.
- Ensures consumers can use the library as a single package while retaining Astro's native component optimizations.
