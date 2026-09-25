import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

/// Every keyboard-reachable control in one row, so Tab walks through them
/// and the focus ring can be checked in both themes.
@widgetbook.UseCase(name: 'Keyboard focus', type: RefractionPressable)
Widget keyboardFocus(BuildContext context) {
  return const _KeyboardFocusDemo();
}

class _KeyboardFocusDemo extends StatefulWidget {
  const _KeyboardFocusDemo();

  @override
  State<_KeyboardFocusDemo> createState() => _KeyboardFocusDemoState();
}

class _KeyboardFocusDemoState extends State<_KeyboardFocusDemo> {
  bool _muted = false;
  bool _notify = true;
  String _density = 'comfortable';

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    return Padding(
      padding: EdgeInsets.all(theme.spacingXl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Press Tab — every control shows the focus ring; Enter / Space activate.',
            style: theme.textStyle.copyWith(
              fontSize: 13,
              color: theme.colors.mutedForeground,
            ),
          ),
          SizedBox(height: theme.spacingLg),
          Wrap(
            spacing: theme.spacingMd,
            runSpacing: theme.spacingMd,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              RefractionButton(
                autofocus: true,
                onPressed: () {},
                child: const Text('Send'),
              ),
              RefractionButton(
                variant: RefractionButtonVariant.outline,
                onPressed: () {},
                child: const Text('Cancel'),
              ),
              RefractionButton(
                variant: RefractionButtonVariant.ghost,
                size: RefractionButtonSize.icon,
                semanticLabel: 'Delete message',
                onPressed: () {},
                child: const Icon(Icons.delete_outline, size: 18),
              ),
              const RefractionButton(onPressed: null, child: Text('Disabled')),
            ],
          ),
          SizedBox(height: theme.spacingLg),
          Wrap(
            spacing: theme.spacingXl,
            runSpacing: theme.spacingMd,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              _labelled(
                theme,
                RefractionCheckbox(
                  value: _muted,
                  semanticLabel: 'Mute channel',
                  onChanged: (v) => setState(() => _muted = v ?? false),
                ),
                'Mute channel',
              ),
              _labelled(
                theme,
                RefractionSwitch(
                  value: _notify,
                  semanticLabel: 'Notifications',
                  onChanged: (v) => setState(() => _notify = v),
                ),
                'Notifications',
              ),
              for (final d in const ['compact', 'comfortable'])
                _labelled(
                  theme,
                  RefractionRadio<String>(
                    value: d,
                    groupValue: _density,
                    semanticLabel: d,
                    onChanged: (v) => setState(() => _density = v ?? d),
                  ),
                  d,
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _labelled(RefractionThemeData theme, Widget control, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        control,
        SizedBox(width: theme.spacingSm),
        ExcludeSemantics(
          child: Text(label, style: theme.textStyle.copyWith(fontSize: 14)),
        ),
      ],
    );
  }
}
