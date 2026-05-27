import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  group('RefractionCollapsible Rendering', () {
    testWidgets('Renders trigger and content', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionCollapsible(
            child: Column(
              children: [
                RefractionCollapsibleTrigger(child: Text('Trigger 1')),
                RefractionCollapsibleContent(child: Text('Content 1')),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Trigger 1'), findsOneWidget);
      expect(find.text('Content 1'), findsOneWidget);
    });

    testWidgets('SizeTransition initially 0 when closed', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionCollapsible(
            child: Column(
              children: [
                RefractionCollapsibleTrigger(child: Text('Trigger')),
                RefractionCollapsibleContent(child: Text('Content')),
              ],
            ),
          ),
        ),
      );

      final SizeTransition st = tester.widget(find.byType(SizeTransition));
      expect(st.sizeFactor.value, 0.0);
    });

    testWidgets('SizeTransition initially 1 when defaultOpen=true', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionCollapsible(
            defaultOpen: true,
            child: Column(
              children: [
                RefractionCollapsibleTrigger(child: Text('Trigger')),
                RefractionCollapsibleContent(child: Text('Content')),
              ],
            ),
          ),
        ),
      );

      final SizeTransition st = tester.widget(find.byType(SizeTransition));
      expect(st.sizeFactor.value, 1.0);
    });

    testWidgets('SizeTransition initially 1 when isOpen=true', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionCollapsible(
            isOpen: true,
            child: Column(
              children: [
                RefractionCollapsibleTrigger(child: Text('Trigger')),
                RefractionCollapsibleContent(child: Text('Content')),
              ],
            ),
          ),
        ),
      );

      final SizeTransition st = tester.widget(find.byType(SizeTransition));
      expect(st.sizeFactor.value, 1.0);
    });

    testWidgets('State initializes correctly', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          RefractionCollapsible(
            child: Builder(
              builder: (ctx) {
                final state = RefractionCollapsible.of(ctx);
                expect(state.isOpen, false);
                return const SizedBox();
              },
            ),
          ),
        ),
      );
    });
  });

  group('RefractionCollapsible Uncontrolled Toggle', () {
    for (int i = 0; i < 10; i++) {
      testWidgets('Uncontrolled toggle interaction iteration $i', (
        tester,
      ) async {
        await tester.pumpWidget(
          buildTestApp(
            const RefractionCollapsible(
              child: Column(
                children: [
                  RefractionCollapsibleTrigger(child: Text('Trigger')),
                  RefractionCollapsibleContent(child: Text('Content')),
                ],
              ),
            ),
          ),
        );

        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          0.0,
        );
        await tester.tap(find.text('Trigger'));
        await tester.pump();

        // Wait for animation to start
        await tester.pump(const Duration(milliseconds: 50));
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          greaterThan(0.0),
        );

        await tester.pumpAndSettle();
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          1.0,
        );

        await tester.tap(find.text('Trigger'));
        await tester.pump();

        await tester.pump(const Duration(milliseconds: 50));
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          lessThan(1.0),
        );

        await tester.pumpAndSettle();
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          0.0,
        );
      });
    }
  });

  group('RefractionCollapsible Controlled', () {
    for (int i = 0; i < 10; i++) {
      testWidgets('Controlled update toggles animation iteration $i', (
        tester,
      ) async {
        Widget buildControlled(bool open) {
          return buildTestApp(
            RefractionCollapsible(
              isOpen: open,
              child: const Column(
                children: [
                  RefractionCollapsibleTrigger(child: Text('Trigger')),
                  RefractionCollapsibleContent(child: Text('Content')),
                ],
              ),
            ),
          );
        }

        await tester.pumpWidget(buildControlled(false));
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          0.0,
        );

        await tester.pumpWidget(buildControlled(true));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 100));
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          greaterThan(0.0),
        );
        await tester.pumpAndSettle();
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          1.0,
        );

        await tester.pumpWidget(buildControlled(false));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 100));
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          lessThan(1.0),
        );
        await tester.pumpAndSettle();
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          0.0,
        );
      });
    }

    testWidgets(
      'Tapping controlled trigger calls callback but does not animate immediately',
      (tester) async {
        bool? callbackValue;
        await tester.pumpWidget(
          buildTestApp(
            RefractionCollapsible(
              isOpen: false,
              onOpenChange: (val) => callbackValue = val,
              child: const Column(
                children: [
                  RefractionCollapsibleTrigger(child: Text('Trigger')),
                  RefractionCollapsibleContent(child: Text('Content')),
                ],
              ),
            ),
          ),
        );

        await tester.tap(find.text('Trigger'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 100));

        // Because we didn't update isOpen prop, it should stay 0
        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          0.0,
        );
        expect(callbackValue, true);
      },
    );
  });

  group('RefractionCollapsible Disabled', () {
    for (int i = 0; i < 10; i++) {
      testWidgets('Disabled state prevents toggle iteration $i', (
        tester,
      ) async {
        bool callbackFired = false;
        await tester.pumpWidget(
          buildTestApp(
            RefractionCollapsible(
              disabled: true,
              onOpenChange: (_) => callbackFired = true,
              child: const Column(
                children: [
                  RefractionCollapsibleTrigger(child: Text('Trigger')),
                  RefractionCollapsibleContent(child: Text('Content')),
                ],
              ),
            ),
          ),
        );

        await tester.tap(find.text('Trigger'));
        await tester.pumpAndSettle();

        expect(
          tester
              .widget<SizeTransition>(find.byType(SizeTransition))
              .sizeFactor
              .value,
          0.0,
        );
        expect(callbackFired, false);
      });
    }

    testWidgets('Disabling while open prevents close', (tester) async {
      bool callbackFired = false;
      await tester.pumpWidget(
        buildTestApp(
          RefractionCollapsible(
            disabled: true,
            defaultOpen: true,
            onOpenChange: (_) => callbackFired = true,
            child: const Column(
              children: [
                RefractionCollapsibleTrigger(child: Text('Trigger')),
                RefractionCollapsibleContent(child: Text('Content')),
              ],
            ),
          ),
        ),
      );

      await tester.tap(find.text('Trigger'));
      await tester.pumpAndSettle();

      expect(
        tester
            .widget<SizeTransition>(find.byType(SizeTransition))
            .sizeFactor
            .value,
        1.0,
      );
      expect(callbackFired, false);
    });
  });

  group('RefractionCollapsible Callbacks', () {
    for (int i = 0; i < 5; i++) {
      testWidgets('Callback passes correct value when opened iteration $i', (
        tester,
      ) async {
        bool? val;
        await tester.pumpWidget(
          buildTestApp(
            RefractionCollapsible(
              onOpenChange: (v) => val = v,
              child: const Column(
                children: [
                  RefractionCollapsibleTrigger(child: Text('Trigger')),
                  RefractionCollapsibleContent(child: Text('Content')),
                ],
              ),
            ),
          ),
        );

        await tester.tap(find.text('Trigger'));
        expect(val, true);
      });

      testWidgets('Callback passes correct value when closed iteration $i', (
        tester,
      ) async {
        bool? val;
        await tester.pumpWidget(
          buildTestApp(
            RefractionCollapsible(
              defaultOpen: true,
              onOpenChange: (v) => val = v,
              child: const Column(
                children: [
                  RefractionCollapsibleTrigger(child: Text('Trigger')),
                  RefractionCollapsibleContent(child: Text('Content')),
                ],
              ),
            ),
          ),
        );

        await tester.tap(find.text('Trigger'));
        expect(val, false);
      });
    }
  });

  group('Trigger onTap callback', () {
    for (int i = 0; i < 5; i++) {
      testWidgets('onTap fires alongside toggle iteration $i', (tester) async {
        bool onTapFired = false;
        bool? openStateFired;
        await tester.pumpWidget(
          buildTestApp(
            RefractionCollapsible(
              onOpenChange: (v) => openStateFired = v,
              child: Column(
                children: [
                  RefractionCollapsibleTrigger(
                    onTap: () => onTapFired = true,
                    child: const Text('Trigger'),
                  ),
                  const RefractionCollapsibleContent(child: Text('Content')),
                ],
              ),
            ),
          ),
        );

        await tester.tap(find.text('Trigger'));
        expect(onTapFired, true);
        expect(openStateFired, true);
      });
    }
  });

  group('Nested and Error States', () {
    testWidgets('Throws if context missing', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionCollapsibleTrigger(child: Text('Trigger')),
        ),
      );

      final exception = tester.takeException();
      expect(exception, isAssertionError);
    });

    testWidgets('Nested collapsibles operate independently', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionCollapsible(
            key: Key('outer'),
            child: Column(
              children: [
                RefractionCollapsibleTrigger(child: Text('OuterTrigger')),
                RefractionCollapsibleContent(
                  child: RefractionCollapsible(
                    key: Key('inner'),
                    child: Column(
                      children: [
                        RefractionCollapsibleTrigger(
                          child: Text('InnerTrigger'),
                        ),
                        RefractionCollapsibleContent(
                          child: Text('InnerContent'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );

      final outerSt = tester.widget<SizeTransition>(
        find.byType(SizeTransition).first,
      );
      final innerSt = tester.widget<SizeTransition>(
        find.byType(SizeTransition).last,
      );
      expect(outerSt.sizeFactor.value, 0.0);
      expect(innerSt.sizeFactor.value, 0.0);

      await tester.tap(find.text('OuterTrigger'));
      await tester.pumpAndSettle();

      expect(
        tester
            .widget<SizeTransition>(find.byType(SizeTransition).first)
            .sizeFactor
            .value,
        1.0,
      );
      expect(
        tester
            .widget<SizeTransition>(find.byType(SizeTransition).last)
            .sizeFactor
            .value,
        0.0,
      );

      await tester.tap(find.text('InnerTrigger'));
      await tester.pumpAndSettle();

      expect(
        tester
            .widget<SizeTransition>(find.byType(SizeTransition).first)
            .sizeFactor
            .value,
        1.0,
      );
      expect(
        tester
            .widget<SizeTransition>(find.byType(SizeTransition).last)
            .sizeFactor
            .value,
        1.0,
      );
    });
  });
}
