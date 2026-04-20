import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class PregnancyTrackerApp extends StatelessWidget {
  const PregnancyTrackerApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: Container(
          decoration: BoxDecoration(
            color: colors.card,
            border: Border(bottom: BorderSide(color: colors.border)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: SafeArea(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: colors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(Icons.pregnant_woman, color: colors.primary),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Ovia Tracker",
                          style: theme.textStyle.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          "Week 24 • Trimester 2",
                          style: theme.textStyle.copyWith(
                            color: colors.mutedForeground,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                RefractionButton(
                  variant: RefractionButtonVariant.ghost,
                  size: RefractionButtonSize.icon,
                  onPressed: () {},
                  child: const Icon(Icons.settings),
                ),
              ],
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            RefractionCard(
              child: Column(
                children: [
                  const RefractionCardHeader(
                    child: RefractionCardTitle("Baby is the size of a Cantaloupe!"),
                  ),
                  RefractionCardContent(
                    child: Column(
                      children: [
                        Container(
                          height: 160,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: colors.secondary,
                            borderRadius: BorderRadius.circular(theme.borderRadius),
                          ),
                          child: Icon(
                            Icons.child_care,
                            size: 80,
                            color: colors.secondaryForeground.withOpacity(0.5),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          "Your baby is about 11.8 inches long and weighs about 1.3 pounds. They are rapidly gaining baby fat now!",
                          style: theme.textStyle.copyWith(
                            color: colors.mutedForeground,
                            height: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              "Today's Metrics",
              style: theme.textStyle.copyWith(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: RefractionCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "Weight",
                              style: theme.textStyle.copyWith(
                                color: colors.mutedForeground,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Icon(Icons.monitor_weight_outlined, size: 16, color: colors.primary),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          "142 lbs",
                          style: theme.textStyle.copyWith(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "+0.5 lbs this week",
                          style: theme.textStyle.copyWith(
                            fontSize: 12,
                            color: colors.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: RefractionCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "Water",
                              style: theme.textStyle.copyWith(
                                color: colors.mutedForeground,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Icon(Icons.water_drop_outlined, size: 16, color: Colors.blue),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          "48 oz",
                          style: theme.textStyle.copyWith(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Goal: 80 oz",
                          style: theme.textStyle.copyWith(
                            fontSize: 12,
                            color: colors.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            RefractionCard(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: colors.destructive.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.favorite, color: colors.destructive),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Log Symptoms",
                          style: theme.textStyle.copyWith(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "How are you feeling today?",
                          style: theme.textStyle.copyWith(
                            color: colors.mutedForeground,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  RefractionButton(
                    variant: RefractionButtonVariant.outline,
                    onPressed: () {},
                    child: const Text("Log"),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: colors.card,
          border: Border(top: BorderSide(color: colors.border)),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(theme, Icons.home, "Home", true),
                _buildNavItem(theme, Icons.calendar_today, "Timeline", false),
                _buildNavItem(theme, Icons.article_outlined, "Articles", false),
                _buildNavItem(theme, Icons.person_outline, "Profile", false),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(RefractionThemeData theme, IconData icon, String label, bool isSelected) {
    final color = isSelected ? theme.colors.primary : theme.colors.mutedForeground;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color),
        const SizedBox(height: 4),
        Text(
          label,
          style: theme.textStyle.copyWith(
            color: color,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      ],
    );
  }
}
