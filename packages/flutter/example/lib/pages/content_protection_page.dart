import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class ContentProtectionPage extends StatefulWidget {
  const ContentProtectionPage({super.key});

  @override
  State<ContentProtectionPage> createState() => _ContentProtectionPageState();
}

class _ContentProtectionPageState extends State<ContentProtectionPage> {
  bool _isLocked = true;
  bool _showWatermark = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Content Protection'),
        backgroundColor: theme.colors.background,
        foregroundColor: theme.colors.foreground,
      ),
      backgroundColor: theme.colors.background,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Content Protection',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: theme.colors.foreground,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'A wrapper component that protects child content by obscuring it with a blur, overlay, or watermark until unlocked.',
              style: TextStyle(
                fontSize: 16,
                color: theme.colors.mutedForeground,
              ),
            ),
            const SizedBox(height: 32),

            // Controls
            Row(
              children: [
                RefractionCheckbox(
                  value: _isLocked,
                  onChanged: (val) => setState(() => _isLocked = val == true),
                  label: 'Locked',
                ),
                const SizedBox(width: 24),
                RefractionCheckbox(
                  value: _showWatermark,
                  onChanged: (val) =>
                      setState(() => _showWatermark = val == true),
                  label: 'Watermark',
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Example 1: Basic lock with paywall overlay
            _buildSectionTitle('Paywall Overlay'),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: theme.colors.border),
                borderRadius: BorderRadius.circular(theme.borderRadius),
              ),
              clipBehavior: Clip.antiAlias,
              child: RefractionContentProtection(
                isLocked: _isLocked,
                watermarkText: _showWatermark ? 'john.doe@example.com' : null,
                overlay: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.lock_outline,
                      size: 48,
                      color: theme.colors.foreground,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'This content is for subscribers only.',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: theme.colors.foreground,
                      ),
                    ),
                    const SizedBox(height: 16),
                    RefractionButton(
                      child: const Text('Subscribe Now'),
                      onPressed: () {
                        setState(() {
                          _isLocked = false;
                        });
                      },
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'The Secret to Refraction UI',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: theme.colors.foreground,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                        style: TextStyle(
                          fontSize: 16,
                          height: 1.5,
                          color: theme.colors.foreground,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                        style: TextStyle(
                          fontSize: 16,
                          height: 1.5,
                          color: theme.colors.foreground,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: RefractionTheme.of(context).colors.foreground,
      ),
    );
  }
}
