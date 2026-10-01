# Markdown renderer


## Unicode message display

Sanitized HTML is enhanced after hydration using the shared complete-grapheme
artwork inventory. Unicode remains selectable text; code/pre, URL attributes,
and editable nodes are never rewritten. Native text remains during load/error
and when artwork is disabled. React conversation messages consume this renderer;
Astro conversation SSR messages invoke the same helper. Hosts replacing Astro
message DOM can call `enhanceUnicodeEmojiDisplay` after their render. This is
static Twemoji coverage, not a bundled web Noto animation runtime.
