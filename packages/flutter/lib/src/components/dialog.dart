import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

class RefractionDialog {
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
