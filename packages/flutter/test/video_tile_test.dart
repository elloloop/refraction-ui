import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/video_tile.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionVideoTile displays name and initials fallback when mediaSlot is null', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(const RefractionVideoTile(name: 'Sarah Connor')),
    );

    expect(find.text('Sarah Connor'), findsOneWidget);
    // Initials: SC
    expect(find.text('SC'), findsOneWidget);
  });

  testWidgets('RefractionVideoTile displays mediaSlot when provided', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionVideoTile(
          name: 'Sarah Connor',
          mediaSlot: Text('Custom Video Feed'),
        ),
      ),
    );

    expect(find.text('Sarah Connor'), findsOneWidget);
    expect(find.text('SC'), findsNothing);
    expect(find.text('Custom Video Feed'), findsOneWidget);
  });

  testWidgets('RefractionVideoTile displays mic off icon when muted', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionVideoTile(
          name: 'Sarah Connor',
          micState: RefractionVideoTileMicState.muted,
        ),
      ),
    );

    expect(find.byIcon(Icons.mic_off), findsOneWidget);
  });

  testWidgets('RefractionVideoTile displays reaction badge', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionVideoTile(
          name: 'Sarah Connor',
          reaction: Text('🔥'),
        ),
      ),
    );

    expect(find.text('🔥'), findsOneWidget);
  });
}
