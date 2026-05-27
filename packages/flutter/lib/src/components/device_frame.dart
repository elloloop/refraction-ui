import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// The type of device to display.
enum RefractionDeviceType {
  /// iPhone device frame.
  iphone,

  /// iPad device frame.
  ipad,

  /// Generic Android phone frame.
  androidPhone,

  /// Generic Android tablet frame.
  androidTablet,
}

/// The orientation of the device frame.
enum RefractionDeviceOrientation {
  /// Portrait orientation (taller than it is wide).
  portrait,

  /// Landscape orientation (wider than it is tall).
  landscape,
}

class _DeviceSpec {
  final double width;
  final double height;
  final double radius;
  final double borderWidth;
  final bool notch;
  final bool homeIndicator;

  const _DeviceSpec({
    required this.width,
    required this.height,
    required this.radius,
    required this.borderWidth,
    required this.notch,
    required this.homeIndicator,
  });
}

const _deviceSpecs = {
  RefractionDeviceType.iphone: _DeviceSpec(
    width: 375,
    height: 812,
    radius: 44,
    borderWidth: 6,
    notch: true,
    homeIndicator: true,
  ),
  RefractionDeviceType.ipad: _DeviceSpec(
    width: 810,
    height: 1080,
    radius: 18,
    borderWidth: 6,
    notch: false,
    homeIndicator: true,
  ),
  RefractionDeviceType.androidPhone: _DeviceSpec(
    width: 360,
    height: 800,
    radius: 24,
    borderWidth: 4,
    notch: false,
    homeIndicator: false,
  ),
  RefractionDeviceType.androidTablet: _DeviceSpec(
    width: 800,
    height: 1280,
    radius: 16,
    borderWidth: 4,
    notch: false,
    homeIndicator: false,
  ),
};

const _deviceLabels = {
  RefractionDeviceType.iphone: 'iPhone',
  RefractionDeviceType.ipad: 'iPad',
  RefractionDeviceType.androidPhone: 'Android Phone',
  RefractionDeviceType.androidTablet: 'Android Tablet',
};

/// A component that renders a visual device frame (like a phone or tablet)
/// around its content.
///
/// Mirrors the `@refraction-ui/device-frame` React component.
class RefractionDeviceFrame extends StatelessWidget {
  /// The type of device to render.
  final RefractionDeviceType device;

  /// The orientation of the device.
  final RefractionDeviceOrientation orientation;

  /// The content to display inside the device screen.
  final Widget? child;

  /// Creates a [RefractionDeviceFrame].
  const RefractionDeviceFrame({
    super.key,
    this.device = RefractionDeviceType.iphone,
    this.orientation = RefractionDeviceOrientation.portrait,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final spec = _deviceSpecs[device]!;
    final isLandscape = orientation == RefractionDeviceOrientation.landscape;

    final frameWidth = isLandscape ? spec.height : spec.width;
    final frameHeight = isLandscape ? spec.width : spec.height;

    return Semantics(
      label: '${_deviceLabels[device]} device frame in ${orientation.name} orientation',
      image: true,
      child: Container(
        width: frameWidth,
        height: frameHeight,
        decoration: BoxDecoration(
          color: Colors.black,
          border: Border.all(
            color: const Color(0xFF1F2937),
            width: spec.borderWidth,
          ),
          borderRadius: BorderRadius.circular(spec.radius),
          boxShadow: const [
            BoxShadow(
              color: Color(0x1A000000), // shadow-xl opacity 10%
              offset: Offset(0, 20),
              blurRadius: 25,
              spreadRadius: -5,
            ),
            BoxShadow(
              color: Color(0x1A000000),
              offset: Offset(0, 8),
              blurRadius: 10,
              spreadRadius: -6,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(
            (spec.radius - spec.borderWidth).clamp(0.0, double.infinity),
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Screen area
              Container(
                color: theme.colors.background,
                child: child,
              ),
              // Notch decoration
              if (spec.notch)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
                      width: frameWidth * 0.4,
                      height: 30,
                      decoration: const BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.vertical(
                          bottom: Radius.circular(16),
                        ),
                      ),
                    ),
                  ),
                ),
              // Home indicator decoration
              if (spec.homeIndicator)
                Positioned(
                  bottom: 8,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
                      width: frameWidth * 0.35,
                      height: 5,
                      decoration: BoxDecoration(
                        color: const Color(0xFFD1D5DB), // bg-gray-300
                        borderRadius: BorderRadius.circular(9999),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
