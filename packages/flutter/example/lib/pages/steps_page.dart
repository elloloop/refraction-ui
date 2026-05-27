import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class StepsPage extends StatefulWidget {
  const StepsPage({super.key});

  @override
  State<StepsPage> createState() => _StepsPageState();
}

class _StepsPageState extends State<StepsPage> {
  int _currentStep1 = 1;
  int _currentStep2 = 0;

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Steps",
      description: "A sequence of steps that guides the user through a process.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Vertical Steps (Default)",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
              ),
              const SizedBox(height: 16),
              RefractionSteps(
                currentStep: _currentStep1,
                onStepTap: (index) => setState(() => _currentStep1 = index),
                steps: const [
                  RefractionStepItem(
                    title: Text("Account details"),
                    description: Text("Provide your email and password"),
                  ),
                  RefractionStepItem(
                    title: Text("Payment"),
                    description: Text("Add a credit card or bank account"),
                  ),
                  RefractionStepItem(
                    title: Text("Confirm"),
                    description: Text("Review and submit your order"),
                  ),
                ],
              ),
              const SizedBox(height: 64),
              Text(
                "Horizontal Steps",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
              ),
              const SizedBox(height: 16),
              RefractionSteps(
                currentStep: _currentStep2,
                orientation: Axis.horizontal,
                onStepTap: (index) => setState(() => _currentStep2 = index),
                steps: const [
                  RefractionStepItem(
                    title: Text("Step 1"),
                  ),
                  RefractionStepItem(
                    title: Text("Step 2"),
                  ),
                  RefractionStepItem(
                    title: Text("Step 3"),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
