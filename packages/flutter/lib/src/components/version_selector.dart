import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// An option representing a selectable version.
class RefractionVersionOption {
  /// The underlying value (e.g. 'v1.0.0').
  final String value;

  /// The human-readable label (e.g. 'v1.0.0 (Beta)').
  final String label;

  /// Whether this version is the latest one. If true, displays a 'Latest' badge.
  final bool isLatest;

  const RefractionVersionOption({
    required this.value,
    required this.label,
    this.isLatest = false,
  });
}

/// A themed dropdown specifically designed to display and select software versions.
///
/// `RefractionVersionSelector` is the Flutter sibling of the `VersionSelector`
/// component from the React and Astro Refraction UI packages. It displays the
/// currently selected version and allows the user to select from a list of [versions].
/// It supports displaying a 'Latest' badge next to the appropriate version.
class RefractionVersionSelector extends StatefulWidget {
  /// The options exposed by the dropdown.
  final List<RefractionVersionOption> versions;

  /// The currently selected value, or `null` to show the [placeholder].
  final String? value;

  /// Called with the new value when the user picks a different option.
  final ValueChanged<String>? onChanged;

  /// Text shown when [value] is `null` or no matching version is found.
  final String placeholder;

  /// When `true`, the control is rendered with reduced opacity and ignores taps.
  final bool disabled;

  const RefractionVersionSelector({
    super.key,
    required this.versions,
    this.value,
    this.onChanged,
    this.placeholder = 'Select version...',
    this.disabled = false,
  });

  @override
  State<RefractionVersionSelector> createState() =>
      _RefractionVersionSelectorState();
}

class _RefractionVersionSelectorState extends State<RefractionVersionSelector> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;
  bool _isHovered = false;

  void _togglePopover() {
    if (widget.disabled) return;
    if (_isOpen) {
      _closePopover();
    } else {
      _showPopover();
    }
  }

  void _showPopover() {
    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;

    _overlayEntry = OverlayEntry(
      builder: (context) => _VersionSelectorDropdown(
        layerLink: _layerLink,
        targetSize: size,
        options: widget.versions,
        value: widget.value,
        onClose: _closePopover,
        onSelect: (val) {
          widget.onChanged?.call(val);
          _closePopover();
        },
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

  @override
  void dispose() {
    _closePopover(fromDispose: true);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final backgroundColor = widget.disabled ? colors.muted : colors.background;
    final borderColor = _isOpen || (_isHovered && !widget.disabled)
        ? colors.ring
        : colors.border;

    RefractionVersionOption? selectedOpt;
    if (widget.value != null) {
      final matches = widget.versions.where((v) => v.value == widget.value);
      if (matches.isNotEmpty) {
        selectedOpt = matches.first;
      }
    }

    final displayLabel = selectedOpt?.label ?? widget.placeholder;

    return CompositedTransformTarget(
      link: _layerLink,
      child: Semantics(
        button: true,
        enabled: !widget.disabled,
        expanded: _isOpen,
        child: MouseRegion(
          onEnter: (_) => setState(() => _isHovered = true),
          onExit: (_) => setState(() => _isHovered = false),
          child: GestureDetector(
            onTap: _togglePopover,
            child: Opacity(
              opacity: widget.disabled ? 0.5 : 1.0,
              child: Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: backgroundColor,
                  border: Border.all(color: borderColor),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Text(
                        displayLabel,
                        style: theme.data.textStyle.copyWith(
                          color: colors.foreground,
                          fontSize: 14,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (selectedOpt?.isLatest ?? false) ...[
                      const SizedBox(width: 8),
                      const _LatestBadge(),
                    ],
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
      ),
    );
  }
}

class _VersionSelectorDropdown extends StatelessWidget {
  final LayerLink layerLink;
  final Size targetSize;
  final List<RefractionVersionOption> options;
  final String? value;
  final VoidCallback onClose;
  final ValueChanged<String> onSelect;

  const _VersionSelectorDropdown({
    required this.layerLink,
    required this.targetSize,
    required this.options,
    required this.value,
    required this.onClose,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Stack(
      children: [
        // Invisible dismiss barrier
        GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: onClose,
          child: Container(color: Colors.transparent),
        ),
        Positioned(
          width: targetSize.width > 160 ? targetSize.width : 160,
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
                            children: options.map((opt) {
                              final isSelected = opt.value == value;
                              return InkWell(
                                onTap: () => onSelect(opt.value),
                                hoverColor: colors.accent,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                  color: isSelected
                                      ? colors.accent.withValues(alpha: 0.5)
                                      : null,
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          opt.label,
                                          style: theme.data.textStyle.copyWith(
                                            color: colors.foreground,
                                            fontWeight: isSelected
                                                ? FontWeight.w500
                                                : FontWeight.normal,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                      if (opt.isLatest) ...[
                                        const SizedBox(width: 8),
                                        const _LatestBadge(),
                                      ],
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
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
}

class _LatestBadge extends StatelessWidget {
  const _LatestBadge();

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: colors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(9999),
      ),
      child: Text(
        'Latest',
        style: theme.data.textStyle.copyWith(
          color: colors.primary,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
