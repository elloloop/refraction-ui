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
/// [primary]. The status tokens ([success], [warning], [info]) stand
/// alone: components paint them both as low-alpha tints and as the
/// text/icon color on top of those tints, and they currently share one
/// fixed hue across every curated palette.
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

  /// Success / positive status color. Used for confirmation banners, valid
  /// input borders, "live" badges, and other completed or healthy states.
  final Color success;

  /// Warning status color. Used for caution banners, raised-hand badges,
  /// and warning-level log output.
  final Color warning;

  /// Informational status color. Used for info banners and neutral
  /// highlights that should not read as the brand [primary].
  final Color info;

  // ---------------------------------------------------------------------------
  // Extended semantic roles (all optional).
  //
  // Every field below is stored as a nullable "override" and exposed through a
  // same-named getter that derives a sensible default from the base tokens
  // when the override is null. A palette that sets only the original tokens
  // therefore still exposes the whole extended vocabulary, and no existing
  // construction has to change. Supply an override to break away from the
  // derived default for one role without touching the rest.
  // ---------------------------------------------------------------------------

  final Color? _primaryHover;
  final Color? _primaryActive;
  final Color? _primarySoft;
  final Color? _primarySoftForeground;
  final List<Color>? _primaryGradient;
  final Color? _tertiary;
  final Color? _tertiaryForeground;
  final Color? _tertiarySoft;
  final Color? _tertiarySoftForeground;
  final Color? _placeholder;
  final Color? _surfaceSubtle;
  final Color? _borderSubtle;
  final Color? _positive;
  final Color? _positiveForeground;
  final Color? _caution;
  final Color? _cautionForeground;
  final Color? _done;
  final Color? _neutral;
  final Color? _neutralForeground;
  final Color? _pending;
  final Color? _pendingForeground;
  final Color? _chart1;
  final Color? _chart2;
  final Color? _chart3;
  final Color? _chart4;
  final Color? _chart5;

  /// White, used as the default foreground for filled status surfaces
  /// ([positive], [caution], [pending]) whose base hue is dark enough to
  /// carry white text/icons.
  static const Color _statusForeground = Color(0xFFFFFFFF);

  /// Hover step for [primary] surfaces. Defaults to [primary] darkened ~6%.
  Color get primaryHover => _primaryHover ?? ColorMath.darken(primary, 0.06);

  /// Pressed/active step for [primary] surfaces. Defaults to [primary]
  /// darkened ~12%.
  Color get primaryActive => _primaryActive ?? ColorMath.darken(primary, 0.12);

  /// Soft, tinted brand fill (e.g. selected rows, highlighted chips).
  /// Defaults to [primary] blended ~12% over [background].
  Color get primarySoft =>
      _primarySoft ?? ColorMath.mix(background, primary, 0.12);

  /// Foreground for text/icons drawn on [primarySoft]. Defaults to [primary].
  Color get primarySoftForeground => _primarySoftForeground ?? primary;

  /// Gradient stops for a brand-gradient fill. Defaults to a flat
  /// `[primary, primary]` so a gradient paint is visually identical to a solid
  /// [primary] until a real ramp is supplied.
  List<Color> get primaryGradient =>
      _primaryGradient ?? <Color>[primary, primary];

  /// A second brand accent hue, distinct from [primary]. Defaults to
  /// [secondary].
  Color get tertiary => _tertiary ?? secondary;

  /// Foreground for content on [tertiary]. Defaults to [secondaryForeground].
  Color get tertiaryForeground => _tertiaryForeground ?? secondaryForeground;

  /// Soft, tinted second-accent fill. Defaults to [tertiary] blended ~12%
  /// over [background].
  Color get tertiarySoft =>
      _tertiarySoft ?? ColorMath.mix(background, tertiary, 0.12);

  /// Foreground for content on [tertiarySoft]. Defaults to [tertiary].
  Color get tertiarySoftForeground => _tertiarySoftForeground ?? tertiary;

  /// Placeholder text color for empty inputs. Defaults to [mutedForeground].
  Color get placeholder => _placeholder ?? mutedForeground;

  /// A quieter surface than [card]/[background] for subtle grouping.
  /// Defaults to [muted].
  Color get surfaceSubtle => _surfaceSubtle ?? muted;

  /// A hairline border, lighter than [border]. Defaults to [border] pulled
  /// ~50% toward [background].
  Color get borderSubtle =>
      _borderSubtle ?? ColorMath.mix(border, background, 0.5);

  /// Positive/confirmation status color. Defaults to [success].
  Color get positive => _positive ?? success;

  /// Foreground for content on [positive]. Defaults to white.
  Color get positiveForeground => _positiveForeground ?? _statusForeground;

  /// Caution status color (softer than [destructive]). Defaults to [warning].
  Color get caution => _caution ?? warning;

  /// Foreground for content on [caution]. Defaults to white.
  Color get cautionForeground => _cautionForeground ?? _statusForeground;

  /// "Completed"/done status color. Defaults to [success].
  Color get done => _done ?? success;

  /// Neutral status color (inactive/offline dots, muted chips). Defaults to
  /// [mutedForeground] — a mid gray independent of the brand hue.
  Color get neutral => _neutral ?? mutedForeground;

  /// Foreground for content on [neutral]. Defaults to [foreground].
  Color get neutralForeground => _neutralForeground ?? foreground;

  /// Pending/in-progress status color. Defaults to [warning].
  Color get pending => _pending ?? warning;

  /// Foreground for content on [pending]. Defaults to white.
  Color get pendingForeground => _pendingForeground ?? _statusForeground;

  /// First categorical chart color. Defaults to [primary].
  Color get chart1 => _chart1 ?? primary;

  /// Second categorical chart color. Defaults to [primary] hue-rotated 45°.
  Color get chart2 => _chart2 ?? ColorMath.rotateHue(primary, 45);

  /// Third categorical chart color. Defaults to [primary] hue-rotated 135°.
  Color get chart3 => _chart3 ?? ColorMath.rotateHue(primary, 135);

  /// Fourth categorical chart color. Defaults to [primary] hue-rotated 215°.
  Color get chart4 => _chart4 ?? ColorMath.rotateHue(primary, 215);

  /// Fifth categorical chart color. Defaults to [primary] hue-rotated 300°.
  Color get chart5 => _chart5 ?? ColorMath.rotateHue(primary, 300);

  /// Creates a [RefractionColors] palette.
  ///
  /// The base tokens (`primary`, `background`, …) are required — there are no
  /// implicit fallbacks for them, so a custom palette must explicitly opt into
  /// every base semantic role. The extended roles ([primaryHover],
  /// [tertiary], [borderSubtle], [chart1]…) are all optional: leave one out
  /// and its getter derives a sensible default from the base tokens. For most
  /// apps, prefer one of the curated constants ([minimalLight], [fintechDark],
  /// [wellnessLight], …) and use [copyWith] to tweak.
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
    required this.success,
    required this.warning,
    required this.info,
    Color? primaryHover,
    Color? primaryActive,
    Color? primarySoft,
    Color? primarySoftForeground,
    List<Color>? primaryGradient,
    Color? tertiary,
    Color? tertiaryForeground,
    Color? tertiarySoft,
    Color? tertiarySoftForeground,
    Color? placeholder,
    Color? surfaceSubtle,
    Color? borderSubtle,
    Color? positive,
    Color? positiveForeground,
    Color? caution,
    Color? cautionForeground,
    Color? done,
    Color? neutral,
    Color? neutralForeground,
    Color? pending,
    Color? pendingForeground,
    Color? chart1,
    Color? chart2,
    Color? chart3,
    Color? chart4,
    Color? chart5,
  }) : _primaryHover = primaryHover,
       _primaryActive = primaryActive,
       _primarySoft = primarySoft,
       _primarySoftForeground = primarySoftForeground,
       _primaryGradient = primaryGradient,
       _tertiary = tertiary,
       _tertiaryForeground = tertiaryForeground,
       _tertiarySoft = tertiarySoft,
       _tertiarySoftForeground = tertiarySoftForeground,
       _placeholder = placeholder,
       _surfaceSubtle = surfaceSubtle,
       _borderSubtle = borderSubtle,
       _positive = positive,
       _positiveForeground = positiveForeground,
       _caution = caution,
       _cautionForeground = cautionForeground,
       _done = done,
       _neutral = neutral,
       _neutralForeground = neutralForeground,
       _pending = pending,
       _pendingForeground = pendingForeground,
       _chart1 = chart1,
       _chart2 = chart2,
       _chart3 = chart3,
       _chart4 = chart4,
       _chart5 = chart5;

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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF2196F3),
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
    Color? success,
    Color? warning,
    Color? info,
    Color? primaryHover,
    Color? primaryActive,
    Color? primarySoft,
    Color? primarySoftForeground,
    List<Color>? primaryGradient,
    Color? tertiary,
    Color? tertiaryForeground,
    Color? tertiarySoft,
    Color? tertiarySoftForeground,
    Color? placeholder,
    Color? surfaceSubtle,
    Color? borderSubtle,
    Color? positive,
    Color? positiveForeground,
    Color? caution,
    Color? cautionForeground,
    Color? done,
    Color? neutral,
    Color? neutralForeground,
    Color? pending,
    Color? pendingForeground,
    Color? chart1,
    Color? chart2,
    Color? chart3,
    Color? chart4,
    Color? chart5,
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
      success: success ?? this.success,
      warning: warning ?? this.warning,
      info: info ?? this.info,
      // Extended roles preserve their raw override state: passing nothing keeps
      // a role deriving from the base tokens rather than freezing its default.
      primaryHover: primaryHover ?? _primaryHover,
      primaryActive: primaryActive ?? _primaryActive,
      primarySoft: primarySoft ?? _primarySoft,
      primarySoftForeground: primarySoftForeground ?? _primarySoftForeground,
      primaryGradient: primaryGradient ?? _primaryGradient,
      tertiary: tertiary ?? _tertiary,
      tertiaryForeground: tertiaryForeground ?? _tertiaryForeground,
      tertiarySoft: tertiarySoft ?? _tertiarySoft,
      tertiarySoftForeground: tertiarySoftForeground ?? _tertiarySoftForeground,
      placeholder: placeholder ?? _placeholder,
      surfaceSubtle: surfaceSubtle ?? _surfaceSubtle,
      borderSubtle: borderSubtle ?? _borderSubtle,
      positive: positive ?? _positive,
      positiveForeground: positiveForeground ?? _positiveForeground,
      caution: caution ?? _caution,
      cautionForeground: cautionForeground ?? _cautionForeground,
      done: done ?? _done,
      neutral: neutral ?? _neutral,
      neutralForeground: neutralForeground ?? _neutralForeground,
      pending: pending ?? _pending,
      pendingForeground: pendingForeground ?? _pendingForeground,
      chart1: chart1 ?? _chart1,
      chart2: chart2 ?? _chart2,
      chart3: chart3 ?? _chart3,
      chart4: chart4 ?? _chart4,
      chart5: chart5 ?? _chart5,
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
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      info: Color.lerp(info, other.info, t)!,
      // Interpolate the resolved (derived-or-overridden) values so animations
      // stay smooth whether or not a palette overrides an extended role.
      primaryHover: Color.lerp(primaryHover, other.primaryHover, t),
      primaryActive: Color.lerp(primaryActive, other.primaryActive, t),
      primarySoft: Color.lerp(primarySoft, other.primarySoft, t),
      primarySoftForeground: Color.lerp(
        primarySoftForeground,
        other.primarySoftForeground,
        t,
      ),
      primaryGradient: _lerpColorList(
        primaryGradient,
        other.primaryGradient,
        t,
      ),
      tertiary: Color.lerp(tertiary, other.tertiary, t),
      tertiaryForeground: Color.lerp(
        tertiaryForeground,
        other.tertiaryForeground,
        t,
      ),
      tertiarySoft: Color.lerp(tertiarySoft, other.tertiarySoft, t),
      tertiarySoftForeground: Color.lerp(
        tertiarySoftForeground,
        other.tertiarySoftForeground,
        t,
      ),
      placeholder: Color.lerp(placeholder, other.placeholder, t),
      surfaceSubtle: Color.lerp(surfaceSubtle, other.surfaceSubtle, t),
      borderSubtle: Color.lerp(borderSubtle, other.borderSubtle, t),
      positive: Color.lerp(positive, other.positive, t),
      positiveForeground: Color.lerp(
        positiveForeground,
        other.positiveForeground,
        t,
      ),
      caution: Color.lerp(caution, other.caution, t),
      cautionForeground: Color.lerp(
        cautionForeground,
        other.cautionForeground,
        t,
      ),
      done: Color.lerp(done, other.done, t),
      neutral: Color.lerp(neutral, other.neutral, t),
      neutralForeground: Color.lerp(
        neutralForeground,
        other.neutralForeground,
        t,
      ),
      pending: Color.lerp(pending, other.pending, t),
      pendingForeground: Color.lerp(
        pendingForeground,
        other.pendingForeground,
        t,
      ),
      chart1: Color.lerp(chart1, other.chart1, t),
      chart2: Color.lerp(chart2, other.chart2, t),
      chart3: Color.lerp(chart3, other.chart3, t),
      chart4: Color.lerp(chart4, other.chart4, t),
      chart5: Color.lerp(chart5, other.chart5, t),
    );
  }

  /// Interpolates two gradient stop lists. When the lists share a length the
  /// stops are lerped pairwise; otherwise the whole list snaps at the
  /// midpoint (nothing sensible interpolates a 2-stop ramp into a 5-stop one).
  static List<Color> _lerpColorList(List<Color> a, List<Color> b, double t) {
    if (a.length == b.length) {
      return <Color>[
        for (var i = 0; i < a.length; i++) Color.lerp(a[i], b[i], t)!,
      ];
    }
    return t < 0.5 ? a : b;
  }
}
