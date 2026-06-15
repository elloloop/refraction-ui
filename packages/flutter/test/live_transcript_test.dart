import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/live_transcript.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  final List<RefractionTranscriptEntry> testEntries = [
    const RefractionTranscriptEntry(
      id: '1',
      speaker: 'Sarah Connor',
      text: 'First line from Sarah',
      timestamp: '12:00',
      speakerColor: Colors.blue,
    ),
    const RefractionTranscriptEntry(
      id: '2',
      speaker: 'Sarah Connor',
      text: 'Second line from Sarah',
      timestamp: '12:01',
    ),
    const RefractionTranscriptEntry(
      id: '3',
      speaker: 'John Doe',
      text: 'Response from John',
      timestamp: '12:02',
    ),
  ];

  testWidgets('RefractionLiveTranscript groups consecutive entries by speaker', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionLiveTranscript(
          entries: testEntries,
        ),
      ),
    );

    // Sarah Connor's name should only be rendered once (as the header of the merged block)
    expect(find.text('Sarah Connor'), findsOneWidget);

    // Both lines from Sarah should be displayed
    expect(find.text('First line from Sarah'), findsOneWidget);
    expect(find.text('Second line from Sarah'), findsOneWidget);

    // John's name and message should be displayed
    expect(find.text('John Doe'), findsOneWidget);
    expect(find.text('Response from John'), findsOneWidget);
  });
}
