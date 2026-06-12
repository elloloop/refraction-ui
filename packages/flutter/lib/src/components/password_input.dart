import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'input.dart';

/// A password field with a built-in reveal/hide toggle.
///
/// Wraps [RefractionInput], toggling the masking of the underlying field
/// between obscured and plain text via a trailing eye button. Mirrors the
/// React/Astro `PasswordInput` adapter — it forwards [validationState],
/// [leadingIcon], [controller], [onChanged] and friends straight through to
/// the underlying input.
///
/// ```dart
/// RefractionPasswordField(
///   placeholder: 'Password',
///   leadingIcon: const Icon(Icons.lock_outline),
///   onChanged: (value) => password = value,
/// )
/// ```
class RefractionPasswordField extends StatefulWidget {
  /// Optional externally-managed controller forwarded to [RefractionInput].
  final TextEditingController? controller;

  /// Optional externally-managed focus node forwarded to [RefractionInput].
  final FocusNode? focusNode;

  /// Hint text shown when the field is empty.
  final String? placeholder;

  /// When true, the field is dimmed and read-only.
  final bool disabled;

  /// Optional leading icon (e.g. a lock) forwarded to [RefractionInput].
  final Widget? leadingIcon;

  /// Optional validation affordance forwarded to [RefractionInput].
  final RefractionInputValidationState? validationState;

  /// Called on every keystroke with the current text.
  final ValueChanged<String>? onChanged;

  /// Called when the user submits the field.
  final ValueChanged<String>? onSubmitted;

  /// Accessible label for the reveal action. Defaults to `'Show password'`.
  final String revealLabel;

  /// Accessible label for the hide action. Defaults to `'Hide password'`.
  final String hideLabel;

  /// Creates a [RefractionPasswordField].
  const RefractionPasswordField({
    super.key,
    this.controller,
    this.focusNode,
    this.placeholder,
    this.disabled = false,
    this.leadingIcon,
    this.validationState,
    this.onChanged,
    this.onSubmitted,
    this.revealLabel = 'Show password',
    this.hideLabel = 'Hide password',
  });

  @override
  State<RefractionPasswordField> createState() =>
      _RefractionPasswordFieldState();
}

class _RefractionPasswordFieldState extends State<RefractionPasswordField> {
  bool _revealed = false;

  void _toggle() => setState(() => _revealed = !_revealed);

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;

    return RefractionInput(
      controller: widget.controller,
      focusNode: widget.focusNode,
      placeholder: widget.placeholder,
      disabled: widget.disabled,
      leadingIcon: widget.leadingIcon,
      validationState: widget.validationState,
      obscureText: !_revealed,
      onChanged: widget.onChanged,
      onSubmitted: widget.onSubmitted,
      suffix: Semantics(
        button: true,
        label: _revealed ? widget.hideLabel : widget.revealLabel,
        child: MouseRegion(
          cursor: widget.disabled
              ? SystemMouseCursors.forbidden
              : SystemMouseCursors.click,
          child: GestureDetector(
            onTap: widget.disabled ? null : _toggle,
            child: Icon(
              _revealed ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              size: 16,
              color: colors.mutedForeground,
            ),
          ),
        ),
      ),
    );
  }
}
