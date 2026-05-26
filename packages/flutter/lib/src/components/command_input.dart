import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'input.dart';

/// A pattern used to match a command trigger in a [RefractionCommandInput].
class CommandTrigger {
  /// The character that triggers the command sequence, e.g., `/` or `@`.
  final String char;

  /// An optional regex pattern the sequence text must match to remain valid.
  final RegExp? pattern;

  /// Creates a [CommandTrigger].
  const CommandTrigger({required this.char, this.pattern});
}

/// A text input field that detects command sequences (e.g. `@mentions` or `/commands`)
/// and displays a popover to resolve them.
class RefractionCommandInput extends StatefulWidget {
  /// The controller for the text input.
  final TextEditingController? controller;

  /// The hint text shown when empty.
  final String? placeholder;

  /// The list of triggers to detect.
  final List<CommandTrigger> triggers;

  /// A builder for the popover shown when a command is active.
  final Widget Function(
    BuildContext context,
    String trigger,
    String search,
    VoidCallback close,
  )?
  popoverBuilder;

  /// Called on every text change.
  final ValueChanged<String>? onChanged;

  /// A callback when a command is committed (e.g., user hits Enter or selects from the popover).
  final void Function(String trigger, String search)? onCommandCommit;

  /// Creates a [RefractionCommandInput].
  const RefractionCommandInput({
    super.key,
    this.controller,
    this.placeholder,
    this.triggers = const [],
    this.popoverBuilder,
    this.onChanged,
    this.onCommandCommit,
  });

  @override
  State<RefractionCommandInput> createState() => _RefractionCommandInputState();
}

class _RefractionCommandInputState extends State<RefractionCommandInput> {
  late TextEditingController _controller;
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;

  bool _isOpen = false;
  String _activeTrigger = '';
  String _activeSearch = '';

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _controller.addListener(_handleInput);
  }

  @override
  void didUpdateWidget(RefractionCommandInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != oldWidget.controller) {
      if (oldWidget.controller == null) {
        _controller.dispose();
      } else {
        oldWidget.controller!.removeListener(_handleInput);
      }
      _controller = widget.controller ?? TextEditingController();
      _controller.addListener(_handleInput);
    }
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    } else {
      _controller.removeListener(_handleInput);
    }
    _closePopover(isDisposing: true);
    super.dispose();
  }

  void _handleInput() {
    if (widget.onChanged != null) {
      widget.onChanged!(_controller.text);
    }

    _parseText();
  }

  void _parseText() {
    final text = _controller.text;
    final cursorPosition = _controller.selection.baseOffset;

    if (cursorPosition < 0 || cursorPosition > text.length) {
      _cancelCommand();
      return;
    }

    for (int i = cursorPosition - 1; i >= 0; i--) {
      final char = text[i];
      final matchedTrigger = widget.triggers
          .where((t) => t.char == char)
          .firstOrNull;

      if (matchedTrigger != null) {
        final isStartOfWord = i == 0 || RegExp(r'\s').hasMatch(text[i - 1]);
        if (isStartOfWord) {
          final commandText = text.substring(i + 1, cursorPosition);
          if (!RegExp(r'\s').hasMatch(commandText)) {
            bool isValid = true;
            if (matchedTrigger.pattern != null) {
              isValid = matchedTrigger.pattern!.hasMatch(commandText);
            }
            if (isValid) {
              _triggerCommand(matchedTrigger.char, commandText);
              return;
            }
          }
        }
        break;
      }

      if (RegExp(r'\s').hasMatch(char)) {
        break;
      }
    }

    _cancelCommand();
  }

  void _triggerCommand(String trigger, String search) {
    if (!_isOpen || _activeTrigger != trigger || _activeSearch != search) {
      _activeTrigger = trigger;
      _activeSearch = search;
      if (!_isOpen) {
        _showPopover();
      } else {
        _overlayEntry?.markNeedsBuild();
      }
    }
  }

  void _cancelCommand() {
    if (_isOpen) {
      _closePopover();
    }
  }

  void _showPopover() {
    if (widget.popoverBuilder == null) return;
    _isOpen = true;

    _overlayEntry = OverlayEntry(
      builder: (context) {
        final RenderBox renderBox =
            this.context.findRenderObject() as RenderBox;
        final size = renderBox.size;

        return Stack(
          children: [
            Positioned(
              width: size.width,
              child: CompositedTransformFollower(
                link: _layerLink,
                showWhenUnlinked: false,
                offset: Offset(0, size.height + 8),
                child: Material(
                  color: Colors.transparent,
                  child: widget.popoverBuilder!(
                    context,
                    _activeTrigger,
                    _activeSearch,
                    _closePopover,
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
    Overlay.of(context).insert(_overlayEntry!);
  }

  void _closePopover({bool isDisposing = false}) {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted && !isDisposing) {
      setState(() {
        _isOpen = false;
        _activeTrigger = '';
        _activeSearch = '';
      });
    } else {
      _isOpen = false;
      _activeTrigger = '';
      _activeSearch = '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent && _isOpen) {
          if (event.logicalKey == LogicalKeyboardKey.escape) {
            _closePopover();
            return KeyEventResult.handled;
          }
        }
        return KeyEventResult.ignored;
      },
      child: CompositedTransformTarget(
        link: _layerLink,
        child: RefractionInput(
          controller: _controller,
          placeholder: widget.placeholder,
          onSubmitted: (value) {
            if (_isOpen) {
              if (widget.onCommandCommit != null) {
                widget.onCommandCommit!(_activeTrigger, _activeSearch);
              }
              _closePopover();
            }
          },
        ),
      ),
    );
  }
}
