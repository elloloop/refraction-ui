import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single option offered by a [RefractionRadioGroup].
///
/// Each item carries a strongly typed [value] (the value reported via the
/// group's `onChanged` callback when this item is selected) plus
/// presentation metadata.
///
/// ```dart
/// const RefractionRadioItem<String>(
///   value: 'monthly',
///   label: 'Monthly',
///   description: r'$10 per month, cancel any time.',
/// );
/// ```
class RefractionRadioItem<T> {
  /// The value associated with this radio item.
  ///
  /// Reported via [RefractionRadioGroup.onChanged] when selected and
  /// compared against [RefractionRadioGroup.groupValue] to determine the
  /// selected state.
  final T value;

  /// Primary text shown next to the radio circle.
  final String label;

  /// Optional secondary text shown beneath [label] in
  /// [RefractionColors.mutedForeground].
  final String? description;

  /// When `true`, the option cannot be selected and is rendered with
  /// reduced opacity.
  final bool disabled;

  /// Creates an immutable description of a radio option.
  const RefractionRadioItem({
    required this.value,
    required this.label,
    this.description,
    this.disabled = false,
  });
}

/// A vertically stacked group of radio buttons that share a single value.
///
/// `RefractionRadioGroup` is the Flutter analogue of the
/// `RefractionRadioGroup` component from the React, Angular and Astro
/// Refraction UI packages (a shadcn-equivalent pattern). Selection is
/// driven by [groupValue] — the item whose [RefractionRadioItem.value]
/// equals this is rendered as selected.
///
/// The widget is generic in `T`, allowing strongly typed values such as
/// enums or domain models to flow through unchanged.
///
/// ```dart
/// enum Plan { monthly, yearly }
///
/// Plan plan = Plan.monthly;
/// RefractionRadioGroup<Plan>(
///   groupValue: plan,
///   onChanged: (next) => setState(() => plan = next!),
///   items: const [
///     RefractionRadioItem(value: Plan.monthly, label: 'Monthly'),
///     RefractionRadioItem(
///       value: Plan.yearly,
///       label: 'Yearly',
///       description: 'Save 20%',
///     ),
///   ],
/// );
/// ```
///
/// See also:
///
///  * [RefractionRadioItem], the data type accepted by [items].
class RefractionRadioGroup<T> extends StatelessWidget {
  /// The options to render, in order.
  final List<RefractionRadioItem<T>> items;

  /// The currently selected value.
  ///
  /// May be `null` to indicate that no option is selected.
  final T? groupValue;

  /// Called with the new value when the user picks a different option.
  ///
  /// Set to `null` to render the entire group as read-only.
  final ValueChanged<T?>? onChanged;

  /// Creates a radio group with the supplied [items].
  const RefractionRadioGroup({
    super.key,
    required this.items,
    required this.groupValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.map((item) {
        return _RadioItemView<T>(
          item: item,
          isSelected: item.value == groupValue,
          onChanged: onChanged,
        );
      }).toList(),
    );
  }
}

class _RadioItemView<T> extends StatelessWidget {
  final RefractionRadioItem<T> item;
  final bool isSelected;
  final ValueChanged<T?>? onChanged;

  const _RadioItemView({
    required this.item,
    required this.isSelected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final isDisabled = item.disabled || onChanged == null;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: GestureDetector(
        onTap: isDisabled ? null : () => onChanged!(item.value),
        behavior: HitTestBehavior.opaque,
        child: Opacity(
          opacity: isDisabled ? 0.5 : 1.0,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                margin: const EdgeInsets.only(top: 2.0),
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected ? theme.colors.primary : Colors.transparent,
                  border: Border.all(
                    color: isSelected ? theme.colors.primary : theme.colors.border,
                    width: 1.5,
                  ),
                ),
                child: isSelected
                    ? Center(
                        child: Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: theme.colors.primaryForeground,
                          ),
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.label,
                      style: theme.textStyle.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: theme.colors.foreground,
                      ),
                    ),
                    if (item.description != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        item.description!,
                        style: theme.textStyle.copyWith(
                          fontSize: 14,
                          color: theme.colors.mutedForeground,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
