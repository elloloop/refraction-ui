import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/timeline.dart';

void main() {
  group('RefractionTimeline Tests', () {
    final List<RefractionTimelineItemData> testItems = const [
      RefractionTimelineItemData(
        id: '1',
        title: 'Event One',
        time: '10:00 AM',
        description: 'First event description',
        status: RefractionTimelineItemStatus.done,
      ),
      RefractionTimelineItemData(
        id: '2',
        title: 'Event Two',
        time: '11:00 AM',
        status: RefractionTimelineItemStatus.current,
      ),
      RefractionTimelineItemData(
        id: '3',
        title: 'Event Three',
        status: RefractionTimelineItemStatus.upcoming,
      ),
    ];

    testWidgets('Renders items vertically with all texts', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: RefractionTimeline(
                items: testItems,
                orientation: RefractionTimelineOrientation.vertical,
              ),
            ),
          ),
        ),
      );

      // Verify all titles are rendered
      expect(find.text('Event One'), findsOneWidget);
      expect(find.text('Event Two'), findsOneWidget);
      expect(find.text('Event Three'), findsOneWidget);

      // Verify time strings
      expect(find.text('10:00 AM'), findsOneWidget);
      expect(find.text('11:00 AM'), findsOneWidget);

      // Verify description
      expect(find.text('First event description'), findsOneWidget);
    });

    testWidgets('Renders items horizontally', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: RefractionTimeline(
                items: testItems,
                orientation: RefractionTimelineOrientation.horizontal,
              ),
            ),
          ),
        ),
      );

      // Verify titles are rendered in horizontal mode
      expect(find.text('Event One'), findsOneWidget);
      expect(find.text('Event Two'), findsOneWidget);
      expect(find.text('Event Three'), findsOneWidget);
    });

    testWidgets('Uses custom renderItem when provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: RefractionTimeline(
                items: testItems,
                renderItem: (context, item, index, isLast) {
                  return Text('Custom ${item.title}');
                },
              ),
            ),
          ),
        ),
      );

      expect(find.text('Custom Event One'), findsOneWidget);
      expect(find.text('Custom Event Two'), findsOneWidget);
      expect(find.text('Custom Event Three'), findsOneWidget);
      expect(find.text('Event One'), findsNothing); // Overridden by custom builder
    });
  });
}
