import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:refraction_ui/refraction_ui.dart';

class _NavNotifier extends Notifier<String> {
  @override
  String build() => "/calendar";
  void update(String val) => state = val;
}
final familyCalendarNavProvider = NotifierProvider<_NavNotifier, String>(_NavNotifier.new);

class FamilyCalendarApp extends ConsumerWidget {
  const FamilyCalendarApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final currentPath = ref.watch(familyCalendarNavProvider);

    Widget activeContent;
    switch (currentPath) {
      case "/calendar":
        activeContent = _buildCalendarBoard(theme, colors);
        break;
      case "/chores":
        activeContent = _buildChoresBoard(theme, colors);
        break;
      case "/meals":
        activeContent = _buildMealsBoard(theme, colors);
        break;
      default:
        activeContent = _buildCalendarBoard(theme, colors);
    }

    return Scaffold(
      backgroundColor: colors.background,
      appBar: RefractionNavbar(
        logo: Row(
          children: [
            Icon(Icons.calendar_month, color: colors.primary),
            const SizedBox(width: 12),
            Text(
              "Nesta Wall Display",
              style: theme.textStyle.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        links: const [
          NavLink(label: "Calendar", href: "/calendar"),
          NavLink(label: "Chores", href: "/chores"),
          NavLink(label: "Meals", href: "/meals"),
        ],
        currentPath: currentPath,
        onNavigate: (path) => ref.read(familyCalendarNavProvider.notifier).update(path),
      ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          RefractionSidebar(
            currentPath: currentPath,
            onNavigate: (path) => ref.read(familyCalendarNavProvider.notifier).update(path),
            sections: const [
              SidebarSection(
                title: "Family Profiles",
                items: [
                  SidebarItem(label: "Mom", href: "/mom", icon: Icon(Icons.person)),
                  SidebarItem(label: "Dad", href: "/dad", icon: Icon(Icons.person)),
                  SidebarItem(label: "Kids", href: "/kids", icon: Icon(Icons.child_care)),
                ],
              ),
            ],
          ),
          Expanded(child: activeContent),
        ],
      ),
    );
  }

  Widget _buildCalendarBoard(RefractionThemeData theme, RefractionColors colors) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Today's Schedule",
                style: theme.textStyle.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              RefractionButton(onPressed: () {}, child: const Text("Add Event")),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: RefractionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const RefractionCardHeader(
                        child: RefractionCardTitle("Upcoming Events"),
                      ),
                      RefractionCardContent(
                        child: Column(
                          children: [
                            _buildEventRow(
                              theme,
                              time: "08:00 AM",
                              title: "School Drop-off",
                              tag: "Kids",
                              variant: RefractionBadgeVariant.primary,
                            ),
                            const Divider(height: 24),
                            _buildEventRow(
                              theme,
                              time: "10:30 AM",
                              title: "Dentist Appointment",
                              tag: "Dad",
                              variant: RefractionBadgeVariant.secondary,
                            ),
                            const Divider(height: 24),
                            _buildEventRow(
                              theme,
                              time: "06:00 PM",
                              title: "Soccer Practice",
                              tag: "Kids",
                              variant: RefractionBadgeVariant.primary,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                flex: 1,
                child: Column(
                  children: [
                    RefractionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const RefractionCardHeader(
                            child: RefractionCardTitle("Quick Tasks"),
                          ),
                          RefractionCardContent(
                            child: Column(
                              children: [
                                _buildCheckboxRow(theme, colors, "Take out trash", true),
                                const SizedBox(height: 12),
                                _buildCheckboxRow(theme, colors, "Load dishwasher", false),
                                const SizedBox(height: 12),
                                _buildCheckboxRow(theme, colors, "Walk the dog", false),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    RefractionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const RefractionCardHeader(child: RefractionCardTitle("Dinner")),
                          RefractionCardContent(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Spaghetti Bolognese",
                                  style: theme.textStyle.copyWith(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "Prep time: 45m",
                                  style: theme.textStyle.copyWith(
                                    color: colors.mutedForeground,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChoresBoard(RefractionThemeData theme, RefractionColors colors) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Weekly Chores",
            style: theme.textStyle.copyWith(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: RefractionCard(
                  child: Column(
                    children: [
                      const RefractionCardHeader(child: RefractionCardTitle("To Do")),
                      RefractionCardContent(
                        child: Column(
                          children: [
                            _buildChoreCard(theme, colors, "Vacuum Living Room", "Mom"),
                            const SizedBox(height: 12),
                            _buildChoreCard(theme, colors, "Clean Windows", "Dad"),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: RefractionCard(
                  child: Column(
                    children: [
                      const RefractionCardHeader(child: RefractionCardTitle("In Progress")),
                      RefractionCardContent(
                        child: Column(
                          children: [
                            _buildChoreCard(theme, colors, "Laundry", "Kids"),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: RefractionCard(
                  child: Column(
                    children: [
                      const RefractionCardHeader(child: RefractionCardTitle("Completed")),
                      RefractionCardContent(
                        child: Column(
                          children: [
                            _buildChoreCard(theme, colors, "Groceries", "Mom"),
                            const SizedBox(height: 12),
                            _buildChoreCard(theme, colors, "Trash & Recycling", "Kids"),
                          ],
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

  Widget _buildMealsBoard(RefractionThemeData theme, RefractionColors colors) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Meal Planning",
                style: theme.textStyle.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              RefractionButton(variant: RefractionButtonVariant.secondary, onPressed: () {}, child: const Text("Generate List")),
            ],
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 24,
            runSpacing: 24,
            children: [
              _buildMealDay(theme, colors, "Monday", "Chicken Salad", "300 kcal", true),
              _buildMealDay(theme, colors, "Tuesday", "Beef Tacos", "600 kcal", false),
              _buildMealDay(theme, colors, "Wednesday", "Salmon & Asparagus", "450 kcal", false),
              _buildMealDay(theme, colors, "Thursday", "Pasta Primavera", "550 kcal", false),
              _buildMealDay(theme, colors, "Friday", "Pizza Night", "800 kcal", false),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMealDay(RefractionThemeData theme, RefractionColors colors, String day, String meal, String cals, bool isToday) {
    return Container(
      width: 250,
      decoration: BoxDecoration(
        color: isToday ? colors.primary.withValues(alpha: 0.05) : colors.card,
        border: Border.all(color: isToday ? colors.primary : colors.border, width: isToday ? 2 : 1),
        borderRadius: BorderRadius.circular(theme.borderRadius),
        boxShadow: isToday ? theme.heavyShadow : theme.softShadow,
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            day,
            style: theme.textStyle.copyWith(
              color: isToday ? colors.primary : colors.mutedForeground,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            meal,
            style: theme.textStyle.copyWith(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(cals, style: theme.textStyle.copyWith(color: colors.mutedForeground)),
        ],
      ),
    );
  }

  Widget _buildChoreCard(RefractionThemeData theme, RefractionColors colors, String title, String assignee) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.background,
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(theme.borderRadius),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: theme.textStyle.copyWith(fontWeight: FontWeight.w500)),
          RefractionBadge(variant: RefractionBadgeVariant.outline, child: Text(assignee)),
        ],
      ),
    );
  }

  Widget _buildCheckboxRow(RefractionThemeData theme, RefractionColors colors, String title, bool checked) {
    return Row(
      children: [
        RefractionCheckbox(value: checked),
        const SizedBox(width: 12),
        Text(
          title,
          style: theme.textStyle.copyWith(
            decoration: checked ? TextDecoration.lineThrough : null,
            color: checked ? colors.mutedForeground : colors.foreground,
          ),
        ),
      ],
    );
  }

  Widget _buildEventRow(
    RefractionThemeData theme, {
    required String time,
    required String title,
    required String tag,
    required RefractionBadgeVariant variant,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            time,
            style: theme.textStyle.copyWith(
              color: theme.colors.mutedForeground,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: theme.textStyle.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 8),
              RefractionBadge(variant: variant, child: Text(tag)),
            ],
          ),
        ),
      ],
    );
  }
}
