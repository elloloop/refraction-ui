import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget _app(Widget child) {
  return MaterialApp(
    home: RefractionTheme(
      data: RefractionThemeData.light(),
      child: Scaffold(body: Center(child: child)),
    ),
  );
}

void main() {
  group('RefractionSegmentedControl', () {
    const items = [
      RefractionSegmentedControlItem(value: 'a', label: 'Alpha'),
      RefractionSegmentedControlItem(value: 'b', label: 'Beta'),
      RefractionSegmentedControlItem(value: 'c', label: 'Gamma'),
    ];

    testWidgets('renders items and selects on tap (uncontrolled)', (
      tester,
    ) async {
      String? changed;
      await tester.pumpWidget(
        _app(
          RefractionSegmentedControl<String>(
            initialValue: 'a',
            items: items,
            onValueChange: (v) => changed = v,
          ),
        ),
      );

      expect(find.text('Alpha'), findsOneWidget);
      expect(find.text('Beta'), findsOneWidget);

      await tester.tap(find.text('Beta'));
      await tester.pumpAndSettle();
      expect(changed, 'b');
    });

    testWidgets('controlled value does not change internally', (tester) async {
      String? changed;
      await tester.pumpWidget(
        _app(
          RefractionSegmentedControl<String>(
            value: 'a',
            items: items,
            onValueChange: (v) => changed = v,
          ),
        ),
      );

      await tester.tap(find.text('Gamma'));
      await tester.pumpAndSettle();
      // Callback fires, but the displayed selection stays 'a' until the parent
      // updates `value`.
      expect(changed, 'c');
      // The only segment flagged `checked` stays 'Alpha' — the controlled
      // widget never mutates its own selection.
      final checked = tester
          .widgetList<Semantics>(find.byType(Semantics))
          .where((s) => s.properties.checked == true)
          .toList();
      expect(checked, hasLength(1));
      expect(checked.single.properties.label, 'Alpha');
    });

    testWidgets('arrow keys move selection with wrap', (tester) async {
      final selections = <String>[];
      await tester.pumpWidget(
        _app(
          RefractionSegmentedControl<String>(
            initialValue: 'a',
            items: items,
            onValueChange: selections.add,
          ),
        ),
      );

      await tester.tap(find.text('Alpha'));
      await tester.pumpAndSettle();

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(selections.last, 'b');

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(selections.last, 'a');

      // Wrap past the start.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(selections.last, 'c');

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();
      expect(selections.last, 'a');

      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(selections.last, 'c');
    });
  });

  group('RefractionPasswordField', () {
    testWidgets('toggles obscureText when the eye is tapped', (tester) async {
      await tester.pumpWidget(
        _app(
          const SizedBox(
            width: 300,
            child: RefractionPasswordField(placeholder: 'Password'),
          ),
        ),
      );

      TextField field() => tester.widget<TextField>(find.byType(TextField));
      expect(field().obscureText, isTrue);

      await tester.tap(find.byIcon(Icons.visibility_outlined));
      await tester.pumpAndSettle();
      expect(field().obscureText, isFalse);

      await tester.tap(find.byIcon(Icons.visibility_off_outlined));
      await tester.pumpAndSettle();
      expect(field().obscureText, isTrue);
    });

    testWidgets('forwards typed text via onChanged', (tester) async {
      String? value;
      await tester.pumpWidget(
        _app(
          SizedBox(
            width: 300,
            child: RefractionPasswordField(onChanged: (v) => value = v),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'hunter2');
      expect(value, 'hunter2');
    });
  });

  group('RefractionInput validation', () {
    testWidgets('valid shows a trailing check icon', (tester) async {
      await tester.pumpWidget(
        _app(
          const SizedBox(
            width: 300,
            child: RefractionInput(
              validationState: RefractionInputValidationState.valid,
            ),
          ),
        ),
      );
      expect(find.byIcon(Icons.check), findsOneWidget);
    });

    testWidgets('renders a leading icon', (tester) async {
      await tester.pumpWidget(
        _app(
          const SizedBox(
            width: 300,
            child: RefractionInput(leadingIcon: Icon(Icons.mail_outline)),
          ),
        ),
      );
      expect(find.byIcon(Icons.mail_outline), findsOneWidget);
    });
  });

  group('RefractionSocialAuthButton', () {
    testWidgets('renders the provider label and fires onPressed', (
      tester,
    ) async {
      var taps = 0;
      await tester.pumpWidget(
        _app(
          RefractionSocialAuthButton(
            provider: RefractionSocialProvider.google,
            onPressed: () => taps++,
          ),
        ),
      );

      expect(find.text('Continue with Google'), findsOneWidget);
      await tester.tap(find.text('Continue with Google'));
      expect(taps, 1);
    });

    testWidgets('lastUsed renders the badge', (tester) async {
      await tester.pumpWidget(
        _app(
          RefractionSocialAuthButton(
            provider: RefractionSocialProvider.github,
            lastUsed: true,
            onPressed: () {},
          ),
        ),
      );
      expect(find.text('Last used'), findsOneWidget);
    });

    testWidgets('loading hides the label and ignores taps', (tester) async {
      var taps = 0;
      await tester.pumpWidget(
        _app(
          RefractionSocialAuthButton(
            provider: RefractionSocialProvider.apple,
            loading: true,
            onPressed: () => taps++,
          ),
        ),
      );
      expect(find.text('Continue with Apple'), findsNothing);
      await tester.tap(find.byType(RefractionSocialAuthButton));
      expect(taps, 0);
    });
  });

  group('RefractionSeparator', () {
    testWidgets('renders a centered label', (tester) async {
      await tester.pumpWidget(
        _app(
          const SizedBox(
            width: 240,
            child: RefractionSeparator(label: Text('OR')),
          ),
        ),
      );
      expect(find.text('OR'), findsOneWidget);
    });

    testWidgets('vertical orientation builds without a label', (tester) async {
      await tester.pumpWidget(
        _app(
          const SizedBox(
            height: 40,
            child: RefractionSeparator(
              orientation: RefractionSeparatorOrientation.vertical,
            ),
          ),
        ),
      );
      expect(find.byType(RefractionSeparator), findsOneWidget);
    });
  });

  group('RefractionEmptyState', () {
    testWidgets('renders icon, title, description and actions', (tester) async {
      var taps = 0;
      await tester.pumpWidget(
        _app(
          RefractionEmptyState(
            icon: const Icon(Icons.inbox_outlined),
            title: const Text('Nothing here'),
            description: const Text('Come back later.'),
            actions: [
              RefractionButton(
                onPressed: () => taps++,
                child: const Text('Reload'),
              ),
            ],
          ),
        ),
      );

      expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
      expect(find.text('Nothing here'), findsOneWidget);
      expect(find.text('Come back later.'), findsOneWidget);

      await tester.tap(find.text('Reload'));
      expect(taps, 1);
    });

    testWidgets('ConfirmationCard defaults to bordered', (tester) async {
      await tester.pumpWidget(
        _app(
          const RefractionConfirmationCard(
            title: Text('Check your email'),
          ),
        ),
      );
      expect(find.text('Check your email'), findsOneWidget);
      expect(
        find.descendant(
          of: find.byType(RefractionConfirmationCard),
          matching: find.byType(Container),
        ),
        findsWidgets,
      );
    });
  });
}
