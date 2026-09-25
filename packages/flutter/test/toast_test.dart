import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget _app({
  required Widget child,
  RefractionToastController? controller,
  bool reduceMotion = false,
  bool withToaster = true,
}) {
  return MaterialApp(
    builder: (context, c) => MediaQuery(
      data: MediaQuery.of(context).copyWith(disableAnimations: reduceMotion),
      child: RefractionTheme(
        data: RefractionThemeData.light(),
        child: withToaster
            ? RefractionToaster(controller: controller, child: c!)
            : c!,
      ),
    ),
    home: Scaffold(body: Center(child: child)),
  );
}

final _closeButton = find.byWidgetPredicate(
  (w) => w is RefractionButton && w.semanticLabel == 'Dismiss notification',
);

void _setSize(WidgetTester tester, Size size) {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

Widget _trigger(void Function(BuildContext) onTap) => Builder(
  builder: (context) =>
      TextButton(onPressed: () => onTap(context), child: const Text('go')),
);

void main() {
  group('RefractionToastController', () {
    test('keeps the newest maxVisible and retires the oldest', () {
      final retired = <String>[];
      final c = RefractionToastController(maxVisible: 2);
      for (final t in ['a', 'b', 'c']) {
        c.show(
          RefractionToastData(title: t, onDismissed: () => retired.add(t)),
        );
      }
      expect(c.entries.map((e) => e.data.title), ['b', 'c']);
      expect(retired, ['a']);
    });

    test('handle dismisses once and reports inactive', () {
      var calls = 0;
      final c = RefractionToastController();
      final h = c.show(
        RefractionToastData(title: 'x', onDismissed: () => calls++),
      );
      expect(h.isActive, isTrue);
      h.dismiss();
      h.dismiss();
      expect(h.isActive, isFalse);
      expect(calls, 1);
    });

    test('dismissAll clears and notifies each toast', () {
      var calls = 0;
      final c = RefractionToastController();
      c.show(RefractionToastData(title: 'a', onDismissed: () => calls++));
      c.show(RefractionToastData(title: 'b', onDismissed: () => calls++));
      c.dismissAll();
      expect(c.entries, isEmpty);
      expect(calls, 2);
    });
  });

  group('RefractionToaster', () {
    testWidgets('auto-dismisses after the default duration', (tester) async {
      await tester.pumpWidget(
        _app(
          child: _trigger(
            (ctx) => RefractionToast.show(context: ctx, title: 'Saved'),
          ),
        ),
      );
      await tester.tap(find.text('go'));
      await tester.pumpAndSettle();
      expect(find.text('Saved'), findsOneWidget);
      await tester.pump(RefractionToaster.defaultDuration);
      await tester.pumpAndSettle();
      expect(find.text('Saved'), findsNothing);
    });

    testWidgets('toasts stack instead of overlapping', (tester) async {
      await tester.pumpWidget(
        _app(
          child: _trigger((ctx) {
            RefractionToast.show(context: ctx, title: 'First');
            RefractionToast.show(context: ctx, title: 'Second');
          }),
        ),
      );
      await tester.tap(find.text('go'));
      await tester.pumpAndSettle();
      final first = tester.getRect(find.text('First'));
      final second = tester.getRect(find.text('Second'));
      expect(first.overlaps(second), isFalse);
      // Newest sits nearest the bottom edge.
      expect(second.top, greaterThan(first.top));
    });

    testWidgets('action runs and dismisses; Undo gets the longer duration', (
      tester,
    ) async {
      var undone = false;
      await tester.pumpWidget(
        _app(
          child: _trigger(
            (ctx) => RefractionToast.show(
              context: ctx,
              title: 'Message deleted',
              action: RefractionToastAction(
                label: 'Undo',
                onPressed: () => undone = true,
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('go'));
      await tester.pumpAndSettle();
      await tester.pump(RefractionToaster.defaultDuration);
      await tester.pump();
      expect(find.text('Message deleted'), findsOneWidget);
      await tester.tap(find.text('Undo'));
      await tester.pumpAndSettle();
      expect(undone, isTrue);
      expect(find.text('Message deleted'), findsNothing);
    });

    testWidgets('hovering pauses the timer', (tester) async {
      await tester.pumpWidget(
        _app(
          child: _trigger(
            (ctx) => RefractionToast.show(context: ctx, title: 'Hold me'),
          ),
        ),
      );
      await tester.tap(find.text('go'));
      await tester.pumpAndSettle();
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(
        location: tester.getCenter(find.text('Hold me')),
      );
      addTearDown(gesture.removePointer);
      await tester.pump();
      await tester.pump(RefractionToaster.defaultDuration * 2);
      expect(find.text('Hold me'), findsOneWidget);
      await gesture.moveTo(Offset.zero);
      await tester.pump(RefractionToaster.defaultDuration);
      await tester.pumpAndSettle();
      expect(find.text('Hold me'), findsNothing);
    });

    testWidgets('Duration.zero keeps it until the close button', (
      tester,
    ) async {
      var dismissed = false;
      await tester.pumpWidget(
        _app(
          child: _trigger(
            (ctx) => RefractionToast.show(
              context: ctx,
              title: "Couldn't send message",
              variant: RefractionToastVariant.destructive,
              duration: Duration.zero,
              onDismissed: () => dismissed = true,
            ),
          ),
        ),
      );
      await tester.tap(find.text('go'));
      await tester.pumpAndSettle();
      await tester.pump(const Duration(minutes: 1));
      expect(find.text("Couldn't send message"), findsOneWidget);
      await tester.tap(_closeButton);
      await tester.pumpAndSettle();
      expect(dismissed, isTrue);
      expect(find.text("Couldn't send message"), findsNothing);
    });

    testWidgets('is a live region and Escape dismisses a focused toast', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        _app(
          child: _trigger(
            (ctx) => RefractionToast.show(
              context: ctx,
              title: 'Link copied',
              duration: Duration.zero,
            ),
          ),
        ),
      );
      await tester.tap(find.text('go'));
      await tester.pumpAndSettle();
      final live = find.byWidgetPredicate(
        (w) => w is Semantics && (w.properties.liveRegion ?? false),
      );
      expect(live, findsOneWidget);

      // Focus the close button inside the toast, then Escape.
      final close = _closeButton;
      Focus.of(
        tester.element(
          find.descendant(of: close, matching: find.byType(GestureDetector)),
        ),
      ).requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(find.text('Link copied'), findsNothing);
      handle.dispose();
    });

    testWidgets('phone width spans the screen; desktop sits bottom-right', (
      tester,
    ) async {
      final c = RefractionToastController();
      _setSize(tester, const Size(390, 844));
      await tester.pumpWidget(_app(controller: c, child: const SizedBox()));
      c.show(
        const RefractionToastData(title: 'Phone', duration: Duration.zero),
      );
      await tester.pumpAndSettle();
      final phone = tester.getRect(
        find
            .ancestor(of: find.text('Phone'), matching: find.byType(Container))
            .first,
      );
      expect(phone.width, greaterThan(390 - 40));

      _setSize(tester, const Size(1440, 900));
      await tester.pumpWidget(_app(controller: c, child: const SizedBox()));
      await tester.pumpAndSettle();
      final desk = tester.getRect(
        find
            .ancestor(of: find.text('Phone'), matching: find.byType(Container))
            .first,
      );
      expect(desk.width, closeTo(360, 1));
      expect(desk.right, greaterThan(1440 - 40));
    });

    testWidgets('without a toaster, show() installs one in the overlay', (
      tester,
    ) async {
      await tester.pumpWidget(
        _app(
          withToaster: false,
          child: _trigger((ctx) {
            RefractionToast.show(context: ctx, title: 'One');
            RefractionToast.show(context: ctx, title: 'Two');
          }),
        ),
      );
      await tester.tap(find.text('go'));
      await tester.pumpAndSettle();
      expect(
        tester
            .getRect(find.text('One'))
            .overlaps(tester.getRect(find.text('Two'))),
        isFalse,
      );
    });

    testWidgets('reduced motion shows the toast without an entrance', (
      tester,
    ) async {
      await tester.pumpWidget(
        _app(
          reduceMotion: true,
          child: _trigger(
            (ctx) => RefractionToast.show(context: ctx, title: 'Instant'),
          ),
        ),
      );
      await tester.tap(find.text('go'));
      await tester.pump();
      await tester.pump();
      final fade = tester.widget<FadeTransition>(
        find
            .ancestor(
              of: find.text('Instant'),
              matching: find.byType(FadeTransition),
            )
            .first,
      );
      expect(fade.opacity.value, 1.0);
    });
  });
}
