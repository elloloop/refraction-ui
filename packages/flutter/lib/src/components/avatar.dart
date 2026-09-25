import 'package:flutter/material.dart';
import '../theme/hsl_color.dart';
import '../theme/refraction_colors.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';
import 'presence_indicator.dart';

/// A circular profile image with a graceful initials fallback.
///
/// Renders the network image at [imageUrl]; while it loads, when the URL is
/// null, or when the image fails, the initials of [fallbackText] are shown
/// on a tint picked deterministically from the name — so the same person
/// gets the same color on every screen and every device.
///
/// Mirrors the shadcn-ui `Avatar` primitive shipped in the React and
/// Astro Refraction UI packages.
///
/// ```dart
/// RefractionAvatar(
///   imageUrl: 'https://example.com/jane.png',
///   fallbackText: 'Jane Doe', // shows "JD" until the image arrives
///   presence: RefractionPresenceStatus.online,
///   size: 48,
/// )
/// ```
///
/// To stack several avatars together, use `RefractionAvatarGroup`.
class RefractionAvatar extends StatelessWidget {
  /// Network URL of the avatar image. If null or unloadable, the
  /// initials fallback is shown.
  final String? imageUrl;

  /// The person's (or group's) name.
  ///
  /// Drives the initials ([initialsFor]: `"Jane Doe"` → `"JD"`), the tint
  /// ([tintFor]) and, unless [semanticLabel] is given, what a screen reader
  /// announces.
  final String fallbackText;

  /// Corner radius applied to the container, in logical pixels.
  ///
  /// Defaults to `999.0`, producing a circle. Lower values produce a
  /// rounded square.
  final double radius;

  /// Width and height of the avatar in logical pixels. Defaults to `40.0`.
  final double size;

  /// The fallback background, overriding the deterministic tint.
  final Color? tint;

  /// What the tint is derived from, when it should differ from
  /// [fallbackText] — typically a stable user id, so a rename keeps the
  /// color.
  final String? colorSeed;

  /// An optional presence dot on the bottom-end corner.
  final RefractionPresenceStatus? presence;

  /// The color of the ring separating the [presence] dot from the avatar —
  /// the surface the avatar sits on. Defaults to
  /// [RefractionColors.background].
  final Color? ringColor;

  /// What a screen reader announces. Defaults to [fallbackText], followed
  /// by the presence status when [presence] is set.
  final String? semanticLabel;

  /// Creates a [RefractionAvatar].
  ///
  /// [fallbackText] is required because it is used both as the visible
  /// fallback and for accessibility.
  const RefractionAvatar({
    super.key,
    this.imageUrl,
    required this.fallbackText,
    this.radius = 999.0,
    this.size = 40.0,
    this.tint,
    this.colorSeed,
    this.presence,
    this.ringColor,
    this.semanticLabel,
  });

  /// The number of hues in the deterministic tint ramp.
  static const int tintCount = 8;

  /// Degrees between neighbouring hues of the ramp (a full turn / [tintCount]).
  static const double _hueStep = 360.0 / tintCount;

  /// How strongly a hue is laid over the background for the fallback fill;
  /// dark surfaces need more to read as colored.
  static const double _tintStrengthLight = 0.18;
  static const double _tintStrengthDark = 0.32;

  /// Initials take this fraction of the avatar's size.
  static const double _initialsScale = 0.4;

  /// The presence dot's diameter as a fraction of the avatar's size, and
  /// its bounds.
  static const double _presenceScale = 0.28;
  static const double _presenceMin = 8.0;
  static const double _presenceMax = 14.0;

  /// FNV-1a (32-bit) parameters for [tintIndexFor].
  static const int _fnvOffset = 0x811c9dc5;
  static const int _fnvPrime = 0x01000193;
  static const int _mask32 = 0xffffffff;
  static const int _foldHigh = 16;
  static const int _foldLow = 8;

  /// A single token of at most this many characters that is already all
  /// upper-case is taken to be initials the caller computed ("JD").
  static const int _preformedInitialsMax = 2;

  /// The initials shown for [name]: the first letter of the first and last
  /// words (`"Jane Doe"` → `"JD"`, `"Mary Jane Watson"` → `"MW"`), the first
  /// letter of a single word (`"Jane"` → `"J"`), or the name as given when
  /// it is already short upper-case initials (`"JD"`). Grapheme-aware, so
  /// names in any script (and emoji) are never split mid-character. Returns
  /// `"?"` for a blank name. Matches `getInitials` in `@refraction-ui/avatar`.
  static String initialsFor(String name) {
    final words = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((w) => w.isNotEmpty)
        .toList();
    if (words.isEmpty) return '?';
    if (words.length == 1) {
      final word = words.single;
      final isPreformed =
          word.characters.length <= _preformedInitialsMax &&
          word == word.toUpperCase();
      if (isPreformed) return word;
      return word.characters.first.toUpperCase();
    }
    return (words.first.characters.first + words.last.characters.first)
        .toUpperCase();
  }

  /// A stable index into the tint ramp for [seed] — FNV-1a, so it is the
  /// same on every platform and every run (unlike `String.hashCode`).
  static int tintIndexFor(String seed) {
    var hash = _fnvOffset;
    for (final unit in seed.trim().toLowerCase().codeUnits) {
      hash ^= unit;
      hash = (hash * _fnvPrime) & _mask32;
    }
    // FNV's low bits mix poorly for short, similar strings ("AB", "CD"),
    // and `% tintCount` reads only the low bits — fold the high bits down.
    hash ^= hash >> _foldHigh;
    hash ^= hash >> _foldLow;
    return hash % tintCount;
  }

  /// The saturated hue for [seed]: [RefractionColors.info] rotated around
  /// the color wheel in [tintCount] steps. Derived from a status token
  /// rather than the brand, so a monochrome brand still yields distinct
  /// colors.
  static Color hueFor(String seed, RefractionColors colors) =>
      ColorMath.rotateHue(colors.info, tintIndexFor(seed) * _hueStep);

  /// The fallback (fill, initials) pair for [seed] on this theme: the hue
  /// laid softly over the background, with initials in the same hue pushed
  /// to AA contrast against it.
  static (Color, Color) tintFor(String seed, RefractionThemeData theme) {
    final colors = theme.colors;
    return _tintPair(hueFor(seed, colors), colors);
  }

  static (Color, Color) _tintPair(Color hue, RefractionColors colors) {
    final isDark = colors.background.computeLuminance() < 0.5;
    final fill = ColorMath.mix(
      colors.background,
      hue,
      isDark ? _tintStrengthDark : _tintStrengthLight,
    );
    return (fill, ColorMath.ensureContrast(hue, fill));
  }

  /// A copy of this avatar at [newSize], keeping everything else — used by
  /// groups that size their members uniformly.
  RefractionAvatar resized(double newSize) => RefractionAvatar(
    key: key,
    imageUrl: imageUrl,
    fallbackText: fallbackText,
    radius: radius,
    size: newSize,
    tint: tint,
    colorSeed: colorSeed,
    presence: presence,
    ringColor: ringColor,
    semanticLabel: semanticLabel,
  );

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final (fill, ink) = tint != null
        ? _tintPair(tint!, theme.colors)
        : tintFor(colorSeed ?? fallbackText, theme);
    final fallback = _buildFallback(theme, fill, ink);

    final url = imageUrl;
    Widget face = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(radius),
      ),
      clipBehavior: Clip.antiAlias,
      child: url == null
          ? fallback
          : Image.network(
              url,
              width: size,
              height: size,
              fit: BoxFit.cover,
              // Initials until the first frame arrives, not an empty disc.
              frameBuilder: (context, child, frame, wasSynchronouslyLoaded) =>
                  frame == null && !wasSynchronouslyLoaded ? fallback : child,
              errorBuilder: (context, error, stackTrace) => fallback,
            ),
    );

    final status = presence;
    if (status != null) {
      final dot = (size * _presenceScale).clamp(_presenceMin, _presenceMax);
      face = Stack(
        clipBehavior: Clip.none,
        children: [
          face,
          PositionedDirectional(
            end: 0,
            bottom: 0,
            child: RefractionPresenceIndicator(
              status: status,
              diameter: dot,
              ringColor: ringColor ?? theme.colors.background,
            ),
          ),
        ],
      );
    }

    final presenceText = status == null
        ? null
        : RefractionPresenceIndicator.defaultLabels[status];
    return Semantics(
      image: true,
      label:
          semanticLabel ??
          (presenceText == null
              ? fallbackText
              : '$fallbackText, $presenceText'),
      excludeSemantics: true,
      child: face,
    );
  }

  Widget _buildFallback(RefractionThemeData theme, Color fill, Color ink) {
    return ColoredBox(
      color: fill,
      child: Center(
        child: Text(
          initialsFor(fallbackText),
          maxLines: 1,
          softWrap: false,
          textScaler: TextScaler.noScaling,
          style: theme.textStyle.copyWith(
            color: ink,
            fontWeight: FontWeight.w600,
            fontSize: size * _initialsScale,
            height: 1.0,
          ),
        ),
      ),
    );
  }
}
