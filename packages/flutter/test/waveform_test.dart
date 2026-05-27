import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp(Widget child) {
    return RefractionTheme(
      data: RefractionThemeData.light(),
      child: MaterialApp(home: Scaffold(body: child)),
    );
  }

  group('RefractionWaveform', () {
    testWidgets('1. renders silent waveform without samples', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildApp(const RefractionWaveform(paused: true)));
      expect(find.byType(RefractionWaveform), findsOneWidget);
    });

    for (var variant in WaveformVariant.values) {
      testWidgets('renders variant ${variant.name}', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          buildApp(RefractionWaveform(variant: variant, paused: true)),
        );
        expect(find.byType(RefractionWaveform), findsOneWidget);
      });
    }

    final testLengths = [1, 2, 10, 48, 100, 1024, 2048];
    for (var length in testLengths) {
      testWidgets('handles sample length $length', (WidgetTester tester) async {
        final samples = List.generate(length, (i) => (i / length) * 2 - 1.0);
        await tester.pumpWidget(
          buildApp(RefractionWaveform(samples: samples, paused: true)),
        );
        expect(find.byType(RefractionWaveform), findsOneWidget);
      });
    }

    final barCounts = [1, 10, 48, 100, 1024, 2048];
    for (var count in barCounts) {
      testWidgets('handles barCount $count', (WidgetTester tester) async {
        await tester.pumpWidget(
          buildApp(RefractionWaveform(barCount: count, paused: true)),
        );
        expect(find.byType(RefractionWaveform), findsOneWidget);
      });
    }

    final intensities = [0.0, 0.5, 1.0, 1.5, -0.5, double.nan];
    for (var intensity in intensities) {
      testWidgets('handles intensity $intensity', (WidgetTester tester) async {
        await tester.pumpWidget(
          buildApp(RefractionWaveform(intensity: intensity, paused: true)),
        );
        expect(find.byType(RefractionWaveform), findsOneWidget);
      });
    }

    final amplitudes = [0.0, 0.5, 1.0, 2.0, -1.0, double.nan];
    for (var amplitude in amplitudes) {
      testWidgets('handles amplitude $amplitude', (WidgetTester tester) async {
        await tester.pumpWidget(
          buildApp(RefractionWaveform(amplitude: amplitude, paused: true)),
        );
        expect(find.byType(RefractionWaveform), findsOneWidget);
      });
    }

    final smoothings = [0.0, 0.5, 0.8, 0.99, 1.5, -0.5, double.nan];
    for (var smoothing in smoothings) {
      testWidgets('handles smoothing $smoothing', (WidgetTester tester) async {
        await tester.pumpWidget(
          buildApp(RefractionWaveform(smoothing: smoothing, paused: true)),
        );
        expect(find.byType(RefractionWaveform), findsOneWidget);
      });
    }

    testWidgets('handles paused state changes', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(const RefractionWaveform(paused: true)));
      await tester.pumpWidget(
        buildApp(const RefractionWaveform(paused: false)),
      );
      await tester.pump(const Duration(milliseconds: 16));
      await tester.pumpWidget(buildApp(const RefractionWaveform(paused: true)));
      expect(find.byType(RefractionWaveform), findsOneWidget);
    });

    testWidgets('respects explicit width and height', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionWaveform(width: 200, height: 100, paused: true),
        ),
      );
      final sizedBox = tester.widget<SizedBox>(
        find
            .ancestor(
              of: find.byType(CustomPaint),
              matching: find.byType(SizedBox),
            )
            .first,
      );
      expect(sizedBox.width, 200);
      expect(sizedBox.height, 100);
    });

    testWidgets('falls back to default height and full width', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildApp(const RefractionWaveform(paused: true)));
      final sizedBox = tester.widget<SizedBox>(
        find
            .ancestor(
              of: find.byType(CustomPaint),
              matching: find.byType(SizedBox),
            )
            .first,
      );
      expect(sizedBox.width, double.infinity);
      expect(sizedBox.height, 80.0);
    });

    testWidgets('respects custom color', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionWaveform(color: Colors.red, paused: true)),
      );
      expect(find.byType(RefractionWaveform), findsOneWidget);
    });

    testWidgets('handles samples with NaN and Infinity', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionWaveform(
            samples: [
              double.nan,
              double.infinity,
              double.negativeInfinity,
              0.0,
            ],
            paused: true,
          ),
        ),
      );
      expect(find.byType(RefractionWaveform), findsOneWidget);
    });

    testWidgets('handles dynamic sample updates', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionWaveform(samples: [0.1, 0.2], paused: false)),
      );
      await tester.pump(const Duration(milliseconds: 16));
      await tester.pumpWidget(
        buildApp(
          const RefractionWaveform(samples: [0.5, 0.6, 0.7], paused: false),
        ),
      );
      await tester.pump(const Duration(milliseconds: 16));
      expect(find.byType(RefractionWaveform), findsOneWidget);
    });

    testWidgets('has correct semantics', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(const RefractionWaveform(paused: true)));
      expect(find.bySemanticsLabel('Audio waveform'), findsOneWidget);
    });
  });
}
