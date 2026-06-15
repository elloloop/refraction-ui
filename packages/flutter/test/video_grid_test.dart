import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/video_grid.dart';
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

  final List<RefractionVideoTileData> demoParticipants = [
    const RefractionVideoTileData(id: '1', name: 'Alice Smith'),
    const RefractionVideoTileData(id: '2', name: 'Bob Johnson'),
    const RefractionVideoTileData(id: '3', name: 'Charlie Brown'),
  ];

  testWidgets('RefractionVideoGrid renders a GridView with all participants in grid mode', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionVideoGrid(
          participants: demoParticipants,
          layout: RefractionVideoGridLayout.grid,
        ),
      ),
    );

    expect(find.byType(GridView), findsOneWidget);
    expect(find.text('Alice Smith'), findsOneWidget);
    expect(find.text('Bob Johnson'), findsOneWidget);
    expect(find.text('Charlie Brown'), findsOneWidget);
  });

  testWidgets('RefractionVideoGrid renders a speaker layout with a spotlight and filmstrip', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionVideoGrid(
          participants: demoParticipants,
          layout: RefractionVideoGridLayout.speaker,
          spotlightId: '2',
        ),
      ),
    );

    // Spotlight participant is Bob Johnson, Charlie Brown and Alice Smith are in the filmstrip
    expect(find.text('Bob Johnson'), findsOneWidget);
    expect(find.text('Alice Smith'), findsOneWidget);
    expect(find.text('Charlie Brown'), findsOneWidget);
    expect(find.byType(ListView), findsOneWidget); // Filmstrip
  });
}
