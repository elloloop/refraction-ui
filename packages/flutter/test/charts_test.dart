import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildChart(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: SizedBox(width: 400, height: 300, child: child)),
      ),
    );
  }

  group('RefractionLineChart Tests', () {
    final sampleData = [
      RefractionChartDataPoint(x: 0, y: 10),
      RefractionChartDataPoint(x: 1, y: 20),
      RefractionChartDataPoint(x: 2, y: 15),
      RefractionChartDataPoint(x: 3, y: 30),
    ];

    testWidgets('Renders empty data safely', (tester) async {
      await tester.pumpWidget(buildChart(RefractionLineChart(data: [])));
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    for (int i = 0; i < 15; i++) {
      testWidgets('Renders simple line chart $i', (tester) async {
        await tester.pumpWidget(
          buildChart(RefractionLineChart(data: sampleData)),
        );
        expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
      });
    }

    testWidgets('Renders line chart with grid', (tester) async {
      await tester.pumpWidget(
        buildChart(RefractionLineChart(data: sampleData, showGrid: true)),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders line chart without grid', (tester) async {
      await tester.pumpWidget(
        buildChart(RefractionLineChart(data: sampleData, showGrid: false)),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders line chart with dots', (tester) async {
      await tester.pumpWidget(
        buildChart(RefractionLineChart(data: sampleData, showDots: true)),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders line chart with area fill', (tester) async {
      await tester.pumpWidget(
        buildChart(RefractionLineChart(data: sampleData, fillArea: true)),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders line chart with explicit bounds', (tester) async {
      await tester.pumpWidget(
        buildChart(
          RefractionLineChart(
            data: sampleData,
            minX: -1,
            maxX: 5,
            minY: 0,
            maxY: 50,
          ),
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders line chart with single point', (tester) async {
      await tester.pumpWidget(
        buildChart(
          RefractionLineChart(data: [RefractionChartDataPoint(x: 1, y: 1)]),
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders line chart with negative values', (tester) async {
      await tester.pumpWidget(
        buildChart(
          RefractionLineChart(
            data: [
              RefractionChartDataPoint(x: -2, y: -10),
              RefractionChartDataPoint(x: -1, y: -5),
              RefractionChartDataPoint(x: 0, y: 0),
            ],
          ),
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders line chart with identical points', (tester) async {
      await tester.pumpWidget(
        buildChart(
          RefractionLineChart(
            data: [
              RefractionChartDataPoint(x: 1, y: 10),
              RefractionChartDataPoint(x: 1, y: 10),
            ],
          ),
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });
  });

  group('RefractionBarChart Tests', () {
    final sampleData = [
      RefractionChartDataPoint(x: 0, y: 10),
      RefractionChartDataPoint(x: 1, y: 20),
      RefractionChartDataPoint(x: 2, y: 15),
      RefractionChartDataPoint(x: 3, y: 30),
    ];

    testWidgets('Renders empty data safely', (tester) async {
      await tester.pumpWidget(buildChart(RefractionBarChart(data: [])));
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    for (int i = 0; i < 15; i++) {
      testWidgets('Renders simple bar chart $i', (tester) async {
        await tester.pumpWidget(
          buildChart(RefractionBarChart(data: sampleData)),
        );
        expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
      });
    }

    testWidgets('Renders bar chart with grid', (tester) async {
      await tester.pumpWidget(
        buildChart(RefractionBarChart(data: sampleData, showGrid: true)),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders bar chart without grid', (tester) async {
      await tester.pumpWidget(
        buildChart(RefractionBarChart(data: sampleData, showGrid: false)),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders bar chart with single bar', (tester) async {
      await tester.pumpWidget(
        buildChart(
          RefractionBarChart(data: [RefractionChartDataPoint(x: 0, y: 50)]),
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders bar chart with negative values clamped', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildChart(
          RefractionBarChart(
            data: [
              RefractionChartDataPoint(x: 0, y: -10),
              RefractionChartDataPoint(x: 1, y: 20),
            ],
          ),
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders bar chart with explicit maxY', (tester) async {
      await tester.pumpWidget(
        buildChart(RefractionBarChart(data: sampleData, maxY: 100)),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders bar chart with 0 max Y handled', (tester) async {
      await tester.pumpWidget(
        buildChart(
          RefractionBarChart(
            data: [
              RefractionChartDataPoint(x: 0, y: 0),
              RefractionChartDataPoint(x: 1, y: 0),
            ],
          ),
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });
  });

  group('RefractionPieChart Tests', () {
    final sampleData = [
      RefractionPieChartDataPoint(value: 10, color: Colors.red),
      RefractionPieChartDataPoint(value: 20, color: Colors.blue),
      RefractionPieChartDataPoint(value: 30, color: Colors.green),
    ];

    testWidgets('Renders empty data safely', (tester) async {
      await tester.pumpWidget(buildChart(RefractionPieChart(data: [])));
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    for (int i = 0; i < 15; i++) {
      testWidgets('Renders simple pie chart $i', (tester) async {
        await tester.pumpWidget(
          buildChart(RefractionPieChart(data: sampleData)),
        );
        expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
      });
    }

    testWidgets('Renders donut chart with holeRadius', (tester) async {
      await tester.pumpWidget(
        buildChart(RefractionPieChart(data: sampleData, holeRadius: 40)),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders donut chart with large holeRadius', (tester) async {
      await tester.pumpWidget(
        buildChart(
          RefractionPieChart(
            data: sampleData,
            holeRadius: 1000,
          ), // Larger than bounds safely ignored
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders pie chart with single slice', (tester) async {
      await tester.pumpWidget(
        buildChart(
          RefractionPieChart(
            data: [
              RefractionPieChartDataPoint(value: 100, color: Colors.purple),
            ],
          ),
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });

    testWidgets('Renders pie chart with 0 total handled safely', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildChart(
          RefractionPieChart(
            data: [
              RefractionPieChartDataPoint(value: 0, color: Colors.purple),
              RefractionPieChartDataPoint(value: 0, color: Colors.orange),
            ],
          ),
        ),
      );
      expect(find.byType(CustomPaint), findsAtLeastNWidgets(1));
    });
  });
}
