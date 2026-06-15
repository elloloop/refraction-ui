import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/live_captions.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  final List<RefractionCaptionCue> testCues = [
    const RefractionCaptionCue(id: '1', speaker: 'Sarah Connor', text: 'Hello John.', isFinal: true),
    const RefractionCaptionCue(id: '2', speaker: 'John Connor', text: 'Hey mom.', isFinal: true),
    const RefractionCaptionCue(id: '3', speaker: 'Terminator', text: 'Come with me', isFinal: false),
  ];

  testWidgets('RefractionLiveCaptions displays maxLines number of cues', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionLiveCaptions(
          cues: testCues,
          maxLines: 2,
        ),
      ),
    );

    // Should display only the last 2 cues: John Connor: Hey mom, and Terminator: Come with me
    expect(
      find.byWidgetPredicate(
        (w) => w is RichText && w.text.toPlainText().contains('Sarah Connor'),
      ),
      findsNothing,
    );
    expect(
      find.byWidgetPredicate(
        (w) => w is RichText && w.text.toPlainText().contains('Hey mom'),
      ),
      findsOneWidget,
    );
    expect(
      find.byWidgetPredicate(
        (w) => w is RichText && w.text.toPlainText().contains('Come with me'),
      ),
      findsOneWidget,
    );
  });

  testWidgets('RefractionLiveCaptions handles empty cues with waiting state', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionLiveCaptions(cues: []),
      ),
    );

    expect(find.text('Waiting for captions...'), findsOneWidget);
  });
}
