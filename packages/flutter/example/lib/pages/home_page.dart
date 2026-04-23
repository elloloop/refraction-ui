import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class HomePage extends StatelessWidget {
  final VoidCallback onGetStarted;

  const HomePage({super.key, required this.onGetStarted});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return SingleChildScrollView(
      child: Column(
        children: [
          // Hero Section
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 120),
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [
                  colors.primary.withValues(alpha: 0.1),
                  colors.background,
                ],
                radius: 1.5,
                center: const Alignment(0, -0.5),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: colors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(color: colors.primary.withValues(alpha: 0.2)),
                  ),
                  child: Text(
                    "v1.0.0 Now Available",
                    style: theme.textStyle.copyWith(
                      color: colors.primary,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                Text(
                  "Beautiful, Production-Ready\nFlutter Components",
                  textAlign: TextAlign.center,
                  style: theme.textStyle.copyWith(
                    fontSize: 64,
                    fontWeight: FontWeight.w800,
                    height: 1.1,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: 600,
                  child: Text(
                    "A premium UI toolkit designed to elevate your Flutter applications. Stop hacking together generic interfaces and start shipping world-class experiences right out of the box.",
                    textAlign: TextAlign.center,
                    style: theme.textStyle.copyWith(
                      fontSize: 20,
                      color: colors.mutedForeground,
                      height: 1.5,
                    ),
                  ),
                ),
                const SizedBox(height: 48),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    RefractionButton(
                      size: RefractionButtonSize.lg,
                      onPressed: onGetStarted,
                      child: const Row(
                        children: [
                          Text("Browse Components"),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward, size: 16),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    RefractionButton(
                      size: RefractionButtonSize.lg,
                      variant: RefractionButtonVariant.outline,
                      onPressed: () {},
                      child: const Row(
                        children: [
                          Icon(Icons.code, size: 16),
                          SizedBox(width: 8),
                          Text("View on GitHub"),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Features Section (Mockups)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
            color: colors.background,
            child: Column(
              children: [
                Text(
                  "Crafted with immense attention to detail",
                  style: theme.textStyle.copyWith(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 64),
                // Simple stacked staggered grid for look
                Wrap(
                  spacing: 32,
                  runSpacing: 32,
                  alignment: WrapAlignment.center,
                  children: [
                    _buildFeatureCard(
                      theme,
                      Icons.palette,
                      "5 Curated Archetypes",
                      "Swap between Minimal, Fintech, Wellness, Creative, and Productivity layouts instantly.",
                    ),
                    _buildFeatureCard(
                      theme,
                      Icons.phone_iphone,
                      "Pixel Perfect Mockups",
                      "All components are built to perfectly map to Mobbin's highest standards.",
                    ),
                    _buildFeatureCard(
                      theme,
                      Icons.dark_mode,
                      "Intelligent Theming",
                      "True dark modes focusing on organic diffused shadows and crisp layout transitions.",
                    ),
                  ],
                ),
                const SizedBox(height: 160),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFeatureCard(RefractionThemeData theme, IconData icon, String title, String description) {
    final colors = theme.colors;
    return Container(
      width: 320,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border),
        boxShadow: theme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: colors.primary, size: 28),
          ),
          const SizedBox(height: 24),
          Text(
            title,
            style: theme.textStyle.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: theme.textStyle.copyWith(
              color: colors.mutedForeground,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
