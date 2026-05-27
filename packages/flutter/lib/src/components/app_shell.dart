import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A comprehensive layout shell for Refraction UI applications.
///
/// `RefractionAppShell` implements a standard application frame comprising a
/// [header], [footer], [leftSidebar], [rightSidebar], and main [content].
///
/// On viewports wider than [mobileBreakpoint], the sidebars are displayed
/// persistently alongside the content. On narrower viewports, they collapse
/// into off-canvas drawers that slide in when toggled.
///
/// Example:
/// ```dart
/// RefractionAppShell(
///   header: RefractionNavbar(...),
///   leftSidebar: RefractionSidebar(...),
///   content: const Center(child: Text('Main Content')),
/// )
/// ```
class RefractionAppShell extends StatefulWidget {
  /// The widget displayed at the top of the application shell.
  final Widget? header;

  /// The widget displayed at the bottom of the application shell.
  final Widget? footer;

  /// The widget displayed on the left side of the screen.
  final Widget? leftSidebar;

  /// The widget displayed on the right side of the screen.
  final Widget? rightSidebar;

  /// The primary content area of the application.
  final Widget content;

  /// The viewport width at which sidebars collapse into drawers.
  final double mobileBreakpoint;

  /// Whether the left sidebar drawer is open on mobile viewports.
  final bool isLeftSidebarOpen;

  /// Callback invoked when the left sidebar drawer's open state changes.
  final ValueChanged<bool>? onLeftSidebarOpenChanged;

  /// Whether the right sidebar drawer is open on mobile viewports.
  final bool isRightSidebarOpen;

  /// Callback invoked when the right sidebar drawer's open state changes.
  final ValueChanged<bool>? onRightSidebarOpenChanged;

  /// The width of the left sidebar.
  final double leftSidebarWidth;

  /// The width of the right sidebar.
  final double rightSidebarWidth;

  /// Creates a responsive application shell.
  const RefractionAppShell({
    super.key,
    this.header,
    this.footer,
    this.leftSidebar,
    this.rightSidebar,
    required this.content,
    this.mobileBreakpoint = 768.0,
    this.isLeftSidebarOpen = false,
    this.onLeftSidebarOpenChanged,
    this.isRightSidebarOpen = false,
    this.onRightSidebarOpenChanged,
    this.leftSidebarWidth = 280.0,
    this.rightSidebarWidth = 280.0,
  });

  /// Retrieves the nearest [RefractionAppShellState] from the given [context].
  static RefractionAppShellState? of(BuildContext context) {
    return context.findAncestorStateOfType<RefractionAppShellState>();
  }

  @override
  State<RefractionAppShell> createState() => RefractionAppShellState();
}

class RefractionAppShellState extends State<RefractionAppShell> {
  late bool _internalLeftOpen;
  late bool _internalRightOpen;

  @override
  void initState() {
    super.initState();
    _internalLeftOpen = widget.isLeftSidebarOpen;
    _internalRightOpen = widget.isRightSidebarOpen;
  }

  @override
  void didUpdateWidget(RefractionAppShell oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isLeftSidebarOpen != oldWidget.isLeftSidebarOpen) {
      _internalLeftOpen = widget.isLeftSidebarOpen;
    }
    if (widget.isRightSidebarOpen != oldWidget.isRightSidebarOpen) {
      _internalRightOpen = widget.isRightSidebarOpen;
    }
  }

  /// Toggles the left sidebar drawer on mobile viewports.
  void toggleLeftSidebar() {
    final newState = !_internalLeftOpen;
    if (widget.onLeftSidebarOpenChanged != null) {
      widget.onLeftSidebarOpenChanged!(newState);
    } else {
      setState(() => _internalLeftOpen = newState);
    }
  }

  /// Toggles the right sidebar drawer on mobile viewports.
  void toggleRightSidebar() {
    final newState = !_internalRightOpen;
    if (widget.onRightSidebarOpenChanged != null) {
      widget.onRightSidebarOpenChanged!(newState);
    } else {
      setState(() => _internalRightOpen = newState);
    }
  }

  /// Closes both sidebars.
  void closeSidebars() {
    if (widget.onLeftSidebarOpenChanged != null && _internalLeftOpen) {
      widget.onLeftSidebarOpenChanged!(false);
    } else {
      setState(() => _internalLeftOpen = false);
    }

    if (widget.onRightSidebarOpenChanged != null && _internalRightOpen) {
      widget.onRightSidebarOpenChanged!(false);
    } else {
      setState(() => _internalRightOpen = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < widget.mobileBreakpoint;
        final showLeftOverlay = isMobile && _internalLeftOpen;
        final showRightOverlay = isMobile && _internalRightOpen;
        final showOverlay = showLeftOverlay || showRightOverlay;

        return Container(
          color: theme.colors.background,
          child: Stack(
            children: [
              // Main Layout
              Column(
                children: [
                  if (widget.header != null) widget.header!,
                  Expanded(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (!isMobile && widget.leftSidebar != null)
                          SizedBox(
                            width: widget.leftSidebarWidth,
                            child: widget.leftSidebar!,
                          ),
                        Expanded(child: widget.content),
                        if (!isMobile && widget.rightSidebar != null)
                          SizedBox(
                            width: widget.rightSidebarWidth,
                            child: widget.rightSidebar!,
                          ),
                      ],
                    ),
                  ),
                  if (widget.footer != null) widget.footer!,
                ],
              ),

              // Mobile Overlay
              if (isMobile)
                Positioned.fill(
                  child: IgnorePointer(
                    ignoring: !showOverlay,
                    child: AnimatedOpacity(
                      duration: const Duration(milliseconds: 200),
                      opacity: showOverlay ? 1.0 : 0.0,
                      child: GestureDetector(
                        onTap: closeSidebars,
                        child: Container(
                          color: Colors.black.withValues(alpha: 0.5),
                        ),
                      ),
                    ),
                  ),
                ),

              // Mobile Left Sidebar Drawer
              if (isMobile && widget.leftSidebar != null)
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeInOut,
                  top: 0,
                  bottom: 0,
                  left: _internalLeftOpen ? 0 : -widget.leftSidebarWidth,
                  width: widget.leftSidebarWidth,
                  child: Material(
                    color: theme.colors.background,
                    elevation: _internalLeftOpen ? 16 : 0,
                    child: widget.leftSidebar!,
                  ),
                ),

              // Mobile Right Sidebar Drawer
              if (isMobile && widget.rightSidebar != null)
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeInOut,
                  top: 0,
                  bottom: 0,
                  right: _internalRightOpen ? 0 : -widget.rightSidebarWidth,
                  width: widget.rightSidebarWidth,
                  child: Material(
                    color: theme.colors.background,
                    elevation: _internalRightOpen ? 16 : 0,
                    child: widget.rightSidebar!,
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
