import 'dart:async';

import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

/// A bottom banner prompting the user to install the application.
///
/// Simulates a PWA install prompt. It waits for a specified [delay],
/// and then shows itself. Users can click the install or dismiss buttons.
/// 
/// Mirrors the headless `@refraction-ui/install-prompt` and React/Astro adapters.
/// Note: Real PWA installation via `beforeinstallprompt` is a web-only API.
/// This component provides the UI and state management for handling such prompts
/// in a multi-platform way.
class RefractionInstallPrompt extends StatefulWidget {
  /// Delay before showing the prompt. Defaults to 3 seconds.
  final Duration delay;

  /// Label for the install button. Defaults to 'Install'.
  final String installLabel;

  /// Label for the dismiss button. Defaults to 'Dismiss'.
  final String dismissLabel;

  /// Message text displayed in the prompt.
  final String message;

  /// Callback when the install button is pressed.
  final VoidCallback? onInstall;

  /// Callback when the dismiss button is pressed.
  final VoidCallback? onDismiss;

  /// Initial state for whether the prompt is already dismissed.
  /// Typically loaded from local storage by the caller.
  final bool initialDismissed;

  /// Creates a [RefractionInstallPrompt].
  const RefractionInstallPrompt({
    super.key,
    this.delay = const Duration(seconds: 3),
    this.installLabel = 'Install',
    this.dismissLabel = 'Dismiss',
    this.message = 'Install this app for a better experience',
    this.onInstall,
    this.onDismiss,
    this.initialDismissed = false,
  });

  @override
  State<RefractionInstallPrompt> createState() => RefractionInstallPromptState();
}

class RefractionInstallPromptState extends State<RefractionInstallPrompt> {
  bool _isVisible = false;
  bool _isDismissed = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _isDismissed = widget.initialDismissed;
    _startTimer();
  }

  @override
  void didUpdateWidget(RefractionInstallPrompt oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialDismissed != oldWidget.initialDismissed) {
      _isDismissed = widget.initialDismissed;
      if (_isDismissed) {
        setState(() {
          _isVisible = false;
        });
        _timer?.cancel();
      } else if (!_isVisible) {
        _startTimer();
      }
    } else if (widget.delay != oldWidget.delay && !_isVisible && !_isDismissed) {
      _startTimer();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    if (!_isDismissed) {
      _timer = Timer(widget.delay, () {
        if (mounted && !_isDismissed) {
          setState(() {
            _isVisible = true;
          });
        }
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _handleInstall() {
    widget.onInstall?.call();
    setState(() {
      _isVisible = false;
    });
  }

  void _handleDismiss() {
    widget.onDismiss?.call();
    setState(() {
      _isVisible = false;
      _isDismissed = true;
    });
  }

  /// Manually trigger the prompt to show, ignoring the delay.
  /// Will not show if it has been dismissed.
  void show() {
    if (!_isDismissed) {
      setState(() {
        _isVisible = true;
      });
    }
  }

  /// Programmatically dismiss the prompt.
  void dismiss() {
    _handleDismiss();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isVisible) return const SizedBox.shrink();

    final theme = RefractionTheme.of(context).data;

    return Semantics(
      container: true,
      label: 'Install application',
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        decoration: BoxDecoration(
          color: theme.colors.background,
          border: Border(
            top: BorderSide(color: theme.colors.border),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  widget.message,
                  style: theme.textStyle.copyWith(
                    color: theme.colors.foreground,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  RefractionButton(
                    variant: RefractionButtonVariant.ghost,
                    size: RefractionButtonSize.sm,
                    onPressed: _handleDismiss,
                    child: Text(widget.dismissLabel),
                  ),
                  const SizedBox(width: 8),
                  RefractionButton(
                    variant: RefractionButtonVariant.primary,
                    size: RefractionButtonSize.sm,
                    onPressed: _handleInstall,
                    child: Text(widget.installLabel),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
