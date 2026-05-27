import 'dart:async';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import '../theme/refraction_theme.dart';

/// The playback state of the video.
enum RefractionVideoState { idle, loading, playing, paused, ended }

/// A highly customizable, headless-capable video player component.
///
/// It wraps the standard `video_player` capabilities and provides
/// a Refraction-themed UI shell overlay for controls.
class RefractionVideoPlayer extends StatefulWidget {
  /// The URL of the video to play.
  final String? src;

  /// The poster image URL (optional) to show when the video is not yet playing.
  final String? poster;

  /// Whether the video should autoplay.
  final bool autoPlay;

  /// Whether the video should start muted.
  final bool muted;

  /// Whether to show the UI controls.
  final bool showControls;

  /// Callback when video state changes.
  final ValueChanged<RefractionVideoState>? onStateChanged;

  /// An external controller. If provided, [src], [autoPlay], and [muted] are ignored
  /// and managed by the controller.
  final VideoPlayerController? controller;

  /// Creates a [RefractionVideoPlayer].
  const RefractionVideoPlayer({
    super.key,
    this.src,
    this.poster,
    this.autoPlay = false,
    this.muted = false,
    this.showControls = true,
    this.onStateChanged,
    this.controller,
  }) : assert(
         src != null || controller != null,
         'Either src or controller must be provided.',
       );

  @override
  State<RefractionVideoPlayer> createState() => _RefractionVideoPlayerState();
}

class _RefractionVideoPlayerState extends State<RefractionVideoPlayer> {
  VideoPlayerController? _internalController;
  VideoPlayerController get _controller =>
      widget.controller ?? _internalController!;

  RefractionVideoState _state = RefractionVideoState.idle;
  bool _showControlsOverlay = true;
  Timer? _hideControlsTimer;
  bool _isDragging = false;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _initController();
  }

  void _initController() {
    if (widget.controller == null) {
      if (widget.src != null) {
        _internalController = VideoPlayerController.networkUrl(
          Uri.parse(widget.src!),
        );
        _initializeInternalController();
      }
    } else {
      _initialized = widget.controller!.value.isInitialized;
      _controller.addListener(_videoListener);
      _updateState();
    }
  }

  Future<void> _initializeInternalController() async {
    _setState(RefractionVideoState.loading);
    try {
      await _internalController!.initialize();
      _initialized = true;
      _internalController!.addListener(_videoListener);

      if (widget.muted) {
        await _internalController!.setVolume(0.0);
      }

      if (widget.autoPlay) {
        await _internalController!.play();
      } else {
        _setState(RefractionVideoState.idle);
      }
    } catch (e) {
      _setState(RefractionVideoState.idle);
    }
  }

  @override
  void didUpdateWidget(RefractionVideoPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != oldWidget.controller) {
      if (oldWidget.controller == null) {
        _internalController?.removeListener(_videoListener);
        _internalController?.dispose();
        _internalController = null;
      } else {
        oldWidget.controller?.removeListener(_videoListener);
      }
      _initController();
    }
  }

  void _videoListener() {
    if (!mounted) return;
    if (!_initialized && _controller.value.isInitialized) {
      _initialized = true;
    }
    _updateState();
    setState(() {}); // Re-build for progress updates
  }

  void _updateState() {
    final value = _controller.value;
    RefractionVideoState newState;

    if (value.hasError) {
      newState = RefractionVideoState.idle;
    } else if (!value.isInitialized) {
      newState = RefractionVideoState.loading;
    } else if (value.isBuffering) {
      newState = RefractionVideoState.loading;
    } else if (value.position >= value.duration &&
        value.duration != Duration.zero) {
      newState = RefractionVideoState.ended;
    } else if (value.isPlaying) {
      newState = RefractionVideoState.playing;
    } else {
      newState =
          _state == RefractionVideoState.idle && value.position == Duration.zero
          ? RefractionVideoState.idle
          : RefractionVideoState.paused;
    }

    _setState(newState);
  }

  void _setState(RefractionVideoState newState) {
    if (_state != newState) {
      setState(() {
        _state = newState;
      });
      widget.onStateChanged?.call(newState);

      if (newState == RefractionVideoState.playing && !_isDragging) {
        _startHideControlsTimer();
      } else {
        _cancelHideControlsTimer();
        setState(() {
          _showControlsOverlay = true;
        });
      }
    }
  }

  void _startHideControlsTimer() {
    _cancelHideControlsTimer();
    _hideControlsTimer = Timer(const Duration(seconds: 3), () {
      if (mounted && _state == RefractionVideoState.playing && !_isDragging) {
        setState(() {
          _showControlsOverlay = false;
        });
      }
    });
  }

  void _cancelHideControlsTimer() {
    _hideControlsTimer?.cancel();
  }

  @override
  void dispose() {
    _cancelHideControlsTimer();
    _controller.removeListener(_videoListener);
    _internalController?.dispose();
    super.dispose();
  }

  void _togglePlay() {
    if (_controller.value.isPlaying) {
      _controller.pause();
    } else {
      if (_state == RefractionVideoState.ended) {
        _controller.seekTo(Duration.zero);
      }
      _controller.play();
    }
  }

  void _toggleMute() {
    if (_controller.value.volume == 0) {
      _controller.setVolume(1.0);
    } else {
      _controller.setVolume(0.0);
    }
  }

  void _onInteraction() {
    setState(() {
      _showControlsOverlay = true;
    });
    if (_state == RefractionVideoState.playing) {
      _startHideControlsTimer();
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60).abs());
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60).abs());
    if (duration.inHours > 0) {
      return "${duration.inHours}:$twoDigitMinutes:$twoDigitSeconds";
    }
    return "$twoDigitMinutes:$twoDigitSeconds";
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final isMuted = _initialized && _controller.value.volume == 0;

    Widget content;

    if (_initialized) {
      content = AspectRatio(
        aspectRatio: _controller.value.aspectRatio,
        child: VideoPlayer(_controller),
      );
    } else {
      content = Container(
        color: Colors.black,
        child: const Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    if (widget.poster != null &&
        (_state == RefractionVideoState.idle ||
            _state == RefractionVideoState.loading)) {
      content = Stack(
        fit: StackFit.expand,
        children: [
          content,
          Image.network(widget.poster!, fit: BoxFit.cover),
        ],
      );
    }

    return MouseRegion(
      onHover: (_) => _onInteraction(),
      child: GestureDetector(
        onTap: _onInteraction,
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(theme.borderRadius),
            color: Colors.black,
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              content,
              if (widget.showControls)
                AnimatedOpacity(
                  opacity: _showControlsOverlay ? 1.0 : 0.0,
                  duration: const Duration(milliseconds: 300),
                  child: Container(
                    color: Colors.black.withValues(alpha: 0.4),
                    child: Column(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: _togglePlay,
                            child: Center(
                              child: _state == RefractionVideoState.loading
                                  ? const CircularProgressIndicator(
                                      color: Colors.white,
                                    )
                                  : Container(
                                      decoration: BoxDecoration(
                                        color: Colors.black.withValues(
                                          alpha: 0.5,
                                        ),
                                        shape: BoxShape.circle,
                                      ),
                                      padding: const EdgeInsets.all(16),
                                      child: Icon(
                                        _state == RefractionVideoState.playing
                                            ? Icons.pause
                                            : (_state ==
                                                      RefractionVideoState.ended
                                                  ? Icons.replay
                                                  : Icons.play_arrow),
                                        color: Colors.white,
                                        size: 48,
                                      ),
                                    ),
                            ),
                          ),
                        ),
                        // Bottom Controls
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                              colors: [
                                Colors.black.withValues(alpha: 0.8),
                                Colors.transparent,
                              ],
                            ),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: Icon(
                                  _state == RefractionVideoState.playing
                                      ? Icons.pause
                                      : Icons.play_arrow,
                                  color: Colors.white,
                                ),
                                onPressed: _togglePlay,
                              ),
                              IconButton(
                                icon: Icon(
                                  isMuted ? Icons.volume_off : Icons.volume_up,
                                  color: Colors.white,
                                ),
                                onPressed: _toggleMute,
                              ),
                              Expanded(child: _buildProgressBar(theme)),
                              const SizedBox(width: 8),
                              Text(
                                '${_formatDuration(_controller.value.position)} / ${_formatDuration(_controller.value.duration)}',
                                style: const TextStyle(
                                  color: Colors.white,
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
      ),
    );
  }

  Widget _buildProgressBar(RefractionTheme theme) {
    if (!_initialized) {
      return const SizedBox.shrink();
    }

    final position = _controller.value.position.inMilliseconds.toDouble();
    final duration = _controller.value.duration.inMilliseconds.toDouble();

    return SliderTheme(
      data: SliderThemeData(
        trackHeight: 4,
        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
        activeTrackColor: theme.colors.primary,
        inactiveTrackColor: Colors.white.withValues(alpha: 0.3),
        thumbColor: theme.colors.primary,
        overlayColor: theme.colors.primary.withValues(alpha: 0.2),
      ),
      child: Slider(
        value: position.clamp(0.0, duration > 0 ? duration : 0.0),
        min: 0.0,
        max: duration > 0 ? duration : 1.0,
        onChangeStart: (_) {
          _isDragging = true;
          _cancelHideControlsTimer();
        },
        onChanged: (value) {
          _controller.seekTo(Duration(milliseconds: value.toInt()));
        },
        onChangeEnd: (_) {
          _isDragging = false;
          if (_state == RefractionVideoState.playing) {
            _startHideControlsTimer();
          }
        },
      ),
    );
  }
}
