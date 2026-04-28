import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

/// Static helper for displaying themed modal dialogs.
///
/// [RefractionDialog] is not instantiated directly; call [show] to push a
/// scaled-and-faded dialog using the active [RefractionTheme]. The dialog
/// inherits the parent theme so children may continue to read tokens via
/// [RefractionTheme.of].
///
/// Mirrors the shadcn-ui `Dialog` primitive shipped in the React, Angular,
/// and Astro Refraction UI packages.
///
/// ```dart
/// final result = await RefractionDialog.show<bool>(
///   context: context,
///   title: const Text('Delete file?'),
///   content: const Text('This action cannot be undone.'),
///   actions: [
///     RefractionButton(
///       variant: RefractionButtonVariant.outline,
///       onPressed: () => Navigator.of(context).pop(false),
///       child: const Text('Cancel'),
///     ),
///     RefractionButton(
///       variant: RefractionButtonVariant.destructive,
///       onPressed: () => Navigator.of(context).pop(true),
///       child: const Text('Delete'),
///     ),
///   ],
/// );
/// ```
class RefractionDialog {
  /// Pushes a Refraction-themed modal dialog onto the navigator.
  ///
  /// The dialog displays [title] and [content] using theme typography, and
  /// shows [actions] in the footer. If [actions] is null, a single
  /// outline-styled `Close` button is rendered.
  ///
  /// Returns a future that completes with the value passed to
  /// `Navigator.pop`, or `null` if dismissed by tapping the barrier (only
  /// possible when [barrierDismissible] is true).
  static Future<T?> show<T>({
    required BuildContext context,
    required Widget title,
    required Widget content,
    List<Widget>? actions,
    bool barrierDismissible = true,
  }) {
    final themeProvider = RefractionTheme.of(context);
    final theme = themeProvider.data;
    final colors = theme.colors;

    return showGeneralDialog<T>(
      context: context,
      barrierColor: Colors.black54,
      barrierDismissible: barrierDismissible,
      barrierLabel: 'Dismiss',
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) {
        return const SizedBox.shrink();
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        final curve = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
        );
        return ScaleTransition(
          scale: Tween<double>(begin: 0.95, end: 1.0).animate(curve),
          child: RefractionTheme(
            data: theme,
            child: FadeTransition(
              opacity: curve,
              child: AlertDialog(
                backgroundColor: colors.popover,
                surfaceTintColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(theme.borderRadius * 1.5),
                  side: BorderSide(color: colors.border),
                ),
                elevation: theme.heavyShadow != null
                    ? 0
                    : 24, // Use custom shadow if provided
                title: DefaultTextStyle(
                  style: theme.textStyle.copyWith(
                    color: colors.foreground,
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.5,
                  ),
                  child: title,
                ),
                content: DefaultTextStyle(
                  style: theme.textStyle.copyWith(
                    color: colors.mutedForeground,
                    fontSize: 14,
                  ),
                  child: content,
                ),
                actions:
                    actions ??
                    [
                      RefractionButton(
                        variant: RefractionButtonVariant.outline,
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Close'),
                      ),
                    ],
              ),
            ),
          ),
        );
      },
    );
  }
}
