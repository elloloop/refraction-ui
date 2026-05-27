import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// An inherited widget that exposes the form state down the widget tree.
class RefractionFormScope extends InheritedWidget {
  /// The state of the closest [RefractionForm].
  final RefractionFormState formState;

  /// Whether the form is currently submitting.
  final bool isLoading;

  /// The current error message displayed by the form, if any.
  final String? errorMessage;

  /// Creates a [RefractionFormScope].
  const RefractionFormScope({
    super.key,
    required this.formState,
    required this.isLoading,
    this.errorMessage,
    required super.child,
  });

  @override
  bool updateShouldNotify(RefractionFormScope oldWidget) {
    return isLoading != oldWidget.isLoading ||
        errorMessage != oldWidget.errorMessage;
  }
}

/// A form wrapper component that manages form state, validation, submission
/// loading states, and error handling for multiple inputs.
///
/// Use [RefractionForm] to group inputs and provide a unified submission process.
/// It automatically catches errors thrown by [onSubmit], displays them using
/// [RefractionTheme], and exposes [isLoading] to children (e.g. for buttons).
class RefractionForm extends StatefulWidget {
  /// The future to execute when the form is submitted and valid.
  final Future<void> Function()? onSubmit;

  /// The widget below this widget in the tree.
  final Widget child;

  /// Used to enable/disable form field auto validation and update their error text.
  final AutovalidateMode autovalidateMode;

  /// Optional callback invoked when [onSubmit] throws an exception.
  /// If provided, it overrides the default error display.
  final void Function(Object error)? onError;

  /// Optional callback invoked when [onSubmit] completes successfully.
  final VoidCallback? onSuccess;

  /// Whether to display error messages automatically below the form.
  final bool showErrorMessage;

  /// An optional key to use for the underlying [Form].
  final GlobalKey<FormState>? formKey;

  /// Creates a [RefractionForm].
  const RefractionForm({
    super.key,
    required this.child,
    this.onSubmit,
    this.autovalidateMode = AutovalidateMode.disabled,
    this.onError,
    this.onSuccess,
    this.showErrorMessage = true,
    this.formKey,
  });

  /// The state from the closest instance of this class that encloses the given
  /// context.
  static RefractionFormState? of(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<RefractionFormScope>()
        ?.formState;
  }

  /// Returns true if the closest [RefractionForm] is currently submitting.
  static bool isLoading(BuildContext context) {
    return context
            .dependOnInheritedWidgetOfExactType<RefractionFormScope>()
            ?.isLoading ??
        false;
  }

  @override
  State<RefractionForm> createState() => RefractionFormState();
}

class RefractionFormState extends State<RefractionForm> {
  late final GlobalKey<FormState> _formKey;
  bool _isLoading = false;
  String? _errorMessage;

  /// Whether the form is currently executing [onSubmit].
  bool get isLoading => _isLoading;

  /// The current error message displayed by the form, if any.
  String? get errorMessage => _errorMessage;

  @override
  void initState() {
    super.initState();
    _formKey = widget.formKey ?? GlobalKey<FormState>();
  }

  /// Manually sets the error message.
  void setErrorMessage(String? message) {
    if (!mounted) return;
    setState(() {
      _errorMessage = message;
    });
  }

  /// Clears the current error message.
  void clearError() {
    if (!mounted) return;
    setState(() {
      _errorMessage = null;
    });
  }

  /// Validates the form and triggers the [onSubmit] callback.
  ///
  /// This method sets [isLoading] to true, executes the submission future,
  /// catches exceptions, and resets the loading state when done.
  Future<void> submit() async {
    if (widget.onSubmit == null || _isLoading) return;

    // Check validation
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    _formKey.currentState?.save();

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await widget.onSubmit!();
      if (mounted && widget.onSuccess != null) {
        widget.onSuccess!();
      }
    } catch (e) {
      if (mounted) {
        if (widget.onError != null) {
          widget.onError!(e);
        } else {
          setErrorMessage(e.toString());
        }
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);

    final form = Form(
      key: _formKey,
      autovalidateMode: widget.autovalidateMode,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          widget.child,
          if (widget.showErrorMessage && _errorMessage != null)
            Padding(
              padding: const EdgeInsets.only(top: 16.0),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: theme.colors.destructive.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                  border: Border.all(
                    color: theme.colors.destructive.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 16,
                      color: theme.colors.destructive,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!.replaceFirst(
                          RegExp(r'^Exception: '),
                          '',
                        ),
                        style: theme.data.textStyle.copyWith(
                          color: theme.colors.destructive,
                          fontSize: 14.0,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );

    return RefractionFormScope(
      formState: this,
      isLoading: _isLoading,
      errorMessage: _errorMessage,
      child: form,
    );
  }
}
