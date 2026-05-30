import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class ChartsPage extends StatelessWidget {
  const ChartsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final lineData = [
      RefractionChartDataPoint(x: 0, y: 10),
      RefractionChartDataPoint(x: 1, y: 25),
      RefractionChartDataPoint(x: 2, y: 15),
      RefractionChartDataPoint(x: 3, y: 40),
      RefractionChartDataPoint(x: 4, y: 35),
      RefractionChartDataPoint(x: 5, y: 60),
    ];

    final barData = [
      RefractionChartDataPoint(x: 0, y: 15, color: Colors.blue),
      RefractionChartDataPoint(x: 1, y: 30, color: Colors.indigo),
      RefractionChartDataPoint(x: 2, y: 20, color: Colors.purple),
      RefractionChartDataPoint(x: 3, y: 45, color: Colors.deepPurple),
      RefractionChartDataPoint(x: 4, y: 25, color: Colors.blueAccent),
    ];

    final pieData = [
      RefractionPieChartDataPoint(value: 35, color: Colors.blue, label: 'A'),
      RefractionPieChartDataPoint(
        value: 25,
        color: Colors.lightBlue,
        label: 'B',
      ),
      RefractionPieChartDataPoint(value: 20, color: Colors.cyan, label: 'C'),
      RefractionPieChartDataPoint(value: 20, color: Colors.teal, label: 'D'),
    ];

    return PreviewCanvas(
      title: "Charts",
      description:
          "Headless rendering components for line, bar, and pie charts.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Line Chart",
                  style: RefractionTheme.of(context).data.textStyle.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 300,
                  child: RefractionLineChart(
                    data: lineData,
                    showDots: true,
                    fillArea: true,
                    lineColor: Colors.blue,
                  ),
                ),
                const SizedBox(height: 48),
                Text(
                  "Bar Chart",
                  style: RefractionTheme.of(context).data.textStyle.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 300,
                  child: RefractionBarChart(data: barData, barSpacing: 16.0),
                ),
                const SizedBox(height: 48),
                Text(
                  "Pie & Donut Chart",
                  style: RefractionTheme.of(context).data.textStyle.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 250,
                        child: RefractionPieChart(data: pieData),
                      ),
                    ),
                    Expanded(
                      child: SizedBox(
                        height: 250,
                        child: RefractionPieChart(
                          data: pieData,
                          holeRadius: 60,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 48),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
