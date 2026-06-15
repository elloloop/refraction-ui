import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/browser_chrome_mock.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionBrowserChromeMock renders domain, path, and child', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionBrowserChromeMock(
          url: 'easyloops.dev/path/to/page',
          child: const Text('PORTPORT'),
        ),
      ),
    );

    expect(find.text('PORTPORT'), findsOneWidget);

    final richTextFinder = find.byWidgetPredicate(
      (widget) =>
          widget is RichText &&
          widget.text.toPlainText().contains('easyloops.dev'),
    );
    expect(richTextFinder, findsOneWidget);

    final RichText richText = tester.widget(richTextFinder);
    final textSpan = richText.text as TextSpan;
    expect(textSpan.children![0].toPlainText(), 'easyloops.dev');
    expect(textSpan.children![1].toPlainText(), '/path/to/page');
  });

  testWidgets('RefractionBrowserChromeMock renders live/rec status', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionBrowserChromeMock(
          url: 'easyloops.dev',
          status: RefractionBrowserChromeStatus.live,
          child: SizedBox(),
        ),
      ),
    );

    expect(find.text('LIVE'), findsOneWidget);

    await tester.pumpWidget(
      buildTestApp(
        const RefractionBrowserChromeMock(
          url: 'easyloops.dev',
          status: RefractionBrowserChromeStatus.rec,
          child: SizedBox(),
        ),
      ),
    );

    expect(find.text('REC'), findsOneWidget);
  });
}
