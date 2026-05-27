import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A visually hidden widget that becomes visible at the top of the screen
/// when it receives keyboard focus, allowing keyboard users to bypass
/// repetitive navigation and jump straight to the main content.
class RefractionSkipToContent extends StatefulWidget {
  /// The [FocusNode] of the main content area that should receive focus
  /// when this button is activated.
  final FocusNode targetNode;

  /// The text label for the button. Defaults to 'Skip to main content'.
  final String label;

  /// Optional callback invoked when the skip action is triggered.
  final VoidCallback? onSkip;

  const RefractionSkipToContent({
    super.key,
    required this.targetNode,
    this.label = 'Skip to main content',
    this.onSkip,
  });

  @override
  State<RefractionSkipToContent> createState() =>
      _RefractionSkipToContentState();
}

class _RefractionSkipToContentState extends State<RefractionSkipToContent>
    with SingleTickerProviderStateMixin {
  final FocusNode _focusNode = FocusNode(debugLabel: 'SkipToContent');
  final OverlayPortalController _portalController = OverlayPortalController();
  late AnimationController _animationController;
  late Animation<Offset> _offsetAnimation;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _offsetAnimation =
        Tween<Offset>(begin: const Offset(0, -1.5), end: Offset.zero).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: Curves.easeOutCubic,
          ),
        );

    _animationController.addStatusListener((status) {
      if (status == AnimationStatus.dismissed) {
        _portalController.hide();
      }
    });

    _focusNode.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
    if (_focusNode.hasFocus) {
      _portalController.show();
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _activate() {
    widget.onSkip?.call();
    widget.targetNode.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    return FocusableActionDetector(
      focusNode: _focusNode,
      actions: {
        ActivateIntent: CallbackAction<ActivateIntent>(
          onInvoke: (intent) {
            _activate();
            return null;
          },
        ),
      },
      child: SizedBox(
        width: 0,
        height: 0,
        child: OverlayPortal(
          controller: _portalController,
          overlayChildBuilder: (context) {
            final theme = RefractionTheme.of(context);
            return Positioned(
              top: 16,
              left: 16,
              child: SafeArea(
                child: AnimatedBuilder(
                  animation: _offsetAnimation,
                  builder: (context, child) {
                    return FractionalTranslation(
                      translation: _offsetAnimation.value,
                      child: child,
                    );
                  },
                  child: Semantics(
                    button: true,
                    focused: _isFocused,
                    label: widget.label,
                    child: GestureDetector(
                      onTap: _activate,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: theme.colors.background,
                          border: Border.all(color: theme.colors.border),
                          borderRadius: BorderRadius.circular(
                            theme.borderRadius,
                          ),
                          boxShadow: [
                            ...?theme.data.heavyShadow,
                            if (_isFocused)
                              BoxShadow(
                                color: theme.colors.ring,
                                spreadRadius: 2,
                              ),
                          ],
                        ),
                        child: Text(
                          widget.label,
                          style: theme.data.textStyle.copyWith(
                            color: theme.colors.foreground,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
