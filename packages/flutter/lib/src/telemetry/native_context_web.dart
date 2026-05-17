/// Native-context collector for Flutter web.
///
/// Web has no device model / OS APIs that are store-safe and stable, so this
/// reports only the engine locale. `navigator.userAgent` is intentionally NOT
/// read (fingerprinting surface). The uniform surface is preserved — web just
/// resolves a smaller map. Consumers can still inject app version/build via
/// `NativeContextOverrides`.
library;

import 'dart:ui' show PlatformDispatcher;

Map<String, Object?> collectNativeContext() {
  final out = <String, Object?>{};
  out['osName'] = 'web';
  try {
    final l = PlatformDispatcher.instance.locale;
    final tag = l.countryCode == null || l.countryCode!.isEmpty
        ? l.languageCode
        : '${l.languageCode}-${l.countryCode}';
    if (tag.isNotEmpty) out['locale'] = tag;
  } catch (_) {
    // omit
  }
  return out;
}
