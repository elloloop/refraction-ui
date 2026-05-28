import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

/// The severity level of a log entry.
enum RefractionLogLevel { debug, info, warning, error }

/// A single entry in the [RefractionLogger].
class RefractionLogEntry {
  final RefractionLogLevel level;
  final String message;
  final DateTime timestamp;
  final Map<String, dynamic>? data;

  const RefractionLogEntry({
    required this.level,
    required this.message,
    required this.timestamp,
    this.data,
  });
}

/// A developer-oriented log viewer component.
///
/// Displays a list of [RefractionLogEntry] items in a monospace,
/// terminal-like interface. Supports filtering by log level and
/// copying logs to the clipboard.
class RefractionLogger extends StatefulWidget {
  /// The list of log entries to display.
  final List<RefractionLogEntry> logs;

  /// Whether to show the filter toolbar. Defaults to `true`.
  final bool showFilters;

  /// Whether to show the copy-to-clipboard button. Defaults to `true`.
  final bool showCopy;

  /// The maximum height of the logger. If null, it will size itself to
  /// its parent (e.g., if placed in an Expanded).
  final double? height;

  /// A custom builder for individual log items.
  final Widget Function(BuildContext context, RefractionLogEntry entry)?
  itemBuilder;

  const RefractionLogger({
    super.key,
    required this.logs,
    this.showFilters = true,
    this.showCopy = true,
    this.height,
    this.itemBuilder,
  });

  @override
  State<RefractionLogger> createState() => _RefractionLoggerState();
}

class _RefractionLoggerState extends State<RefractionLogger> {
  final Set<RefractionLogLevel> _activeFilters = {
    RefractionLogLevel.debug,
    RefractionLogLevel.info,
    RefractionLogLevel.warning,
    RefractionLogLevel.error,
  };

  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _toggleFilter(RefractionLogLevel level) {
    setState(() {
      if (_activeFilters.contains(level)) {
        _activeFilters.remove(level);
      } else {
        _activeFilters.add(level);
      }
    });
  }

  void _copyLogs() {
    final filteredLogs = widget.logs
        .where((l) => _activeFilters.contains(l.level))
        .toList();
    final buffer = StringBuffer();
    for (final log in filteredLogs) {
      final timeString =
          '${log.timestamp.hour.toString().padLeft(2, '0')}:${log.timestamp.minute.toString().padLeft(2, '0')}:${log.timestamp.second.toString().padLeft(2, '0')}';
      buffer.writeln(
        '[$timeString] [${log.level.name.toUpperCase()}] ${log.message}',
      );
      if (log.data != null) {
        buffer.writeln('  Data: ${log.data}');
      }
    }
    Clipboard.setData(ClipboardData(text: buffer.toString()));
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Logs copied to clipboard')));
  }

  Color _getColorForLevel(RefractionLogLevel level, BuildContext context) {
    final colors = RefractionTheme.of(context).colors;
    switch (level) {
      case RefractionLogLevel.debug:
        return colors.foreground.withValues(alpha: 0.5);
      case RefractionLogLevel.info:
        return colors.primary;
      case RefractionLogLevel.warning:
        return Color(0xFFF59E0B);
      case RefractionLogLevel.error:
        return colors.destructive;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final filteredLogs = widget.logs
        .where((l) => _activeFilters.contains(l.level))
        .toList();

    Widget content = Container(
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (widget.showFilters || widget.showCopy)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: colors.border)),
              ),
              child: Row(
                children: [
                  if (widget.showFilters) ...[
                    _FilterChip(
                      label: 'Debug',
                      isActive: _activeFilters.contains(
                        RefractionLogLevel.debug,
                      ),
                      onTap: () => _toggleFilter(RefractionLogLevel.debug),
                      activeColor: _getColorForLevel(
                        RefractionLogLevel.debug,
                        context,
                      ),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Info',
                      isActive: _activeFilters.contains(
                        RefractionLogLevel.info,
                      ),
                      onTap: () => _toggleFilter(RefractionLogLevel.info),
                      activeColor: _getColorForLevel(
                        RefractionLogLevel.info,
                        context,
                      ),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Warn',
                      isActive: _activeFilters.contains(
                        RefractionLogLevel.warning,
                      ),
                      onTap: () => _toggleFilter(RefractionLogLevel.warning),
                      activeColor: _getColorForLevel(
                        RefractionLogLevel.warning,
                        context,
                      ),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Error',
                      isActive: _activeFilters.contains(
                        RefractionLogLevel.error,
                      ),
                      onTap: () => _toggleFilter(RefractionLogLevel.error),
                      activeColor: _getColorForLevel(
                        RefractionLogLevel.error,
                        context,
                      ),
                    ),
                  ],
                  const Spacer(),
                  if (widget.showCopy)
                    IconButton(
                      icon: Icon(
                        Icons.copy,
                        size: 16,
                        color: colors.foreground.withValues(alpha: 0.7),
                      ),
                      onPressed: _copyLogs,
                      tooltip: 'Copy Logs',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(
                        minWidth: 32,
                        minHeight: 32,
                      ),
                      splashRadius: 16,
                    ),
                ],
              ),
            ),
          Expanded(
            child: filteredLogs.isEmpty
                ? Center(
                    child: Text(
                      'No logs to display',
                      style: theme.data.textStyle.copyWith(
                        color: colors.foreground.withValues(alpha: 0.5),
                      ),
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(12),
                    itemCount: filteredLogs.length,
                    itemBuilder: (context, index) {
                      final log = filteredLogs[index];
                      if (widget.itemBuilder != null) {
                        return widget.itemBuilder!(context, log);
                      }
                      return _LogItem(log: log);
                    },
                  ),
          ),
        ],
      ),
    );

    if (widget.height != null) {
      return SizedBox(height: widget.height, child: content);
    }

    return content;
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final Color activeColor;

  const _FilterChip({
    required this.label,
    required this.isActive,
    required this.onTap,
    required this.activeColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isActive
              ? activeColor.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(theme.borderRadius / 2),
          border: Border.all(
            color: isActive
                ? activeColor.withValues(alpha: 0.5)
                : colors.border,
          ),
        ),
        child: Text(
          label,
          style: theme.data.textStyle.copyWith(
            fontSize: 12,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            color: isActive
                ? activeColor
                : colors.foreground.withValues(alpha: 0.7),
          ),
        ),
      ),
    );
  }
}

class _LogItem extends StatelessWidget {
  final RefractionLogEntry log;

  const _LogItem({required this.log});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    Color levelColor;
    switch (log.level) {
      case RefractionLogLevel.debug:
        levelColor = colors.foreground.withValues(alpha: 0.5);
        break;
      case RefractionLogLevel.info:
        levelColor = colors.primary;
        break;
      case RefractionLogLevel.warning:
        levelColor = Color(0xFFF59E0B);
        break;
      case RefractionLogLevel.error:
        levelColor = colors.destructive;
        break;
    }

    final timeString =
        '${log.timestamp.hour.toString().padLeft(2, '0')}:${log.timestamp.minute.toString().padLeft(2, '0')}:${log.timestamp.second.toString().padLeft(2, '0')}';

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '[$timeString]',
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: 12,
              color: colors.foreground.withValues(alpha: 0.5),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 48,
            child: Text(
              log.level.name.toUpperCase(),
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: levelColor,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  log.message,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: colors.foreground,
                  ),
                ),
                if (log.data != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      log.data.toString(),
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: colors.foreground.withValues(alpha: 0.7),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
