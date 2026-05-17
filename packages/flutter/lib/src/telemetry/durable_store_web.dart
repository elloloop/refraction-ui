/// Durable store for Flutter web — `window.localStorage` via `dart:js_interop`
/// (SDK-provided, no extra pub dependency; matches `lifecycle_web.dart`'s
/// modern interop instead of the deprecated `dart:html`). Degrades silently
/// (private mode / disabled) so the resolver can fall back to memory.
library;

import 'dart:js_interop';

import 'durable_store.dart';

@JS('window')
external _Window get _window;

@JS()
@staticInterop
class _Window {}

extension on _Window {
  external _Storage get localStorage;
}

@JS()
@staticInterop
class _Storage {}

extension on _Storage {
  external JSString? getItem(JSString key);
  external void setItem(JSString key, JSString value);
  external void removeItem(JSString key);
}

class _LocalStorageDurable implements DurableStore {
  @override
  String? read(String key) {
    try {
      return _window.localStorage.getItem(key.toJS)?.toDart;
    } catch (_) {
      return null;
    }
  }

  @override
  void write(String key, String value) {
    try {
      _window.localStorage.setItem(key.toJS, value.toJS);
    } catch (_) {
      // Quota / disabled — degrade silently.
    }
  }

  @override
  void remove(String key) {
    try {
      _window.localStorage.removeItem(key.toJS);
    } catch (_) {
      // ignore
    }
  }
}

DurableStore? createPlatformDurableStore() {
  try {
    const probe = '__rfx_t_probe__';
    _window.localStorage.setItem(probe.toJS, '1'.toJS);
    _window.localStorage.removeItem(probe.toJS);
    return _LocalStorageDurable();
  } catch (_) {
    return null;
  }
}
