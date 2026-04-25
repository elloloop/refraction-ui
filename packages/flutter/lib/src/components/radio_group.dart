import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionRadioItem<T> {
  final T value;
  final String label;
  final String? description;
  final bool disabled;

  const RefractionRadioItem({
    required this.value,
    required this.label,
    this.description,
    this.disabled = false,
  });
}

class RefractionRadioGroup<T> extends StatelessWidget {
  final List<RefractionRadioItem<T>> items;
  final T? groupValue;
  final ValueChanged<T?>? onChanged;

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
