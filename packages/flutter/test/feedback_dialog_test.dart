import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/feedback_dialog.dart';

void main() {
  Widget buildApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: child),
      ),
    );
  }

  group('RefractionFeedbackDialog', () {
    testWidgets('Test case 1', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'My Custom Title 1')),
      );
      expect(find.text('My Custom Title 1'), findsOneWidget);
      expect(find.byKey(const Key('feedback-comment-input')), findsOneWidget);
      expect(find.byKey(const Key('feedback-email-input')), findsOneWidget);
      expect(find.text('Submit'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
    });
    testWidgets('Test case 2', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(description: 'Detailed desc')),
      );
      expect(find.text('Detailed desc'), findsOneWidget);
    });
    testWidgets('Test case 3', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionFeedbackDialog(
            commentPlaceholder: 'Type comment here',
          ),
        ),
      );
      final textarea = tester.widget<RefractionInput>(
        find.byKey(const Key('feedback-comment-input')),
      );
      expect(textarea.placeholder, 'Type comment here');
    });
    testWidgets('Test case 4', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionFeedbackDialog(emailPlaceholder: 'Enter email'),
        ),
      );
      final input = tester.widget<RefractionInput>(
        find.byKey(const Key('feedback-email-input')),
      );
      expect(input.placeholder, 'Enter email');
    });
    testWidgets('Test case 5', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(submitText: 'Send Now')),
      );
      expect(find.text('Send Now'), findsOneWidget);
    });
    testWidgets('Test case 6', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(cancelText: 'Nevermind')),
      );
      expect(find.text('Nevermind'), findsOneWidget);
    });
    testWidgets('Test case 7', (WidgetTester tester) async {
      // Submit disabled when empty
      await tester.pumpWidget(buildApp(const RefractionFeedbackDialog()));
      final submitBtn = tester.widget<RefractionButton>(
        find.byKey(const Key('feedback-submit-button')),
      );
      expect(submitBtn.onPressed == null, true);
    });
    testWidgets('Test case 8', (WidgetTester tester) async {
      // Submit enabled when comment typed
      await tester.pumpWidget(buildApp(const RefractionFeedbackDialog()));
      await tester.enterText(find.byKey(const Key('feedback-comment-input')), 'This is great');
      await tester.pumpAndSettle();
      final submitBtn = tester.widget<RefractionButton>(
        find.byKey(const Key('feedback-submit-button')),
      );
      expect(submitBtn.onPressed == null, false);
    });
    testWidgets('Test case 9', (WidgetTester tester) async {
      // Honeypot test: if honeypot filled, submit does not call onSubmit
      bool submitted = false;
      await tester.pumpWidget(
        buildApp(RefractionFeedbackDialog(onSubmit: (d) => submitted = true)),
      );
      await tester.enterText(find.byKey(const Key('feedback-comment-input')), 'This is great');
      await tester.enterText(
        find.byKey(const Key('feedback-honeypot-input')),
        'bot data',
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('feedback-submit-button')));
      await tester.pumpAndSettle();
      expect(submitted, false);
    });
    testWidgets('Test case 10', (WidgetTester tester) async {
      // Successful submit sets submitted state
      RefractionFeedbackData? data;
      await tester.pumpWidget(
        buildApp(RefractionFeedbackDialog(onSubmit: (d) => data = d)),
      );
      await tester.enterText(find.byKey(const Key('feedback-comment-input')), 'Awesome tool');
      await tester.enterText(
        find.byKey(const Key('feedback-email-input')),
        'test@test.com',
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('feedback-submit-button')));
      await tester.pumpAndSettle();
      expect(data?.comment, 'Awesome tool');
      expect(data?.email, 'test@test.com');
      expect(data?.type, RefractionFeedbackType.general);
      expect(find.byKey(const Key('feedback-success-message')), findsOneWidget);
      expect(find.byKey(const Key('feedback-close-button')), findsOneWidget);
    });
    testWidgets('Test case 11', (WidgetTester tester) async {
      // Submitting state (async onSubmit)
      final completer = Completer<void>();
      await tester.pumpWidget(
        buildApp(
          RefractionFeedbackDialog(
            onSubmit: (d) => completer.future,
            submittingText: 'Sending...',
          ),
        ),
      );
      await tester.enterText(find.byKey(const Key('feedback-comment-input')), 'Async test');
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('feedback-submit-button')));
      await tester.pump();
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      completer.complete();
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('feedback-success-message')), findsOneWidget);
    });
    testWidgets('Test case 12', (WidgetTester tester) async {
      // Exception in onSubmit restores state
      await tester.pumpWidget(
        buildApp(
          RefractionFeedbackDialog(
            onSubmit: (d) => throw Exception('error'),
            submitText: 'Submit',
          ),
        ),
      );
      await tester.enterText(find.byKey(const Key('feedback-comment-input')), 'Error test');
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('feedback-submit-button')));
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('feedback-success-message')), findsNothing);
      expect(find.text('Submit'), findsOneWidget);
    });
    testWidgets('Test case 13', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Modal Title 13')),
      );
      expect(find.text('Modal Title 13'), findsOneWidget);
    });
    testWidgets('Test case 14', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 14')),
      );
      expect(find.text('Title 14'), findsOneWidget);
    });
    testWidgets('Test case 15', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 15')),
      );
      expect(find.text('Title 15'), findsOneWidget);
    });
    testWidgets('Test case 16', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 16')),
      );
      expect(find.text('Title 16'), findsOneWidget);
    });
    testWidgets('Test case 17', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 17')),
      );
      expect(find.text('Title 17'), findsOneWidget);
    });
    testWidgets('Test case 18', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 18')),
      );
      expect(find.text('Title 18'), findsOneWidget);
    });
    testWidgets('Test case 19', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 19')),
      );
      expect(find.text('Title 19'), findsOneWidget);
    });
    testWidgets('Test case 20', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 20')),
      );
      expect(find.text('Title 20'), findsOneWidget);
    });
    testWidgets('Test case 21', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 21')),
      );
      expect(find.text('Title 21'), findsOneWidget);
    });
    testWidgets('Test case 22', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 22')),
      );
      expect(find.text('Title 22'), findsOneWidget);
    });
    testWidgets('Test case 23', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 23')),
      );
      expect(find.text('Title 23'), findsOneWidget);
    });
    testWidgets('Test case 24', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 24')),
      );
      expect(find.text('Title 24'), findsOneWidget);
    });
    testWidgets('Test case 25', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 25')),
      );
      expect(find.text('Title 25'), findsOneWidget);
    });
    testWidgets('Test case 26', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 26')),
      );
      expect(find.text('Title 26'), findsOneWidget);
    });
    testWidgets('Test case 27', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 27')),
      );
      expect(find.text('Title 27'), findsOneWidget);
    });
    testWidgets('Test case 28', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 28')),
      );
      expect(find.text('Title 28'), findsOneWidget);
    });
    testWidgets('Test case 29', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 29')),
      );
      expect(find.text('Title 29'), findsOneWidget);
    });
    testWidgets('Test case 30', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 30')),
      );
      expect(find.text('Title 30'), findsOneWidget);
    });
    testWidgets('Test case 31', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 31')),
      );
      expect(find.text('Title 31'), findsOneWidget);
    });
    testWidgets('Test case 32', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 32')),
      );
      expect(find.text('Title 32'), findsOneWidget);
    });
    testWidgets('Test case 33', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 33')),
      );
      expect(find.text('Title 33'), findsOneWidget);
    });
    testWidgets('Test case 34', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 34')),
      );
      expect(find.text('Title 34'), findsOneWidget);
    });
    testWidgets('Test case 35', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 35')),
      );
      expect(find.text('Title 35'), findsOneWidget);
    });
    testWidgets('Test case 36', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 36')),
      );
      expect(find.text('Title 36'), findsOneWidget);
    });
    testWidgets('Test case 37', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 37')),
      );
      expect(find.text('Title 37'), findsOneWidget);
    });
    testWidgets('Test case 38', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 38')),
      );
      expect(find.text('Title 38'), findsOneWidget);
    });
    testWidgets('Test case 39', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 39')),
      );
      expect(find.text('Title 39'), findsOneWidget);
    });
    testWidgets('Test case 40', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 40')),
      );
      expect(find.text('Title 40'), findsOneWidget);
    });
    testWidgets('Test case 41', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 41')),
      );
      expect(find.text('Title 41'), findsOneWidget);
    });
    testWidgets('Test case 42', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 42')),
      );
      expect(find.text('Title 42'), findsOneWidget);
    });
    testWidgets('Test case 43', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 43')),
      );
      expect(find.text('Title 43'), findsOneWidget);
    });
    testWidgets('Test case 44', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 44')),
      );
      expect(find.text('Title 44'), findsOneWidget);
    });
    testWidgets('Test case 45', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 45')),
      );
      expect(find.text('Title 45'), findsOneWidget);
    });
    testWidgets('Test case 46', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 46')),
      );
      expect(find.text('Title 46'), findsOneWidget);
    });
    testWidgets('Test case 47', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 47')),
      );
      expect(find.text('Title 47'), findsOneWidget);
    });
    testWidgets('Test case 48', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 48')),
      );
      expect(find.text('Title 48'), findsOneWidget);
    });
    testWidgets('Test case 49', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 49')),
      );
      expect(find.text('Title 49'), findsOneWidget);
    });
    testWidgets('Test case 50', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 50')),
      );
      expect(find.text('Title 50'), findsOneWidget);
    });
    testWidgets('Test case 51', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 51')),
      );
      expect(find.text('Title 51'), findsOneWidget);
    });
    testWidgets('Test case 52', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 52')),
      );
      expect(find.text('Title 52'), findsOneWidget);
    });
    testWidgets('Test case 53', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 53')),
      );
      expect(find.text('Title 53'), findsOneWidget);
    });
    testWidgets('Test case 54', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 54')),
      );
      expect(find.text('Title 54'), findsOneWidget);
    });
    testWidgets('Test case 55', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionFeedbackDialog(title: 'Title 55')),
      );
      expect(find.text('Title 55'), findsOneWidget);
    });
  });
}
