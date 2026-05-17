/// Native device/app context auto-attach.
///
/// Collects a small, fixed, **non-identifying** set of attributes — device
/// model, OS name + version, app version/build, locale — and merges them once
/// onto every record's context as a `device` sub-map. This is the same on
/// web / android / ios / desktop: the public surface is a single
/// [NativeContext] resolved behind a conditional import. No advertising ID,
/// no IDFA/IDFV, no MAC, no persistent hardware identifier is ever read here
/// (store-compliance: see `PrivacyInfo.xcprivacy` + DATA_SAFETY.md).
///
/// Dependency policy: this uses only `dart:io` (`Platform`) and Flutter SDK
/// APIs (`PlatformDispatcher.locale`). It deliberately does NOT pull
/// `device_info_plus` / `package_info_plus`; app version/build are read from
/// the optional [NativeContextOverrides] the consumer can supply (or from
/// `--dart-define`d values) so the package stays dependency-free while still
/// shipping the attributes stores expect documented.
library;

import 'native_context_stub.dart'
    if (dart.library.io) 'native_context_io.dart'
    if (dart.library.js_interop) 'native_context_web.dart'
    as platform;

/// Consumer-supplied overrides. App version/build are not reliably available
/// without a plugin; the consumer passes them (commonly from generated build
/// config or `--dart-define`). Any field left null is simply omitted.
class NativeContextOverrides {
  /// Creates [NativeContextOverrides].
  const NativeContextOverrides({
    this.appVersion,
    this.appBuild,
    this.deviceModel,
    this.osName,
    this.osVersion,
    this.locale,
  });

  /// Marketing version, e.g. `1.4.0` (iOS `CFBundleShortVersionString` /
  /// Android `versionName`).
  final String? appVersion;

  /// Build number, e.g. `42` (iOS `CFBundleVersion` / Android `versionCode`).
  final String? appBuild;

  /// Override the auto-detected device model.
  final String? deviceModel;

  /// Override the auto-detected OS name (`ios`, `android`, ...).
  final String? osName;

  /// Override the auto-detected OS version string.
  final String? osVersion;

  /// Override the auto-detected locale (BCP-47-ish, e.g. `en-US`).
  final String? locale;
}

/// Resolves the native device/app attributes for the current platform.
class NativeContext {
  NativeContext._(this._values);

  final Map<String, Object?> _values;

  /// Resolve the platform context once. Failures degrade to an empty map so
  /// telemetry never breaks because a platform probe threw.
  factory NativeContext.resolve([NativeContextOverrides? overrides]) {
    Map<String, Object?> base;
    try {
      base = platform.collectNativeContext();
    } catch (_) {
      base = <String, Object?>{};
    }
    if (overrides != null) {
      if (overrides.appVersion != null) base['appVersion'] = overrides.appVersion;
      if (overrides.appBuild != null) base['appBuild'] = overrides.appBuild;
      if (overrides.deviceModel != null) {
        base['deviceModel'] = overrides.deviceModel;
      }
      if (overrides.osName != null) base['osName'] = overrides.osName;
      if (overrides.osVersion != null) base['osVersion'] = overrides.osVersion;
      if (overrides.locale != null) base['locale'] = overrides.locale;
    }
    base.removeWhere((_, v) => v == null);
    return NativeContext._(base);
  }

  /// The collected attributes (a fresh copy; callers may mutate it).
  Map<String, Object?> get values => Map<String, Object?>.from(_values);

  /// `true` when at least one attribute was resolved.
  bool get isNotEmpty => _values.isNotEmpty;
}
