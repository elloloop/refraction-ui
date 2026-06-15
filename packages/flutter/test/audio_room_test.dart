import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/audio_room.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  final List<RefractionAudioParticipant> testParticipants = [
    const RefractionAudioParticipant(
      id: '1',
      name: 'Alice Cooper',
      speaking: true,
    ),
    const RefractionAudioParticipant(
      id: '2',
      name: 'Bob Marley',
      muted: true,
    ),
    const RefractionAudioParticipant(
      id: '3',
      name: 'Charlie Chaplin',
      handRaised: true,
    ),
  ];

  testWidgets('RefractionAudioRoom renders all participants with appropriate badges', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionAudioRoom(
          participants: testParticipants,
        ),
      ),
    );

    // Verify all names are displayed under the orbs
    expect(find.text('Alice Cooper'), findsOneWidget);
    expect(find.text('Bob Marley'), findsOneWidget);
    expect(find.text('Charlie Chaplin'), findsOneWidget);

    // Initials: AC, BM, CC
    expect(find.text('AC'), findsOneWidget);
    expect(find.text('BM'), findsOneWidget);
    expect(find.text('CC'), findsOneWidget);

    // Muted icon (mic_off) should render for Bob Marley
    expect(find.byIcon(Icons.mic_off), findsOneWidget);

    // Hand raised emoji should render for Charlie Chaplin
    expect(find.text('✋'), findsOneWidget);
  });
}
