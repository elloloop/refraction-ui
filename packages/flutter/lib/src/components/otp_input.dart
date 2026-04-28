import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

/// A segmented one-time-password (OTP) input rendered as a row of single
/// digit fields.
///
/// `RefractionOtpInput` is the Flutter counterpart of the `RefractionOtpInput`
/// component shipped with the React, Angular and Astro versions of Refraction
/// UI (a shadcn-equivalent pattern). It exposes [length] independent boxes,
/// only accepts digits, and automatically advances focus as the user types.
/// Pressing backspace inside an empty box jumps focus to the previous box
/// for fast correction.
///
/// Two callbacks are provided:
///
///  * [onChanged] fires on every keystroke with the partial value.
///  * [onCompleted] fires once when the user has filled every box.
///
/// ```dart
/// RefractionOtpInput(
///   length: 6,
///   autofocus: true,
///   onChanged: (value) => debugPrint('partial: $value'),
///   onCompleted: (value) => verifyOtp(value),
/// );
/// ```
///
/// The borders animate between [RefractionColors.input], [RefractionColors.border]
/// and [RefractionColors.ring] depending on focus and fill state.
class RefractionOtpInput extends StatefulWidget {
  /// Number of digit boxes rendered. Defaults to `6`.
  final int length;

  /// Called once when every box has been filled with a digit.
  final ValueChanged<String>? onCompleted;

  /// Called on every change with the concatenated partial value.
  final ValueChanged<String>? onChanged;

  /// When `true`, the first box is focused on mount.
  final bool autofocus;

  /// Creates an OTP input with [length] boxes.
  const RefractionOtpInput({
    super.key,
    this.length = 6,
    this.onCompleted,
    this.onChanged,
    this.autofocus = false,
  });

  @override
  State<RefractionOtpInput> createState() => _RefractionOtpInputState();
}

class _RefractionOtpInputState extends State<RefractionOtpInput> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;
  int _focusedIndex = -1;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (index) {
      final node = FocusNode();
      node.addListener(() {
        if (node.hasFocus) {
          setState(() {
            _focusedIndex = index;
          });
        }
      });
      node.onKeyEvent = (node, event) {
        if (event is KeyDownEvent &&
            event.logicalKey == LogicalKeyboardKey.backspace) {
          if (_controllers[index].text.isEmpty && index > 0) {
            // If the field is already empty, backspace should jump back and highlight previous
            _focusNodes[index - 1].requestFocus();
            // Don't fully handle it, let the previous field handle the actual deletion if needed next time
            // Or just handle the jump explicitly
            return KeyEventResult.handled;
          }
        }
        return KeyEventResult.ignored;
      };
      return node;
    });

    if (widget.autofocus) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _focusNodes[0].requestFocus();
      });
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onChanged(String value, int index) {
    if (value.isNotEmpty) {
      if (index < widget.length - 1) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
        setState(() {
          _focusedIndex = -1;
        });
      }
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }

    final fullOtp = _controllers.map((c) => c.text).join();
    if (widget.onChanged != null) widget.onChanged!(fullOtp);
    if (fullOtp.length == widget.length && widget.onCompleted != null) {
      widget.onCompleted!(fullOtp);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(widget.length, (index) {
        final isFocused = _focusedIndex == index;
        final isFilled = _controllers[index].text.isNotEmpty;
        final borderColor = isFocused
            ? colors.ring
            : (isFilled ? colors.border : colors.input);

        return Container(
          width: 44, // Reduced from 48 to safely fit 6 bounds on 360px viewport
          height: 48,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            color: colors.background,
            border: Border.all(color: borderColor, width: isFocused ? 2 : 1),
            borderRadius: BorderRadius.circular(theme.borderRadius),
          ),
          alignment: Alignment.center,
          child: TextField(
            controller: _controllers[index],
            focusNode: _focusNodes[index],
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(1),
            ],
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: colors.foreground,
            ),
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
              counterText: '',
            ),
            onChanged: (value) => _onChanged(value, index),
          ),
        );
      }),
    );
  }
}
