import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:refraction_ui/refraction_ui.dart';

class _NavNotifier extends Notifier<int> {
  @override
  int build() => 0;
  void update(int val) => state = val;
}
final pregnancyTrackerNavProvider = NotifierProvider<_NavNotifier, int>(_NavNotifier.new);

class _PushNotifier extends Notifier<bool> {
  @override
  bool build() => true;
  void update(bool val) => state = val;
}
final pushNotificationsProvider = NotifierProvider<_PushNotifier, bool>(_PushNotifier.new);

class PregnancyTrackerApp extends ConsumerWidget {
  const PregnancyTrackerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final currentIndex = ref.watch(pregnancyTrackerNavProvider);

    final Widget activePage;
    switch (currentIndex) {
      case 0:
        activePage = _buildHomePage(theme, colors);
        break;
      case 1:
        activePage = _buildTimelinePage(theme, colors);
        break;
      case 2:
        activePage = _buildProfilePage(context, ref, theme, colors);
        break;
      default:
        activePage = _buildHomePage(theme, colors);
    }

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
                        color: colors.primary.withValues(alpha: 0.1),
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
                  child: const Icon(Icons.notifications_none),
                ),
              ],
            ),
          ),
        ),
      ),
      body: activePage,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: colors.card,
          border: Border(top: BorderSide(color: colors.border)),
          boxShadow: theme.softShadow,
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(ref, theme, Icons.home, "Home", 0),
                _buildNavItem(ref, theme, Icons.calendar_today, "Timeline", 1),
                _buildNavItem(ref, theme, Icons.person_outline, "Profile", 2),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHomePage(RefractionThemeData theme, RefractionColors colors) {
    return SingleChildScrollView(
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
                        height: 180,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              colors.primary.withValues(alpha: 0.7),
                              colors.primary
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(theme.borderRadius),
                          boxShadow: theme.heavyShadow,
                        ),
                        child: Icon(
                          Icons.child_care,
                          size: 100,
                          color: colors.primaryForeground,
                        ),
                      ),
                      const SizedBox(height: 24),
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
                          Icon(Icons.monitor_weight_outlined,
                              size: 16, color: colors.primary),
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
                          const Icon(Icons.water_drop_outlined,
                              size: 16, color: Colors.blue),
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
        ],
      ),
    );
  }

  Widget _buildTimelinePage(RefractionThemeData theme, RefractionColors colors) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 4,
      itemBuilder: (context, index) {
        final weeks = [24, 23, 22, 21];
        final titles = [
          "Hearing Development",
          "Rapid Weight Gain",
          "Taste Buds Forming",
          "Swallowing Fluid",
        ];
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: RefractionCard(
            child: Row(
              children: [
                Container(
                  width: 80,
                  height: 100,
                  decoration: BoxDecoration(
                    color: colors.secondary,
                    borderRadius: BorderRadius.horizontal(
                      left: Radius.circular(theme.borderRadius),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      "Wk ${weeks[index]}",
                      style: theme.textStyle.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          titles[index],
                          style: theme.textStyle.copyWith(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Your baby is continuing to grow stronger every single day. Make sure you get rest.",
                          style: theme.textStyle.copyWith(
                            color: colors.mutedForeground,
                            fontSize: 14,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProfilePage(BuildContext context, WidgetRef ref, RefractionThemeData theme, RefractionColors colors) {
    final pushNotificationsEnabled = ref.watch(pushNotificationsProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: colors.primary,
            child: Text(
              "SJ",
              style: theme.textStyle.copyWith(
                color: colors.primaryForeground,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            "Sarah Jenkins",
            style: theme.textStyle.copyWith(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 32),
          RefractionCard(
            child: Column(
              children: [
                _buildSettingsRow(
                  theme,
                  "Push Notifications",
                  pushNotificationsEnabled,
                  (val) => ref.read(pushNotificationsProvider.notifier).update(val),
                ),
                const Divider(height: 1),
                _buildSettingsRow(theme, "Weekly Emails", false, (val) {}),
                const Divider(height: 1),
                _buildSettingsRow(theme, "Share Data Anonymous Mode", true, (val) {}),
              ],
            ),
          ),
          const SizedBox(height: 24),
          RefractionButton(
            variant: RefractionButtonVariant.destructive,
            onPressed: () {},
            child: const Text("Sign Out"),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsRow(RefractionThemeData theme, String title, bool value, ValueChanged<bool> onChanged) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: theme.textStyle),
          RefractionSwitch(value: value, onChanged: onChanged),
        ],
      ),
    );
  }

  Widget _buildNavItem(WidgetRef ref, RefractionThemeData theme, IconData icon, String label, int index) {
    final currentIndex = ref.watch(pregnancyTrackerNavProvider);
    final isSelected = currentIndex == index;
    final color = isSelected ? theme.colors.primary : theme.colors.mutedForeground;
    
    return InkWell(
      onTap: () => ref.read(pregnancyTrackerNavProvider.notifier).update(index),
      child: Column(
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
      ),
    );
  }
}
