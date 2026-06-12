import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Tone that tints the [RefractionEmptyState] icon chip.
///
/// Mirrors the React/Astro `EmptyState` tones. [neutral] uses the theme's
/// muted palette; the other tones use fixed semantic hues (tinted at low
/// opacity) so they read on both light and dark surfaces, since the core
/// token set has no dedicated success/warning roles.
enum RefractionEmptyStateTone {
  /// Muted, palette-derived chip.
  neutral,

  /// Green-tinted chip.
  success,

  /// Amber-tinted chip.
  warning,

  /// Destructive-tinted chip.
  danger,
}

/// A centered column for empty / zero-result states and inline confirmations.
///
/// Renders an optional tone-tinted icon chip, a [title], optional
/// [description], and an optional [actions] row. Pass [bordered] to wrap the
/// content in a card surface. Mirrors the React/Astro `EmptyState`.
///
/// ```dart
/// RefractionEmptyState(
///   icon: const Icon(Icons.inbox_outlined),
///   title: const Text('No messages'),
///   description: const Text('When you get one, it shows up here.'),
///   actions: [RefractionButton(onPressed: refresh, child: const Text('Refresh'))],
/// )
/// ```
class RefractionEmptyState extends StatelessWidget {
  /// Optional icon rendered inside the tone-tinted chip.
  final Widget? icon;

  /// Tone that tints the icon chip. Defaults to
  /// [RefractionEmptyStateTone.neutral].
  final RefractionEmptyStateTone tone;

  /// Primary heading.
  final Widget title;

  /// Optional supporting copy.
  final Widget? description;

  /// Optional action row, centered under the description.
  final List<Widget>? actions;

  /// When true, wraps the content in a bordered card surface.
  final bool bordered;

  /// Creates a [RefractionEmptyState].
  const RefractionEmptyState({
    super.key,
    this.icon,
    this.tone = RefractionEmptyStateTone.neutral,
    required this.title,
    this.description,
    this.actions,
    this.bordered = false,
  });

  /// Resolves the (background, foreground) pair for the icon chip.
  ({Color background, Color foreground}) _chipColors(RefractionTheme theme) {
    const success = Color(0xFF22C55E);
    const warning = Color(0xFFF59E0B);
    final colors = theme.colors;
    switch (tone) {
      case RefractionEmptyStateTone.neutral:
        return (background: colors.muted, foreground: colors.mutedForeground);
      case RefractionEmptyStateTone.success:
        return (background: success.withValues(alpha: 0.1), foreground: success);
      case RefractionEmptyStateTone.warning:
        return (background: warning.withValues(alpha: 0.1), foreground: warning);
      case RefractionEmptyStateTone.danger:
        return (
          background: colors.destructive.withValues(alpha: 0.1),
          foreground: colors.destructive,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final chip = _chipColors(theme);

    final content = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (icon != null) ...[
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: chip.background,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: IconTheme.merge(
                data: IconThemeData(color: chip.foreground, size: 24),
                child: icon!,
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],
        DefaultTextStyle.merge(
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: colors.foreground,
          ),
          child: title,
        ),
        if (description != null) ...[
          const SizedBox(height: 6),
          DefaultTextStyle.merge(
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: colors.mutedForeground),
            child: description!,
          ),
        ],
        if (actions != null && actions!.isNotEmpty) ...[
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: actions!,
          ),
        ],
      ],
    );

    final padded = Padding(
      padding: const EdgeInsets.all(32),
      child: content,
    );

    if (!bordered) return padded;

    return Container(
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(theme.borderRadius * 1.5),
        border: Border.all(color: colors.border),
      ),
      child: padded,
    );
  }
}

/// A thin preset of [RefractionEmptyState] with [bordered] defaulting to
/// `true`, for inline confirmation states (e.g. "Check your email").
///
/// Mirrors the React/Astro `ConfirmationCard`.
class RefractionConfirmationCard extends StatelessWidget {
  /// Optional icon rendered inside the tone-tinted chip.
  final Widget? icon;

  /// Tone that tints the icon chip.
  final RefractionEmptyStateTone tone;

  /// Primary heading.
  final Widget title;

  /// Optional supporting copy.
  final Widget? description;

  /// Optional action row.
  final List<Widget>? actions;

  /// When true (the default), wraps the content in a bordered card surface.
  final bool bordered;

  /// Creates a [RefractionConfirmationCard].
  const RefractionConfirmationCard({
    super.key,
    this.icon,
    this.tone = RefractionEmptyStateTone.neutral,
    required this.title,
    this.description,
    this.actions,
    this.bordered = true,
  });

  @override
  Widget build(BuildContext context) {
    return RefractionEmptyState(
      icon: icon,
      tone: tone,
      title: title,
      description: description,
      actions: actions,
      bordered: bordered,
    );
  }
}
