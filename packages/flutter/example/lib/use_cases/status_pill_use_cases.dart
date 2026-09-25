import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

/// A work-tracking status vocabulary, mapped onto the semantic status types.
const List<(String, RefractionStatusType)> _statuses = [
  ('Not started', RefractionStatusType.neutral),
  ('Working on it', RefractionStatusType.pending),
  ('Stuck', RefractionStatusType.error),
  ('In review', RefractionStatusType.info),
  ('Done', RefractionStatusType.success),
];

@widgetbook.UseCase(name: 'Variants', type: RefractionStatusPill)
Widget statusPillVariantsUseCase(BuildContext context) {
  final theme = RefractionTheme.of(context).data;
  Widget row(String title, List<Widget> children) => Padding(
    padding: const EdgeInsets.only(bottom: 20),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textStyle.copyWith(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: theme.colors.foreground,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(spacing: 8, runSpacing: 8, children: children),
      ],
    ),
  );

  return SingleChildScrollView(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        row('Solid', [
          for (final (label, type) in _statuses)
            RefractionStatusPill(label: label, type: type),
        ]),
        row('Soft', [
          for (final (label, type) in _statuses)
            RefractionStatusPill(
              label: label,
              type: type,
              variant: RefractionStatusPillVariant.soft,
            ),
        ]),
        row('Small', [
          for (final (label, type) in _statuses)
            RefractionStatusPill(
              label: label,
              type: type,
              size: RefractionStatusPillSize.sm,
            ),
        ]),
        row('Custom colour + icon', const [
          RefractionStatusPill(
            label: 'Blocked by legal',
            color: Color(0xFF7C3AED),
            icon: Icons.gavel_rounded,
          ),
          RefractionStatusPill(
            label: 'Waiting on customer',
            color: Color(0xFF0EA5E9),
            variant: RefractionStatusPillVariant.soft,
          ),
        ]),
        row('Table cell (expand)', [
          for (final (label, type) in _statuses.take(3))
            SizedBox(
              width: 140,
              child: RefractionStatusPill(
                label: label,
                type: type,
                expand: true,
              ),
            ),
        ]),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Interactive', type: RefractionStatusPill)
Widget statusPillInteractiveUseCase(BuildContext context) {
  return const Center(child: _CyclingPill());
}

/// Clicking (or Enter/Space) advances the status — in an app this would open
/// a status menu; cycling keeps the demo self-contained.
class _CyclingPill extends StatefulWidget {
  const _CyclingPill();

  @override
  State<_CyclingPill> createState() => _CyclingPillState();
}

class _CyclingPillState extends State<_CyclingPill> {
  int _index = 1;

  @override
  Widget build(BuildContext context) {
    final (label, type) = _statuses[_index];
    return SizedBox(
      width: 160,
      child: RefractionStatusPill(
        label: label,
        type: type,
        expand: true,
        semanticLabel: 'Status: $label',
        onPressed: () =>
            setState(() => _index = (_index + 1) % _statuses.length),
      ),
    );
  }
}
