import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

enum RefractionVoicePillSpeaker { ai, user, custom }

enum RefractionVoicePillPosition {
  inline,
  topStart,
  topCenter,
  topEnd,
  bottomStart,
  bottomCenter,
  bottomEnd,
  leftStart,
  leftCenter,
  leftEnd,
  rightStart,
  rightCenter,
  rightEnd,
}

class RefractionVoicePill extends StatefulWidget {
  final RefractionVoicePillSpeaker speaker;
  final String? customSpeakerLabel;
  final String label;
  final String? sub;
  final double intensity;
  final bool muted;
  final VoidCallback? onToggleMute;
  final RefractionVoicePillPosition position;
  final Widget? avatar;

  const RefractionVoicePill({
    super.key,
    this.speaker = RefractionVoicePillSpeaker.ai,
    this.customSpeakerLabel,
    required this.label,
    this.sub,
    this.intensity = 0.0,
    this.muted = false,
    this.onToggleMute,
    this.position = RefractionVoicePillPosition.bottomCenter,
    this.avatar,
  });

  @override
  State<RefractionVoicePill> createState() => _RefractionVoicePillState();
}

class _RefractionVoicePillState extends State<RefractionVoicePill>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: _pulseDurationMs),
    );
    if (_visualIntensity > 0) {
      _pulseController.repeat();
    }
  }

  @override
  void didUpdateWidget(RefractionVoicePill oldWidget) {
    super.didUpdateWidget(oldWidget);
    final oldVisualIntensity = oldWidget.muted
        ? 0.0
        : oldWidget.intensity.clamp(0.0, 1.0);
    if (_visualIntensity != oldVisualIntensity) {
      _pulseController.duration = Duration(milliseconds: _pulseDurationMs);
      if (_visualIntensity > 0 && !_pulseController.isAnimating) {
        _pulseController.repeat();
      } else if (_visualIntensity == 0 && _pulseController.isAnimating) {
        _pulseController.stop();
        _pulseController.value = 0.0;
      }
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  String get _speakerLabel {
    if (widget.speaker == RefractionVoicePillSpeaker.ai) return 'AI';
    if (widget.speaker == RefractionVoicePillSpeaker.user) return 'User';
    return widget.customSpeakerLabel?.trim().isNotEmpty == true
        ? widget.customSpeakerLabel!.trim()
        : 'AI';
  }

  String get _speakerKey {
    final raw = _speakerLabel
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    return raw.isNotEmpty ? raw : 'ai';
  }

  String get _initials {
    if (_speakerKey == 'ai') return 'AI';
    if (_speakerKey == 'user') return 'U';

    final parts = _speakerLabel.split(RegExp(r'[\s_-]+'));
    final initials = parts
        .where((p) => p.isNotEmpty)
        .map((p) => p[0])
        .join('')
        .substring(0, math.min(2, parts.length))
        .toUpperCase();
    return initials.isNotEmpty ? initials : 'V';
  }

  double get _clampedIntensity => widget.intensity.clamp(0.0, 1.0);
  double get _visualIntensity => widget.muted ? 0.0 : _clampedIntensity;

  double get _ringOpacity =>
      _visualIntensity == 0.0 ? 0.0 : 0.12 + _visualIntensity * 0.42;
  double get _ringScale => 1.0 + _visualIntensity * 0.35;
  int get _pulseDurationMs =>
      _visualIntensity == 0.0 ? 1800 : (1700 - _visualIntensity * 700).round();

  Color _getAccentColor(RefractionThemeData theme) {
    if (widget.muted) return theme.colors.mutedForeground;
    if (_speakerKey == 'user') return theme.colors.accentForeground;
    return theme.colors.primary;
  }

  Color _getAccentForegroundColor(RefractionThemeData theme) {
    if (_speakerKey == 'user') return theme.colors.accent;
    return theme.colors.primaryForeground;
  }

  Widget _buildPulseRing(double phaseOffset, Color accentColor) {
    return AnimatedBuilder(
      key: ValueKey('pulse_ring_$phaseOffset'),
      animation: _pulseController,
      builder: (context, child) {
        double phase = (_pulseController.value + phaseOffset) % 1.0;

        double currentScale = _ringScale * (1.0 + phase);
        double currentOpacity = _ringOpacity * (1.0 - phase);

        return Transform.scale(
          scale: currentScale,
          child: Opacity(
            opacity: currentOpacity,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: accentColor, width: 1.0),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildAvatar(RefractionThemeData theme, Color accent, Color accentFg) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(color: accent, shape: BoxShape.circle),
      alignment: Alignment.center,
      clipBehavior: Clip.antiAlias,
      child:
          widget.avatar ??
          Text(
            _initials,
            style: TextStyle(
              color: accentFg,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
    );
  }

  Widget _buildMuteButton(RefractionThemeData theme) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: theme.colors.border),
      ),
      child: IconButton(
        padding: EdgeInsets.zero,
        iconSize: 16,
        color: theme.colors.mutedForeground,
        hoverColor: theme.colors.accent,
        splashRadius: 16,
        icon: Icon(widget.muted ? Icons.volume_off : Icons.volume_up),
        onPressed: widget.onToggleMute,
      ),
    );
  }

  Widget _buildContent(RefractionThemeData theme) {
    final accent = _getAccentColor(theme);
    final accentFg = _getAccentForegroundColor(theme);
    final textColor = theme.colors.foreground;
    final subTextColor = theme.colors.mutedForeground;

    return Container(
      constraints: BoxConstraints(
        maxWidth: math.min(MediaQuery.of(context).size.width - 32, 352),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: theme.colors.background,
        borderRadius: BorderRadius.circular(9999),
        border: Border.all(color: theme.colors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
          BoxShadow(
            color: theme.colors.border.withValues(alpha: 0.5),
            blurRadius: 0,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 40,
            height: 40,
            child: Stack(
              children: [
                if (_visualIntensity > 0) ...[
                  _buildPulseRing(0.0, accent),
                  _buildPulseRing(0.5, accent),
                ],
                _buildAvatar(theme, accent, accentFg),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.label,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    height: 1.2,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (widget.sub != null)
                  Text(
                    widget.sub!,
                    style: TextStyle(
                      color: subTextColor,
                      fontSize: 12,
                      height: 1.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          if (widget.onToggleMute != null) ...[
            const SizedBox(width: 12),
            _buildMuteButton(theme),
          ],
        ],
      ),
    );
  }

  Widget _buildPositioned(Widget child) {
    if (widget.position == RefractionVoicePillPosition.inline) {
      return child;
    }

    Alignment alignment;
    switch (widget.position) {
      case RefractionVoicePillPosition.topStart:
        alignment = Alignment.topLeft;
        break;
      case RefractionVoicePillPosition.topCenter:
        alignment = Alignment.topCenter;
        break;
      case RefractionVoicePillPosition.topEnd:
        alignment = Alignment.topRight;
        break;
      case RefractionVoicePillPosition.bottomStart:
        alignment = Alignment.bottomLeft;
        break;
      case RefractionVoicePillPosition.bottomCenter:
        alignment = Alignment.bottomCenter;
        break;
      case RefractionVoicePillPosition.bottomEnd:
        alignment = Alignment.bottomRight;
        break;
      case RefractionVoicePillPosition.leftStart:
        alignment = Alignment.topLeft;
        break;
      case RefractionVoicePillPosition.leftCenter:
        alignment = Alignment.centerLeft;
        break;
      case RefractionVoicePillPosition.leftEnd:
        alignment = Alignment.bottomLeft;
        break;
      case RefractionVoicePillPosition.rightStart:
        alignment = Alignment.topRight;
        break;
      case RefractionVoicePillPosition.rightCenter:
        alignment = Alignment.centerRight;
        break;
      case RefractionVoicePillPosition.rightEnd:
        alignment = Alignment.bottomRight;
        break;
      case RefractionVoicePillPosition.inline:
        alignment = Alignment.center; // Unreachable
    }

    return SafeArea(
      child: Align(
        alignment: alignment,
        child: Padding(padding: const EdgeInsets.all(16.0), child: child),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    final mainContent = AnimatedOpacity(
      duration: const Duration(milliseconds: 200),
      opacity: widget.muted ? 0.8 : 1.0,
      child: _buildContent(theme),
    );

    return _buildPositioned(mainContent);
  }
}
