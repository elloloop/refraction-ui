# Native-safe focus ring comparison

Actual headless Flutter widget captures of the public RefractionFocusRing use
neutral repository-owned content. They are not production app screenshots or
native document click evidence. Each comparison uses the same 440×280 viewport
at 2× pixels and the real shared minimal light/dark themes. Before: the same card
without the newly introduced wrapper. After: Tab focuses the actual wrapper and
Enter activates its callback once. The capture loads the official SDK Roboto font.

The independent test/focus_ring_test.dart checks actual PlatformViewLayer order
and Tab/Enter in both appearances. Screenshots alone cannot establish native
pointer ownership. No visual-regression baseline is updated here.

From packages/flutter run:

```sh
FLUTTER_ROOT=/path/to/official/flutter flutter test --no-pub \
  ../../docs/pr-evidence/focus-ring/capture_test.dart test/focus_ring_test.dart
```
