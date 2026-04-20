import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class FamilyCalendarApp extends StatelessWidget {
  const FamilyCalendarApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

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
        currentPath: "/calendar",
        onNavigate: (_) {},
      ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RefractionSidebar(
            currentPath: "/calendar",
            onNavigate: (_) {},
            sections: const [
              SidebarSection(
                title: "Family",
                items: [
                  SidebarItem(label: "Mom", href: "/mom", icon: Icon(Icons.person)),
                  SidebarItem(label: "Dad", href: "/dad", icon: Icon(Icons.person)),
                  SidebarItem(label: "Kids", href: "/kids", icon: Icon(Icons.child_care)),
                ],
              ),
            ],
          ),
          Expanded(
            child: SingleChildScrollView(
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
                      RefractionButton(
                        onPressed: () {},
                        child: const Text("Add Event"),
                      ),
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
                                    child: RefractionCardTitle("Daily Chores"),
                                  ),
                                  RefractionCardContent(
                                    child: Column(
                                      children: [
                                        Row(
                                          children: [
                                            const RefractionCheckbox(value: true),
                                            const SizedBox(width: 12),
                                            Text(
                                              "Take out trash",
                                              style: theme.textStyle.copyWith(
                                                decoration: TextDecoration.lineThrough,
                                                color: colors.mutedForeground,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 12),
                                        Row(
                                          children: [
                                            const RefractionCheckbox(value: false),
                                            const SizedBox(width: 12),
                                            Text("Load dishwasher", style: theme.textStyle),
                                          ],
                                        ),
                                        const SizedBox(height: 12),
                                        Row(
                                          children: [
                                            const RefractionCheckbox(value: false),
                                            const SizedBox(width: 12),
                                            Text("Walk the dog", style: theme.textStyle),
                                          ],
                                        ),
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
                                  const RefractionCardHeader(
                                    child: RefractionCardTitle("Dinner Menu"),
                                  ),
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
            ),
          ),
        ],
      ),
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
              RefractionBadge(
                variant: variant,
                child: Text(tag),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
