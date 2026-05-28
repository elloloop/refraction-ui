import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp(Widget child) {
    return RefractionTheme(
      data: RefractionThemeData.light(),
      child: MaterialApp(
        home: Scaffold(body: Builder(builder: (context) => child)),
      ),
    );
  }

  for (final side in RefractionSheetSide.values) {
    group('RefractionSheet - $side', () {
      testWidgets('Opens successfully', (tester) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        expect(find.text('Sheet Content'), findsOneWidget);
      });

      testWidgets('Renders title and description', (tester) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      title: const Text('Sheet Title'),
                      description: const Text('Sheet Description'),
                      content: const Text('Sheet Content'),
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        expect(find.text('Sheet Title'), findsOneWidget);
        expect(find.text('Sheet Description'), findsOneWidget);
      });

      testWidgets('Renders actions', (tester) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                      actions: [const Text('Action 1'), const Text('Action 2')],
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        expect(find.text('Action 1'), findsOneWidget);
        expect(find.text('Action 2'), findsOneWidget);
      });

      testWidgets('Renders drag handle if showDragHandle is true', (
        tester,
      ) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                      showDragHandle: true,
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        // Drag handle is a Container with width 32
        final handleContainer = find.byWidgetPredicate(
          (w) => w is Container && w.constraints?.maxWidth == 32,
        );
        expect(handleContainer, findsOneWidget);
      });

      testWidgets('Dismisses on barrier tap if barrierDismissible is true', (
        tester,
      ) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                      barrierDismissible: true,
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();
        expect(find.text('Sheet Content'), findsOneWidget);

        // Tap outside the sheet content (barrier)
        Offset tapOffset =
            (side == RefractionSheetSide.left ||
                side == RefractionSheetSide.top)
            ? const Offset(700, 500)
            : const Offset(10, 10);
        await tester.tapAt(tapOffset);
        await tester.pumpAndSettle();

        expect(find.text('Sheet Content'), findsNothing);
      });

      testWidgets(
        'Does not dismiss on barrier tap if barrierDismissible is false',
        (tester) async {
          await tester.pumpWidget(
            buildApp(
              Builder(
                builder: (context) {
                  return ElevatedButton(
                    onPressed: () {
                      RefractionSheet.show(
                        context: context,
                        side: side,
                        content: const Text('Sheet Content'),
                        barrierDismissible: false,
                      );
                    },
                    child: const Text('Open'),
                  );
                },
              ),
            ),
          );

          await tester.tap(find.text('Open'));
          await tester.pumpAndSettle();
          expect(find.text('Sheet Content'), findsOneWidget);

          // Tap outside the sheet content (barrier)
          Offset tapOffset =
              (side == RefractionSheetSide.left ||
                  side == RefractionSheetSide.top)
              ? const Offset(700, 500)
              : const Offset(10, 10);
          await tester.tapAt(tapOffset);
          await tester.pumpAndSettle();

          expect(find.text('Sheet Content'), findsOneWidget);
        },
      );

      testWidgets('Applies custom width and height', (tester) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                      width: 250,
                      height: 350,
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        final container = tester.widget<Container>(
          find.descendant(
            of: find.byType(Material),
            matching: find.byType(Container).first,
          ),
        );

        expect(container.constraints?.maxWidth, 250);
        expect(container.constraints?.maxHeight, 350);
      });

      testWidgets('Dismisses on sufficient drag', (tester) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                      width: 400,
                      height: 400,
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        final sheetCenter = tester.getCenter(find.text('Sheet Content'));
        Offset dragOffset;
        switch (side) {
          case RefractionSheetSide.left:
            dragOffset = const Offset(-250, 0); // Drag left
            break;
          case RefractionSheetSide.right:
            dragOffset = const Offset(250, 0); // Drag right
            break;
          case RefractionSheetSide.top:
            dragOffset = const Offset(0, -250); // Drag up
            break;
          case RefractionSheetSide.bottom:
            dragOffset = const Offset(0, 250); // Drag down
            break;
        }

        await tester.dragFrom(sheetCenter, dragOffset);
        await tester.pumpAndSettle();

        expect(find.text('Sheet Content'), findsNothing);
      });

      testWidgets('Snaps back on insufficient drag', (tester) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                      width: 400,
                      height: 400,
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        final sheetCenter = tester.getCenter(find.text('Sheet Content'));
        Offset dragOffset;
        switch (side) {
          case RefractionSheetSide.left:
            dragOffset = const Offset(-50, 0); // Small drag left
            break;
          case RefractionSheetSide.right:
            dragOffset = const Offset(50, 0); // Small drag right
            break;
          case RefractionSheetSide.top:
            dragOffset = const Offset(0, -50); // Small drag up
            break;
          case RefractionSheetSide.bottom:
            dragOffset = const Offset(0, 50); // Small drag down
            break;
        }

        await tester.dragFrom(sheetCenter, dragOffset);
        await tester.pumpAndSettle();

        expect(find.text('Sheet Content'), findsOneWidget);
      });

      testWidgets('Dismisses on fast fling', (tester) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                      width: 400,
                      height: 400,
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        final sheetCenter = tester.getCenter(find.text('Sheet Content'));
        Offset flingOffset;
        switch (side) {
          case RefractionSheetSide.left:
            flingOffset = const Offset(-50, 0);
            break;
          case RefractionSheetSide.right:
            flingOffset = const Offset(50, 0);
            break;
          case RefractionSheetSide.top:
            flingOffset = const Offset(0, -50);
            break;
          case RefractionSheetSide.bottom:
            flingOffset = const Offset(0, 50);
            break;
        }

        await tester.flingFrom(sheetCenter, flingOffset, 1000);
        await tester.pumpAndSettle();

        expect(find.text('Sheet Content'), findsNothing);
      });

      testWidgets('Respects background color from theme', (tester) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        final material = tester.widget<Material>(find.byType(Material).last);
        expect(material.color, RefractionThemeData.light().colors.background);
      });

      testWidgets('Inner container matches background color and border', (
        tester,
      ) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        final container = tester.widget<Container>(
          find.descendant(
            of: find.byType(Material),
            matching: find.byType(Container).first,
          ),
        );

        final decoration = container.decoration as BoxDecoration;
        expect(decoration.color, RefractionThemeData.light().colors.background);
        expect(decoration.border, isNotNull);
      });

      testWidgets('Content scroll view is present', (tester) async {
        await tester.pumpWidget(
          buildApp(
            Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    RefractionSheet.show(
                      context: context,
                      side: side,
                      content: const Text('Sheet Content'),
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        );

        await tester.tap(find.text('Open'));
        await tester.pumpAndSettle();

        expect(find.byType(SingleChildScrollView), findsOneWidget);
      });
    });
  }
}
