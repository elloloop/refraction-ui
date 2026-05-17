/// Default persistent storage for Flutter web (dart:html). Uses
/// `window.localStorage`, degrading silently when it is unavailable
/// (private mode / disabled) so the resolver can fall back to memory.
library;

// ignore: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html' as html;

import 'types.dart';

class _LocalStorage implements AnalyticsStorage {
  @override
  String? get(String key) {
    try {
      return html.window.localStorage[key];
    } catch (_) {
      return null;
    }
  }

  @override
  void set(String key, String value) {
    try {
      html.window.localStorage[key] = value;
    } catch (_) {
      // Quota / disabled — degrade silently.
    }
  }

  @override
  void remove(String key) {
    try {
      html.window.localStorage.remove(key);
    } catch (_) {
      // ignore
    }
  }
}

AnalyticsStorage? createPlatformStorage() {
  try {
    // Probe — private mode can throw on write.
    const probe = '__rfx_a_probe__';
    html.window.localStorage[probe] = '1';
    html.window.localStorage.remove(probe);
    return _LocalStorage();
  } catch (_) {
    return null;
  }
}
