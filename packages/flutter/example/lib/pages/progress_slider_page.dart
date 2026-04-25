import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class ProgressSliderPage extends StatefulWidget {
  const ProgressSliderPage({super.key});

  @override
  State<ProgressSliderPage> createState() => _ProgressSliderPageState();
}

class _ProgressSliderPageState extends State<ProgressSliderPage> {
  double _sliderValue = 0.5;

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Progress & Slider",
      description: "Continuous and discrete progress indicators and value selectors.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Progress Bar",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              const RefractionProgress(value: 0.3),
              const SizedBox(height: 16),
              const RefractionProgress(value: 0.8, color: Colors.green),
              const SizedBox(height: 48),
              Text(
                "Slider",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionSlider(
                value: _sliderValue,
                onChanged: (val) {
                  setState(() {
                    _sliderValue = val;
                  });
                },
              ),
              const SizedBox(height: 16),
              RefractionProgress(value: _sliderValue), // Linked progress
            ],
          ),
        ),
      ),
    );
  }
}
