import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

enum DeviceType { iphone, android, tablet }

class RefractionDeviceFrame extends StatefulWidget {
  final Widget child;
  final DeviceType deviceType;

  const RefractionDeviceFrame({
    super.key,
    required this.child,
    this.deviceType = DeviceType.iphone,
  });

  @override
  _RefractionDeviceFrameState createState() => _RefractionDeviceFrameState();
}

class _RefractionDeviceFrameState extends State<RefractionDeviceFrame> {
  bool _isKeyboardVisible = false;

  @override
  void initState() {
    super.initState();
    FocusManager.instance.addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    FocusManager.instance.removeListener(_handleFocusChange);
    super.dispose();
  }

  final String _debugFocus = "INIT";

  void _handleFocusChange() {
    final focus = FocusManager.instance.primaryFocus;

    // A structural FocusScopeNode represents the background/layout taking ambient focus.
    // An explicit FocusNode implies a discrete interaction target (e.g., an Input) was engaged.
    final hasFocus =
        focus != null && focus.hasPrimaryFocus && focus is! FocusScopeNode;

    if (mounted) {
      setState(() {
        if (_isKeyboardVisible != hasFocus) {
          _isKeyboardVisible = hasFocus;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    double width;
    double height;
    double borderRadius;
    double keyboardHeight = 290;
    Widget notchOrCamera = const SizedBox.shrink();

    switch (widget.deviceType) {
      case DeviceType.iphone:
        width = 375;
        height = 812;
        borderRadius = 40;
        notchOrCamera = Positioned(
          top: 0,
          left: (width - 120) / 2, // Center the notch
          child: Container(
            width: 120,
            height: 30,
            decoration: const BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
          ),
        );
        break;
      case DeviceType.android:
        width = 360;
        height = 800;
        borderRadius = 24;
        notchOrCamera = Positioned(
          top: 8,
          left: (width - 20) / 2, // Center punch hole
          child: Container(
            width: 20,
            height: 20,
            decoration: const BoxDecoration(
              color: Colors.black,
              shape: BoxShape.circle,
            ),
          ),
        );
        break;
      case DeviceType.tablet:
        width = 768; // iPad Mini / generic tablet portrait
        height = 1024;
        borderRadius = 24;
        keyboardHeight = 350;
        notchOrCamera = Positioned(
          top: 8,
          left: (width - 12) / 2,
          child: Container(
            width: 12,
            height: 12,
            decoration: const BoxDecoration(
              color: Colors.black,
              shape: BoxShape.circle,
            ),
          ),
        );
        break;
    }

    return Container(
      width: width + 24, // hardware border
      height: height + 24, // hardware border
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.foreground.withOpacity(
          0.1,
        ), // Frame color (metal/plastic)
        borderRadius: BorderRadius.circular(borderRadius + 12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Screen
          Container(
            width: width,
            height: height,
            decoration: BoxDecoration(
              color: colors.background, // default screen bg
              borderRadius: BorderRadius.circular(borderRadius),
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(
              children: [
                MediaQuery(
                  data: MediaQuery.of(context).copyWith(
                    size: Size(width, height),
                    padding: EdgeInsets.only(
                      top: widget.deviceType == DeviceType.iphone ? 44 : 24,
                      bottom: widget.deviceType == DeviceType.iphone ? 34 : 16,
                    ),
                    viewInsets: EdgeInsets.only(
                      bottom: _isKeyboardVisible ? keyboardHeight : 0,
                    ),
                  ),
                  child: widget
                      .child, // The hosted application loads here natively!
                ),
                // Virtual Keyboard Mock Overlay
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.fastOutSlowIn,
                  bottom: _isKeyboardVisible ? 0 : -keyboardHeight,
                  left: 0,
                  right: 0,
                  height: keyboardHeight,
                  child: Container(
                    decoration: BoxDecoration(
                      color: colors.muted.withOpacity(
                        0.95,
                      ), // Glassy keyboard background
                      border: Border(top: BorderSide(color: colors.border)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              IconButton(
                                icon: Icon(
                                  Icons.keyboard_hide,
                                  color: colors.foreground,
                                ),
                                tooltip: "Dismiss Keyboard",
                                onPressed: () {
                                  FocusManager.instance.primaryFocus?.unfocus();
                                },
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.keyboard,
                                color: colors.mutedForeground,
                                size: 48,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                "Mock Virtual Keyboard",
                                style: TextStyle(
                                  color: colors.mutedForeground,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.2,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                "(Physical keys are captured normally via PC)",
                                style: TextStyle(
                                  color: colors.mutedForeground.withOpacity(
                                    0.5,
                                  ),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Hardware Overlay (Notches/Cameras)
          notchOrCamera,
        ],
      ),
    );
  }
}
