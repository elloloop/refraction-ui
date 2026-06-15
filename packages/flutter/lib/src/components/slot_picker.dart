import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single day chip shown in the day-selector row.
class SlotDay {
  /// Unique identifier for the day (e.g. "2024-06-14").
  final String id;

  /// Short weekday label (e.g. "Fri").
  final String weekday;

  /// Day-of-month label (e.g. "14" or 14).
  final dynamic dayNum;

  const SlotDay({
    required this.id,
    required this.weekday,
    required this.dayNum,
  });
}

/// The currently-selected day + time slot pair.
class SlotSelection {
  /// The `id` of the selected day.
  final String dayId;

  /// The selected time slot string (e.g. "10:00 AM").
  final String slot;

  const SlotSelection({
    required this.dayId,
    required this.slot,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SlotSelection &&
          runtimeType == other.runtimeType &&
          dayId == other.dayId &&
          slot == other.slot;

  @override
  int get hashCode => dayId.hashCode ^ slot.hashCode;
}

/// A Calendly-style day + time-slot booking picker.
class RefractionSlotPicker extends StatefulWidget {
  /// The list of days to show as chips.
  final List<SlotDay> days;

  /// Map of dayId -> available time slot strings.
  final Map<String, List<String>> slotsByDay;

  /// Controlled selection value.
  final SlotSelection? value;

  /// Initial selection for uncontrolled usage.
  final SlotSelection? defaultValue;

  /// Called when the user picks a day + slot.
  final void Function(SlotSelection)? onChange;

  /// Label shown beside the "Pick a time" heading (e.g. "Eastern Time").
  final String? timezoneLabel;

  /// Slot strings that should be rendered as disabled.
  final List<String> disabledSlots;

  const RefractionSlotPicker({
    super.key,
    required this.days,
    required this.slotsByDay,
    this.value,
    this.defaultValue,
    this.onChange,
    this.timezoneLabel,
    this.disabledSlots = const [],
  });

  @override
  State<RefractionSlotPicker> createState() => _RefractionSlotPickerState();
}

class _RefractionSlotPickerState extends State<RefractionSlotPicker> {
  SlotSelection? _internalSelection;

  @override
  void initState() {
    super.initState();
    _internalSelection = widget.defaultValue;
  }

  SlotSelection? get _effectiveSelection =>
      widget.value != null ? widget.value : _internalSelection;

  void _handleDaySelect(String dayId) {
    final slots = widget.slotsByDay[dayId] ?? [];
    final currentSelection = _effectiveSelection;

    // Keep the slot only if it's still available on the new day.
    final keepSlot = (currentSelection != null &&
            currentSelection.slot.isNotEmpty &&
            slots.contains(currentSelection.slot))
        ? currentSelection.slot
        : null;

    final next = keepSlot != null
        ? SlotSelection(dayId: dayId, slot: keepSlot)
        : SlotSelection(dayId: dayId, slot: '');

    if (widget.value == null) {
      setState(() {
        _internalSelection = next;
      });
    }
    widget.onChange?.call(next);
  }

  void _handleSlotSelect(String slot) {
    final selectedDayId = _effectiveSelection?.dayId;
    if (selectedDayId == null) return;

    final next = SlotSelection(dayId: selectedDayId, slot: slot);

    if (widget.value == null) {
      setState(() {
        _internalSelection = next;
      });
    }
    widget.onChange?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final currentSelection = _effectiveSelection;
    final selectedDayId = currentSelection?.dayId;
    final currentSlots = selectedDayId != null ? (widget.slotsByDay[selectedDayId] ?? []) : <String>[];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Section: Pick a day
        Text(
          'Pick a day',
          style: theme.textStyle.copyWith(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: colors.foreground,
          ),
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: widget.days.map((day) {
              final isSelected = selectedDayId == day.id;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: InkWell(
                  onTap: () => _handleDaySelect(day.id),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    constraints: const BoxConstraints(minWidth: 56),
                    decoration: BoxDecoration(
                      color: isSelected ? colors.primary : colors.card,
                      borderRadius: BorderRadius.circular(theme.borderRadius),
                      border: Border.all(
                        color: isSelected ? colors.primary : colors.border,
                      ),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          day.weekday,
                          style: theme.textStyle.copyWith(
                            fontSize: 12,
                            color: isSelected ? colors.primaryForeground : colors.mutedForeground,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${day.dayNum}',
                          style: theme.textStyle.copyWith(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? colors.primaryForeground : colors.foreground,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        if (selectedDayId != null && currentSlots.isNotEmpty) ...[
          const SizedBox(height: 20),
          // Section: Pick a time
          Row(
            children: [
              Text(
                'Pick a time',
                style: theme.textStyle.copyWith(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: colors.foreground,
                ),
              ),
              if (widget.timezoneLabel != null) ...[
                const SizedBox(width: 8),
                Text(
                  widget.timezoneLabel!,
                  style: theme.textStyle.copyWith(
                    fontSize: 12,
                    color: colors.mutedForeground,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: 2.5,
            ),
            itemCount: currentSlots.length,
            itemBuilder: (context, index) {
              final slot = currentSlots[index];
              final isSelected = currentSelection?.slot == slot;
              final isDisabled = widget.disabledSlots.contains(slot);

              return Opacity(
                opacity: isDisabled ? 0.4 : 1.0,
                child: InkWell(
                  onTap: isDisabled ? null : () => _handleSlotSelect(slot),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isSelected ? colors.primary : colors.card,
                      borderRadius: BorderRadius.circular(theme.borderRadius),
                      border: Border.all(
                        color: isSelected ? colors.primary : colors.border,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      slot,
                      style: theme.textStyle.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: isSelected ? colors.primaryForeground : colors.foreground,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ],
    );
  }
}
