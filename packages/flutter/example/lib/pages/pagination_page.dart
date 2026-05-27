import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class PaginationPage extends StatefulWidget {
  const PaginationPage({super.key});

  @override
  State<PaginationPage> createState() => _PaginationPageState();
}

class _PaginationPageState extends State<PaginationPage> {
  int _currentPage1 = 1;
  int _currentPage2 = 5;
  int _currentPage3 = 50;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final textStyle = theme.data.textStyle.copyWith(
      fontWeight: FontWeight.bold,
      fontSize: 18,
    );

    return PreviewCanvas(
      title: "Pagination",
      description:
          "A component that displays a series of pages, with controls to navigate forward, backward, or jump to specific pages.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Basic Pagination", style: textStyle),
              const SizedBox(height: 16),
              RefractionPagination(
                totalPages: 10,
                currentPage: _currentPage1,
                onPageChanged: (page) => setState(() => _currentPage1 = page),
              ),
              const SizedBox(height: 48),

              Text("Without Previous/Next Labels", style: textStyle),
              const SizedBox(height: 16),
              RefractionPagination(
                totalPages: 10,
                currentPage: _currentPage2,
                previousLabel: null,
                nextLabel: null,
                onPageChanged: (page) => setState(() => _currentPage2 = page),
              ),
              const SizedBox(height: 48),

              Text("Large Range", style: textStyle),
              const SizedBox(height: 16),
              RefractionPagination(
                totalPages: 100,
                currentPage: _currentPage3,
                onPageChanged: (page) => setState(() => _currentPage3 = page),
              ),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}
