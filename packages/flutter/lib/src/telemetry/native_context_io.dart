/// Native-context collector for `dart:io` targets (Android, iOS, macOS,
/// Windows, Linux).
///
/// Reads ONLY non-identifying, store-safe values:
///  - `osName`      — `ios` / `android` / `macos` / `windows` / `linux`
///  - `osVersion`   — `Platform.operatingSystemVersion` (kernel/OS string)
///  - `deviceModel` — best-effort: `Platform.localHostname` on desktop;
///                    on mobile this is a generic value (`iPhone`/`Android`)
///                    because the precise model needs a plugin we deliberately
///                    avoid. The consumer can override via
///                    `NativeContextOverrides.deviceModel`.
///  - `locale`      — `PlatformDispatcher.instance.locale` (BCP-47-ish)
///  - `dartVersion` — `Platform.version` (diagnostic only)
///
/// No advertising ID, IDFA/IDFV, MAC, serial, or any persistent hardware
/// identifier is read. Required-reason API note: the only "required reason"
/// API potentially touched on iOS is file timestamps via the durable queue
/// (declared `C617.1` in the privacy manifest) — nothing here reads one.
library;

import 'dart:io';
import 'dart:ui' show PlatformDispatcher;

Map<String, Object?> collectNativeContext() {
  final out = <String, Object?>{};

  String osName;
  if (Platform.isIOS) {
    osName = 'ios';
  } else if (Platform.isAndroid) {
    osName = 'android';
  } else if (Platform.isMacOS) {
    osName = 'macos';
  } else if (Platform.isWindows) {
    osName = 'windows';
  } else if (Platform.isLinux) {
    osName = 'linux';
  } else {
    osName = Platform.operatingSystem;
  }
  out['osName'] = osName;

  try {
    out['osVersion'] = Platform.operatingSystemVersion;
  } catch (_) {
    // Some sandboxes deny this — omit.
  }

  // Device model: precise model requires a platform plugin we intentionally
  // do not depend on. Use a coarse, non-identifying value; consumers wanting
  // the exact model pass NativeContextOverrides.deviceModel.
  try {
    if (Platform.isIOS) {
      out['deviceModel'] = 'iPhone/iPad';
    } else if (Platform.isAndroid) {
      out['deviceModel'] = 'Android';
    } else {
      // Desktop hostname is a user-set, non-hardware label — fine to report.
      out['deviceModel'] = Platform.localHostname;
    }
  } catch (_) {
    // Hostname lookup can throw in locked-down sandboxes — omit.
  }

  try {
    final l = PlatformDispatcher.instance.locale;
    final tag = l.countryCode == null || l.countryCode!.isEmpty
        ? l.languageCode
        : '${l.languageCode}-${l.countryCode}';
    if (tag.isNotEmpty) out['locale'] = tag;
  } catch (_) {
    // Locale unavailable before the engine binds — omit.
  }

  try {
    // Major.minor only; the full version string is noisy.
    final v = Platform.version.split(' ').first;
    out['dartVersion'] = v;
  } catch (_) {
    // omit
  }

  return out;
}
