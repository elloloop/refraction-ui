/// Web lifecycle hook (Flutter web).
///
/// Internal implementation detail behind [LifecycleHook] — selected via the
/// conditional import in `lifecycle.dart`. Mirrors the web telemetry
/// manager's "flush on `pagehide` + `visibilitychange` (hidden)" branch.
/// Uses only `dart:js_interop` (SDK-provided, no extra pub dependency).
library;

import 'dart:js_interop';

import 'lifecycle.dart';

@JS('window')
external _Window get _window;

@JS('document')
external _Document get _document;

@JS()
@staticInterop
class _Window {}

extension on _Window {
  external void addEventListener(JSString type, JSFunction listener);
  external void removeEventListener(JSString type, JSFunction listener);
}

@JS()
@staticInterop
class _Document {}

extension on _Document {
  external JSString? get visibilityState;
}

class _WebSubscription implements LifecycleSubscription {
  _WebSubscription(this._detach);

  final void Function() _detach;
  bool _cancelled = false;

  @override
  void cancel() {
    if (_cancelled) return;
    _cancelled = true;
    _detach();
  }
}

class _WebLifecycleHook implements LifecycleHook {
  const _WebLifecycleHook();

  @override
  LifecycleSubscription onExit(void Function() onExit) {
    void pageHideListener(JSAny _) => onExit();
    void visibilityListener(JSAny _) {
      if (_document.visibilityState?.toDart == 'hidden') onExit();
    }

    final pageHide = pageHideListener.toJS;
    final visibility = visibilityListener.toJS;

    _window.addEventListener('pagehide'.toJS, pageHide);
    _window.addEventListener('visibilitychange'.toJS, visibility);

    return _WebSubscription(() {
      _window.removeEventListener('pagehide'.toJS, pageHide);
      _window.removeEventListener('visibilitychange'.toJS, visibility);
    });
  }
}

/// Web factory.
LifecycleHook createLifecycleHook() => const _WebLifecycleHook();
