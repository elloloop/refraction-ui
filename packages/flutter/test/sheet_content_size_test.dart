import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Future<void> open(
    WidgetTester tester, {
    required Widget content,
    bool dark = false,
    double scale = 1,
    double keyboard = 0,
    double? maxHeight,
  }) async {
    tester.view.physicalSize = const Size(375, 667);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      RefractionTheme(
        data: dark ? RefractionThemeData.dark() : RefractionThemeData.light(),
        child: MaterialApp(
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context).copyWith(
              textScaler: TextScaler.linear(scale),
              viewInsets: EdgeInsets.only(bottom: keyboard),
            ),
            child: child!,
          ),
          home: Builder(
            builder: (context) => Scaffold(
              body: TextButton(
                onPressed: () => RefractionSheet.show(
                  context: context,
                  side: RefractionSheetSide.bottom,
                  fitContent: true,
                  maxHeight: maxHeight,
                  title: const Text('Message actions'),
                  content: content,
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Done'),
                    ),
                  ],
                ),
                child: const Text('Open'),
              ),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();
  }

  for (final dark in [false, true]) {
    testWidgets(
      'short content fits without a fixed viewport fraction ($dark)',
      (tester) async {
        await open(
          tester,
          dark: dark,
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final label in [
                'Reply',
                'React',
                'Forward',
                'Copy',
                'Edit',
                'Delete',
                'More',
              ])
                SizedBox(height: 48, child: Center(child: Text(label))),
            ],
          ),
        );
        final scroll = tester.getRect(find.byType(SingleChildScrollView));
        expect(scroll.height, 352);
        for (final label in [
          'Reply',
          'React',
          'Forward',
          'Copy',
          'Edit',
          'Delete',
          'More',
        ]) {
          expect(find.text(label).hitTestable(), findsOneWidget);
        }
        expect(tester.getBottomLeft(find.text('Done')).dy, lessThan(667));
        expect(tester.takeException(), isNull);
        await tester.tap(find.text('Done'), warnIfMissed: true);
        await tester.pumpAndSettle();
        expect(find.text('Reply'), findsNothing);
      },
    );

    testWidgets(
      'long content scrolls with visible footer above keyboard ($dark)',
      (tester) async {
        await open(
          tester,
          dark: dark,
          scale: 3.2,
          keyboard: 220,
          maxHeight: 420,
          content: Column(
            children: [for (var i = 0; i < 20; i++) Text('Action $i')],
          ),
        );
        expect(tester.getBottomLeft(find.text('Done')).dy, lessThan(447));
        expect(tester.takeException(), isNull);
        await tester.scrollUntilVisible(
          find.text('Action 19'),
          300,
          scrollable: find.byType(Scrollable).last,
        );
        await tester.pumpAndSettle();
        expect(find.text('Action 19').hitTestable(), findsOneWidget);
        await tester.tap(find.text('Done'), warnIfMissed: true);
        await tester.pumpAndSettle();
        expect(find.text('Action 19'), findsNothing);
      },
    );
  }
}
