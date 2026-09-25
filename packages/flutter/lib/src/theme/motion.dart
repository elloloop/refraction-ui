import 'package:flutter/widgets.dart';

/// Reduced-motion aware durations.
///
/// Every Refraction animation resolves its duration through [duration], so
/// when the platform asks for reduced motion (iOS "Reduce Motion", Android
/// "Remove animations", `prefers-reduced-motion` on web — all surfaced by
/// Flutter as [MediaQueryData.disableAnimations]) transitions jump straight
/// to their end state instead of sliding, scaling or pulsing.
///
/// ```dart
/// AnimatedOpacity(
///   duration: RefractionMotion.duration(context, theme.motionMedium),
///   opacity: visible ? 1 : 0,
///   child: child,
/// )
/// ```
class RefractionMotion {
  const RefractionMotion._();

  /// Whether the platform asks for reduced motion at [context]. Returns
  /// `false` when there is no [MediaQuery] above [context].
  static bool reduced(BuildContext context) =>
      MediaQuery.maybeDisableAnimationsOf(context) ?? false;

  /// [base], or [Duration.zero] when [reduced] is true.
  static Duration duration(BuildContext context, Duration base) =>
      reduced(context) ? Duration.zero : base;
}
