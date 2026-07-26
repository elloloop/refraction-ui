import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionBottomNav)
Widget defaultBottomNav(BuildContext context) {
  return const SizedBox(
    width: 400,
    child: RefractionBottomNav(
      currentPath: '/home',
      tabs: [
        NavTab(label: 'Home', href: '/home', icon: Icon(Icons.home_outlined)),
        NavTab(label: 'Search', href: '/search', icon: Icon(Icons.search)),
        NavTab(
          label: 'Notifications',
          href: '/notifications',
          icon: Icon(Icons.notifications_outlined),
        ),
        NavTab(
          label: 'Profile',
          href: '/profile',
          icon: Icon(Icons.person_outline),
        ),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'With Active Icons', type: RefractionBottomNav)
Widget activeIconsBottomNav(BuildContext context) {
  return const SizedBox(
    width: 400,
    child: RefractionBottomNav(
      currentPath: '/search',
      tabs: [
        NavTab(
          label: 'Home',
          href: '/home',
          icon: Icon(Icons.home_outlined),
          activeIcon: Icon(Icons.home),
        ),
        NavTab(
          label: 'Search',
          href: '/search',
          icon: Icon(Icons.search_outlined),
          activeIcon: Icon(Icons.search),
        ),
        NavTab(
          label: 'Profile',
          href: '/profile',
          icon: Icon(Icons.person_outline),
          activeIcon: Icon(Icons.person),
        ),
      ],
    ),
  );
}
