import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/presence_indicator.dart';
import '../dev_tools/preview_canvas.dart';

class PresenceIndicatorPage extends StatelessWidget {
  const PresenceIndicatorPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Presence Indicator",
      description:
          "A small widget used to show user online/offline/away status.",
      child: Center(
        child: Wrap(
          spacing: 48,
          runSpacing: 48,
          crossAxisAlignment: WrapCrossAlignment.start,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Sizes (Dots Only)"),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 16,
                  children: [
                    const RefractionPresenceIndicator(
                      status: RefractionPresenceStatus.online,
                      size: RefractionPresenceSize.sm,
                    ),
                    const RefractionPresenceIndicator(
                      status: RefractionPresenceStatus.online,
                      size: RefractionPresenceSize.md,
                    ),
                    const RefractionPresenceIndicator(
                      status: RefractionPresenceStatus.online,
                      size: RefractionPresenceSize.lg,
                    ),
                  ],
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("All Statuses (with labels)"),
                const SizedBox(height: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (final status in RefractionPresenceStatus.values)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: RefractionPresenceIndicator(
                          status: status,
                          showLabel: true,
                        ),
                      ),
                  ],
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Layered on Avatar"),
                const SizedBox(height: 16),
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    const RefractionAvatar(fallbackText: 'AR', size: 40),
                    Container(
                      decoration: BoxDecoration(
                        color: RefractionTheme.of(
                          context,
                        ).data.colors.background,
                        shape: BoxShape.circle,
                      ),
                      padding: const EdgeInsets.all(
                        2,
                      ), // border to separate dot
                      child: const RefractionPresenceIndicator(
                        status: RefractionPresenceStatus.online,
                        size: RefractionPresenceSize.sm,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
