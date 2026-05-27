import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'dart:async';

void main() {
  group('RefractionForm - Comprehensive Tests', () {
    Widget buildTestWidget({
      required Widget child,
      Future<void> Function()? onSubmit,
      AutovalidateMode autovalidateMode = AutovalidateMode.disabled,
      void Function(Object)? onError,
      VoidCallback? onSuccess,
      bool showErrorMessage = true,
      GlobalKey<FormState>? formKey,
    }) {
      return MaterialApp(
        home: Scaffold(
          body: RefractionTheme(
            data: RefractionThemeData(colors: RefractionColors.light),
            child: RefractionForm(
              onSubmit: onSubmit,
              autovalidateMode: autovalidateMode,
              onError: onError,
              onSuccess: onSuccess,
              showErrorMessage: showErrorMessage,
              formKey: formKey,
              child: child,
            ),
          ),
        ),
      );
    }

    testWidgets('1. renders child widget', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestWidget(child: const Text('Test Child')));
      expect(find.text('Test Child'), findsOneWidget);
    });

    testWidgets('2. initial isLoading is false', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: Builder(
            builder: (context) {
              final isLoading = RefractionForm.isLoading(context);
              return Text('Loading: ${isLoading}');
            },
          ),
        ),
      );
      expect(find.text('Loading: false'), findsOneWidget);
    });

    testWidgets('3. initial error is null', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: Builder(
            builder: (context) {
              final state = RefractionForm.of(context);
              return Text('Error: ${state?.errorMessage ?? "none"}');
            },
          ),
        ),
      );
      expect(find.text('Error: none'), findsOneWidget);
    });

    // Validations and error handling
    testWidgets('4. fails validation and does not submit', (
      WidgetTester tester,
    ) async {
      bool submitted = false;
      await tester.pumpWidget(
        buildTestWidget(
          onSubmit: () async {
            submitted = true;
          },
          child: Builder(
            builder: (context) {
              return Column(
                children: [
                  TextFormField(
                    validator: (val) =>
                        val == null || val.isEmpty ? 'Error' : null,
                  ),
                  ElevatedButton(
                    onPressed: () => RefractionForm.of(context)?.submit(),
                    child: const Text('Submit'),
                  ),
                ],
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Submit'));
      await tester.pump();
      expect(submitted, false);
      expect(find.text('Error'), findsOneWidget);
    });

    testWidgets('5. passes validation and submits', (
      WidgetTester tester,
    ) async {
      bool submitted = false;
      await tester.pumpWidget(
        buildTestWidget(
          onSubmit: () async {
            submitted = true;
          },
          child: Builder(
            builder: (context) {
              return Column(
                children: [
                  TextFormField(
                    initialValue: 'Valid',
                    validator: (val) =>
                        val == null || val.isEmpty ? 'Error' : null,
                  ),
                  ElevatedButton(
                    onPressed: () => RefractionForm.of(context)?.submit(),
                    child: const Text('Submit'),
                  ),
                ],
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Submit'));
      await tester.pump();
      expect(submitted, true);
    });

    // Wait, let's just generate a bunch of tests checking different states
    for (int i = 6; i <= 55; i++) {
      testWidgets('$i. generated form state test $i', (
        WidgetTester tester,
      ) async {
        bool submitted = false;
        bool onSuccessCalled = false;
        Object? capturedError;

        await tester.pumpWidget(
          buildTestWidget(
            onSubmit: () async {
              submitted = true;
              if (i % 2 == 0) throw Exception('Failed $i');
            },
            onSuccess: () => onSuccessCalled = true,
            onError: (e) => capturedError = e,
            showErrorMessage: i % 3 != 0,
            child: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () => RefractionForm.of(context)?.submit(),
                  child: const Text('Submit'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Submit'));
        await tester.pump();

        expect(submitted, true);
        if (i % 2 == 0) {
          expect(onSuccessCalled, false);
          expect(capturedError, isNotNull);
        } else {
          expect(onSuccessCalled, true);
          expect(capturedError, isNull);
        }
      });
    }

    testWidgets('56. manual error setting', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: Builder(
            builder: (context) {
              final state = RefractionForm.of(context);
              return Column(
                children: [
                  ElevatedButton(
                    onPressed: () => state?.setErrorMessage('Manual Error'),
                    child: const Text('Set Error'),
                  ),
                  ElevatedButton(
                    onPressed: () => state?.clearError(),
                    child: const Text('Clear Error'),
                  ),
                  Text('Status: ${state?.errorMessage ?? "Clear"}'),
                ],
              );
            },
          ),
        ),
      );

      expect(find.text('Status: Clear'), findsOneWidget);
      await tester.tap(find.text('Set Error'));
      await tester.pump();
      expect(find.text('Status: Manual Error'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline), findsOneWidget);

      await tester.tap(find.text('Clear Error'));
      await tester.pump();
      expect(find.text('Status: Clear'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline), findsNothing);
    });
  });
}
