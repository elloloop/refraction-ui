# Composer quality contract

The benchmark is the reliability people expect while composing in WhatsApp or
Slack: keep their draft, selection, input session and intent intact. This is a
behavioral benchmark, not a claim of feature parity with either product. The
composer does not implement a messaging transport, outbox, server persistence,
media upload, audio recording or delivery receipts.

## Required checks

From the repository root, with Flutter on PATH:

```sh
make ci
cd packages/flutter
flutter pub get
flutter test --exclude-tags golden
cd example
flutter build web --release --target lib/composer_input_harness.dart
cd ../../..
pnpm exec playwright install chromium
pnpm exec playwright test --config playwright.flutter.config.ts
```

`test-matrix-flutter` runs the non-golden suite and the browser checks on every
PR and main push. Only visual baselines tagged `golden` are excluded: their
OS-specific pixels cannot justify ignoring behavior failures. The publish gate
also runs the non-golden suite. Golden tests remain separately runnable on the
baseline platform with `flutter test --tags golden`.

For a short edit loop:

```sh
cd packages/flutter
flutter test test/composer_test.dart test/composer_interaction_test.dart test/core/composer_core_test.dart test/core/composer_rules_test.dart test/core/composer_trigger_test.dart test/core/composer_suggestion_test.dart test/core/composer_token_test.dart
```

## Coverage and ownership matrix

These are existing and newly added executable contracts, not a list of tests we
intend to write. `J*`, `A*`, etc. are stable labels in the named test files.

| Behavior people depend on | Executable coverage | Boundary / remaining gap |
| --- | --- | --- |
| Long uninterrupted typing, wrapping, capped growth, internal scrolling | `composer_interaction_test.dart`: continuous Unicode typing (90 successive edits); `composer_test.dart` J6/J7/J8 | Widget test checks client, focus, exact buffer and scroll position; browser checks real DOM focus at 390/768/1280px |
| Prediction/autocorrect, paste, deletion without keyboard collapse | Interaction tests: selected middle-word replacement, same-length autocorrect, bulk paste/select-all deletion; essential input-client regression in `composer_test.dart` | OS prediction UI needs the native exercise below; channel updates do not simulate a prediction tap |
| Selection, caret and suffix preservation | Interaction tests: middle-word replacement, backward selection, same-length correction, scale change; browser Shift+Left replacement | Core stores an ordered range, so the adapter must preserve Flutter's selection direction when range is unchanged |
| Unicode, surrogate pairs, combining marks, skin tones and ZWJ families | Continuous typing test; core rules A6/A7; widget paste-limit test | Does not assert installed fonts/glyph appearance or OS grapheme navigation behavior |
| IME preedit, commit, Enter guard and length limits | Interaction tests: over-limit CJK preedit/commit and mention composition; J2; core rules A4 and triggers C12 | Active composing text belongs to IME; OS language keyboard candidate UI is native smoke coverage |
| Brief input hold without keyboard disconnection | Formatter lock/unlock interaction test checks rejected text, editor identity, platform client connection count, focus and keyboard visibility | Host guards programmatic controller writes and duplicate sends separately |
| Text size, viewport and responsive layout | Interaction scale test (1x/2x/3x), J7/J15/J16; browser width and RTL matrix | Real keyboard insets/orientation animation remain native checks |
| Accessibility reading order and real browser semantics | Four traversal tests (LTR/RTL × default/custom leading), J1/J9/J19; browser original-node identity and zero blur checks | Screen-reader spoken output is not simulated; VoiceOver/TalkBack require manual accessibility review |
| Send/Shift+Enter/composition precedence | J2/J3/J4/J20; core rules A4; browser Shift+Enter | Keyboard shortcut semantics differ by modality; native return remains newline |
| Empty/whitespace, disabled/read-only/busy/validation | J11/J12/J13/B12; external-controller disabled/read-only rebuild tests; core A2/A3/B4/B5/B8/B9; interaction busy→invalid→successful send | Transport success/failure/retry is host-owned; validation failure is not a network retry test |
| Mentions, emoji, token atomicity and suggestion navigation | J4/J5/J19/J20/J22; `core/composer_trigger_test.dart`, `composer_suggestion_test.dart`, `composer_token_test.dart`; interaction CJK mention touch commit | Resolver data and permissions are host-owned; core includes stale responses, cancellation, debounce and retry |
| Emoji/accessory selection replacement and focus recovery | Interaction selected-word family emoji insertion; accessory open/close and outside-tap tests in `composer_test.dart` | Emoji button inserts through public controller; gallery permissions/pickers belong to host |
| Controller replacement/unmount and async cleanup | J17/J18/external FocusNode test; interaction controller conversation swap and late resolver after unmount | Host must scope controllers and draft keys to the intended conversation |
| Draft storage, composition-safe autosave and restore | Core F6/F7/F8; J21; interaction two-key draft isolation | Injected store contract only; no disk/cloud durability is promised by in-memory fixture |
| Edit existing/cancel/restore unsent draft | Core B13; J23; interaction edit cancel and edit submit preserve pre-edit draft | Selecting which server message to edit and applying the update are host-owned |
| Attachment limits, status, removal and attachments-only send | Core F1–F5; J14 | File I/O, compression, upload progress source, offline outbox and retries are host integrations |

## Why these tests catch the original escapes

Do not repeatedly call `tester.enterText`, `showKeyboard`, or a browser `fill`
helper in an input-retention test. Those can focus the field again and conceal a
lost connection. The widget helper asserts an existing input client **before**
each `TestTextInput.updateEditingValue`; it focuses only once. The browser test
sends keys without refocusing, retains the original DOM element, counts blur
events and verifies the entire resulting value.

Mutation checks used while adding this suite:

- Removing the TextField's persistent key makes continuous Unicode typing fail
  on lost input connection.
- Removing the ordinal semantic ordering makes RTL traversal tests fail.
- The previous bridge normalized backward selection to forward; the new
  backward-selection widget test fails on the first selection update, and the
  real browser replacement leaves fragments of the original word. The bridge
  now retains anchor/extent/affinity when the core's ordered range is unchanged.

Toggling disabled/read-only under an external controller's ListenableBuilder
also reproduced a build-time ancestor notification. Core flags still update
synchronously; controller listeners are coalesced until the end of the frame only
for widget flag synchronization during build. Standalone controller changes
remain synchronous without an initialized Flutter binding (`composer_controller_test.dart`). The two widget regressions verify both
restriction and re-enable preserve the draft and update send eligibility.

Run mutation experiments only in an isolated checkout and restore production
code afterward. Assertions are about observable behavior; they do not test for
`GlobalKey`, `AnimatedSize`, or a particular implementation tree.

## Native software-keyboard exercise

The example target `lib/composer_input_harness.dart` uses the public component,
with no login, network or message transport. On a simulator/emulator with an OS
software keyboard enabled:

```sh
cd packages/flutter/example
flutter devices
flutter run -d DEVICE_ID --target lib/composer_input_harness.dart
```

Keep the hardware keyboard disconnected in the iOS simulator. Record the screen
locally, note Flutter/OS/device versions and perform this sequence without
retapping the editor to recover focus:

1. Tap the field once. Type until it wraps and reaches its height ceiling; keep
   typing to verify the caret scrolls into view.
2. Type `congr`, tap the actual keyboard prediction `congratulations`, then
   continue typing. Trigger an actual autocorrection (for example `typign`).
3. Insert a newline with Return; select and replace a middle word, paste a
   multiline block, select all/delete, then type again.
4. Switch to a CJK IME, compose and confirm a candidate. Switch to emoji and
   insert a multi-codepoint emoji. Verify draft/caret and keyboard continuity.
5. Rotate or resize the viewport while editing, then continue. Check the send
   button remains reachable and sends once.

Acceptance: no unsolicited keyboard dismissal, lost/duplicated text or caret
jump; newline does not submit; send intentionally clears the draft and retains
focus. Preserve before/after evidence locally for keyboard changes. The iPhone
prediction regression was reproduced and verified in the consuming app on a
native simulator; that evidence is not an automated upstream native test.
Android, mobile Safari and OS screen-reader coverage must be reported as
unverified until actually exercised. Desktop Chromium responsive viewports do
not count as mobile OS testing. Native keyboard automation is not currently
wired into this repository's CI; adding it requires a native driver that taps
the real IME, not an integration test that merely injects Dart editing values.

## Opt-in clipboard images

`RefractionComposer.onImagesPasted` enables image paste. Its host stages the
images in its existing upload workflow; this component never submits, uploads,
or retains clipboard bytes. `onPasteError` reports causes and the localized
`strings.pasteFailedNotice` displays a failure. `clipboardReader` is an injectable
native reader for tests. With no callback, existing text paste is unchanged.

Desktop Cmd+V/Ctrl+V uses Flutter's overridable `PasteTextIntent`. Flutter's
context toolbar adds Paste even when an image-only clipboard has no text. Web
uses the user-triggered ClipboardEvent reader rather than polling or requesting
asynchronous browser clipboard permission. Text goes through the existing
EditableText input formatter/selection/undo path, including mixed text+images.
Only the focused enabled, editable, non-busy composer reads a browser event.
Late results after newer edits, controller replacement, disable or unmount are
ignored. Each clipboard item contributes one representation (PNG, else JPEG),
in item order, with the first plain-text representation; TIFF/DIB conversion to PNG is supplied by the native adapter.
Unsupported formats do not stage. A read or size failure rejects the whole paste
transaction, retains the draft, and displays the error; retry is a new gesture.
Individual images are bounded at 100 MiB while streaming, before host validation.

Flutter's first-party Clipboard API only exposes text. `super_clipboard: 0.10.0-dev.2`
is a necessary documented third-party dependency from Superlist, isolated in
`composer_clipboard.dart`. It supplies OS format conversion and browser paste
readers across macOS, Windows, Linux, iOS, Android and web. It uses native Rust
through `super_native_extensions` and may download precompiled binaries or build
with installed rustup; native build prerequisites must be provisioned by the
consumer's standard pipeline. API availability and OS source formats vary;
Windows/Linux multiple items have platform restrictions. This is not a promise
that every software keyboard exposes image paste, or that arbitrary HTML image
URLs/files/HEIC formats are read. Android keyboard content insertion is separate
from a clipboard gesture and is not implemented here.

Tests: `composer_clipboard_reader_test.dart` exercises format precedence,
multiple/mixed payloads, unsupported formats, bounded reads and errors;
`composer_clipboard_test.dart` checks staging without submit, selection/input
retention and late-read cleanup. Browser tests exercise actual Chromium keyboard
paste of a generated PNG and browser ClipboardEvent mixed payloads at 390, 768,
1280px, including real editor undo. The isolated harness stages fixture chips
with no transport. `example/integration_test/clipboard_image_test.dart` also exercises native macOS
PNG reading through the real plugin and keyboard paste action, retaining draft
and focus. Run it with `flutter test integration_test/clipboard_image_test.dart
-d macos` from example (it writes a generated PNG to the OS clipboard). The iOS 26.5 simulator fixture uses the actual plugin and an image-only context
Paste button, retaining draft and keyboard focus. The context toolbar belongs
to the composer tap region so tapping Paste is never an outside dismissal. The
local Xcode 27 macOS run used a temporary unsigned arm64/macOS12 compiler config and disabled
experimental Swift Package Manager; no application deployment floor changed.
The host GitHub SSH rewrite initially blocked the plugin's public `mime_guess`
Rust patch; process-local `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`,
`CARGO_NET_GIT_FETCH_WITH_CLI=true` allowed its existing HTTPS URL. No user Git
setting or dependency source was changed. The iOS run used a temporary unsigned
arm64/iOS15 compiler config; the example's older deployment targets are refused
by Xcode 27, and no app support floor was changed in this feature. Windows, Linux,
Android and mobile Safari clipboard behavior remain unverified; desktop responsive tests do not establish mobile OS support.

`test-matrix-flutter-native` builds a generated consuming app for Android, Linux
and Windows. It imports the public composer and clipboard API and uses the actual
native dependency graph, including Cargokit. These are build gates, not clipboard
interaction claims; require all three jobs green before tagging this feature.

## Stacked composer surface and icon menus

`test/composer_layout_test.dart` runs both the default and stacked toolbar
layouts through focused multi-character replacement, line wrapping and submit.
It checks editor-state identity, input-client count, focus retention and the
existing undo-controller replacement (the pre-existing sent-text undo bug is
outside this additive layout change). `test/icon_menu_test.dart` checks separate
accessible mic/menu actions, disabled controls, legacy triggers and selection.
Main/keypad Enter on focused toolbar actions must activate the intended action
without submitting or clearing a review draft; unhandled host-action keys must
not invoke editor shortcuts. A narrow toolbar test forces actions onto multiple
rows while its primary action remains separate. Fixed default and stacked cases
verify editor continuity within each layout, not dynamic switching between them.
The multiline docs use case consumes the same shared stacked-layout widgets.

### Android build toolchain compatibility

Refraction 0.51 requires Flutter 3.44+ and pins upstream Superlist 0.10.0-dev.2.
Its native hooks replace Cargokit, whose Project.exec call was removed in Gradle 9.
The native Android smoke gate pins Flutter 3.47.5; Linux and Windows use stable
Flutter. Consumers on Flutter 3.38.3 must stay on Refraction 0.50 until upgraded.
The upstream prerelease also widens device_info_plus compatibility so clipboard
images and current official LiveKit SDKs can coexist. Because this is a prerelease,
the widget, browser clipboard and native build gates must pass before publishing.
No dependency override, package-cache patch or error suppression is used.

### Browser selection synchronization

The real Unicode clipboard case covers rapid select-all/paste after both platform and explicit Ctrl undo/redo shortcuts. The DOM selection is captured synchronously at the paste gesture because Flutter selectionchange notifications can lag behind it. The clipboard reader still rejects a result after subsequent typing or selection movement; widget regressions cover both stale-read cases.
