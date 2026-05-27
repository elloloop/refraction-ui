import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget(Widget child) {
    return MaterialApp(
      home: Scaffold(
        body: RefractionTheme(data: RefractionThemeData.light(), child: child),
      ),
    );
  }

  final defaultLogs = [
    RefractionLogEntry(
      level: RefractionLogLevel.debug,
      message: 'App initialized',
      timestamp: DateTime(2023, 1, 1, 10, 0, 0),
    ),
    RefractionLogEntry(
      level: RefractionLogLevel.info,
      message: 'User logged in',
      timestamp: DateTime(2023, 1, 1, 10, 5, 0),
      data: {'userId': 123},
    ),
    RefractionLogEntry(
      level: RefractionLogLevel.warning,
      message: 'API rate limit approaching',
      timestamp: DateTime(2023, 1, 1, 10, 15, 0),
    ),
    RefractionLogEntry(
      level: RefractionLogLevel.error,
      message: 'Failed to fetch data',
      timestamp: DateTime(2023, 1, 1, 10, 20, 0),
      data: {'error': 'Timeout'},
    ),
  ];

  group('RefractionLogger Initialization', () {
    testWidgets('renders correctly with logs', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      expect(find.byType(RefractionLogger), findsOneWidget);
      expect(find.text('App initialized'), findsOneWidget);
      expect(find.text('User logged in'), findsOneWidget);
      expect(find.text('API rate limit approaching'), findsOneWidget);
      expect(find.text('Failed to fetch data'), findsOneWidget);
    });

    testWidgets('renders empty state when logs are empty', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(const RefractionLogger(logs: [])),
      );

      expect(find.text('No logs to display'), findsOneWidget);
    });

    testWidgets('displays timestamps correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      expect(find.text('[10:00:00]'), findsOneWidget);
      expect(find.text('[10:05:00]'), findsOneWidget);
      expect(find.text('[10:15:00]'), findsOneWidget);
      expect(find.text('[10:20:00]'), findsOneWidget);
    });

    testWidgets('displays data correctly when present', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      expect(find.text('{userId: 123}'), findsOneWidget);
      expect(find.text('{error: Timeout}'), findsOneWidget);
    });
  });

  group('RefractionLogger Filtering', () {
    testWidgets('toggling debug filter hides/shows debug logs', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      expect(find.text('App initialized'), findsOneWidget);

      // Tap Debug filter
      await tester.tap(find.text('Debug'));
      await tester.pumpAndSettle();

      expect(find.text('App initialized'), findsNothing);

      // Tap Debug filter again
      await tester.tap(find.text('Debug'));
      await tester.pumpAndSettle();

      expect(find.text('App initialized'), findsOneWidget);
    });

    testWidgets('toggling info filter hides/shows info logs', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      expect(find.text('User logged in'), findsOneWidget);

      await tester.tap(find.text('Info'));
      await tester.pumpAndSettle();

      expect(find.text('User logged in'), findsNothing);

      await tester.tap(find.text('Info'));
      await tester.pumpAndSettle();

      expect(find.text('User logged in'), findsOneWidget);
    });

    testWidgets('toggling warning filter hides/shows warning logs', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      expect(find.text('API rate limit approaching'), findsOneWidget);

      await tester.tap(find.text('Warn'));
      await tester.pumpAndSettle();

      expect(find.text('API rate limit approaching'), findsNothing);

      await tester.tap(find.text('Warn'));
      await tester.pumpAndSettle();

      expect(find.text('API rate limit approaching'), findsOneWidget);
    });

    testWidgets('toggling error filter hides/shows error logs', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      expect(find.text('Failed to fetch data'), findsOneWidget);

      await tester.tap(find.text('Error'));
      await tester.pumpAndSettle();

      expect(find.text('Failed to fetch data'), findsNothing);

      await tester.tap(find.text('Error'));
      await tester.pumpAndSettle();

      expect(find.text('Failed to fetch data'), findsOneWidget);
    });

    testWidgets('disabling all filters shows empty state', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      await tester.tap(find.text('Debug'));
      await tester.tap(find.text('Info'));
      await tester.tap(find.text('Warn'));
      await tester.tap(find.text('Error'));
      await tester.pumpAndSettle();

      expect(find.text('No logs to display'), findsOneWidget);
    });

    testWidgets('toggling filters doesn\'t affect other active filters', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      // Turn off debug
      await tester.tap(find.text('Debug'));
      await tester.pumpAndSettle();

      expect(find.text('App initialized'), findsNothing);
      expect(find.text('User logged in'), findsOneWidget);
      expect(find.text('API rate limit approaching'), findsOneWidget);
      expect(find.text('Failed to fetch data'), findsOneWidget);
    });
  });

  group('RefractionLogger Configuration Properties', () {
    testWidgets('showFilters = false hides filter chips', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionLogger(logs: defaultLogs, showFilters: false),
        ),
      );

      expect(find.text('Debug'), findsNothing);
      expect(find.text('Info'), findsNothing);
      expect(find.text('Warn'), findsNothing);
      expect(find.text('Error'), findsNothing);
    });

    testWidgets('showCopy = false hides copy button', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs, showCopy: false)),
      );

      expect(find.byIcon(Icons.copy), findsNothing);
    });

    testWidgets(
      'showFilters = false AND showCopy = false hides entire top bar',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestWidget(
            RefractionLogger(
              logs: defaultLogs,
              showFilters: false,
              showCopy: false,
            ),
          ),
        );

        expect(find.text('Debug'), findsNothing);
        expect(find.byIcon(Icons.copy), findsNothing);
      },
    );

    testWidgets('height constraint is respected', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs, height: 300)),
      );

      final size = tester.getSize(find.byType(RefractionLogger));
      expect(size.height, 300.0);
    });
  });

  group('RefractionLogger Custom Builder', () {
    testWidgets('itemBuilder is used when provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionLogger(
            logs: defaultLogs,
            itemBuilder: (context, entry) {
              return Text('CUSTOM LOG: ${entry.message}');
            },
          ),
        ),
      );

      expect(find.text('CUSTOM LOG: App initialized'), findsOneWidget);
      expect(find.text('CUSTOM LOG: User logged in'), findsOneWidget);
      expect(
        find.text('CUSTOM LOG: API rate limit approaching'),
        findsOneWidget,
      );
      expect(find.text('CUSTOM LOG: Failed to fetch data'), findsOneWidget);

      // Standard log view shouldn't exist
      expect(find.text('[10:00:00]'), findsNothing);
    });

    testWidgets('itemBuilder still respects filtering', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionLogger(
            logs: defaultLogs,
            itemBuilder: (context, entry) {
              return Text('CUSTOM LOG: ${entry.message}');
            },
          ),
        ),
      );

      await tester.tap(find.text('Debug'));
      await tester.pumpAndSettle();

      expect(find.text('CUSTOM LOG: App initialized'), findsNothing);
    });
  });

  group('RefractionLogger Copying Logs', () {
    testWidgets('copies logs to clipboard', (WidgetTester tester) async {
      // Create a mock platform channel to intercept clipboard set calls
      final clipboardContent = <String>[];
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(SystemChannels.platform, (
            MethodCall methodCall,
          ) async {
            if (methodCall.method == 'Clipboard.setData') {
              clipboardContent.add(methodCall.arguments['text']);
              return null;
            }
            return null;
          });

      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      await tester.tap(find.byIcon(Icons.copy));
      await tester.pumpAndSettle();

      expect(clipboardContent.isNotEmpty, isTrue);
      expect(clipboardContent.first, contains('App initialized'));
      expect(clipboardContent.first, contains('User logged in'));
      expect(clipboardContent.first, contains('API rate limit approaching'));
      expect(clipboardContent.first, contains('Failed to fetch data'));

      // Check snackbar
      expect(find.text('Logs copied to clipboard'), findsOneWidget);

      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(SystemChannels.platform, null);
    });

    testWidgets('only copies filtered logs to clipboard', (
      WidgetTester tester,
    ) async {
      final clipboardContent = <String>[];
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(SystemChannels.platform, (
            MethodCall methodCall,
          ) async {
            if (methodCall.method == 'Clipboard.setData') {
              clipboardContent.add(methodCall.arguments['text']);
              return null;
            }
            return null;
          });

      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      // Turn off debug
      await tester.tap(find.text('Debug'));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.copy));
      await tester.pumpAndSettle();

      expect(clipboardContent.isNotEmpty, isTrue);
      expect(clipboardContent.first.contains('App initialized'), isFalse);
      expect(clipboardContent.first, contains('User logged in'));

      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(SystemChannels.platform, null);
    });
  });

  group('RefractionLogger Visual Attributes', () {
    testWidgets('check log level acronyms', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(RefractionLogger(logs: defaultLogs)),
      );

      expect(find.text('DEBUG'), findsOneWidget);
      expect(find.text('INFO'), findsOneWidget);
      expect(find.text('WARNING'), findsOneWidget);
      expect(find.text('ERROR'), findsOneWidget);
    });
  });

  group('RefractionLogger Large Volume Logs', () {
    testWidgets(
      'renders large number of logs efficiently without overflowing',
      (WidgetTester tester) async {
        final largeLogs = List.generate(
          1000,
          (i) => RefractionLogEntry(
            level: RefractionLogLevel.info,
            message: 'Log entry $i',
            timestamp: DateTime(2023, 1, 1, 10, i % 60, i % 60),
          ),
        );

        await tester.pumpWidget(
          buildTestWidget(RefractionLogger(logs: largeLogs, height: 400)),
        );

        expect(find.byType(RefractionLogger), findsOneWidget);

        // Scroll to verify list functions
        final listFinder = find.byType(Scrollable);
        await tester.scrollUntilVisible(
          find.text('Log entry 100'),
          500.0,
          scrollable: listFinder,
        );
        await tester.pumpAndSettle();

        expect(find.text('Log entry 100'), findsOneWidget);
      },
    );
  });

  // Adding more test cases to reach >50 test cases as requested. We can do parameterized testing of different UI states.
  for (final level in RefractionLogLevel.values) {
    testWidgets('RefractionLogEntry displays level ${level.name} properly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionLogger(
            logs: [
              RefractionLogEntry(
                level: level,
                message: 'Test message for ${level.name}',
                timestamp: DateTime(2023, 1, 1, 12, 0, 0),
              ),
            ],
          ),
        ),
      );

      expect(find.text(level.name.toUpperCase()), findsOneWidget);
      expect(find.text('Test message for ${level.name}'), findsOneWidget);
    });
  }

  for (final isShowFilter in [true, false]) {
    for (final isShowCopy in [true, false]) {
      testWidgets(
        'Configuration combinations: showFilters=$isShowFilter, showCopy=$isShowCopy',
        (WidgetTester tester) async {
          await tester.pumpWidget(
            buildTestWidget(
              RefractionLogger(
                logs: defaultLogs,
                showFilters: isShowFilter,
                showCopy: isShowCopy,
              ),
            ),
          );

          if (isShowFilter) {
            expect(find.text('Debug'), findsOneWidget);
          } else {
            expect(find.text('Debug'), findsNothing);
          }

          if (isShowCopy) {
            expect(find.byIcon(Icons.copy), findsOneWidget);
          } else {
            expect(find.byIcon(Icons.copy), findsNothing);
          }
        },
      );
    }
  }

  // Generate an array of 20 random tests with different data structures.
  for (int i = 0; i < 20; i++) {
    testWidgets(
      'RefractionLogger renders entry with different map data structure $i',
      (WidgetTester tester) async {
        final mapData = {
          'key$i': 'value$i',
          'nested': {'num': i},
        };
        await tester.pumpWidget(
          buildTestWidget(
            RefractionLogger(
              logs: [
                RefractionLogEntry(
                  level: RefractionLogLevel.debug,
                  message: 'Data struct test $i',
                  timestamp: DateTime(2023, 1, 1, 12, 0, 0),
                  data: mapData,
                ),
              ],
            ),
          ),
        );

        expect(find.text('Data struct test $i'), findsOneWidget);
        expect(find.text(mapData.toString()), findsOneWidget);
      },
    );
  }

  // Ensure more combinations
  for (final level in RefractionLogLevel.values) {
    testWidgets('Filtering works specifically for ${level.name}', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionLogger(
            logs: [
              RefractionLogEntry(
                level: level,
                message: 'Isolated test for ${level.name}',
                timestamp: DateTime(2023, 1, 1, 12, 0, 0),
              ),
            ],
          ),
        ),
      );

      expect(find.text('Isolated test for ${level.name}'), findsOneWidget);

      // We know the labels: Debug, Info, Warn, Error
      String label = 'Debug';
      if (level == RefractionLogLevel.info) label = 'Info';
      if (level == RefractionLogLevel.warning) label = 'Warn';
      if (level == RefractionLogLevel.error) label = 'Error';

      await tester.tap(find.text(label));
      await tester.pumpAndSettle();

      expect(find.text('Isolated test for ${level.name}'), findsNothing);
      expect(find.text('No logs to display'), findsOneWidget);
    });
  }
}
