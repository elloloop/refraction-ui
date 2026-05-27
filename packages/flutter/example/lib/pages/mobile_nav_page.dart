import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class MobileNavPage extends StatefulWidget {
  const MobileNavPage({super.key});

  @override
  State<MobileNavPage> createState() => _MobileNavPageState();
}

class _MobileNavPageState extends State<MobileNavPage> {
  int _selectedValue = 1;
  int _selectedHeaderValue = 1;
  bool _showLabels = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mobile Nav')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'A mobile-specific navigation bar (often shown at the bottom or as a specialized header). '
              'It accepts navigation items with icons and labels, handles selection state, and triggers callbacks.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 32),

            const Text(
              'Controls',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SwitchListTile(
              title: const Text('Show Labels'),
              value: _showLabels,
              onChanged: (val) => setState(() => _showLabels = val),
            ),

            const SizedBox(height: 32),

            const Text(
              'Standard Bottom Nav',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                border: Border.all(
                  color: RefractionTheme.of(context).colors.border,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              clipBehavior: Clip.hardEdge,
              child: Column(
                children: [
                  Container(
                    height: 200,
                    alignment: Alignment.center,
                    child: Text('Selected Value: $_selectedValue'),
                  ),
                  RefractionMobileNav<int>(
                    selectedValue: _selectedValue,
                    onSelect: (val) => setState(() => _selectedValue = val),
                    showLabels: _showLabels,
                    items: const [
                      RefractionMobileNavItem(
                        label: 'Home',
                        icon: Icon(Icons.home_outlined),
                        activeIcon: Icon(Icons.home),
                        value: 1,
                      ),
                      RefractionMobileNavItem(
                        label: 'Search',
                        icon: Icon(Icons.search_outlined),
                        activeIcon: Icon(Icons.search),
                        value: 2,
                      ),
                      RefractionMobileNavItem(
                        label: 'Settings',
                        icon: Icon(Icons.settings_outlined),
                        activeIcon: Icon(Icons.settings),
                        value: 3,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            const Text(
              'Header Nav',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                border: Border.all(
                  color: RefractionTheme.of(context).colors.border,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              clipBehavior: Clip.hardEdge,
              child: Column(
                children: [
                  RefractionMobileNav<int>(
                    selectedValue: _selectedHeaderValue,
                    onSelect: (val) =>
                        setState(() => _selectedHeaderValue = val),
                    showLabels: _showLabels,
                    isHeader: true,
                    items: const [
                      RefractionMobileNavItem(
                        label: 'Feed',
                        icon: Icon(Icons.article_outlined),
                        activeIcon: Icon(Icons.article),
                        value: 1,
                      ),
                      RefractionMobileNavItem(
                        label: 'Discover',
                        icon: Icon(Icons.explore_outlined),
                        activeIcon: Icon(Icons.explore),
                        value: 2,
                      ),
                    ],
                  ),
                  Container(
                    height: 100,
                    alignment: Alignment.center,
                    child: Text('Selected Header Value: $_selectedHeaderValue'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            const Text(
              'Many Items (Space Between)',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            RefractionMobileNav<int>(
              selectedValue: 1,
              showLabels: _showLabels,
              items: const [
                RefractionMobileNavItem(
                  label: '1',
                  icon: Icon(Icons.looks_one),
                  value: 1,
                ),
                RefractionMobileNavItem(
                  label: '2',
                  icon: Icon(Icons.looks_two),
                  value: 2,
                ),
                RefractionMobileNavItem(
                  label: '3',
                  icon: Icon(Icons.looks_3),
                  value: 3,
                ),
                RefractionMobileNavItem(
                  label: '4',
                  icon: Icon(Icons.looks_4),
                  value: 4,
                ),
                RefractionMobileNavItem(
                  label: '5',
                  icon: Icon(Icons.looks_5),
                  value: 5,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
