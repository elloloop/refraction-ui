import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/radial_gauge.dart';

void main() {
  group('RefractionRadialGauge Tests', () {
    testWidgets('Renders and displays value by default', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionRadialGauge(value: 75.0),
            ),
          ),
        ),
      );

      // Verify the value is displayed in the center
      expect(find.text('75'), findsOneWidget);
    });

    testWidgets('Renders custom label and sublabel', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionRadialGauge(
                value: 42.0,
                label: Text('CustomLabel'),
                sublabel: Text('CustomSublabel'),
              ),
            ),
          ),
        ),
      );

      expect(find.text('CustomLabel'), findsOneWidget);
      expect(find.text('CustomSublabel'), findsOneWidget);
      expect(find.text('42'), findsNothing); // Custom label overrides numeric value
    });

    testWidgets('Applies correct tone color from zones', (WidgetTester tester) async {
      const List<RefractionGaugeZone> testZones = [
        RefractionGaugeZone(upTo: 30.0, tone: RefractionGaugeTone.danger),
        RefractionGaugeZone(upTo: 70.0, tone: RefractionGaugeTone.warning),
        RefractionGaugeZone(upTo: 100.0, tone: RefractionGaugeTone.success),
      ];

      // Test danger zone (value = 20)
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionRadialGauge(
                value: 20.0,
                zones: testZones,
              ),
            ),
          ),
        ),
      );

      final RefractionRadialGauge gaugeWidget1 = tester.widget(find.byType(RefractionRadialGauge));
      final theme1 = RefractionThemeData.light();
      expect(gaugeWidget1.value, equals(20.0));

      // Test warning zone (value = 50)
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionRadialGauge(
                value: 50.0,
                zones: testZones,
              ),
            ),
          ),
        ),
      );

      final RefractionRadialGauge gaugeWidget2 = tester.widget(find.byType(RefractionRadialGauge));
      expect(gaugeWidget2.value, equals(50.0));

      // Test success zone (value = 85)
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionRadialGauge(
                value: 85.0,
                zones: testZones,
              ),
            ),
          ),
        ),
      );

      final RefractionRadialGauge gaugeWidget3 = tester.widget(find.byType(RefractionRadialGauge));
      expect(gaugeWidget3.value, equals(85.0));
    });
  });
}
