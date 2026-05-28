import 'package:flutter/material.dart';
import 'hsl_color.dart';

/// Semantic color tokens used by every Refraction UI widget.
///
/// Refraction UI never references raw colors inside components — it always
/// reads through this token set so that one swap of [RefractionColors] (via
/// [RefractionThemeData]) re-skins the entire app. The token names match
/// the React/Astro Refraction libraries and the shadcn convention
/// (`primary` / `primaryForeground`, `card` / `cardForeground`, …) so
/// designers can reuse the same Figma variables across platforms.
///
/// Each "thing" token is paired with a `Foreground` token that is
/// guaranteed to read accessibly on top of it — for example, draw text in
/// [primaryForeground] when the surface beneath it is filled with
/// [primary].
///
/// Implements [ThemeExtension] so it can also be plugged into a Material
/// `ThemeData.extensions` list when interoperating with Material widgets.
class RefractionColors extends ThemeExtension<RefractionColors> {
  /// Brand action color. Used for primary buttons, links, selected states,
  /// focused indicators, and other "this is the main call to action"
  /// surfaces.
  final Color primary;

  /// Foreground color (text/icons) for content drawn on top of [primary].
  final Color primaryForeground;

  /// Secondary surface color. Used for secondary buttons, soft chips, and
  /// supporting surfaces that need to recede behind [primary].
  final Color secondary;

  /// Foreground color (text/icons) for content drawn on top of [secondary].
  final Color secondaryForeground;

  /// Destructive / danger color. Used for delete buttons, error toasts,
  /// validation messages, and irreversible actions.
  final Color destructive;

  /// Foreground color (text/icons) for content drawn on top of
  /// [destructive].
  final Color destructiveForeground;

  /// Muted surface color. Used for de-emphasized backgrounds — disabled
  /// fields, skeleton placeholders, quiet grouping panels.
  final Color muted;

  /// Foreground color for text/icons on top of [muted]. Also commonly used
  /// directly for secondary copy such as captions and hints.
  final Color mutedForeground;

  /// Accent surface color. Used for hover/active states on neutral
  /// surfaces and for subtle highlights.
  final Color accent;

  /// Foreground color (text/icons) for content drawn on top of [accent].
  final Color accentForeground;

  /// Page background — the bottommost surface of the app.
  final Color background;

  /// Default foreground color for body text and icons drawn directly on
  /// [background].
  final Color foreground;

  /// Card surface color. Used for raised content blocks that sit above
  /// [background].
  final Color card;

  /// Foreground color (text/icons) for content drawn on top of [card].
  final Color cardForeground;

  /// Floating-surface color used by popovers, dropdowns, menus, and
  /// command palettes.
  final Color popover;

  /// Foreground color (text/icons) for content drawn on top of [popover].
  final Color popoverForeground;

  /// Hairline color used for dividers and component borders.
  final Color border;

  /// Border/fill color for input controls — text fields, selects,
  /// checkboxes in their resting state.
  final Color input;

  /// Focus ring color drawn around interactive elements when they receive
  /// keyboard focus. Should provide strong contrast against [background].
  final Color ring;

  /// Creates a [RefractionColors] palette.
  ///
  /// All tokens are required — there are no implicit fallbacks, so a
  /// custom palette must explicitly opt into every semantic role. For most
  /// apps, prefer one of the curated constants ([minimalLight],
  /// [fintechDark], [wellnessLight], …) and use [copyWith] to tweak.
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

  /// Minimal palette, light mode. Pure monochrome — Apple/Nike aesthetic
  /// with deepest blacks, pure whites, and soft neutral grays.
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

  /// Minimal palette, dark mode. Inverse monochrome — pure black surfaces,
  /// pure white primaries.
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

  /// Fintech palette, light mode. Revolut-inspired — neon green primary on
  /// a crisp neutral surface for high-confidence financial UI.
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

  /// Fintech palette, dark mode. Bright accent green over deep blue-black
  /// chrome — high-contrast trading/banking aesthetic.
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

  /// Wellness palette, light mode. Warm off-whites, organic taupe borders,
  /// soft coral accents — Flo/Headspace inspired.
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

  /// Wellness palette, dark mode. Warm browns and muted coral primaries
  /// for a calm, low-stimulation evening UI.
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

  /// Creative palette, light mode. Discord-style "blurple" primaries on
  /// neutral white — well suited to gaming, social, and creative tools.
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

  /// Creative palette, dark mode. Indigo primaries on near-black surfaces
  /// for an OLED-friendly creative-tool aesthetic.
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

  /// Productivity palette, light mode. Linear-style subdued blues on crisp
  /// clean grays — designed for long-session task and tracking apps.
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

  /// Productivity palette, dark mode. Soft sky blue primaries on graphite
  /// surfaces — easy on the eyes during long focused sessions.
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

  static final RefractionColors refractionLight = RefractionColors(
    primary: HslColor.parse('250 50% 50%'),
    primaryForeground: HslColor.parse('0 0% 100%'),
    secondary: HslColor.parse('240 5% 96%'),
    secondaryForeground: HslColor.parse('240 4% 44%'),
    destructive: HslColor.parse('0 84% 50%'),
    destructiveForeground: HslColor.parse('0 0% 100%'),
    muted: HslColor.parse('240 5% 96%'),
    mutedForeground: HslColor.parse('240 4% 44%'),
    accent: HslColor.parse('250 30% 95%'),
    accentForeground: HslColor.parse('250 50% 40%'),
    background: HslColor.parse('0 0% 99%'),
    foreground: HslColor.parse('240 10% 10%'),
    card: HslColor.parse('0 0% 99%'),
    cardForeground: HslColor.parse('240 10% 10%'),
    popover: HslColor.parse('0 0% 100%'),
    popoverForeground: HslColor.parse('240 10% 10%'),
    border: HslColor.parse('240 6% 92%'),
    input: HslColor.parse('240 6% 92%'),
    ring: HslColor.parse('250 50% 50%'),
  );

  static final RefractionColors refractionDark = RefractionColors(
    primary: HslColor.parse('250 50% 65%'),
    primaryForeground: HslColor.parse('240 10% 4%'),
    secondary: HslColor.parse('240 5% 16%'),
    secondaryForeground: HslColor.parse('240 5% 65%'),
    destructive: HslColor.parse('0 63% 31%'),
    destructiveForeground: HslColor.parse('0 0% 98%'),
    muted: HslColor.parse('240 5% 16%'),
    mutedForeground: HslColor.parse('240 5% 65%'),
    accent: HslColor.parse('250 30% 20%'),
    accentForeground: HslColor.parse('250 60% 80%'),
    background: HslColor.parse('240 10% 4%'),
    foreground: HslColor.parse('0 0% 98%'),
    card: HslColor.parse('240 10% 8%'),
    cardForeground: HslColor.parse('0 0% 98%'),
    popover: HslColor.parse('240 10% 8%'),
    popoverForeground: HslColor.parse('0 0% 98%'),
    border: HslColor.parse('240 5% 16%'),
    input: HslColor.parse('240 5% 16%'),
    ring: HslColor.parse('250 50% 65%'),
  );

  static final RefractionColors luxeLight = RefractionColors(
    primary: HslColor.parse('220 90% 45%'),
    primaryForeground: HslColor.parse('0 0% 100%'),
    secondary: HslColor.parse('220 5% 96%'),
    secondaryForeground: HslColor.parse('220 5% 40%'),
    destructive: HslColor.parse('0 72% 45%'),
    destructiveForeground: HslColor.parse('0 0% 100%'),
    muted: HslColor.parse('220 5% 96%'),
    mutedForeground: HslColor.parse('220 5% 40%'),
    accent: HslColor.parse('220 30% 95%'),
    accentForeground: HslColor.parse('220 60% 35%'),
    background: HslColor.parse('0 0% 100%'),
    foreground: HslColor.parse('0 0% 12%'),
    card: HslColor.parse('0 0% 100%'),
    cardForeground: HslColor.parse('0 0% 12%'),
    popover: HslColor.parse('0 0% 100%'),
    popoverForeground: HslColor.parse('0 0% 12%'),
    border: HslColor.parse('220 6% 93%'),
    input: HslColor.parse('220 6% 93%'),
    ring: HslColor.parse('220 90% 45%'),
  );

  static final RefractionColors luxeDark = RefractionColors(
    primary: HslColor.parse('220 85% 60%'),
    primaryForeground: HslColor.parse('0 0% 7%'),
    secondary: HslColor.parse('220 5% 16%'),
    secondaryForeground: HslColor.parse('220 5% 65%'),
    destructive: HslColor.parse('0 63% 31%'),
    destructiveForeground: HslColor.parse('0 0% 98%'),
    muted: HslColor.parse('220 5% 16%'),
    mutedForeground: HslColor.parse('220 5% 60%'),
    accent: HslColor.parse('220 25% 18%'),
    accentForeground: HslColor.parse('220 60% 75%'),
    background: HslColor.parse('0 0% 7%'),
    foreground: HslColor.parse('0 0% 98%'),
    card: HslColor.parse('0 0% 10%'),
    cardForeground: HslColor.parse('0 0% 98%'),
    popover: HslColor.parse('0 0% 10%'),
    popoverForeground: HslColor.parse('0 0% 98%'),
    border: HslColor.parse('220 5% 16%'),
    input: HslColor.parse('220 5% 16%'),
    ring: HslColor.parse('220 85% 60%'),
  );

  static final RefractionColors warmLight = RefractionColors(
    primary: HslColor.parse('350 85% 46%'),
    primaryForeground: HslColor.parse('0 0% 100%'),
    secondary: HslColor.parse('30 15% 95%'),
    secondaryForeground: HslColor.parse('25 10% 40%'),
    destructive: HslColor.parse('0 72% 45%'),
    destructiveForeground: HslColor.parse('0 0% 100%'),
    muted: HslColor.parse('30 15% 95%'),
    mutedForeground: HslColor.parse('25 10% 40%'),
    accent: HslColor.parse('350 30% 94%'),
    accentForeground: HslColor.parse('350 60% 38%'),
    background: HslColor.parse('35 40% 99%'),
    foreground: HslColor.parse('15 20% 12%'),
    card: HslColor.parse('35 30% 99%'),
    cardForeground: HslColor.parse('15 20% 12%'),
    popover: HslColor.parse('35 30% 99%'),
    popoverForeground: HslColor.parse('15 20% 12%'),
    border: HslColor.parse('30 12% 90%'),
    input: HslColor.parse('30 12% 90%'),
    ring: HslColor.parse('350 85% 46%'),
  );

  static final RefractionColors warmDark = RefractionColors(
    primary: HslColor.parse('350 80% 65%'),
    primaryForeground: HslColor.parse('15 15% 5%'),
    secondary: HslColor.parse('20 10% 16%'),
    secondaryForeground: HslColor.parse('25 10% 65%'),
    destructive: HslColor.parse('0 63% 31%'),
    destructiveForeground: HslColor.parse('0 0% 98%'),
    muted: HslColor.parse('20 10% 16%'),
    mutedForeground: HslColor.parse('30 10% 60%'),
    accent: HslColor.parse('350 25% 18%'),
    accentForeground: HslColor.parse('350 50% 70%'),
    background: HslColor.parse('15 15% 5%'),
    foreground: HslColor.parse('30 20% 95%'),
    card: HslColor.parse('15 15% 9%'),
    cardForeground: HslColor.parse('30 20% 95%'),
    popover: HslColor.parse('15 15% 9%'),
    popoverForeground: HslColor.parse('30 20% 95%'),
    border: HslColor.parse('20 10% 16%'),
    input: HslColor.parse('20 10% 16%'),
    ring: HslColor.parse('350 80% 65%'),
  );

  static final RefractionColors signalLight = RefractionColors(
    primary: HslColor.parse('190 80% 32%'),
    primaryForeground: HslColor.parse('0 0% 100%'),
    secondary: HslColor.parse('200 8% 95%'),
    secondaryForeground: HslColor.parse('210 8% 40%'),
    destructive: HslColor.parse('0 72% 45%'),
    destructiveForeground: HslColor.parse('0 0% 100%'),
    muted: HslColor.parse('200 8% 95%'),
    mutedForeground: HslColor.parse('210 8% 40%'),
    accent: HslColor.parse('190 25% 93%'),
    accentForeground: HslColor.parse('190 60% 28%'),
    background: HslColor.parse('0 0% 100%'),
    foreground: HslColor.parse('210 15% 12%'),
    card: HslColor.parse('0 0% 100%'),
    cardForeground: HslColor.parse('210 15% 12%'),
    popover: HslColor.parse('0 0% 100%'),
    popoverForeground: HslColor.parse('210 15% 12%'),
    border: HslColor.parse('210 10% 90%'),
    input: HslColor.parse('210 10% 90%'),
    ring: HslColor.parse('190 80% 32%'),
  );

  static final RefractionColors signalDark = RefractionColors(
    primary: HslColor.parse('190 70% 50%'),
    primaryForeground: HslColor.parse('210 15% 5%'),
    secondary: HslColor.parse('210 8% 16%'),
    secondaryForeground: HslColor.parse('210 8% 65%'),
    destructive: HslColor.parse('0 63% 31%'),
    destructiveForeground: HslColor.parse('0 0% 98%'),
    muted: HslColor.parse('210 8% 16%'),
    mutedForeground: HslColor.parse('210 8% 60%'),
    accent: HslColor.parse('190 20% 18%'),
    accentForeground: HslColor.parse('190 50% 65%'),
    background: HslColor.parse('210 15% 5%'),
    foreground: HslColor.parse('190 10% 95%'),
    card: HslColor.parse('210 13% 9%'),
    cardForeground: HslColor.parse('190 10% 95%'),
    popover: HslColor.parse('210 13% 9%'),
    popoverForeground: HslColor.parse('190 10% 95%'),
    border: HslColor.parse('210 10% 16%'),
    input: HslColor.parse('210 10% 16%'),
    ring: HslColor.parse('190 70% 50%'),
  );

  static final RefractionColors pulseLight = RefractionColors(
    primary: HslColor.parse('265 80% 55%'),
    primaryForeground: HslColor.parse('0 0% 100%'),
    secondary: HslColor.parse('240 8% 93%'),
    secondaryForeground: HslColor.parse('240 6% 40%'),
    destructive: HslColor.parse('0 72% 45%'),
    destructiveForeground: HslColor.parse('0 0% 100%'),
    muted: HslColor.parse('240 8% 93%'),
    mutedForeground: HslColor.parse('240 6% 40%'),
    accent: HslColor.parse('265 30% 94%'),
    accentForeground: HslColor.parse('265 60% 40%'),
    background: HslColor.parse('240 10% 97%'),
    foreground: HslColor.parse('240 10% 10%'),
    card: HslColor.parse('240 8% 99%'),
    cardForeground: HslColor.parse('240 10% 10%'),
    popover: HslColor.parse('240 8% 99%'),
    popoverForeground: HslColor.parse('240 10% 10%'),
    border: HslColor.parse('240 8% 90%'),
    input: HslColor.parse('240 8% 90%'),
    ring: HslColor.parse('265 80% 55%'),
  );

  static final RefractionColors pulseDark = RefractionColors(
    primary: HslColor.parse('265 75% 65%'),
    primaryForeground: HslColor.parse('260 15% 5%'),
    secondary: HslColor.parse('260 6% 16%'),
    secondaryForeground: HslColor.parse('260 6% 65%'),
    destructive: HslColor.parse('0 63% 31%'),
    destructiveForeground: HslColor.parse('0 0% 98%'),
    muted: HslColor.parse('260 6% 16%'),
    mutedForeground: HslColor.parse('260 6% 60%'),
    accent: HslColor.parse('265 25% 18%'),
    accentForeground: HslColor.parse('265 55% 75%'),
    background: HslColor.parse('260 15% 5%'),
    foreground: HslColor.parse('260 10% 96%'),
    card: HslColor.parse('260 12% 8%'),
    cardForeground: HslColor.parse('260 10% 96%'),
    popover: HslColor.parse('260 12% 8%'),
    popoverForeground: HslColor.parse('260 10% 96%'),
    border: HslColor.parse('260 6% 16%'),
    input: HslColor.parse('260 6% 16%'),
    ring: HslColor.parse('265 75% 65%'),
  );

  static final RefractionColors monoLight = RefractionColors(
    primary: HslColor.parse('210 10% 23%'),
    primaryForeground: HslColor.parse('0 0% 100%'),
    secondary: HslColor.parse('210 12% 94%'),
    secondaryForeground: HslColor.parse('210 10% 40%'),
    destructive: HslColor.parse('0 72% 45%'),
    destructiveForeground: HslColor.parse('0 0% 100%'),
    muted: HslColor.parse('210 12% 94%'),
    mutedForeground: HslColor.parse('210 10% 40%'),
    accent: HslColor.parse('210 15% 93%'),
    accentForeground: HslColor.parse('210 10% 20%'),
    background: HslColor.parse('210 20% 98%'),
    foreground: HslColor.parse('210 15% 20%'),
    card: HslColor.parse('210 20% 98%'),
    cardForeground: HslColor.parse('210 15% 20%'),
    popover: HslColor.parse('0 0% 100%'),
    popoverForeground: HslColor.parse('210 15% 20%'),
    border: HslColor.parse('210 14% 89%'),
    input: HslColor.parse('210 14% 89%'),
    ring: HslColor.parse('210 10% 23%'),
  );

  static final RefractionColors monoDark = RefractionColors(
    primary: HslColor.parse('210 10% 80%'),
    primaryForeground: HslColor.parse('210 15% 5%'),
    secondary: HslColor.parse('210 8% 14%'),
    secondaryForeground: HslColor.parse('210 8% 65%'),
    destructive: HslColor.parse('0 63% 31%'),
    destructiveForeground: HslColor.parse('0 0% 98%'),
    muted: HslColor.parse('210 8% 14%'),
    mutedForeground: HslColor.parse('210 8% 60%'),
    accent: HslColor.parse('210 10% 18%'),
    accentForeground: HslColor.parse('210 10% 80%'),
    background: HslColor.parse('210 15% 5%'),
    foreground: HslColor.parse('210 15% 93%'),
    card: HslColor.parse('210 13% 8%'),
    cardForeground: HslColor.parse('210 15% 93%'),
    popover: HslColor.parse('210 13% 8%'),
    popoverForeground: HslColor.parse('210 15% 93%'),
    border: HslColor.parse('210 8% 16%'),
    input: HslColor.parse('210 8% 16%'),
    ring: HslColor.parse('210 10% 80%'),
  );

  /// Default light palette. Currently aliases [minimalLight].
  static const RefractionColors light = minimalLight;

  /// Default dark palette. Currently aliases [minimalDark].
  static const RefractionColors dark = minimalDark;

  /// Returns a copy of this palette with the given tokens replaced.
  ///
  /// Pass only the colors you want to change; everything else is carried
  /// through from the receiver. Useful for branding tweaks like a custom
  /// primary while keeping the rest of a curated palette intact.
  ///
  /// ```dart
  /// final brand = RefractionColors.minimalLight
  ///     .copyWith(primary: const Color(0xFF7C3AED));
  /// ```
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
      destructiveForeground:
          destructiveForeground ?? this.destructiveForeground,
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

  /// Linearly interpolates every token between this palette and [other] by
  /// the fraction [t] (0.0 = this, 1.0 = other).
  ///
  /// Used by Flutter's animation machinery when a [ThemeData] containing
  /// this extension is animated — for example, cross-fading between light
  /// and dark mode. Returns the receiver unchanged when [other] is not a
  /// [RefractionColors].
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
      primaryForeground: Color.lerp(
        primaryForeground,
        other.primaryForeground,
        t,
      )!,
      secondary: Color.lerp(secondary, other.secondary, t)!,
      secondaryForeground: Color.lerp(
        secondaryForeground,
        other.secondaryForeground,
        t,
      )!,
      destructive: Color.lerp(destructive, other.destructive, t)!,
      destructiveForeground: Color.lerp(
        destructiveForeground,
        other.destructiveForeground,
        t,
      )!,
      muted: Color.lerp(muted, other.muted, t)!,
      mutedForeground: Color.lerp(mutedForeground, other.mutedForeground, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      accentForeground: Color.lerp(
        accentForeground,
        other.accentForeground,
        t,
      )!,
      background: Color.lerp(background, other.background, t)!,
      foreground: Color.lerp(foreground, other.foreground, t)!,
      card: Color.lerp(card, other.card, t)!,
      cardForeground: Color.lerp(cardForeground, other.cardForeground, t)!,
      popover: Color.lerp(popover, other.popover, t)!,
      popoverForeground: Color.lerp(
        popoverForeground,
        other.popoverForeground,
        t,
      )!,
      border: Color.lerp(border, other.border, t)!,
      input: Color.lerp(input, other.input, t)!,
      ring: Color.lerp(ring, other.ring, t)!,
    );
  }
}
