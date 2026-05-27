import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../theme/refraction_theme.dart';

const Map<String, String> _macKeyDisplay = {
  'Ctrl': '\u2303',
  'Control': '\u2303',
  'Alt': '\u2325',
  'Shift': '\u21E7',
  'Meta': '\u2318',
  'Cmd': '\u2318',
  'Command': '\u2318',
  'Enter': '\u21B5',
  'Backspace': '\u232B',
  'Delete': '\u2326',
  'Escape': '\u238B',
  'ArrowUp': '\u2191',
  'ArrowDown': '\u2193',
  'ArrowLeft': '\u2190',
  'ArrowRight': '\u2192',
  'Tab': '\u21E5',
  ' ': '\u2423',
};

const Map<String, String> _winKeyDisplay = {
  'Ctrl': 'Ctrl',
  'Control': 'Ctrl',
  'Alt': 'Alt',
  'Shift': 'Shift',
  'Meta': 'Win',
  'Cmd': 'Win',
  'Command': 'Win',
  'Enter': '\u21B5',
  'Backspace': '\u232B',
  'Delete': 'Del',
  'Escape': 'Esc',
  'ArrowUp': '\u2191',
  'ArrowDown': '\u2193',
  'ArrowLeft': '\u2190',
  'ArrowRight': '\u2192',
  'Tab': 'Tab',
  ' ': 'Space',
};

/// A widget that visualizes a keyboard shortcut (e.g., "⌘K" or "Ctrl + P").
///
/// Use [RefractionKeyboardShortcut] in menus, tooltips, or command palettes
/// to provide visual hints for hotkeys. It automatically adjusts its appearance
/// based on the platform if [platformAware] is true.
class RefractionKeyboardShortcut extends StatelessWidget {
  /// The list of keys to display, e.g., `['Meta', 'K']` or `['Ctrl', 'Shift', 'P']`.
  final List<String> keys;

  /// Whether to use platform-aware symbols (e.g., Mac symbols like ⌘, ⇧ on Apple platforms).
  /// Defaults to true.
  final bool platformAware;

  /// Whether to force the display as macOS style, useful for testing or previews.
  final bool? forceMacDisplay;

  const RefractionKeyboardShortcut({
    super.key,
    required this.keys,
    this.platformAware = true,
    this.forceMacDisplay,
  });

  bool _isApplePlatform() {
    if (forceMacDisplay != null) {
      return forceMacDisplay!;
    }
    return defaultTargetPlatform == TargetPlatform.macOS ||
        defaultTargetPlatform == TargetPlatform.iOS;
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final useMacDisplay = platformAware && _isApplePlatform();
    final displayMap = useMacDisplay ? _macKeyDisplay : _winKeyDisplay;

    final outerDecoration = BoxDecoration(
      color: theme.colors.muted,
      border: Border.all(color: theme.colors.border),
      borderRadius: BorderRadius.circular(theme.borderRadius / 2),
    );

    final textStyle = TextStyle(
      fontFamily: 'monospace',
      fontSize: 12.0,
      color: theme.colors.mutedForeground,
      height: 1.2,
    );

    if (useMacDisplay) {
      final joinedStr = keys
          .map((k) {
            final val = displayMap[k] ?? k;
            return val.length == 1 ? val.toUpperCase() : val;
          })
          .join('');

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
        decoration: outerDecoration,
        child: Text(joinedStr, style: textStyle),
      );
    }

    // Non-Mac display (e.g., Windows/Linux style with '+')
    final children = <Widget>[];
    for (int i = 0; i < keys.length; i++) {
      final k = keys[i];
      final val = displayMap[k] ?? k;
      final keyText = val.length == 1 ? val.toUpperCase() : val;

      if (i > 0) {
        children.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2.0),
            child: Text(
              '+',
              style: TextStyle(
                fontSize: 12.0,
                color: theme.colors.mutedForeground,
                height: 1.2,
              ),
            ),
          ),
        );
      }

      children.add(
        Container(
          constraints: const BoxConstraints(minWidth: 20.0),
          padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 2.0),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: theme.colors.background,
            border: Border.all(color: theme.colors.border),
            borderRadius: BorderRadius.circular(theme.borderRadius / 2),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0A000000),
                offset: Offset(0, 1),
                blurRadius: 2.0,
              ),
            ],
          ),
          child: Text(
            keyText,
            style: textStyle.copyWith(color: theme.colors.foreground),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
      decoration: outerDecoration,
      child: Wrap(
        spacing: 0.0,
        runSpacing: 2.0,
        crossAxisAlignment: WrapCrossAlignment.center,
        alignment: WrapAlignment.center,
        children: children,
      ),
    );
  }
}
