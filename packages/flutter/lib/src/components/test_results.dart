import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// The execution status of a single test case.
enum TestStatus { pass, fail, skip }

/// Data for a single test case result.
class TestResultData {
  /// Unique identifier for the test.
  final String id;

  /// Human-readable test name.
  final String name;

  /// Execution status.
  final TestStatus status;

  /// How long the test took to run, in milliseconds.
  final int? durationMs;

  /// Expected value (shown in diff when the test fails).
  final String? expected;

  /// Actual value received (shown in diff when the test fails).
  final String? actual;

  /// Optional message — error message on failure, skip reason, etc.
  final String? message;

  const TestResultData({
    required this.id,
    required this.name,
    required this.status,
    this.durationMs,
    this.expected,
    this.actual,
    this.message,
  });
}

/// Displays a list of test case results with pass/fail/skip status.
class RefractionTestResults extends StatelessWidget {
  /// Array of test case results to display.
  final List<TestResultData> results;

  /// When true, renders a summary bar showing "{passed}/{total} passed".
  final bool showSummary;

  const RefractionTestResults({
    super.key,
    required this.results,
    this.showSummary = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    const successColor = Color(0xFF22C55E);

    final passed = results.where((r) => r.status == TestStatus.pass).length;
    final failed = results.where((r) => r.status == TestStatus.fail).length;
    final skipped = results.where((r) => r.status == TestStatus.skip).length;
    final total = results.length;

    final hasFailures = failed > 0;
    final hasSkips = skipped > 0;

    // Summary bar background, border, text color
    Color summaryBg;
    Color summaryBorder;
    Color summaryTextColor;
    if (hasFailures) {
      summaryBg = colors.destructive.withValues(alpha: 0.1);
      summaryBorder = colors.destructive.withValues(alpha: 0.3);
      summaryTextColor = colors.destructive;
    } else if (hasSkips) {
      summaryBg = colors.muted.withValues(alpha: 0.1);
      summaryBorder = colors.border.withValues(alpha: 0.3);
      summaryTextColor = colors.mutedForeground;
    } else {
      summaryBg = successColor.withValues(alpha: 0.1);
      summaryBorder = successColor.withValues(alpha: 0.3);
      summaryTextColor = successColor;
    }

    Widget buildSummaryBar() {
      final textParts = <String>[];
      textParts.add('$passed/$total passed');
      if (failed > 0) textParts.add('· $failed failed');
      if (skipped > 0) textParts.add('· $skipped skipped');

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: summaryBg,
          border: Border.all(color: summaryBorder),
          borderRadius: BorderRadius.circular(theme.borderRadius),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                textParts.join(' '),
                style: theme.textStyle.copyWith(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: summaryTextColor,
                ),
              ),
            ),
          ],
        ),
      );
    }

    Widget buildTestRow(TestResultData result) {
      Color rowBg;
      Color rowBorder;
      Color badgeBg;
      Color badgeTextColor;
      String statusLabel;

      switch (result.status) {
        case TestStatus.pass:
          rowBg = successColor.withValues(alpha: 0.05);
          rowBorder = successColor.withValues(alpha: 0.2);
          badgeBg = successColor.withValues(alpha: 0.2);
          badgeTextColor = successColor;
          statusLabel = 'PASS';
          break;
        case TestStatus.fail:
          rowBg = colors.destructive.withValues(alpha: 0.05);
          rowBorder = colors.destructive.withValues(alpha: 0.2);
          badgeBg = colors.destructive.withValues(alpha: 0.2);
          badgeTextColor = colors.destructive;
          statusLabel = 'FAIL';
          break;
        case TestStatus.skip:
          rowBg = colors.muted.withValues(alpha: 0.05);
          rowBorder = colors.border.withValues(alpha: 0.2);
          badgeBg = colors.muted;
          badgeTextColor = colors.mutedForeground;
          statusLabel = 'SKIP';
          break;
      }

      return Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: rowBg,
          borderRadius: BorderRadius.circular(theme.borderRadius),
          border: Border.all(color: rowBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    statusLabel,
                    style: theme.textStyle.copyWith(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: badgeTextColor,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    result.name,
                    style: theme.textStyle.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: colors.foreground,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (result.durationMs != null) ...[
                  const SizedBox(width: 8),
                  Text(
                    '${result.durationMs} ms',
                    style: theme.textStyle.copyWith(
                      fontSize: 12,
                      color: colors.mutedForeground,
                    ),
                  ),
                ],
              ],
            ),
            if (result.status == TestStatus.fail && result.expected != null) ...[
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: colors.muted.withValues(alpha: 0.3),
                  border: const Border(
                    left: BorderSide(color: successColor, width: 2),
                  ),
                  borderRadius: BorderRadius.only(
                    topRight: Radius.circular(theme.borderRadius),
                    bottomRight: Radius.circular(theme.borderRadius),
                  ),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: RichText(
                  text: TextSpan(
                    style: theme.textStyle.copyWith(
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: successColor,
                    ),
                    children: [
                      TextSpan(
                        text: 'expected ',
                        style: TextStyle(color: successColor.withValues(alpha: 0.6)),
                      ),
                      TextSpan(text: result.expected),
                    ],
                  ),
                ),
              ),
              if (result.actual != null) ...[
                const SizedBox(height: 4),
                Container(
                  decoration: BoxDecoration(
                    color: colors.muted.withValues(alpha: 0.3),
                    border: Border(
                      left: BorderSide(color: colors.destructive, width: 2),
                    ),
                    borderRadius: BorderRadius.only(
                      topRight: Radius.circular(theme.borderRadius),
                      bottomRight: Radius.circular(theme.borderRadius),
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: RichText(
                    text: TextSpan(
                      style: theme.textStyle.copyWith(
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: colors.destructive,
                      ),
                      children: [
                        TextSpan(
                          text: 'actual   ',
                          style: TextStyle(color: colors.destructive.withValues(alpha: 0.6)),
                        ),
                        TextSpan(text: result.actual),
                      ],
                    ),
                  ),
                ),
              ],
            ],
            if (result.message != null && result.message!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                result.message!,
                style: theme.textStyle.copyWith(
                  fontSize: 12,
                  color: colors.mutedForeground,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (showSummary && results.isNotEmpty) ...[
          buildSummaryBar(),
          const SizedBox(height: 12),
        ],
        ...results.map((r) => buildTestRow(r)),
      ],
    );
  }
}
