import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Represents a single selectable language option.
class LanguageOption {
  /// The unique value of the language.
  final String value;

  /// The human-readable label for the language.
  final String label;

  /// An optional grouping category for the language.
  final String? group;

  /// Creates a [LanguageOption].
  const LanguageOption({required this.value, required this.label, this.group});
}

/// A themed dropdown specifically for selecting languages.
///
/// Mirrors the headless logic and styling of the web `language-selector` component.
/// Supports both single and multiple selection.
class RefractionLanguageSelector extends StatefulWidget {
  /// The available language options to choose from.
  final List<LanguageOption> options;

  /// The currently selected value(s).
  final List<String>? value;

  /// Called when the selection changes.
  final ValueChanged<List<String>>? onChanged;

  /// If true, multiple languages can be selected.
  final bool multiple;

  /// The placeholder text to show when no language is selected.
  final String placeholder;

  /// Creates a [RefractionLanguageSelector].
  const RefractionLanguageSelector({
    super.key,
    required this.options,
    this.value,
    this.onChanged,
    this.multiple = false,
    this.placeholder = 'Select language...',
  });

  @override
  State<RefractionLanguageSelector> createState() =>
      _RefractionLanguageSelectorState();
}

class _RefractionLanguageSelectorState
    extends State<RefractionLanguageSelector> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;
  bool _isHovered = false;

  void _togglePopover() {
    if (_isOpen) {
      _closePopover();
    } else {
      _showPopover();
    }
  }

  void _showPopover() {
    if (_isOpen) return;

    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;
    final theme = RefractionTheme.of(context).data;

    _overlayEntry = OverlayEntry(
      builder: (context) => RefractionTheme(
        data: theme,
        child: _LanguageSelectorDropdown(
          layerLink: _layerLink,
          targetSize: size,
          options: widget.options,
          value: widget.value ?? [],
          multiple: widget.multiple,
          onClose: _closePopover,
          onToggle: _handleToggle,
        ),
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isOpen = true);
  }

  void _closePopover({bool fromDispose = false}) {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted && !fromDispose) {
      setState(() => _isOpen = false);
    } else {
      _isOpen = false;
    }
  }

  void _handleToggle(String val) {
    final currentValues = List<String>.from(widget.value ?? []);

    if (widget.multiple) {
      if (currentValues.contains(val)) {
        currentValues.remove(val);
      } else {
        currentValues.add(val);
      }
      widget.onChanged?.call(currentValues);
    } else {
      widget.onChanged?.call([val]);
      _closePopover();
    }
  }

  @override
  void dispose() {
    _closePopover(fromDispose: true);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final selectedValues = widget.value ?? [];

    String displayLabel = widget.placeholder;
    if (selectedValues.isNotEmpty) {
      final selectedOptions = widget.options
          .where((opt) => selectedValues.contains(opt.value))
          .map((opt) => opt.label)
          .toList();
      if (selectedOptions.isNotEmpty) {
        displayLabel = selectedOptions.join(', ');
      }
    }

    final borderColor = _isOpen || _isHovered ? colors.ring : colors.input;

    return CompositedTransformTarget(
      link: _layerLink,
      child: Semantics(
        button: true,
        expanded: _isOpen,
        child: MouseRegion(
          onEnter: (_) => setState(() => _isHovered = true),
          onExit: (_) => setState(() => _isHovered = false),
          child: GestureDetector(
            onTap: _togglePopover,
            child: Container(
              height: 40,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border.all(color: borderColor),
                borderRadius: BorderRadius.circular(theme.borderRadius),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    displayLabel,
                    style: theme.data.textStyle.copyWith(
                      color: selectedValues.isNotEmpty
                          ? colors.foreground
                          : colors.mutedForeground,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    Icons.arrow_drop_down,
                    color: colors.foreground,
                    size: 20,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _LanguageSelectorDropdown extends StatelessWidget {
  final LayerLink layerLink;
  final Size targetSize;
  final List<LanguageOption> options;
  final List<String> value;
  final bool multiple;
  final VoidCallback onClose;
  final ValueChanged<String> onToggle;

  const _LanguageSelectorDropdown({
    required this.layerLink,
    required this.targetSize,
    required this.options,
    required this.value,
    required this.multiple,
    required this.onClose,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    // Group options
    final Map<String, List<LanguageOption>> grouped = {};
    final List<LanguageOption> ungrouped = [];

    for (final opt in options) {
      if (opt.group != null && opt.group!.isNotEmpty) {
        grouped.putIfAbsent(opt.group!, () => []).add(opt);
      } else {
        ungrouped.add(opt);
      }
    }

    return Stack(
      children: [
        // Invisible dismiss barrier
        GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: onClose,
          child: Container(color: Colors.transparent),
        ),
        Positioned(
          width: targetSize.width > 200 ? targetSize.width : 200,
          child: CompositedTransformFollower(
            link: layerLink,
            showWhenUnlinked: false,
            offset: Offset(0, targetSize.height + 4),
            child: Material(
              color: Colors.transparent,
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 150),
                curve: Curves.easeOutCubic,
                tween: Tween(begin: 0.95, end: 1.0),
                builder: (context, scale, child) {
                  return Transform.scale(
                    scale: scale,
                    alignment: Alignment.topCenter,
                    child: Opacity(
                      opacity: ((scale - 0.95) * 20).clamp(0.0, 1.0),
                      child: Container(
                        constraints: const BoxConstraints(maxHeight: 240),
                        decoration: BoxDecoration(
                          color: colors.popover,
                          borderRadius: BorderRadius.circular(
                            theme.borderRadius,
                          ),
                          border: Border.all(color: colors.border),
                          boxShadow: theme.data.heavyShadow,
                        ),
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              for (final entry in grouped.entries) ...[
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                  child: Text(
                                    entry.key.toUpperCase(),
                                    style: theme.data.textStyle.copyWith(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: colors.mutedForeground,
                                    ),
                                  ),
                                ),
                                ...entry.value.map(
                                  (opt) => _buildOption(context, opt),
                                ),
                              ],
                              if (ungrouped.isNotEmpty)
                                ...ungrouped.map(
                                  (opt) => _buildOption(context, opt),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOption(BuildContext context, LanguageOption opt) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final isSelected = value.contains(opt.value);

    return InkWell(
      onTap: () => onToggle(opt.value),
      hoverColor: colors.accent,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        color: isSelected ? colors.accent.withValues(alpha: 0.5) : null,
        child: Row(
          children: [
            if (isSelected)
              Icon(Icons.check, size: 16, color: colors.foreground)
            else
              const SizedBox(width: 16),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                opt.label,
                style: theme.data.textStyle.copyWith(
                  color: colors.foreground,
                  fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
