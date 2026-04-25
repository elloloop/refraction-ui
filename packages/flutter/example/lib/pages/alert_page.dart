import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class AlertPage extends StatelessWidget {
  const AlertPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Alert & Callout",
      description: "Static callout banners used to draw attention to important information.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Alert Variants",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              const RefractionAlert(
                icon: Icon(Icons.terminal),
                title: "Heads up!",
                description: "You can add components to your app using the cli.",
              ),
              const SizedBox(height: 16),
              const RefractionAlert(
                icon: Icon(Icons.warning),
                title: "Warning",
                description: "Your session is about to expire.",
                variant: RefractionAlertVariant.warning,
              ),
              const SizedBox(height: 16),
              const RefractionAlert(
                icon: Icon(Icons.error),
                title: "Error",
                description: "Your session has expired. Please log in again.",
                variant: RefractionAlertVariant.destructive,
              ),
              const SizedBox(height: 16),
              const RefractionAlert(
                icon: Icon(Icons.check_circle),
                title: "Success",
                description: "Your changes have been saved.",
                variant: RefractionAlertVariant.success,
              ),
              const SizedBox(height: 48),
              Text(
                "Callout Component",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              const RefractionCallout(
                title: "Documentation Update",
                description: "We have updated our terms of service.",
              ),
            ],
          ),
        ),
      ),
    );
  }
}
