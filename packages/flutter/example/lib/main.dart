import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

// Import our layouts and pages
import 'pages/home_page.dart';
import 'pages/docs_layout.dart';
import 'dev_tools/preview_canvas.dart';

// Import the mock applications
import 'apps/family_calendar_app.dart';
import 'apps/pregnancy_tracker_app.dart';
import 'apps/my_prototype.dart';

void main() {
  runApp(const ProviderScope(child: RefractionDemoApp()));
}

class _RouteNotifier extends Notifier<String> {
  @override
  String build() => '/';
  void update(String val) => state = val;
}
final appRouteProvider = NotifierProvider<_RouteNotifier, String>(_RouteNotifier.new);

class _DarkModeNotifier extends Notifier<bool> {
  @override
  bool build() => true;
  void toggle() => state = !state;
}
final darkModeProvider = NotifierProvider<_DarkModeNotifier, bool>(_DarkModeNotifier.new);

class _PaletteNotifier extends Notifier<String> {
  @override
  String build() => 'Minimal';
  void update(String val) => state = val;
}
final paletteProvider = NotifierProvider<_PaletteNotifier, String>(_PaletteNotifier.new);


class RefractionDemoApp extends ConsumerWidget {
  const RefractionDemoApp({super.key});

  final List<String> components = const [
    'Buttons',
    'Badges',
    'Inputs & Forms',
    'Select & Dropdowns',
    'Tabs',
    'Navbar & Navigation',
    'Cards & Layouts',
    'Popovers & Tooltips',
    'Toasts',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDarkMode = ref.watch(darkModeProvider);
    final palette = ref.watch(paletteProvider);
    final route = ref.watch(appRouteProvider);

    RefractionThemeData themeData;
    switch (palette) {
      case 'Fintech':
        themeData = isDarkMode ? RefractionThemeData.fintechDark() : RefractionThemeData.fintechLight();
        break;
      case 'Wellness':
        themeData = isDarkMode ? RefractionThemeData.wellnessDark() : RefractionThemeData.wellnessLight();
        break;
      case 'Creative':
        themeData = isDarkMode ? RefractionThemeData.creativeDark() : RefractionThemeData.creativeLight();
        break;
      case 'Productivity':
        themeData = isDarkMode ? RefractionThemeData.productivityDark() : RefractionThemeData.productivityLight();
        break;
      case 'Minimal':
      default:
        themeData = isDarkMode ? RefractionThemeData.minimalDark() : RefractionThemeData.minimalLight();
        break;
    }

    return RefractionTheme(
      data: themeData,
      child: MaterialApp(
        title: 'Refraction UI (Flutter)',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          scaffoldBackgroundColor: themeData.colors.background,
          fontFamily: themeData.fontFamily,
          useMaterial3: true,
        ),
        home: _AppShell(components: components),
      ),
    );
  }
}

class _AppShell extends ConsumerWidget {
  final List<String> components;

  const _AppShell({required this.components});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final currentRoute = ref.watch(appRouteProvider);

    Widget body;
    if (currentRoute == '/') {
      body = HomePage(
        onGetStarted: () => ref.read(appRouteProvider.notifier).update('/docs/buttons'),
      );
    } else if (currentRoute.startsWith('/docs')) {
      body = DocsLayout(
        currentRoute: currentRoute,
        onNavigate: (r) => ref.read(appRouteProvider.notifier).update(r),
        components: components,
        child: _buildDocsContent(currentRoute, context),
      );
    } else {
      body = const Center(child: Text('404 Not Found'));
    }

    return Scaffold(
      backgroundColor: colors.background,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: Container(
          decoration: BoxDecoration(
            color: colors.background,
            border: Border(bottom: BorderSide(color: colors.border)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              InkWell(
                onTap: () => ref.read(appRouteProvider.notifier).update('/'),
                child: Row(
                  children: [
                    Icon(Icons.diamond, color: colors.primary, size: 28),
                    const SizedBox(width: 12),
                    Text(
                      "Refraction UI",
                      style: theme.textStyle.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(width: 8),
                    RefractionBadge(
                      variant: RefractionBadgeVariant.secondary,
                      child: const Text("Flutter v1.0.0"),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  _buildThemePicker(context, ref, theme),
                  const SizedBox(width: 16),
                  _buildDarkModeToggle(ref, theme),
                  const SizedBox(width: 16),
                  RefractionButton(
                    variant: RefractionButtonVariant.outline,
                    onPressed: () {},
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.code, size: 16),
                        SizedBox(width: 8),
                        Text("GitHub"),
                      ],
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
      body: body,
    );
  }

  Widget _buildDarkModeToggle(WidgetRef ref, RefractionThemeData theme) {
    final isDark = ref.watch(darkModeProvider);
    return InkWell(
      onTap: () => ref.read(darkModeProvider.notifier).toggle(),
      child: Container(
        height: 36,
        width: 36,
        decoration: BoxDecoration(
          border: Border.all(color: theme.colors.border),
          borderRadius: BorderRadius.circular(theme.borderRadius),
        ),
        child: Icon(
          isDark ? Icons.light_mode : Icons.dark_mode,
          size: 16,
          color: theme.colors.foreground,
        ),
      ),
    );
  }

  Widget _buildThemePicker(BuildContext context, WidgetRef ref, RefractionThemeData theme) {
    final palette = ref.watch(paletteProvider);
    final palettes = [
      {'name': 'Minimal', 'color': const Color(0xFF000000)},
      {'name': 'Fintech', 'color': const Color(0xFF00D632)},
      {'name': 'Wellness', 'color': const Color(0xFFFF6E66)},
      {'name': 'Creative', 'color': const Color(0xFF5046E5)},
      {'name': 'Productivity', 'color': const Color(0xFF3B82F6)},
    ];

    return PopupMenuButton<String>(
      onSelected: (val) => ref.read(paletteProvider.notifier).update(val),
      offset: const Offset(0, 48),
      color: theme.colors.popover,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(theme.borderRadius),
        side: BorderSide(color: theme.colors.border),
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: theme.colors.border),
          borderRadius: BorderRadius.circular(theme.borderRadius),
        ),
        child: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: palettes.firstWhere((p) => p['name'] == palette)['color'] as Color,
              ),
            ),
            const SizedBox(width: 8),
            Text(palette, style: theme.textStyle.copyWith(fontSize: 14)),
            const SizedBox(width: 4),
            Icon(Icons.keyboard_arrow_down, size: 16, color: theme.colors.foreground),
          ],
        ),
      ),
      itemBuilder: (context) {
        return palettes.map((p) {
          final isSelected = p['name'] == palette;
          return PopupMenuItem<String>(
            value: p['name'] as String,
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: p['color'] as Color,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  p['name'] as String,
                  style: theme.textStyle.copyWith(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          );
        }).toList();
      },
    );
  }

  // Very simple mocked content mapper
  Widget _buildDocsContent(String route, BuildContext context) {
    switch (route) {
      case '/docs/pregnancy-tracker':
        return const PreviewCanvas(
          title: "Pregnancy Tracker Layout",
          description: "A full stateful demonstration of medical health/wellness tracking using the Refraction architecture.",
          fill: true,
          child: PregnancyTrackerApp(),
        );
      case '/docs/family-calendar':
        return const PreviewCanvas(
          title: "Family Calendar Layout",
          description: "A rich data-dense grid structure for productivity displays.",
          fill: true,
          child: FamilyCalendarApp(),
        );
      case '/docs/my-prototype':
        return const PreviewCanvas(
          title: "My Prototype",
          description: "Your local sandbox prototyping environment.",
          fill: true,
          child: MyPrototypeApp(),
        );
      case '/docs/buttons':
        return PreviewCanvas(
          title: "Buttons",
          description: "Primary actions and CTAs.",
          child: Center(
            child: Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                RefractionButton(onPressed: () {}, child: const Text("Primary")),
                RefractionButton(variant: RefractionButtonVariant.secondary, onPressed: () {}, child: const Text("Secondary")),
                RefractionButton(variant: RefractionButtonVariant.outline, onPressed: () {}, child: const Text("Outline")),
                RefractionButton(variant: RefractionButtonVariant.ghost, onPressed: () {}, child: const Text("Ghost")),
                RefractionButton(variant: RefractionButtonVariant.destructive, onPressed: () {}, child: const Text("Destructive")),
              ],
            ),
          ),
        );
      case '/docs/inputs-&-forms':
        return PreviewCanvas(
          title: "Inputs & Forms",
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const RefractionInput(placeholder: "Email address"),
                const SizedBox(height: 16),
                const RefractionInput(placeholder: "Password", obscureText: true),
                const SizedBox(height: 16),
                RefractionButton(onPressed: () {}, child: const Center(child: Text("Submit"))),
              ],
            ),
          ),
        );
      default:
        // Render a generic placeholder for other components
        final title = route.split('/').last.replaceAll('-', ' ').toUpperCase();
        return PreviewCanvas(
          title: title,
          description: "Component documentation is rendering cleanly.",
          child: const Center(child: Text("Preview rendered here.")),
        );
    }
  }
}
