import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

abstract class RefractionDropdownEntry {
  const RefractionDropdownEntry();
  
  List<Widget> build(BuildContext context);
}

class RefractionDropdownItem extends RefractionDropdownEntry {
  final Widget? icon;
  final String label;
  final String? shortcut;
  final bool disabled;
  final VoidCallback? onSelected;

  const RefractionDropdownItem({
    this.icon,
    required this.label,
    this.shortcut,
    this.disabled = false,
    this.onSelected,
  });

  @override
  List<Widget> build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    
    return [
      MenuItemButton(
        onPressed: disabled ? null : onSelected,
        leadingIcon: icon != null 
            ? IconTheme(
                data: IconThemeData(
                  color: disabled ? theme.colors.mutedForeground : theme.colors.foreground,
                  size: 16,
                ),
                child: icon!,
              )
            : null,
        trailingIcon: shortcut != null 
            ? Text(
                shortcut!,
                style: theme.textStyle.copyWith(
                  color: theme.colors.mutedForeground,
                  fontSize: 12,
                ),
              )
            : null,
        style: MenuItemButton.styleFrom(
          foregroundColor: disabled ? theme.colors.mutedForeground : theme.colors.foreground,
          textStyle: theme.textStyle.copyWith(
            fontSize: 14,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ).copyWith(
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.hovered) && !disabled) {
              return theme.colors.accent;
            }
            if (states.contains(WidgetState.focused) && !disabled) {
              return theme.colors.accent;
            }
            return Colors.transparent;
          }),
        ),
        child: Text(label),
      )
    ];
  }
}

class RefractionDropdownDivider extends RefractionDropdownEntry {
  const RefractionDropdownDivider();

  @override
  List<Widget> build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    return [
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Divider(
          height: 1,
          thickness: 1,
          color: theme.colors.border,
        ),
      )
    ];
  }
}

class RefractionDropdownGroup extends RefractionDropdownEntry {
  final String label;
  final List<RefractionDropdownEntry> children;

  const RefractionDropdownGroup({
    required this.label,
    required this.children,
  });

  @override
  List<Widget> build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    return [
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Text(
          label,
          style: theme.textStyle.copyWith(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: theme.colors.mutedForeground,
          ),
        ),
      ),
      ...children.expand((e) => e.build(context)),
    ];
  }
}

class RefractionDropdownSubmenu extends RefractionDropdownEntry {
  final Widget? icon;
  final String label;
  final bool disabled;
  final List<RefractionDropdownEntry> children;

  const RefractionDropdownSubmenu({
    this.icon,
    required this.label,
    this.disabled = false,
    required this.children,
  });

  @override
  List<Widget> build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    
    return [
      SubmenuButton(
        menuChildren: disabled ? [] : children.expand((e) => e.build(context)).toList(),
        leadingIcon: icon != null 
            ? IconTheme(
                data: IconThemeData(
                  color: disabled ? theme.colors.mutedForeground : theme.colors.foreground,
                  size: 16,
                ),
                child: icon!,
              )
            : null,
        style: SubmenuButton.styleFrom(
          foregroundColor: disabled ? theme.colors.mutedForeground : theme.colors.foreground,
          textStyle: theme.textStyle.copyWith(
            fontSize: 14,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ).copyWith(
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.hovered) && !disabled) {
              return theme.colors.accent;
            }
            if (states.contains(WidgetState.focused) && !disabled) {
              return theme.colors.accent;
            }
            return Colors.transparent;
          }),
        ),
        child: Text(label),
      )
    ];
  }
}

class RefractionDropdownMenu extends StatelessWidget {
  final Widget trigger;
  final List<RefractionDropdownEntry> items;
  final double width;
  final AlignmentOffset? alignmentOffset;
  final bool closeOnTriggerTap;

  const RefractionDropdownMenu({
    super.key,
    required this.trigger,
    required this.items,
    this.width = 220,
    this.alignmentOffset,
    this.closeOnTriggerTap = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    return Theme(
      data: Theme.of(context).copyWith(
        menuTheme: MenuThemeData(
          style: MenuStyle(
            backgroundColor: WidgetStatePropertyAll(theme.colors.background),
            elevation: const WidgetStatePropertyAll(4),
            shape: WidgetStatePropertyAll(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(theme.borderRadius),
                side: BorderSide(color: theme.colors.border),
              ),
            ),
            padding: const WidgetStatePropertyAll(EdgeInsets.symmetric(vertical: 4)),
            minimumSize: WidgetStatePropertyAll(Size(width, 0)),
          ),
        ),
      ),
      child: MenuAnchor(
        alignmentOffset: alignmentOffset?.offset ?? Offset.zero,
        menuChildren: items.expand((e) => e.build(context)).toList(),
        builder: (context, controller, child) {
          return GestureDetector(
            onTap: () {
              if (controller.isOpen) {
                if (closeOnTriggerTap) controller.close();
              } else {
                controller.open();
              }
            },
            child: trigger,
          );
        },
      ),
    );
  }
}

class AlignmentOffset {
  final Offset offset;
  const AlignmentOffset(this.offset);
}
