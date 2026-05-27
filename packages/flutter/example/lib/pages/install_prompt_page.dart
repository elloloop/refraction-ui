import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../layout/page_layout.dart';

class InstallPromptPage extends StatefulWidget {
  const InstallPromptPage({super.key});

  @override
  State<InstallPromptPage> createState() => _InstallPromptPageState();
}

class _InstallPromptPageState extends State<InstallPromptPage> {
  final GlobalKey<RefractionInstallPromptState> _promptKey = GlobalKey();
  bool _dismissed = true; // initially hidden in demo unless clicked

  @override
  Widget build(BuildContext context) {
    return PageLayout(
      title: 'Install Prompt',
      description:
          'A banner prompting the user to install the application as a PWA.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('The prompt simulates a bottom sticky banner.'),
          const SizedBox(height: 16),
          RefractionButton(
            onPressed: () {
              setState(() {
                _dismissed = false;
              });
              _promptKey.currentState?.show();
            },
            child: const Text('Show Install Prompt'),
          ),
          const SizedBox(height: 32),
          
          // In a real app, this would be positioned at the bottom of the screen.
          // For demo purposes, we show it embedded here but it spans full width.
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                border: Border.all(color: RefractionTheme.of(context).data.colors.border),
                color: RefractionTheme.of(context).data.colors.muted.withValues(alpha: 0.5),
              ),
              child: Stack(
                children: [
                  const Center(child: Text('App Content Area')),
                  Align(
                    alignment: Alignment.bottomCenter,
                    child: RefractionInstallPrompt(
                      key: _promptKey,
                      delay: Duration.zero,
                      initialDismissed: _dismissed,
                      onDismiss: () {
                        setState(() {
                          _dismissed = true;
                        });
                      },
                      onInstall: () {
                        setState(() {
                          _dismissed = true;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Installation triggered!')),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
