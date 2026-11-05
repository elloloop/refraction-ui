import 'package:flutter/widgets.dart';

import '../theme/refraction_theme.dart';
import 'avatar.dart';

/// A bounded profile image with the shared shape, tokens and initials. Generic
/// provider lifecycle callbacks let its owner retire private decoded images.
class RefractionBoundedAvatar extends StatefulWidget {
  const RefractionBoundedAvatar({
    super.key,
    this.imageUrl,
    this.imageProvider,
    required this.fallbackText,
    this.radius = 999,
    this.size = 40,
    this.fit = BoxFit.cover,
    this.onImageError,
    this.onImageProviderChanged,
  });

  final String? imageUrl;
  final ImageProvider? imageProvider;
  final String fallbackText;
  final double radius;
  final double size;
  final BoxFit fit;
  final VoidCallback? onImageError;
  final ValueChanged<ImageProvider?>? onImageProviderChanged;
  static const int maxDecodeExtent = 512;

  @override
  State<RefractionBoundedAvatar> createState() =>
      _RefractionBoundedAvatarState();
}

class _RefractionBoundedAvatarState extends State<RefractionBoundedAvatar> {
  ImageProvider? _provider;
  bool _reportedError = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _updateProvider();
  }

  @override
  void didUpdateWidget(RefractionBoundedAvatar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.onImageProviderChanged != widget.onImageProviderChanged) {
      oldWidget.onImageProviderChanged?.call(null);
      _provider = null;
    }
    _updateProvider();
  }

  void _updateProvider() {
    final source =
        widget.imageProvider ??
        (widget.imageUrl == null ? null : NetworkImage(widget.imageUrl!));
    final extent = (widget.size * MediaQuery.devicePixelRatioOf(context))
        .ceil()
        .clamp(1, RefractionBoundedAvatar.maxDecodeExtent);
    final ImageProvider? next = source == null
        ? null
        : ResizeImage(
            source,
            width: extent,
            height: extent,
            policy: ResizeImagePolicy.fit,
            allowUpscaling: false,
          );
    if (_provider == next) return;
    if (_provider != null) widget.onImageProviderChanged?.call(null);
    _provider = next;
    _reportedError = false;
    if (next != null) widget.onImageProviderChanged?.call(next);
  }

  void _imageFailed() {
    if (_reportedError) return;
    _reportedError = true;
    final failed = _provider;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && identical(_provider, failed)) widget.onImageError?.call();
    });
  }

  @override
  void dispose() {
    if (_provider != null) widget.onImageProviderChanged?.call(null);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fallback = RefractionAvatar(
      fallbackText: widget.fallbackText,
      size: widget.size,
      radius: widget.radius,
    );
    final provider = _provider;
    if (provider == null) return fallback;
    final image = Image(
      image: provider,
      width: widget.size,
      height: widget.size,
      fit: widget.fit,
      frameBuilder: (context, child, frame, synchronous) =>
          frame == null ? fallback : child,
      errorBuilder: (context, error, stackTrace) {
        _imageFailed();
        return fallback;
      },
    );
    return SizedBox.square(
      dimension: widget.size,
      child: Stack(
        fit: StackFit.expand,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: context.refractionColors.muted,
              borderRadius: BorderRadius.circular(widget.radius),
            ),
          ),
          // Contained illustrations retain the complete rectangular original;
          // rounding a contained image would still crop opaque corner details.
          if (widget.fit == BoxFit.contain)
            image
          else
            ClipRRect(
              borderRadius: BorderRadius.circular(widget.radius),
              child: image,
            ),
        ],
      ),
    );
  }
}
