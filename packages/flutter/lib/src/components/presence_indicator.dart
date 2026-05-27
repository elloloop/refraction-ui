import 'package:flutter/material.dart';
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
/// Can be displayed standalone or layered over an avatar. Supports showing
/// an optional text label alongside the status dot.
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

  /// Optional custom color to override the default color for the given [status].
  final Color? customColor;

  const RefractionPresenceIndicator({
    super.key,
    required this.status,
    this.showLabel = false,
    this.label,
    this.size = RefractionPresenceSize.md,
    this.customColor,
  });

  /// The default labels for each status.
  static const Map<RefractionPresenceStatus, String> defaultLabels = {
    RefractionPresenceStatus.online: 'Online',
    RefractionPresenceStatus.offline: 'Offline',
    RefractionPresenceStatus.away: 'Away',
    RefractionPresenceStatus.busy: 'Busy',
    RefractionPresenceStatus.dnd: 'Do Not Disturb',
  };

  /// The default colors for each status (using standard Tailwind palette values).
  static const Map<RefractionPresenceStatus, Color> defaultColors = {
    RefractionPresenceStatus.online: Color(0xFF22C55E), // green-500
    RefractionPresenceStatus.offline: Color(0xFF9CA3AF), // gray-400
    RefractionPresenceStatus.away: Color(0xFFEAB308), // yellow-500
    RefractionPresenceStatus.busy: Color(0xFFEF4444), // red-500
    RefractionPresenceStatus.dnd: Color(0xFFEF4444), // red-500
  };

  /// The pixel dimension for each size.
  static const Map<RefractionPresenceSize, double> _sizeDimensions = {
    RefractionPresenceSize.sm: 8.0,
    RefractionPresenceSize.md: 10.0,
    RefractionPresenceSize.lg: 12.0,
  };

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final dotColor = customColor ?? defaultColors[status]!;
    final dotSize = _sizeDimensions[size]!;
    final displayText = label ?? defaultLabels[status]!;

    final dot = Container(
      width: dotSize,
      height: dotSize,
      decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
    );

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
