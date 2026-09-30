# Composer clipboard boundary

Flutter (#527) and the web adapters share a behavior contract, not platform IO:
explicit user paste only; original PNG/JPEG payloads to the host; mixed text at
selection; image-only paste retains text/selection; empty or oversized image
batches fail before draft mutation; unsupported formats are skipped; paste never
uploads or submits. Default per-image limit is 100 MiB. Web hosts may override it
with `maxAttachmentSizeBytes`. Callback staging applies normal core gates.

React opts in with `onImagesPasted(File[])`; `onPasteError` accompanies a localized
`strings.pasteFailedNotice`. Without opt-in, generic files still stage automatically;
`onAttachmentAdd(attachment, file)` now retains the raw file. Mixed text is preserved
on that legacy path too. Astro keeps `Composer.astro` as its static shell and adds
`RefractionInteractiveComposer`, with the same core and no React runtime. Its
bubbling DOM events are:

- `refraction:composer-ready`: `{ api }` for host-owned state/status updates.
- `refraction:images-pasted`: `{ images: File[], api }` for staging/upload.
- `refraction:paste-error`: `{ error }` plus a localized live notice.
- `refraction:submit`: `ComposerSubmission`, after explicit Send or opt-in Enter.
- `refraction:attachment-remove`: removed attachment; host cancels its upload.
- `refraction:composer-event`: core notices, including count/accept rejection.

Files are not placed in serializable draft metadata. Keep bytes/upload handles in
the host, call `api.addAttachment` to stage, `updateAttachment` for progress/error/
ready, and gate sending while uploads are unfinished. Host exceptions and failed
uploads belong to that transport boundary, not clipboard-read failures. Astro
provides a basic text/attachment island; React's suggestion/accessory UI is not
implemented by that island. This change does not claim full component parity.

Run locked install, `make ci`, and `make audit`. Then:

```sh
pnpm exec playwright test -c playwright.composer-paste.config.ts
pnpm exec tsc --noEmit --strict --skipLibCheck --moduleResolution bundler --module esnext --target es2022 packages/astro-composer/src/interactive-composer.ts
```

The isolated Astro fixture imports the built public Astro meta and real React
adapter. Build the metas/Tailwind first (`make ci` does this). It has no transport,
account or external media. Screenshots under `e2e/results/composer-paste` are
local, generated evidence, not golden-baseline updates or uploads.

The suite covers mixed text/images, multiple original files, replacement at
selection, image-only selection, format/empty/size errors, no autosend and explicit
Send. Chromium exercises a generated PNG through actual OS clipboard write and
keyboard paste; synthesized events cover mixed MIME payloads. Chromium and
Playwright WebKit exercise native text undo and 390/1280 px layouts. Those synthetic
mixed-event checks do not prove every OS exposes the same MIME combination.

Native text insertion uses `document.execCommand('insertText')` to retain browser
undo, with direct-field fallback where unavailable. This is deprecated and browser
specific: [MDN's undo-buffer explanation](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand).
Never use it to read the clipboard. Mobile Safari, Firefox and other desktop OS
clipboard representations need their own device checks; WebKit automation is not
a real mobile Safari clipboard test. Flutter's separate native/browser matrix is
in `packages/flutter/COMPOSER_TESTING.md`.

Observed limit: in Playwright WebKit, React can coalesce a preceding scripted
`fill()` and the following synthetic paste into one undo step, restoring the
previous draft rather than only the pasted fragment. The suite proves paste undo
from SSR/restored drafts; it does not claim separate undo groups after every
preceding typing sequence. Verify that sequence on target devices before release.
