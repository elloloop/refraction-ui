import 'package:flutter/material.dart';
import '../theme/refraction_colors.dart';
import '../theme/refraction_theme.dart';

/// The specific presence state of the user.
enum RefractionPresenceStatus {
  /// User is active and online.
  online,

  /// User is inactive or signed out.
  offline,

  /// User is away from their device.
  away,

  /// User is currently busy.
  busy,

  /// User is in "Do Not Disturb" mode.
  dnd,
}

/// The size of the presence indicator dot.
enum RefractionPresenceSize {
  /// 8x8 pixels.
  sm,

  /// 10x10 pixels (default).
  md,

  /// 12x12 pixels.
  lg,
}

/// A small widget used to indicate a user's presence or availability status.
///
/// Can be displayed standalone or layered over an avatar (see
/// `RefractionAvatar.presence`). Supports showing an optional text label
/// alongside the status dot.
///
/// Status is never carried by color alone (WCAG 1.4.1): `online` and `busy`
/// are filled dots, `away` and `offline` are hollow rings, and `dnd` is a
/// filled dot with a bar through it. Colors come from the theme's status
/// tokens — see [colorFor].
///
/// ```dart
/// RefractionPresenceIndicator(
///   status: RefractionPresenceStatus.online,
///   showLabel: true,
/// )
/// ```
class RefractionPresenceIndicator extends StatelessWidget {
  /// The presence status to display.
  final RefractionPresenceStatus status;

  /// Whether to show the text label alongside the indicator. Defaults to false.
  final bool showLabel;

  /// Custom label text override. If null, the default label for [status] is used.
  final String? label;

  /// The size of the indicator dot. Defaults to [RefractionPresenceSize.md].
  final RefractionPresenceSize size;

  /// Optional custom color to override the theme color for the given [status].
  final Color? customColor;

  /// An exact dot diameter, overriding [size] — for dots scaled to an
  /// avatar.
  final double? diameter;

  /// Optional ring drawn around the dot in this color — normally the
  /// surface behind it — so a dot overlapping an avatar reads cleanly.
  final Color? ringColor;

  const RefractionPresenceIndicator({
    super.key,
    required this.status,
    this.showLabel = false,
    this.label,
    this.size = RefractionPresenceSize.md,
    this.customColor,
    this.diameter,
    this.ringColor,
  });

  /// The default labels for each status.
  static const Map<RefractionPresenceStatus, String> defaultLabels = {
    RefractionPresenceStatus.online: 'Online',
    RefractionPresenceStatus.offline: 'Offline',
    RefractionPresenceStatus.away: 'Away',
    RefractionPresenceStatus.busy: 'Busy',
    RefractionPresenceStatus.dnd: 'Do Not Disturb',
  };

  /// The pre-token hues (Tailwind palette values).
  @Deprecated(
    'Presence colors now come from the theme status tokens; use '
    'RefractionPresenceIndicator.colorFor(status, colors). '
    'Will be removed in a future minor release.',
  )
  static const Map<RefractionPresenceStatus, Color> defaultColors = {
    RefractionPresenceStatus.online: Color(0xFF22C55E), // green-500
    RefractionPresenceStatus.offline: Color(0xFF9CA3AF), // gray-400
    RefractionPresenceStatus.away: Color(0xFFEAB308), // yellow-500
    RefractionPresenceStatus.busy: Color(0xFFEF4444), // red-500
    RefractionPresenceStatus.dnd: Color(0xFFEF4444), // red-500
  };

  /// The theme color for [status]: `online` → [RefractionColors.positive],
  /// `away` → [RefractionColors.caution], `busy`/`dnd` →
  /// [RefractionColors.destructive], `offline` → [RefractionColors.neutral].
  static Color colorFor(
    RefractionPresenceStatus status,
    RefractionColors colors,
  ) {
    switch (status) {
      case RefractionPresenceStatus.online:
        return colors.positive;
      case RefractionPresenceStatus.away:
        return colors.caution;
      case RefractionPresenceStatus.busy:
      case RefractionPresenceStatus.dnd:
        return colors.destructive;
      case RefractionPresenceStatus.offline:
        return colors.neutral;
    }
  }

  /// Whether [status] is drawn as a hollow ring rather than a filled dot.
  static bool isHollow(RefractionPresenceStatus status) =>
      status == RefractionPresenceStatus.away ||
      status == RefractionPresenceStatus.offline;

  /// The pixel dimension for each size.
  static const Map<RefractionPresenceSize, double> _sizeDimensions = {
    RefractionPresenceSize.sm: 8.0,
    RefractionPresenceSize.md: 10.0,
    RefractionPresenceSize.lg: 12.0,
  };

  /// A hollow ring's stroke, as a fraction of the diameter.
  static const double _hollowStrokeFactor = 0.25;

  /// The dnd bar's size, as fractions of the diameter.
  static const double _barWidthFactor = 0.6;
  static const double _barHeightFactor = 0.2;

  /// The separating ring around an overlaid dot.
  static const double _ringWidth = 2.0;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final dotColor = customColor ?? colorFor(status, theme.colors);
    final dotSize = diameter ?? _sizeDimensions[size]!;
    final displayText = label ?? defaultLabels[status]!;
    final hollow = isHollow(status);
    final ring = ringColor;

    Widget dot = Container(
      width: dotSize,
      height: dotSize,
      decoration: BoxDecoration(
        color: hollow ? ring : dotColor,
        shape: BoxShape.circle,
        border: hollow
            ? Border.all(color: dotColor, width: dotSize * _hollowStrokeFactor)
            : null,
      ),
      child: status == RefractionPresenceStatus.dnd
          ? Center(
              child: FractionallySizedBox(
                widthFactor: _barWidthFactor,
                heightFactor: _barHeightFactor,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: ring ?? theme.colors.destructiveForeground,
                    borderRadius: BorderRadius.circular(dotSize),
                  ),
                ),
              ),
            )
          : null,
    );
    if (ring != null) {
      dot = DecoratedBox(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: ring,
            width: _ringWidth,
            strokeAlign: BorderSide.strokeAlignOutside,
          ),
        ),
        child: dot,
      );
    }

    if (!showLabel) {
      return Semantics(label: displayText, child: dot);
    }

    return Semantics(
      label: displayText,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          dot,
          const SizedBox(width: 6.0), // gap-1.5 equivalent
          Text(
            displayText,
            style: theme.textStyle.copyWith(
              color: theme.colors.mutedForeground,
              fontSize: 14.0, // text-sm
            ),
          ),
        ],
      ),
    );
  }
}
