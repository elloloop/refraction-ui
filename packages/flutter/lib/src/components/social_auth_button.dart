import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

/// Identity provider a [RefractionSocialAuthButton] authenticates against.
enum RefractionSocialProvider {
  /// Google.
  google,

  /// GitHub.
  github,

  /// Microsoft.
  microsoft,

  /// Apple.
  apple,
}

/// "Continue with …" label shown on each provider's button.
const Map<RefractionSocialProvider, String> _providerLabels = {
  RefractionSocialProvider.google: 'Continue with Google',
  RefractionSocialProvider.github: 'Continue with GitHub',
  RefractionSocialProvider.microsoft: 'Continue with Microsoft',
  RefractionSocialProvider.apple: 'Continue with Apple',
};

/// Whether a provider's brand mark renders monochrome (using the button's
/// foreground color) rather than its brand colors. GitHub and Apple are
/// monochrome by design so they read on outline surfaces.
const Map<RefractionSocialProvider, bool> _providerMono = {
  RefractionSocialProvider.google: false,
  RefractionSocialProvider.github: true,
  RefractionSocialProvider.microsoft: false,
  RefractionSocialProvider.apple: true,
};

/// A branded social sign-in button built on the outline [RefractionButton].
///
/// Renders the provider's brand mark and a "Continue with …" label, with
/// optional [loading] spinner and a "Last used" badge. Mirrors the
/// React/Astro `SocialAuthButton`.
///
/// ```dart
/// RefractionSocialAuthButton(
///   provider: RefractionSocialProvider.google,
///   lastUsed: true,
///   onPressed: _signInWithGoogle,
/// )
/// ```
class RefractionSocialAuthButton extends StatelessWidget {
  /// Identity provider this button authenticates against.
  final RefractionSocialProvider provider;

  /// Marks this as the provider the user signed in with last.
  final bool lastUsed;

  /// Shows a spinner and disables interaction.
  final bool loading;

  /// Called when the button is tapped. Pass `null` to disable the button.
  final VoidCallback? onPressed;

  /// Creates a [RefractionSocialAuthButton].
  const RefractionSocialAuthButton({
    super.key,
    required this.provider,
    this.lastUsed = false,
    this.loading = false,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;
    final mono = _providerMono[provider]!;
    final iconColor = mono ? colors.foreground : null;

    final button = RefractionButton(
      variant: RefractionButtonVariant.outline,
      isLoading: loading,
      onPressed: onPressed,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _BrandIcon(provider: provider, color: iconColor),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              _providerLabels[provider]!,
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
          ),
        ],
      ),
    );

    if (!lastUsed) return button;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        button,
        Positioned(
          top: -8,
          right: -8,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: colors.primary,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              'Last used',
              style: TextStyle(
                fontSize: 10,
                color: colors.primaryForeground,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Brand mark for a [RefractionSocialProvider].
///
/// Microsoft renders its four-square logo; the others use recognizable glyphs.
/// When [color] is non-null (monochrome providers) every glyph is tinted with
/// it, otherwise brand colors are used.
class _BrandIcon extends StatelessWidget {
  final RefractionSocialProvider provider;
  final Color? color;

  const _BrandIcon({required this.provider, this.color});

  @override
  Widget build(BuildContext context) {
    const size = 18.0;
    switch (provider) {
      case RefractionSocialProvider.microsoft:
        return CustomPaint(
          size: const Size(size, size),
          painter: _MicrosoftPainter(),
        );
      case RefractionSocialProvider.google:
        return SizedBox(
          width: size,
          height: size,
          child: Center(
            child: Text(
              'G',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: color ?? const Color(0xFF4285F4),
                height: 1,
              ),
            ),
          ),
        );
      case RefractionSocialProvider.github:
        return Icon(Icons.code, size: size, color: color);
      case RefractionSocialProvider.apple:
        return Icon(Icons.apple, size: size + 2, color: color);
    }
  }
}

/// Paints the Microsoft four-square logo.
class _MicrosoftPainter extends CustomPainter {
  static const _red = Color(0xFFF25022);
  static const _green = Color(0xFF7FBA00);
  static const _blue = Color(0xFF00A4EF);
  static const _yellow = Color(0xFFFFB900);

  @override
  void paint(Canvas canvas, Size size) {
    final gap = size.width * 0.08;
    final cell = (size.width - gap) / 2;
    final paint = Paint();

    void square(double x, double y, Color color) {
      paint.color = color;
      canvas.drawRect(Rect.fromLTWH(x, y, cell, cell), paint);
    }

    square(0, 0, _red);
    square(cell + gap, 0, _green);
    square(0, cell + gap, _blue);
    square(cell + gap, cell + gap, _yellow);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Responsive grid wrapper for [RefractionSocialAuthButton]s: a single column
/// on narrow widths, two columns once there is room. Mirrors the React/Astro
/// `SocialAuthRow`.
class RefractionSocialAuthRow extends StatelessWidget {
  /// The social auth buttons to lay out.
  final List<Widget> children;

  /// Width below which the row collapses to a single column. Defaults to 480.
  final double breakpoint;

  /// Spacing between buttons.
  final double spacing;

  /// Creates a [RefractionSocialAuthRow].
  const RefractionSocialAuthRow({
    super.key,
    required this.children,
    this.breakpoint = 480,
    this.spacing = 12,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final twoColumns =
            constraints.maxWidth.isFinite && constraints.maxWidth >= breakpoint;
        if (!twoColumns) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 0; i < children.length; i++) ...[
                if (i > 0) SizedBox(height: spacing),
                children[i],
              ],
            ],
          );
        }

        final cellWidth = (constraints.maxWidth - spacing) / 2;
        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final child in children)
              SizedBox(width: cellWidth, child: child),
          ],
        );
      },
    );
  }
}
