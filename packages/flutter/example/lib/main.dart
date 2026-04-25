import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

// Import our layouts and pages
import 'pages/home_page.dart';
import 'pages/docs_layout.dart';
import 'pages/chat_input_page.dart';
import 'pages/accordion_page.dart';
import 'pages/menus_page.dart';
import 'pages/command_menu_page.dart';
import 'pages/radio_group_page.dart';
import 'pages/progress_slider_page.dart';
import 'pages/alert_page.dart';
import 'pages/avatar_page.dart';
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
    'Accordion',
    'Menus',
    'Command Menu',
    'Radio Group',
    'Progress Slider',
    'Alert',
    'Avatar',
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
      case '/docs/accordion':
        return const AccordionPage();
      case '/docs/menus':
        return const MenusPage();
      case '/docs/command-menu':
        return const CommandMenuPage();
      case '/docs/radio-group':
        return const RadioGroupPage();
      case '/docs/progress-slider':
        return const ProgressSliderPage();
      case '/docs/alert':
        return const AlertPage();
      case '/docs/avatar':
        return const AvatarPage();
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
      case '/docs/badges':
        return PreviewCanvas(
          title: "Badges",
          description: "Small status indicators and labels.",
          child: Center(
            child: Wrap(
              spacing: 16,
              children: const [
                RefractionBadge(child: Text("Primary")),
                RefractionBadge(variant: RefractionBadgeVariant.secondary, child: Text("Secondary")),
                RefractionBadge(variant: RefractionBadgeVariant.outline, child: Text("Outline")),
                RefractionBadge(variant: RefractionBadgeVariant.destructive, child: Text("Destructive")),
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
                const RefractionInput(placeholder: "Disabled Input", disabled: true),
                const SizedBox(height: 16),
                RefractionButton(onPressed: () {}, child: const Center(child: Text("Submit"))),
              ],
            ),
          ),
        );
      case '/docs/chat-input':
        return const ChatInputPage();
      case '/docs/select-&-dropdowns':
        return PreviewCanvas(
          title: "Select & Dropdowns",
          description: "Display a list of choices on temporary surfaces.",
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 300),
              child: RefractionSelect<String>(
                value: "Option 1",
                placeholder: "Select an option",
                items: const [
                  DropdownMenuItem(value: "Option 1", child: Text("Option 1")),
                  DropdownMenuItem(value: "Option 2", child: Text("Option 2")),
                  DropdownMenuItem(value: "Option 3", child: Text("Option 3")),
                ],
                onChanged: (val) {},
              ),
            ),
          ),
        );
      case '/docs/tabs':
        return PreviewCanvas(
          title: "Tabs",
          description: "A set of layered sections of content.",
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: RefractionTabs(
                tabs: const ['Account', 'Password', 'Settings'],
                children: const [
                  Padding(padding: EdgeInsets.all(16.0), child: Text("Make changes to your account here.")),
                  Padding(padding: EdgeInsets.all(16.0), child: Text("Change your password here.")),
                  Padding(padding: EdgeInsets.all(16.0), child: Text("Manage your settings here.")),
                ],
              ),
            ),
          ),
        );
      case '/docs/cards-&-layouts':
        return PreviewCanvas(
          title: "Cards",
          description: "Displays a card with header, content, and footer.",
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 350),
              child: RefractionCard(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const RefractionCardHeader(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          RefractionCardTitle("Create project"),
                          SizedBox(height: 4),
                          RefractionCardDescription("Deploy your new project in one-click."),
                        ],
                      ),
                    ),
                    const RefractionCardContent(
                      child: RefractionInput(placeholder: "Name of your project"),
                    ),
                    RefractionCardFooter(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          RefractionButton(variant: RefractionButtonVariant.outline, onPressed: () {}, child: const Text("Cancel")),
                          RefractionButton(onPressed: () {}, child: const Text("Deploy")),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      case '/docs/popovers-&-tooltips':
        return PreviewCanvas(
          title: "Popovers & Tooltips",
          description: "Floating interactive panels.",
          child: Center(
            child: Wrap(
              spacing: 32,
              children: [
                RefractionTooltip(
                  message: const Text("Add to library"),
                  child: RefractionButton(variant: RefractionButtonVariant.outline, onPressed: () {}, child: const Text("Hover me")),
                ),
                RefractionPopover(
                  content: const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text("Popover content goes here."),
                  ),
                  trigger: RefractionButton(onPressed: () {}, child: const Text("Click for Popover")),
                ),
              ],
            ),
          ),
        );
      case '/docs/toasts':
         return PreviewCanvas(
          title: "Toasts",
          description: "A succinct message that is displayed temporarily.",
          child: Center(
            child: RefractionButton(
              onPressed: () {
                RefractionToast.show(
                  context: context,
                  title: "Scheduled: Catch up",
                  description: "Friday, February 10, 2024 at 5:57 PM",
                );
              },
              child: const Text("Show Toast"),
            ),
          ),
        );
      case '/docs/navbar-&-navigation':
        return const PreviewCanvas(
          title: "Navbar",
          description: "Top-level routing components.",
          child: RefractionNavbar(
            logo: Text("Brand"),
            currentPath: "/home",
            links: [
              NavLink(label: "Home", href: "/home"),
              NavLink(label: "Features", href: "/features"),
              NavLink(label: "Pricing", href: "/pricing"),
            ],
          ),
        );
      case '/docs/introduction':
        return _buildArticlePage(
          context,
          "Introduction",
          "Refraction UI Flutter is a port of the world-class Refraction UI framework. Designed with painstaking attention to detail, it maps perfectly to Mobbin archetypes, offering you pure production-ready aesthetics instantly.\n\nUse this library to stop reinventing the wheel and build professional, beautiful Flutter web and mobile applications.",
        );
      case '/docs/installation':
        return _buildArticlePage(
          context,
          "Installation",
          "Add the following to your pubspec.yaml:\n\n```yaml\ndependencies:\n  refraction_ui: ^1.0.0\n```\n\nRun `flutter pub get` and wrap your app in a `RefractionTheme` to inject the design tokens globally.",
        );
      case '/docs/theming':
         return _buildArticlePage(
          context,
          "Theming",
          "Refraction UI features 5 beautifully curated archetypes out of the box: Minimal, Fintech, Wellness, Creative, and Productivity. \n\nYou can easily construct these factories like so:\n`RefractionThemeData.minimalDark()` or `RefractionThemeData.fintechLight()` and supply them directly to the `RefractionTheme` container.",
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

  Widget _buildArticlePage(BuildContext context, String title, String body) {
    final theme = RefractionTheme.of(context).data;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textStyle.copyWith(
            fontSize: 48,
            fontWeight: FontWeight.w800,
            letterSpacing: -1,
          ),
        ),
        const SizedBox(height: 24),
        Container(
          width: double.infinity,
          height: 1,
          color: theme.colors.border,
        ),
        const SizedBox(height: 32),
        Text(
          body,
          style: theme.textStyle.copyWith(
            fontSize: 18,
            height: 1.6,
            color: theme.colors.mutedForeground,
          ),
        ),
      ],
    );
  }
}
