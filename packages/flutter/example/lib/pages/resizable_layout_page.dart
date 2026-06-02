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
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: RefractionTheme.of(context).colors.foreground),
            ),
            const SizedBox(height: 16),
            Text(
              'A split-view layout with draggable handles to resize the panels.',
              style: TextStyle(fontSize: 16, color: RefractionTheme.of(context).colors.foreground),
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
                      color: RefractionTheme.of(context).colors.card,
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
                      style: TextStyle(color: RefractionTheme.of(context).colors.foreground),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: RefractionTheme.of(context).colors.card,
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
                      style: TextStyle(color: RefractionTheme.of(context).colors.foreground),
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
                      color: RefractionTheme.of(context).colors.card,
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
                      style: TextStyle(color: RefractionTheme.of(context).colors.foreground),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: RefractionTheme.of(context).colors.card,
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
                      style: TextStyle(color: RefractionTheme.of(context).colors.foreground),
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
