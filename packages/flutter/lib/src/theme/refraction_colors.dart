import 'package:flutter/material.dart';

class RefractionColors extends ThemeExtension<RefractionColors> {
  final Color primary;
  final Color primaryForeground;
  final Color secondary;
  final Color secondaryForeground;
  final Color destructive;
  final Color destructiveForeground;
  final Color muted;
  final Color mutedForeground;
  final Color accent;
  final Color accentForeground;
  final Color background;
  final Color foreground;
  final Color card;
  final Color cardForeground;
  final Color popover;
  final Color popoverForeground;
  final Color border;
  final Color input;
  final Color ring;

  const RefractionColors({
    required this.primary,
    required this.primaryForeground,
    required this.secondary,
    required this.secondaryForeground,
    required this.destructive,
    required this.destructiveForeground,
    required this.muted,
    required this.mutedForeground,
    required this.accent,
    required this.accentForeground,
    required this.background,
    required this.foreground,
    required this.card,
    required this.cardForeground,
    required this.popover,
    required this.popoverForeground,
    required this.border,
    required this.input,
    required this.ring,
  });

  // --- MINIMAL PALETTE ---
  // Pure monochrome aesthetics. Deepest blacks, pure whites, soft grays.
  static const RefractionColors minimalLight = RefractionColors(
    primary: Color(0xFF000000),
    primaryForeground: Color(0xFFFFFFFF),
    secondary: Color(0xFFF5F5F7),
    secondaryForeground: Color(0xFF000000),
    destructive: Color(0xFFFF3B30),
    destructiveForeground: Color(0xFFFFFFFF),
    muted: Color(0xFFF5F5F7),
    mutedForeground: Color(0xFF8E8E93),
    accent: Color(0xFFF5F5F7),
    accentForeground: Color(0xFF000000),
    background: Color(0xFFFFFFFF),
    foreground: Color(0xFF000000),
    card: Color(0xFFFFFFFF),
    cardForeground: Color(0xFF000000),
    popover: Color(0xFFFFFFFF),
    popoverForeground: Color(0xFF000000),
    border: Color(0xFFE5E5EA),
    input: Color(0xFFE5E5EA),
    ring: Color(0xFFD1D1D6),
  );

  static const RefractionColors minimalDark = RefractionColors(
    primary: Color(0xFFFFFFFF),
    primaryForeground: Color(0xFF000000),
    secondary: Color(0xFF1C1C1E),
    secondaryForeground: Color(0xFFFFFFFF),
    destructive: Color(0xFFFF453A),
    destructiveForeground: Color(0xFFFFFFFF),
    muted: Color(0xFF1C1C1E),
    mutedForeground: Color(0xFF8E8E93),
    accent: Color(0xFF1C1C1E),
    accentForeground: Color(0xFFFFFFFF),
    background: Color(0xFF000000),
    foreground: Color(0xFFFFFFFF),
    card: Color(0xFF1C1C1E),
    cardForeground: Color(0xFFFFFFFF),
    popover: Color(0xFF1C1C1E),
    popoverForeground: Color(0xFFFFFFFF),
    border: Color(0xFF38383A),
    input: Color(0xFF38383A),
    ring: Color(0xFF48484A),
  );

  // --- FINTECH PALETTE ---
  // Neon accents + heavy deep backgrounds
  static const RefractionColors fintechLight = RefractionColors(
    primary: Color(0xFF00D632),
    primaryForeground: Color(0xFFFFFFFF),
    secondary: Color(0xFFE9F2EB),
    secondaryForeground: Color(0xFF051810),
    destructive: Color(0xFFE43A45),
    destructiveForeground: Color(0xFFFFFFFF),
    muted: Color(0xFFF1F4F7),
    mutedForeground: Color(0xFF758394),
    accent: Color(0xFFF1F4F7),
    accentForeground: Color(0xFF051810),
    background: Color(0xFFF6F8FA),
    foreground: Color(0xFF051810),
    card: Color(0xFFFFFFFF),
    cardForeground: Color(0xFF051810),
    popover: Color(0xFFFFFFFF),
    popoverForeground: Color(0xFF051810),
    border: Color(0xFFEAEDF0),
    input: Color(0xFFEAEDF0),
    ring: Color(0xFF00D632),
  );

  static const RefractionColors fintechDark = RefractionColors(
    primary: Color(0xFF05FF3E),
    primaryForeground: Color(0xFF051810),
    secondary: Color(0xFF18382A),
    secondaryForeground: Color(0xFF05FF3E),
    destructive: Color(0xFFFF4D5A),
    destructiveForeground: Color(0xFFFFFFFF),
    muted: Color(0xFF161920),
    mutedForeground: Color(0xFF8193A7),
    accent: Color(0xFF161920),
    accentForeground: Color(0xFFFFFFFF),
    background: Color(0xFF0B0E14),
    foreground: Color(0xFFFFFFFF),
    card: Color(0xFF161920),
    cardForeground: Color(0xFFFFFFFF),
    popover: Color(0xFF161920),
    popoverForeground: Color(0xFFFFFFFF),
    border: Color(0xFF1F242C),
    input: Color(0xFF1F242C),
    ring: Color(0xFF05FF3E),
  );

  // --- WELLNESS PALETTE ---
  // Warm off-whites, organic taupe borders, soft coral accents
  static const RefractionColors wellnessLight = RefractionColors(
    primary: Color(0xFFFF6E66),
    primaryForeground: Color(0xFFFFFFFF),
    secondary: Color(0xFFF2EFE9),
    secondaryForeground: Color(0xFF4A443C),
    destructive: Color(0xFFE0423A),
    destructiveForeground: Color(0xFFFFFFFF),
    muted: Color(0xFFF2EFE9),
    mutedForeground: Color(0xFF918D88),
    accent: Color(0xFFF2EFE9),
    accentForeground: Color(0xFF4A443C),
    background: Color(0xFFFCFBF8),
    foreground: Color(0xFF2A2320),
    card: Color(0xFFFFFFFF),
    cardForeground: Color(0xFF2A2320),
    popover: Color(0xFFFFFFFF),
    popoverForeground: Color(0xFF2A2320),
    border: Color(0xFFE8E5DF),
    input: Color(0xFFE8E5DF),
    ring: Color(0xFFFFb6b3),
  );

  static const RefractionColors wellnessDark = RefractionColors(
    primary: Color(0xFFFF837D),
    primaryForeground: Color(0xFF2A2320),
    secondary: Color(0xFF4D4139),
    secondaryForeground: Color(0xFFFF837D),
    destructive: Color(0xFFFF524A),
    destructiveForeground: Color(0xFFFFFFFF),
    muted: Color(0xFF3A3029),
    mutedForeground: Color(0xFF998A82),
    accent: Color(0xFF3A3029),
    accentForeground: Color(0xFFE8E5DF),
    background: Color(0xFF201B18),
    foreground: Color(0xFFE8E5DF),
    card: Color(0xFF2E2622),
    cardForeground: Color(0xFFE8E5DF),
    popover: Color(0xFF2E2622),
    popoverForeground: Color(0xFFE8E5DF),
    border: Color(0xFF4D4139),
    input: Color(0xFF4D4139),
    ring: Color(0xFFFF837D),
  );

  // --- CREATIVE PALETTE ---
  // Discord-style Blurple logic, absolute blacks
  static const RefractionColors creativeLight = RefractionColors(
    primary: Color(0xFF5046E5),
    primaryForeground: Color(0xFFFFFFFF),
    secondary: Color(0xFFE6E5FC),
    secondaryForeground: Color(0xFF1E177A),
    destructive: Color(0xFFEF4444),
    destructiveForeground: Color(0xFFFFFFFF),
    muted: Color(0xFFF3F4F6),
    mutedForeground: Color(0xFF6B7280),
    accent: Color(0xFFF3F4F6),
    accentForeground: Color(0xFF111827),
    background: Color(0xFFFFFFFF),
    foreground: Color(0xFF111827),
    card: Color(0xFFFFFFFF),
    cardForeground: Color(0xFF111827),
    popover: Color(0xFFFFFFFF),
    popoverForeground: Color(0xFF111827),
    border: Color(0xFFE5E7EB),
    input: Color(0xFFE5E7EB),
    ring: Color(0xFF5046E5),
  );

  static const RefractionColors creativeDark = RefractionColors(
    primary: Color(0xFF6366F1),
    primaryForeground: Color(0xFFFFFFFF),
    secondary: Color(0xFF1A1A40),
    secondaryForeground: Color(0xFF6366F1),
    destructive: Color(0xFF7F1D1D),
    destructiveForeground: Color(0xFFFFFFFF),
    muted: Color(0xFF27272A),
    mutedForeground: Color(0xFFA1A1AA),
    accent: Color(0xFF27272A),
    accentForeground: Color(0xFFFFFFFF),
    background: Color(0xFF09090B),
    foreground: Color(0xFFFAFAFA),
    card: Color(0xFF18181B),
    cardForeground: Color(0xFFFAFAFA),
    popover: Color(0xFF18181B),
    popoverForeground: Color(0xFFFAFAFA),
    border: Color(0xFF27272A),
    input: Color(0xFF27272A),
    ring: Color(0xFF6366F1),
  );

  // --- PRODUCTIVITY PALETTE ---
  // Linear styling, subdued indigos on crisp clean grays
  static const RefractionColors productivityLight = RefractionColors(
    primary: Color(0xFF3B82F6),
    primaryForeground: Color(0xFFFFFFFF),
    secondary: Color(0xFFEFF6FF),
    secondaryForeground: Color(0xFF153F77),
    destructive: Color(0xFFDC2626),
    destructiveForeground: Color(0xFFFFFFFF),
    muted: Color(0xFFF4F4F5),
    mutedForeground: Color(0xFF71717A),
    accent: Color(0xFFF4F4F5),
    accentForeground: Color(0xFF18181B),
    background: Color(0xFFFAFAFA),
    foreground: Color(0xFF18181B),
    card: Color(0xFFFFFFFF),
    cardForeground: Color(0xFF18181B),
    popover: Color(0xFFFFFFFF),
    popoverForeground: Color(0xFF18181B),
    border: Color(0xFFE4E4E7),
    input: Color(0xFFE4E4E7),
    ring: Color(0xFF3B82F6),
  );

  static const RefractionColors productivityDark = RefractionColors(
    primary: Color(0xFF60A5FA),
    primaryForeground: Color(0xFF121212),
    secondary: Color(0xFF1C2C47),
    secondaryForeground: Color(0xFF60A5FA),
    destructive: Color(0xFF991B1B),
    destructiveForeground: Color(0xFFFAFAFA),
    muted: Color(0xFF2B2B2B),
    mutedForeground: Color(0xFF949494),
    accent: Color(0xFF2B2B2B),
    accentForeground: Color(0xFFFAFAFA),
    background: Color(0xFF121212),
    foreground: Color(0xFFEFEFEF),
    card: Color(0xFF1A1A1A),
    cardForeground: Color(0xFFEFEFEF),
    popover: Color(0xFF1A1A1A),
    popoverForeground: Color(0xFFEFEFEF),
    border: Color(0xFF2B2B2B),
    input: Color(0xFF2B2B2B),
    ring: Color(0xFF60A5FA),
  );

  // Default bindings to Minimal
  static const RefractionColors light = minimalLight;
  static const RefractionColors dark = minimalDark;

  @override
  ThemeExtension<RefractionColors> copyWith({
    Color? primary,
    Color? primaryForeground,
    Color? secondary,
    Color? secondaryForeground,
    Color? destructive,
    Color? destructiveForeground,
    Color? muted,
    Color? mutedForeground,
    Color? accent,
    Color? accentForeground,
    Color? background,
    Color? foreground,
    Color? card,
    Color? cardForeground,
    Color? popover,
    Color? popoverForeground,
    Color? border,
    Color? input,
    Color? ring,
  }) {
    return RefractionColors(
      primary: primary ?? this.primary,
      primaryForeground: primaryForeground ?? this.primaryForeground,
      secondary: secondary ?? this.secondary,
      secondaryForeground: secondaryForeground ?? this.secondaryForeground,
      destructive: destructive ?? this.destructive,
      destructiveForeground: destructiveForeground ?? this.destructiveForeground,
      muted: muted ?? this.muted,
      mutedForeground: mutedForeground ?? this.mutedForeground,
      accent: accent ?? this.accent,
      accentForeground: accentForeground ?? this.accentForeground,
      background: background ?? this.background,
      foreground: foreground ?? this.foreground,
      card: card ?? this.card,
      cardForeground: cardForeground ?? this.cardForeground,
      popover: popover ?? this.popover,
      popoverForeground: popoverForeground ?? this.popoverForeground,
      border: border ?? this.border,
      input: input ?? this.input,
      ring: ring ?? this.ring,
    );
  }

  @override
  ThemeExtension<RefractionColors> lerp(
    ThemeExtension<RefractionColors>? other,
    double t,
  ) {
    if (other is! RefractionColors) {
      return this;
    }
    return RefractionColors(
      primary: Color.lerp(primary, other.primary, t)!,
      primaryForeground: Color.lerp(primaryForeground, other.primaryForeground, t)!,
      secondary: Color.lerp(secondary, other.secondary, t)!,
      secondaryForeground: Color.lerp(secondaryForeground, other.secondaryForeground, t)!,
      destructive: Color.lerp(destructive, other.destructive, t)!,
      destructiveForeground: Color.lerp(destructiveForeground, other.destructiveForeground, t)!,
      muted: Color.lerp(muted, other.muted, t)!,
      mutedForeground: Color.lerp(mutedForeground, other.mutedForeground, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      accentForeground: Color.lerp(accentForeground, other.accentForeground, t)!,
      background: Color.lerp(background, other.background, t)!,
      foreground: Color.lerp(foreground, other.foreground, t)!,
      card: Color.lerp(card, other.card, t)!,
      cardForeground: Color.lerp(cardForeground, other.cardForeground, t)!,
      popover: Color.lerp(popover, other.popover, t)!,
      popoverForeground: Color.lerp(popoverForeground, other.popoverForeground, t)!,
      border: Color.lerp(border, other.border, t)!,
      input: Color.lerp(input, other.input, t)!,
      ring: Color.lerp(ring, other.ring, t)!,
    );
  }
}
