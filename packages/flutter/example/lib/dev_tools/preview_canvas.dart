import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

enum PreviewSize { mobile, tablet, desktop, fluid }

class PreviewCanvas extends StatefulWidget {
  final Widget child;
  final String title;
  final String? description;
  final bool fill;

  const PreviewCanvas({
    super.key,
    required this.child,
    required this.title,
    this.description,
    this.fill = false,
  });

  @override
  State<PreviewCanvas> createState() => _PreviewCanvasState();
}

class _PreviewCanvasState extends State<PreviewCanvas> {
  PreviewSize _currentSize = PreviewSize.desktop;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.title,
          style: theme.textStyle.copyWith(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        if (widget.description != null) ...[
          const SizedBox(height: 8),
          Text(
            widget.description!,
            style: theme.textStyle.copyWith(
              fontSize: 16,
              color: colors.mutedForeground,
            ),
          ),
        ],
        const SizedBox(height: 24),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: colors.border),
            borderRadius: BorderRadius.circular(theme.borderRadius),
            color: colors.card,
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              // Top Control Bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: colors.border)),
                  color: colors.background,
                ),
                child: Row(
                  children: [
                    _buildDeviceButton(theme, Icons.phone_iphone, PreviewSize.mobile),
                    const SizedBox(width: 8),
                    _buildDeviceButton(theme, Icons.tablet_mac, PreviewSize.tablet),
                    const SizedBox(width: 8),
                    _buildDeviceButton(theme, Icons.desktop_mac, PreviewSize.desktop),
                    const SizedBox(width: 8),
                    _buildDeviceButton(theme, Icons.aspect_ratio, PreviewSize.fluid),
                  ],
                ),
              ),
              // Canvas Area
              Container(
                width: double.infinity,
                padding: widget.fill ? EdgeInsets.zero : const EdgeInsets.all(32),
                color: colors.secondary.withValues(alpha: 0.3), // Light subtle background
                alignment: Alignment.center,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Container(
                    width: _getCanvasWidth(),
                    height: widget.fill ? 600 : null,
                    decoration: BoxDecoration(
                      color: colors.background,
                      border: Border.all(color: colors.border),
                      borderRadius: BorderRadius.circular(
                          _currentSize == PreviewSize.fluid ? 0 : theme.borderRadius),
                      boxShadow: _currentSize == PreviewSize.fluid ? null : theme.heavyShadow,
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: widget.fill
                        ? widget.child
                        : Padding(
                            padding: const EdgeInsets.all(32.0),
                            child: widget.child,
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  double? _getCanvasWidth() {
    switch (_currentSize) {
      case PreviewSize.mobile:
        return 375.0;
      case PreviewSize.tablet:
        return 768.0;
      case PreviewSize.desktop:
        return 1024.0;
      case PreviewSize.fluid:
        return double.infinity;
    }
  }

  Widget _buildDeviceButton(RefractionThemeData theme, IconData icon, PreviewSize targetSize) {
    final colors = theme.colors;
    final isSelected = _currentSize == targetSize;

    return InkWell(
      onTap: () => setState(() => _currentSize = targetSize),
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: isSelected ? colors.primary.withValues(alpha: 0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Icon(
          icon,
          size: 18,
          color: isSelected ? colors.primary : colors.mutedForeground,
        ),
      ),
    );
  }
}
