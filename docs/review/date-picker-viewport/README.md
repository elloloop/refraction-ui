# DatePicker bottom-edge widget comparison

These are actual headless Flutter widget renders, not native operating-system
screenshots: 390 × 844 logical pixels, 2× text, 364px trigger, Material 3,
English and installed Arial plus MaterialIcons fonts. The same selected date
is 2026-10-05 07:00, with the trigger at the bottom edge of the viewport.

Before source: `183ff49c3962bf52baf26497621d715037707a28` (PR #558).
After production source: `57550cc1045d49269dd0b8aa1344f41582a024fd`.
The evidence amendment does not change those production source blobs.

Before, the popup opens below the bottom trigger, outside the viewport. After,
it opens within the available height above the trigger, with a scrollable
calendar and complete time digits. The capture fixture checks the actual
popup bounds: before extends below824px; after stays between24px and824px.
Both two-case capture runs pass, without production services or device input.

The light and dark PNGs are separate fixed-format variants. They cannot adapt
to system appearance. Keyboard-inset movement, focused/unfocused editable
geometry, no idle-frame scheduling and DST calendar correctness are covered
by executable tests; these images do not claim a native keyboard or DST proof.
