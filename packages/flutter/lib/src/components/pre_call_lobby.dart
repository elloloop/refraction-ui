import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// Media device option model.
class RefractionMediaDeviceOption {
  /// Unique identifier for the device.
  final String id;

  /// Display name of the device.
  final String label;

  /// Creates a [RefractionMediaDeviceOption].
  const RefractionMediaDeviceOption({
    required this.id,
    required this.label,
  });
}

/// The kind of media device being configured.
enum RefractionDeviceKind {
  /// Camera device.
  camera,

  /// Microphone device.
  microphone,

  /// Audio output / speaker device.
  speaker,
}

/// A device check and setup panel shown before joining a video meeting.
///
/// Features:
/// - Video preview slot or placeholder when camera is off
/// - A real-time 8-bar visual microphone level meter
/// - Selector dropdowns for cameras, microphones, and speakers
/// - Toggles for camera and microphone state
/// - A primary CTA button to join the call
class RefractionPreCallLobby extends StatelessWidget {
  /// Whether the camera is currently enabled.
  final bool cameraOn;

  /// Whether the microphone is currently enabled.
  final bool micOn;

  /// Called when the user toggles the camera button.
  final VoidCallback? onToggleCamera;

  /// Called when the user toggles the microphone button.
  final VoidCallback? onToggleMic;

  /// Current microphone level (0.0 .. 1.0).
  final double micLevel;

  /// Available cameras.
  final List<RefractionMediaDeviceOption> cameras;

  /// Available microphones.
  final List<RefractionMediaDeviceOption> microphones;

  /// Available speakers.
  final List<RefractionMediaDeviceOption> speakers;

  /// Selected camera id.
  final String? selectedCamera;

  /// Selected microphone id.
  final String? selectedMicrophone;

  /// Selected speaker id.
  final String? selectedSpeaker;

  /// Called when the user changes a device selection.
  final void Function(RefractionDeviceKind kind, String deviceId)? onDeviceChange;

  /// Renders inside the camera preview area when camera is on.
  final Widget? previewSlot;

  /// Text displayed on the join button. Defaults to 'Join'.
  final String joinLabel;

  /// Called when the user clicks the join button.
  final VoidCallback? onJoin;

  /// Creates a [RefractionPreCallLobby] panel.
  const RefractionPreCallLobby({
    super.key,
    required this.cameraOn,
    required this.micOn,
    this.onToggleCamera,
    this.onToggleMic,
    this.micLevel = 0.0,
    this.cameras = const [],
    this.microphones = const [],
    this.speakers = const [],
    this.selectedCamera,
    this.selectedMicrophone,
    this.selectedSpeaker,
    this.onDeviceChange,
    this.previewSlot,
    this.joinLabel = 'Join',
    this.onJoin,
  });

  Widget _buildCameraPreview(BuildContext context, RefractionThemeData theme) {
    final colors = theme.colors;

    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        decoration: BoxDecoration(
          color: colors.muted,
          borderRadius: BorderRadius.circular(theme.borderRadius),
        ),
        child: cameraOn && previewSlot != null
            ? previewSlot!
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.videocam_off,
                    size: 40.0,
                    color: colors.mutedForeground,
                  ),
                  const SizedBox(height: 8.0),
                  Text(
                    'Camera is off',
                    style: TextStyle(
                      fontSize: 12.0,
                      color: colors.mutedForeground,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildMicMeter(BuildContext context, RefractionThemeData theme) {
    final colors = theme.colors;
    // Map mic level (0..1) to 0..8 bars
    final litBars = (micLevel * 8).round().clamp(0, 8);

    return Row(
      children: [
        Text(
          'Mic',
          style: TextStyle(
            fontSize: 12.0,
            color: colors.mutedForeground,
          ),
        ),
        const SizedBox(width: 8.0),
        SizedBox(
          height: 20.0,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(8, (i) {
              final isLit = i < litBars;
              final color = isLit ? colors.primary : colors.mutedForeground.withValues(alpha: 0.3);
              final double height = i < 2 ? 8.0 : i < 4 ? 12.0 : i < 6 ? 16.0 : 20.0;

              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 1.0),
                width: 6.0,
                height: height,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(2.0),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }

  Widget _buildDeviceSelect({
    required String label,
    required List<RefractionMediaDeviceOption> options,
    required String? value,
    required ValueChanged<String?>? onChanged,
    required RefractionThemeData theme,
  }) {
    final colors = theme.colors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12.0,
            fontWeight: FontWeight.w500,
            color: colors.mutedForeground,
          ),
        ),
        const SizedBox(height: 4.0),
        Container(
          height: 36.0,
          decoration: BoxDecoration(
            color: colors.background,
            borderRadius: BorderRadius.circular(6.0),
            border: Border.all(color: colors.input),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12.0),
          alignment: Alignment.centerLeft,
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: value,
              dropdownColor: colors.popover,
              icon: Icon(Icons.arrow_drop_down, color: colors.foreground),
              style: TextStyle(
                color: colors.foreground,
                fontSize: 14.0,
              ),
              onChanged: onChanged,
              items: options.map((opt) {
                return DropdownMenuItem<String>(
                  value: opt.id,
                  child: Text(opt.label),
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildToggleButton({
    required bool active,
    required IconData activeIcon,
    required IconData inactiveIcon,
    required VoidCallback? onTap,
    required String label,
    required RefractionThemeData theme,
  }) {
    final colors = theme.colors;
    final Color bg = active ? colors.primary : colors.destructive.withValues(alpha: 0.1);
    final Color fg = active ? colors.primaryForeground : colors.destructive;

    return Semantics(
      button: true,
      label: label,
      selected: active,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 40.0,
            height: 40.0,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: bg,
            ),
            alignment: Alignment.center,
            child: Icon(
              active ? activeIcon : inactiveIcon,
              color: fg,
              size: 18.0,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildJoinButton(BuildContext context, RefractionThemeData theme) {
    final colors = theme.colors;

    return MouseRegion(
      cursor: onJoin != null ? SystemMouseCursors.click : SystemMouseCursors.forbidden,
      child: GestureDetector(
        onTap: onJoin,
        child: Container(
          width: double.infinity,
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(vertical: 12.0),
          decoration: BoxDecoration(
            color: onJoin != null ? colors.primary : colors.primary.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(theme.borderRadius),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 2.0,
                offset: const Offset(0, 1.0),
              ),
            ],
          ),
          child: Text(
            joinLabel,
            style: TextStyle(
              color: onJoin != null ? colors.primaryForeground : colors.primaryForeground.withValues(alpha: 0.5),
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Semantics(
      container: true,
      label: 'Pre-call lobby',
      child: Container(
        constraints: const BoxConstraints(maxWidth: 512.0), // max-w-lg
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: BorderRadius.circular(16.0), // rounded-2xl
          border: Border.all(color: colors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 4.0,
              offset: const Offset(0, 2.0),
            ),
          ],
        ),
        padding: const EdgeInsets.all(24.0),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildCameraPreview(context, theme.data),
              const SizedBox(height: 24.0),
              _buildMicMeter(context, theme.data),
              const SizedBox(height: 24.0),
              if (cameras.isNotEmpty) ...[
                _buildDeviceSelect(
                  label: 'Camera',
                  options: cameras,
                  value: selectedCamera,
                  onChanged: (id) => onDeviceChange?.call(RefractionDeviceKind.camera, id ?? ''),
                  theme: theme.data,
                ),
                const SizedBox(height: 16.0),
              ],
              if (microphones.isNotEmpty) ...[
                _buildDeviceSelect(
                  label: 'Microphone',
                  options: microphones,
                  value: selectedMicrophone,
                  onChanged: (id) => onDeviceChange?.call(RefractionDeviceKind.microphone, id ?? ''),
                  theme: theme.data,
                ),
                const SizedBox(height: 16.0),
              ],
              if (speakers.isNotEmpty) ...[
                _buildDeviceSelect(
                  label: 'Speaker',
                  options: speakers,
                  value: selectedSpeaker,
                  onChanged: (id) => onDeviceChange?.call(RefractionDeviceKind.speaker, id ?? ''),
                  theme: theme.data,
                ),
                const SizedBox(height: 16.0),
              ],
              const SizedBox(height: 8.0),
              Row(
                children: [
                  _buildToggleButton(
                    active: cameraOn,
                    activeIcon: Icons.videocam,
                    inactiveIcon: Icons.videocam_off,
                    onTap: onToggleCamera,
                    label: 'Camera Toggle',
                    theme: theme.data,
                  ),
                  const SizedBox(width: 12.0),
                  _buildToggleButton(
                    active: micOn,
                    activeIcon: Icons.mic,
                    inactiveIcon: Icons.mic_off,
                    onTap: onToggleMic,
                    label: 'Mic Toggle',
                    theme: theme.data,
                  ),
                ],
              ),
              const SizedBox(height: 24.0),
              _buildJoinButton(context, theme.data),
            ],
          ),
        ),
      ),
    );
  }
}
