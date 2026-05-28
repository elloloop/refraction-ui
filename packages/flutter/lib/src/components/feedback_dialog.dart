import 'dart:async';
import 'package:flutter/material.dart';

import '../theme/refraction_theme.dart';
import 'button.dart';
import 'input.dart';

/// The type of feedback being collected.
enum RefractionFeedbackType {
  /// Feedback specific to text.
  text,

  /// Feedback specific to video.
  video,

  /// General feedback.
  general,
}

/// The data collected from the feedback form.
class RefractionFeedbackData {
  /// The user's comment.
  final String comment;

  /// The user's email address, if provided.
  final String? email;

  /// The type of feedback.
  final RefractionFeedbackType type;

  /// Any optionally selected text or context.
  final String? selectedText;

  /// Creates a [RefractionFeedbackData].
  const RefractionFeedbackData({
    required this.comment,
    this.email,
    required this.type,
    this.selectedText,
  });
}

/// A modal dialog designed to collect user feedback.
///
/// Use the static [show] method to display the dialog over the current
/// navigator route. The component maintains internal state for the
/// feedback form, including honeypot verification and submit loading states.
class RefractionFeedbackDialog extends StatefulWidget {
  /// The title of the dialog.
  final String title;

  /// An optional description beneath the title.
  final String? description;

  /// The type of feedback being collected, which may alter the dialog's appearance.
  final RefractionFeedbackType type;

  /// The callback fired when the user submits the form.
  /// If it returns a [Future], the dialog displays a loading state until it completes.
  final FutureOr<void> Function(RefractionFeedbackData data)? onSubmit;

  /// The callback fired when the user cancels or closes the dialog.
  /// If null, [Navigator.pop] is called automatically.
  final VoidCallback? onCancel;

  /// The text for the submit button.
  final String submitText;

  /// The text for the submit button while the [onSubmit] future is pending.
  final String submittingText;

  /// The text for the cancel button.
  final String cancelText;

  /// The message displayed after a successful submission.
  final String successMessage;

  /// The text for the close button displayed after submission.
  final String closeText;

  /// The placeholder for the comment text area.
  final String commentPlaceholder;

  /// The placeholder for the email input.
  final String emailPlaceholder;

  /// Creates a [RefractionFeedbackDialog].
  const RefractionFeedbackDialog({
    super.key,
    this.title = 'Send Feedback',
    this.description,
    this.type = RefractionFeedbackType.general,
    this.onSubmit,
    this.onCancel,
    this.submitText = 'Submit',
    this.submittingText = 'Submitting...',
    this.cancelText = 'Cancel',
    this.successMessage = 'Thank you for your feedback!',
    this.closeText = 'Close',
    this.commentPlaceholder = 'Your feedback...',
    this.emailPlaceholder = 'Email (optional)',
  });

  /// Displays the feedback dialog modally.
  static Future<void> show({
    required BuildContext context,
    String title = 'Send Feedback',
    String? description,
    RefractionFeedbackType type = RefractionFeedbackType.general,
    FutureOr<void> Function(RefractionFeedbackData data)? onSubmit,
    String submitText = 'Submit',
    String submittingText = 'Submitting...',
    String cancelText = 'Cancel',
    String successMessage = 'Thank you for your feedback!',
    String closeText = 'Close',
    String commentPlaceholder = 'Your feedback...',
    String emailPlaceholder = 'Email (optional)',
  }) {
    return showGeneralDialog<void>(
      context: context,
      barrierColor: Colors.black54,
      barrierDismissible: true,
      barrierLabel: 'Dismiss',
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) =>
          const SizedBox.shrink(),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        final curve = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
        );
        final themeProvider = RefractionTheme.of(context);
        final theme = themeProvider.data;

        return ScaleTransition(
          scale: Tween<double>(begin: 0.95, end: 1.0).animate(curve),
          child: RefractionTheme(
            data: theme,
            child: FadeTransition(
              opacity: curve,
              child: Material(
                type: MaterialType.transparency,
                child: RefractionFeedbackDialog(
                  title: title,
                  description: description,
                  type: type,
                  onSubmit: onSubmit,
                  onCancel: () => Navigator.of(context).pop(),
                  submitText: submitText,
                  submittingText: submittingText,
                  cancelText: cancelText,
                  successMessage: successMessage,
                  closeText: closeText,
                  commentPlaceholder: commentPlaceholder,
                  emailPlaceholder: emailPlaceholder,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  State<RefractionFeedbackDialog> createState() =>
      _RefractionFeedbackDialogState();
}

class _RefractionFeedbackDialogState extends State<RefractionFeedbackDialog> {
  final TextEditingController _commentController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _honeypotController = TextEditingController();

  bool _isSubmitting = false;
  bool _isSubmitted = false;

  @override
  void dispose() {
    _commentController.dispose();
    _emailController.dispose();
    _honeypotController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final honeypot = _honeypotController.text;
    if (honeypot.isNotEmpty) return;

    final comment = _commentController.text.trim();
    if (comment.isEmpty) return;

    setState(() {
      _isSubmitting = true;
    });

    final data = RefractionFeedbackData(
      comment: comment,
      email: _emailController.text.trim().isNotEmpty
          ? _emailController.text.trim()
          : null,
      type: widget.type,
    );

    try {
      if (widget.onSubmit != null) {
        await widget.onSubmit!(data);
      }
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _isSubmitted = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    // Determine max width based on feedback type to mirror the web cva variants
    double maxWidth = 448; // max-w-md
    if (widget.type == RefractionFeedbackType.video) {
      maxWidth = 512; // max-w-lg
    }

    if (_isSubmitted) {
      return Center(
        child: Container(
          width: maxWidth,
          margin: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: colors.popover,
            borderRadius: BorderRadius.circular(theme.borderRadius * 1.5),
            border: Border.all(color: colors.border),
            boxShadow: theme.heavyShadow != null
                ? theme.heavyShadow!
                : const [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 24,
                      offset: Offset(0, 8),
                    ),
                  ],
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                widget.successMessage,
                key: const Key('feedback-success-message'),
                style: theme.textStyle.copyWith(
                  color: colors.foreground,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              RefractionButton(
                key: const Key('feedback-close-button'),
                variant: RefractionButtonVariant.outline,
                onPressed: () {
                  if (widget.onCancel != null) {
                    widget.onCancel!();
                  } else {
                    Navigator.of(context).pop();
                  }
                },
                child: Text(widget.closeText),
              ),
            ],
          ),
        ),
      );
    }

    return Center(
      child: Container(
        width: maxWidth,
        margin: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: colors.popover,
          borderRadius: BorderRadius.circular(theme.borderRadius * 1.5),
          border: Border.all(color: colors.border),
          boxShadow: theme.heavyShadow != null
              ? theme.heavyShadow!
              : const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 24,
                    offset: Offset(0, 8),
                  ),
                ],
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              widget.title,
              style: theme.textStyle.copyWith(
                color: colors.foreground,
                fontSize: 18,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.5,
              ),
            ),
            if (widget.description != null) ...[
              const SizedBox(height: 8),
              Text(
                widget.description!,
                style: theme.textStyle.copyWith(
                  color: colors.mutedForeground,
                  fontSize: 14,
                ),
              ),
            ],
            const SizedBox(height: 20),

            // Comment
            RefractionInput(
              maxLines: 4,
              key: const Key('feedback-comment-input'),
              controller: _commentController,
              placeholder: widget.commentPlaceholder,
              disabled: _isSubmitting,
              onChanged: (v) => setState(() {}),
            ),

            const SizedBox(height: 16),

            // Email
            RefractionInput(
              key: const Key('feedback-email-input'),
              controller: _emailController,
              placeholder: widget.emailPlaceholder,
              disabled: _isSubmitting,
            ),

            // Honeypot field - visually hidden, removed from semantics
            ExcludeSemantics(
              child: Opacity(
                opacity: 0,
                child: SizedBox(
                  height: 0,
                  width: 0,
                  child: TextField(
                    controller: _honeypotController,
                    key: const Key('feedback-honeypot-input'),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                RefractionButton(
                  key: const Key('feedback-cancel-button'),
                  variant: RefractionButtonVariant.ghost,
                  onPressed: _isSubmitting
                      ? null
                      : () {
                          if (widget.onCancel != null) {
                            widget.onCancel!();
                          } else {
                            Navigator.of(context).pop();
                          }
                        },
                  child: Text(widget.cancelText),
                ),
                const SizedBox(width: 8),
                RefractionButton(
                  key: const Key('feedback-submit-button'),
                  variant: RefractionButtonVariant.primary,
                  isLoading: _isSubmitting,
                  onPressed:
                      _isSubmitting || _commentController.text.trim().isEmpty
                      ? null
                      : _handleSubmit,
                  child: Text(
                    _isSubmitting ? widget.submittingText : widget.submitText,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
