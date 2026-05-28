import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp(Widget child, [RefractionThemeData? theme]) {
    return MaterialApp(
      home: RefractionTheme(
        data: theme ?? RefractionThemeData(colors: RefractionColors.light),
        child: Scaffold(body: child),
      ),
    );
  }

  group('RefractionInstallPrompt Exhaustive', () {
    testWidgets('Basic behavior test #1', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 1),
            message: 'Message 1',
          ),
        ),
      );
      expect(find.text('Message 1'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 11));
      expect(find.text('Message 1'), findsOneWidget);
    });

    testWidgets('Basic behavior test #2', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 2),
            message: 'Message 2',
          ),
        ),
      );
      expect(find.text('Message 2'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 12));
      expect(find.text('Message 2'), findsOneWidget);
    });

    testWidgets('Basic behavior test #3', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 3),
            message: 'Message 3',
          ),
        ),
      );
      expect(find.text('Message 3'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 13));
      expect(find.text('Message 3'), findsOneWidget);
    });

    testWidgets('Basic behavior test #4', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 4),
            message: 'Message 4',
          ),
        ),
      );
      expect(find.text('Message 4'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 14));
      expect(find.text('Message 4'), findsOneWidget);
    });

    testWidgets('Basic behavior test #5', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 5),
            message: 'Message 5',
          ),
        ),
      );
      expect(find.text('Message 5'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 15));
      expect(find.text('Message 5'), findsOneWidget);
    });

    testWidgets('Basic behavior test #6', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 6),
            message: 'Message 6',
          ),
        ),
      );
      expect(find.text('Message 6'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 16));
      expect(find.text('Message 6'), findsOneWidget);
    });

    testWidgets('Basic behavior test #7', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 7),
            message: 'Message 7',
          ),
        ),
      );
      expect(find.text('Message 7'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 17));
      expect(find.text('Message 7'), findsOneWidget);
    });

    testWidgets('Basic behavior test #8', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 8),
            message: 'Message 8',
          ),
        ),
      );
      expect(find.text('Message 8'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 18));
      expect(find.text('Message 8'), findsOneWidget);
    });

    testWidgets('Basic behavior test #9', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 9),
            message: 'Message 9',
          ),
        ),
      );
      expect(find.text('Message 9'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 19));
      expect(find.text('Message 9'), findsOneWidget);
    });

    testWidgets('Basic behavior test #10', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: const Duration(milliseconds: 10),
            message: 'Message 10',
          ),
        ),
      );
      expect(find.text('Message 10'), findsNothing);
      await tester.pumpAndSettle(const Duration(milliseconds: 20));
      expect(find.text('Message 10'), findsOneWidget);
    });

    testWidgets('Install interaction test #11', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_11',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_11'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Install interaction test #12', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_12',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_12'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Install interaction test #13', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_13',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_13'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Install interaction test #14', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_14',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_14'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Install interaction test #15', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_15',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_15'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Install interaction test #16', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_16',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_16'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Install interaction test #17', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_17',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_17'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Install interaction test #18', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_18',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_18'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Install interaction test #19', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_19',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_19'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Install interaction test #20', (WidgetTester tester) async {
      bool installed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            installLabel: 'Inst_20',
            onInstall: () => installed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inst_20'));
      await tester.pumpAndSettle();
      expect(installed, isTrue);
    });

    testWidgets('Dismiss interaction test #21', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_21',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_21'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_21'), findsNothing);
    });

    testWidgets('Dismiss interaction test #22', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_22',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_22'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_22'), findsNothing);
    });

    testWidgets('Dismiss interaction test #23', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_23',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_23'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_23'), findsNothing);
    });

    testWidgets('Dismiss interaction test #24', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_24',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_24'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_24'), findsNothing);
    });

    testWidgets('Dismiss interaction test #25', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_25',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_25'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_25'), findsNothing);
    });

    testWidgets('Dismiss interaction test #26', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_26',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_26'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_26'), findsNothing);
    });

    testWidgets('Dismiss interaction test #27', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_27',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_27'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_27'), findsNothing);
    });

    testWidgets('Dismiss interaction test #28', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_28',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_28'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_28'), findsNothing);
    });

    testWidgets('Dismiss interaction test #29', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_29',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_29'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_29'), findsNothing);
    });

    testWidgets('Dismiss interaction test #30', (WidgetTester tester) async {
      bool dismissed = false;
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            delay: Duration.zero,
            dismissLabel: 'Dism_30',
            onDismiss: () => dismissed = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Dism_30'));
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text('Dism_30'), findsNothing);
    });

    testWidgets('Initial dismissed test #31', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_31',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_31'), findsNothing);
    });

    testWidgets('Initial dismissed test #32', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_32',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_32'), findsNothing);
    });

    testWidgets('Initial dismissed test #33', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_33',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_33'), findsNothing);
    });

    testWidgets('Initial dismissed test #34', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_34',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_34'), findsNothing);
    });

    testWidgets('Initial dismissed test #35', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_35',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_35'), findsNothing);
    });

    testWidgets('Initial dismissed test #36', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_36',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_36'), findsNothing);
    });

    testWidgets('Initial dismissed test #37', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_37',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_37'), findsNothing);
    });

    testWidgets('Initial dismissed test #38', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_38',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_38'), findsNothing);
    });

    testWidgets('Initial dismissed test #39', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_39',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_39'), findsNothing);
    });

    testWidgets('Initial dismissed test #40', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'HIDDEN_40',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('HIDDEN_40'), findsNothing);
    });

    testWidgets('Lifecycle update test #41', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_41',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_41'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_41',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_41'), findsNothing);
    });

    testWidgets('Lifecycle update test #42', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_42',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_42'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_42',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_42'), findsNothing);
    });

    testWidgets('Lifecycle update test #43', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_43',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_43'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_43',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_43'), findsNothing);
    });

    testWidgets('Lifecycle update test #44', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_44',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_44'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_44',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_44'), findsNothing);
    });

    testWidgets('Lifecycle update test #45', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_45',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_45'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_45',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_45'), findsNothing);
    });

    testWidgets('Lifecycle update test #46', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_46',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_46'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_46',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_46'), findsNothing);
    });

    testWidgets('Lifecycle update test #47', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_47',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_47'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_47',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_47'), findsNothing);
    });

    testWidgets('Lifecycle update test #48', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_48',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_48'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_48',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_48'), findsNothing);
    });

    testWidgets('Lifecycle update test #49', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_49',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_49'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_49',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_49'), findsNothing);
    });

    testWidgets('Lifecycle update test #50', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: false,
            message: 'LIFECYCLE_50',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_50'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            initialDismissed: true,
            message: 'LIFECYCLE_50',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('LIFECYCLE_50'), findsNothing);
    });

    testWidgets('Programmatic API test #51', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_51',
          ),
        ),
      );
      expect(find.text('PROG_51'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_51'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_51'), findsNothing);
    });

    testWidgets('Programmatic API test #52', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_52',
          ),
        ),
      );
      expect(find.text('PROG_52'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_52'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_52'), findsNothing);
    });

    testWidgets('Programmatic API test #53', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_53',
          ),
        ),
      );
      expect(find.text('PROG_53'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_53'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_53'), findsNothing);
    });

    testWidgets('Programmatic API test #54', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_54',
          ),
        ),
      );
      expect(find.text('PROG_54'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_54'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_54'), findsNothing);
    });

    testWidgets('Programmatic API test #55', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_55',
          ),
        ),
      );
      expect(find.text('PROG_55'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_55'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_55'), findsNothing);
    });

    testWidgets('Programmatic API test #56', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_56',
          ),
        ),
      );
      expect(find.text('PROG_56'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_56'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_56'), findsNothing);
    });

    testWidgets('Programmatic API test #57', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_57',
          ),
        ),
      );
      expect(find.text('PROG_57'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_57'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_57'), findsNothing);
    });

    testWidgets('Programmatic API test #58', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_58',
          ),
        ),
      );
      expect(find.text('PROG_58'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_58'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_58'), findsNothing);
    });

    testWidgets('Programmatic API test #59', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_59',
          ),
        ),
      );
      expect(find.text('PROG_59'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_59'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_59'), findsNothing);
    });

    testWidgets('Programmatic API test #60', (WidgetTester tester) async {
      final GlobalKey<RefractionInstallPromptState> key = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RefractionInstallPrompt(
            key: key,
            delay: const Duration(hours: 1),
            message: 'PROG_60',
          ),
        ),
      );
      expect(find.text('PROG_60'), findsNothing);
      key.currentState?.show();
      await tester.pumpAndSettle();
      expect(find.text('PROG_60'), findsOneWidget);
      key.currentState?.dismiss();
      await tester.pumpAndSettle();
      expect(find.text('PROG_60'), findsNothing);
    });

    testWidgets('Semantics are correct', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            message: 'Install me',
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(
        tester.getSemantics(find.byType(RefractionInstallPrompt)),
        matchesSemantics(label: 'Install application\nInstall me'),
      );
      handle.dispose();
    });

    testWidgets('Dark theme styling', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInstallPrompt(
            delay: Duration.zero,
            message: 'Dark mode',
          ),
          RefractionThemeData(colors: RefractionColors.dark),
        ),
      );
      await tester.pumpAndSettle();

      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionInstallPrompt),
              matching: find.byType(Container),
            )
            .first,
      );

      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull); // background color
    });
  });
}
