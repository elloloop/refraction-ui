import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A themed dropdown for choosing a single value out of a finite set.
///
/// `RefractionSelect` is the Flutter sibling of the `RefractionSelect`
/// component from the React, Angular and Astro Refraction UI packages
/// (a shadcn-equivalent pattern). Internally it wraps Flutter's
/// [DropdownButton] but paints the chrome with [RefractionColors.input],
/// [RefractionColors.background] and [RefractionColors.popover] so it
/// matches the rest of the design system.
///
/// The widget is generic in `T`; supply [items] of [DropdownMenuItem] for
/// the desired value type and bind [value] / [onChanged] in the usual
/// `setState` pattern:
///
/// ```dart
/// String? city = 'sf';
/// RefractionSelect<String>(
///   value: city,
///   placeholder: 'Choose a city',
///   onChanged: (v) => setState(() => city = v),
///   items: const [
///     DropdownMenuItem(value: 'sf', child: Text('San Francisco')),
///     DropdownMenuItem(value: 'nyc', child: Text('New York')),
///     DropdownMenuItem(value: 'tk', child: Text('Tokyo')),
///   ],
/// );
/// ```
///
/// Set [disabled] to `true` to render the control as inactive.
class RefractionSelect<T> extends StatefulWidget {
  /// The options exposed by the dropdown.
  final List<DropdownMenuItem<T>> items;

  /// The currently selected value, or `null` to show the [placeholder].
  final T? value;

  /// Called with the new value when the user picks a different option.
  ///
  /// Set to `null` to render the field as read-only.
  final ValueChanged<T?>? onChanged;

  /// Text shown when [value] is `null`.
  final String? placeholder;

  /// When `true`, the field is rendered with reduced opacity and ignores
  /// taps.
  final bool disabled;

  /// Creates a select dropdown bound to [value] over the given [items].
  const RefractionSelect({
    super.key,
    required this.items,
    this.value,
    this.onChanged,
    this.placeholder,
    this.disabled = false,
  });

  @override
  State<RefractionSelect> createState() => _RefractionSelectState();
}

class _RefractionSelectState<T> extends State<RefractionSelect<T>> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final backgroundColor = widget.disabled ? colors.muted : colors.background;
    final borderColor = _isHovered && !widget.disabled
        ? colors.ring
        : colors.input;

    return Semantics(
      button: true,
      enabled: !widget.disabled,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: Opacity(
          opacity: widget.disabled ? 0.5 : 1.0,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: backgroundColor,
              border: Border.all(color: borderColor),
              borderRadius: BorderRadius.circular(theme.borderRadius),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<T>(
                value: widget.value,
                hint: widget.placeholder != null
                    ? Text(
                        widget.placeholder!,
                        style: TextStyle(
                          color: colors.mutedForeground,
                          fontSize: 14,
                        ),
                      )
                    : null,
                items: widget.items,
                onChanged: widget.disabled ? null : widget.onChanged,
                icon: Icon(Icons.arrow_drop_down, color: colors.foreground),
                isExpanded: true,
                dropdownColor: colors.popover,
                style: TextStyle(color: colors.foreground, fontSize: 14),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
