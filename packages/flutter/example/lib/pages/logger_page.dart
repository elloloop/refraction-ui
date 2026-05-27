import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class LoggerPage extends StatefulWidget {
  const LoggerPage({super.key});

  @override
  State<LoggerPage> createState() => _LoggerPageState();
}

class _LoggerPageState extends State<LoggerPage> {
  final List<RefractionLogEntry> _logs = [
    RefractionLogEntry(
      level: RefractionLogLevel.info,
      message: 'Application started successfully',
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
    RefractionLogEntry(
      level: RefractionLogLevel.debug,
      message: 'Connecting to database at localhost:5432...',
      timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
    ),
    RefractionLogEntry(
      level: RefractionLogLevel.debug,
      message: 'Database connection established',
      timestamp: DateTime.now().subtract(const Duration(minutes: 3)),
    ),
    RefractionLogEntry(
      level: RefractionLogLevel.info,
      message: 'User authentication initiated',
      timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
      data: {'userId': 'user_123', 'provider': 'email'},
    ),
    RefractionLogEntry(
      level: RefractionLogLevel.warning,
      message: 'Response delay from auth server',
      timestamp: DateTime.now().subtract(const Duration(minutes: 1)),
      data: {'latency_ms': 1204},
    ),
    RefractionLogEntry(
      level: RefractionLogLevel.error,
      message: 'Failed to sync user profile data',
      timestamp: DateTime.now(),
      data: {'error': 'Network timeout', 'retry_count': 3},
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Logger",
      description:
          "A developer-oriented component for viewing application logs, complete with filtering by severity level and clipboard copying support.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Standard Logger",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionLogger(logs: _logs, height: 300),

              const SizedBox(height: 48),
              Text(
                "Read-only Logger (No Headers)",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionLogger(
                logs: _logs
                    .where((l) => l.level == RefractionLogLevel.error)
                    .toList(),
                height: 150,
                showFilters: false,
                showCopy: false,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
