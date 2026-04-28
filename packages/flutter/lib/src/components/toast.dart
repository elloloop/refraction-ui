import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Imperative API for showing transient toast notifications.
///
/// `RefractionToast` is the Flutter analogue of the `RefractionToast`
/// component from the React, Angular and Astro Refraction UI packages
/// (a shadcn-equivalent pattern). Unlike the declarative web variants,
/// the Flutter version is invoked imperatively via the static [show]
/// method which inserts an [OverlayEntry] above the current screen,
/// animates it in from the bottom-right, and removes it after [duration].
///
/// ```dart
/// ElevatedButton(
///   onPressed: () => RefractionToast.show(
///     context: context,
///     title: 'Saved',
///     description: 'Your changes have been synced.',
///   ),
///   child: const Text('Save'),
/// );
/// ```
///
/// The toast paints itself with [RefractionColors.card] and
/// [RefractionColors.border]. The class itself is never instantiated;
/// only the static API is meant to be used.
class RefractionToast {
  /// Displays a toast at the bottom-right of the nearest [Overlay].
  ///
  /// The toast contains a bold [title] and an optional [description] line
  /// rendered in [RefractionColors.mutedForeground]. After [duration] has
  /// elapsed the [OverlayEntry] is removed automatically; pass a longer
  /// [duration] for messages that need more reading time.
  ///
  /// The [context] must have an ancestor [Overlay] — typically the one
  /// created by [MaterialApp].
  static void show({
    required BuildContext context,
    required String title,
    String? description,
    Duration duration = const Duration(seconds: 4),
  }) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final overlay = Overlay.of(context);
    late OverlayEntry overlayEntry;

    overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        bottom: 40,
        right: 24,
        child: Material(
          color: Colors.transparent,
          child: TweenAnimationBuilder<double>(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOutCubic,
            tween: Tween(begin: 0.0, end: 1.0),
            builder: (context, value, child) {
              return Transform.translate(
                offset: Offset(0, 20 * (1 - value)),
                child: Opacity(
                  opacity: value,
                  child: Container(
                    width: 320,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: colors.card,
                      borderRadius: BorderRadius.circular(theme.borderRadius),
                      border: Border.all(color: colors.border),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            color: colors.foreground,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        if (description != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            description,
                            style: TextStyle(
                              color: colors.mutedForeground,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );

    overlay.insert(overlayEntry);

    Future.delayed(duration, () {
      overlayEntry.remove();
    });
  }
}
