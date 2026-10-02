import 'dart:js_interop';

import 'package:flutter/services.dart' show TextSelection;

@JS('document.activeElement')
external _ClipboardInput? get _activeInput;

@JS()
@staticInterop
class _ClipboardInput {}

extension on _ClipboardInput {
  external JSString? get value;
  external JSNumber? get selectionStart;
  external JSNumber? get selectionEnd;
  external JSString? get selectionDirection;
}

/// Reads only the focused input's selection during a user paste gesture.
/// Text equality prevents taking a range from a different browser editor.
TextSelection? composerBrowserClipboardSelection(String expectedText) {
  final input = _activeInput;
  if (input == null || input.value?.toDart != expectedText) return null;
  final start = input.selectionStart?.toDartInt;
  final end = input.selectionEnd?.toDartInt;
  if (start == null ||
      end == null ||
      start < 0 ||
      end < start ||
      end > expectedText.length) {
    return null;
  }
  final backward = input.selectionDirection?.toDart == 'backward';
  return TextSelection(
    baseOffset: backward ? end : start,
    extentOffset: backward ? start : end,
  );
}
