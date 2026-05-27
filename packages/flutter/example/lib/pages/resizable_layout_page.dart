import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class ResizableLayoutPage extends StatelessWidget {
  const ResizableLayoutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Resizable Layout',
              style: RefractionTheme.of(
                context,
              ).textStyle.copyWith(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              'A split-view layout with draggable handles to resize the panels.',
              style: RefractionTheme.of(
                context,
              ).textStyle.copyWith(fontSize: 16),
            ),
            const SizedBox(height: 32),
            Expanded(
              child: RefractionResizableLayout(
                direction: Axis.horizontal,
                defaultSizes: const [30.0, 70.0],
                minSizes: const [20.0, 20.0],
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: RefractionTheme.of(context).colors.surface,
                      border: Border.all(
                        color: RefractionTheme.of(context).colors.border,
                      ),
                      borderRadius: BorderRadius.circular(
                        RefractionTheme.of(context).borderRadius,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'Sidebar',
                      style: RefractionTheme.of(context).textStyle,
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: RefractionTheme.of(context).colors.surface,
                      border: Border.all(
                        color: RefractionTheme.of(context).colors.border,
                      ),
                      borderRadius: BorderRadius.circular(
                        RefractionTheme.of(context).borderRadius,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'Main Content',
                      style: RefractionTheme.of(context).textStyle,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Expanded(
              child: RefractionResizableLayout(
                direction: Axis.vertical,
                defaultSizes: const [50.0, 50.0],
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: RefractionTheme.of(context).colors.surface,
                      border: Border.all(
                        color: RefractionTheme.of(context).colors.border,
                      ),
                      borderRadius: BorderRadius.circular(
                        RefractionTheme.of(context).borderRadius,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'Top Panel',
                      style: RefractionTheme.of(context).textStyle,
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: RefractionTheme.of(context).colors.surface,
                      border: Border.all(
                        color: RefractionTheme.of(context).colors.border,
                      ),
                      borderRadius: BorderRadius.circular(
                        RefractionTheme.of(context).borderRadius,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'Bottom Panel',
                      style: RefractionTheme.of(context).textStyle,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
