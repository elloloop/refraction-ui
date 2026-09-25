import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

/// Gallery-only preview of the accessible color roles: every text-bearing
/// role on the surface it is meant for, with its measured WCAG ratio.
class AccessibleTokensPreview extends StatelessWidget {
  const AccessibleTokensPreview({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final c = theme.colors;
    final swatches = <_Swatch>[
      _Swatch('success', c.successForeground, c.success),
      _Swatch('warning', c.warningForeground, c.warning),
      _Swatch('info', c.infoForeground, c.info),
      _Swatch('destructive', c.destructiveForeground, c.destructive),
      _Swatch('successSoft', c.successSoftForeground, c.successSoft),
      _Swatch('warningSoft', c.warningSoftForeground, c.warningSoft),
      _Swatch('infoSoft', c.infoSoftForeground, c.infoSoft),
      _Swatch(
        'destructiveSoft',
        c.destructiveSoftForeground,
        c.destructiveSoft,
      ),
      _Swatch('mention', c.mentionForeground, c.mention),
      _Swatch('mentionSelf', c.mentionSelfForeground, c.mentionSelf),
      _Swatch('highlight', c.highlightForeground, c.highlight),
      _Swatch('selection', c.selectionForeground, c.selection),
      _Swatch('surfaceSunken', c.foreground, c.surfaceSunken),
      _Swatch('surfaceRaised', c.cardForeground, c.surfaceRaised),
      _Swatch('surfaceOverlay', c.popoverForeground, c.surfaceOverlay),
    ];

    return SingleChildScrollView(
      padding: EdgeInsets.all(theme.spacingLg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Accessible roles',
            style: theme.textStyle.copyWith(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: theme.spacingMd),
          Wrap(
            spacing: theme.spacingSm,
            runSpacing: theme.spacingSm,
            children: [for (final s in swatches) s],
          ),
          SizedBox(height: theme.spacingXl),
          Text.rich(
            TextSpan(
              style: theme.textStyle.copyWith(fontSize: 14),
              children: [
                const TextSpan(text: 'Ping '),
                _mentionSpan('@priya', c.mention, c.mentionForeground),
                const TextSpan(text: ' and '),
                _mentionSpan('@you', c.mentionSelf, c.mentionSelfForeground),
                const TextSpan(text: ' about the release.'),
              ],
            ),
          ),
          SizedBox(height: theme.spacingXl),
          Row(
            children: [
              RefractionFocusRing(
                visible: true,
                borderRadius: BorderRadius.circular(theme.radiusMd),
                child: RefractionButton(
                  onPressed: () {},
                  child: const Text('Focused'),
                ),
              ),
              SizedBox(width: theme.spacingLg),
              Text(
                'focusRing ${RefractionContrast.ratio(c.focusRing, c.background).toStringAsFixed(2)}:1',
                style: theme.textStyle.copyWith(
                  fontSize: 12,
                  color: c.mutedForeground,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  static WidgetSpan _mentionSpan(String text, Color bg, Color fg) {
    return WidgetSpan(
      alignment: PlaceholderAlignment.middle,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          text,
          style: TextStyle(color: fg, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}

class _Swatch extends StatelessWidget {
  final String name;
  final Color fg;
  final Color bg;

  const _Swatch(this.name, this.fg, this.bg);

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final ratio = RefractionContrast.ratio(fg, bg);
    final pass = ratio >= RefractionContrast.aaText;
    return Container(
      width: 168,
      padding: EdgeInsets.all(theme.spacingMd),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(theme.radiusMd),
        border: Border.all(color: theme.colors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            name,
            style: TextStyle(
              color: fg,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '${ratio.toStringAsFixed(2)}:1 ${pass ? 'AA' : 'fails AA'}',
            style: TextStyle(color: fg, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

@widgetbook.UseCase(name: 'Accessible roles', type: AccessibleTokensPreview)
Widget accessibleTokens(BuildContext context) {
  return const AccessibleTokensPreview();
}
