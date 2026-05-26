import 'dart:async';
import 'package:flutter/material.dart';
import 'input.dart';

/// A search bar that debounces user input and provides a loading state.
///
/// Mirrors the search-bar component from the web packages.
class RefractionSearchBar extends StatefulWidget {
  final String? placeholder;
  final ValueChanged<String>? onSearch;
  final ValueChanged<String>? onChanged;
  final Duration debounceDuration;
  final bool isLoading;

  const RefractionSearchBar({
    super.key,
    this.placeholder = 'Search...',
    this.onSearch,
    this.onChanged,
    this.debounceDuration = const Duration(milliseconds: 300),
    this.isLoading = false,
  });

  @override
  State<RefractionSearchBar> createState() => _RefractionSearchBarState();
}

class _RefractionSearchBarState extends State<RefractionSearchBar> {
  final TextEditingController _controller = TextEditingController();
  Timer? _debounceTimer;

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    widget.onChanged?.call(value);

    if (_debounceTimer?.isActive ?? false) _debounceTimer!.cancel();

    if (value.isNotEmpty) {
      _debounceTimer = Timer(widget.debounceDuration, () {
        widget.onSearch?.call(value);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefractionInput(
      controller: _controller,
      placeholder: widget.placeholder,
      onChanged: _onChanged,
      prefix: const Icon(Icons.search, size: 16),
      suffix: widget.isLoading
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : null,
    );
  }
}
