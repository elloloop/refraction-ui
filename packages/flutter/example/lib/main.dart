import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'dev_tools/device_frame.dart';
import 'apps/family_calendar_app.dart';
import 'apps/pregnancy_tracker_app.dart';

void main() {
  runApp(const RefractionDemoApp());
}

class RefractionDemoApp extends StatefulWidget {
  const RefractionDemoApp({Key? key}) : super(key: key);

  @override
  State<RefractionDemoApp> createState() => _RefractionDemoAppState();
}

class _RefractionDemoAppState extends State<RefractionDemoApp> {
  bool isDarkMode = true;
  DeviceType selectedDevice = DeviceType.iphone;
  String selectedComponent = 'Buttons';
  double themeRadius = 8.0;
  String themeFont = 'System'; // Default

  final List<String> components = [
    'Buttons',
    'Inputs & Forms',
    'Badges & Toggles',
    'Overlays & Dialogs',
    'Tabs & Nav',
    'Cards & Layout',
    'App Navigation',
    'Skeleton & Footer',
  ];

  final List<String> apps = ['Family Calendar', 'Pregnancy Tracker'];

  @override
  Widget build(BuildContext context) {
    final baseData = isDarkMode
        ? RefractionThemeData.dark()
        : RefractionThemeData.light();
    final themeData = baseData.copyWith(
      borderRadius: themeRadius,
      fontFamily: themeFont == 'System' ? null : themeFont,
    );
    final colors = themeData.colors;

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Refraction UI Flutter',
      theme: ThemeData(
        scaffoldBackgroundColor: colors.background,
        fontFamily: themeFont == 'System' ? null : themeFont,
        colorScheme: isDarkMode
            ? const ColorScheme.dark()
            : const ColorScheme.light(),
      ),
      home: RefractionTheme(
        data: themeData,
        child: Scaffold(
          backgroundColor: isDarkMode
              ? const Color(0xFF09090B)
              : const Color(0xFFF8FAFC),
          body: Row(
            children: [
              // Sidebar setup
              Container(
                width: 280,
                decoration: BoxDecoration(
                  color: colors.card,
                  border: Border(right: BorderSide(color: colors.border)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Row(
                        children: [
                          Icon(Icons.widgets_rounded, color: colors.foreground),
                          const SizedBox(width: 12),
                          Text(
                            "Refraction UI",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -0.5,
                              color: colors.foreground,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Dark Theme",
                            style: TextStyle(
                              color: colors.foreground,
                              fontSize: 14,
                            ),
                          ),
                          RefractionSwitch(
                            value: isDarkMode,
                            onChanged: (val) =>
                                setState(() => isDarkMode = val),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        "DEVICE FRAME",
                        style: TextStyle(
                          fontSize: 11,
                          color: colors.mutedForeground,
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    _buildDeviceToggle('iPhone', DeviceType.iphone, colors),
                    _buildDeviceToggle('Android', DeviceType.android, colors),
                    _buildDeviceToggle('Tablet', DeviceType.tablet, colors),
                    Expanded(
                      child: ListView(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text(
                              "BRANDING",
                              style: TextStyle(
                                fontSize: 11,
                                color: colors.mutedForeground,
                                letterSpacing: 1.2,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text("Radius"),
                                    Text(themeRadius.toStringAsFixed(1)),
                                  ],
                                ),
                                Slider(
                                  value: themeRadius,
                                  min: 0,
                                  max: 24,
                                  activeColor: colors.primary,
                                  onChanged: (val) => setState(() => themeRadius = val),
                                ),
                                const SizedBox(height: 16),
                                const Text("Typeface"),
                                const SizedBox(height: 8),
                                RefractionSelect<String>(
                                  value: themeFont,
                                  items: const [
                                    DropdownMenuItem(
                                      value: 'System',
                                      child: Text('System (Default)'),
                                    ),
                                    DropdownMenuItem(
                                      value: 'Georgia',
                                      child: Text('Georgia (Serif)'),
                                    ),
                                    DropdownMenuItem(
                                      value: 'Courier',
                                      child: Text('Courier (Mono)'),
                                    ),
                                  ],
                                  onChanged: (val) {
                                    if (val != null)
                                      setState(() => themeFont = val);
                                  },
                                ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text(
                              "COMPONENTS",
                              style: TextStyle(
                                fontSize: 11,
                                color: colors.mutedForeground,
                                letterSpacing: 1.2,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          ...components.map((comp) {
                            final isSelected = selectedComponent == comp;
                            return InkWell(
                              onTap: () =>
                                  setState(() => selectedComponent = comp),
                              child: Container(
                                color: isSelected
                                    ? colors.primary.withOpacity(0.05)
                                    : Colors.transparent,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 10,
                                ),
                                child: Text(
                                  comp,
                                  style: TextStyle(
                                    color: isSelected
                                        ? colors.primary
                                        : colors.mutedForeground,
                                    fontWeight: isSelected
                                        ? FontWeight.w600
                                        : FontWeight.w400,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text(
                              "APPS",
                              style: TextStyle(
                                fontSize: 11,
                                color: colors.mutedForeground,
                                letterSpacing: 1.2,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          ...apps.map((app) {
                            final isSelected = selectedComponent == app;
                            return InkWell(
                              onTap: () =>
                                  setState(() => selectedComponent = app),
                              child: Container(
                                color: isSelected
                                    ? colors.primary.withOpacity(0.05)
                                    : Colors.transparent,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 10,
                                ),
                                child: Text(
                                  app,
                                  style: TextStyle(
                                    color: isSelected
                                        ? colors.primary
                                        : colors.mutedForeground,
                                    fontWeight: isSelected
                                        ? FontWeight.w600
                                        : FontWeight.w400,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // Main content - Prototyping area
              Expanded(
                child: SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: Column(
                        children: [
                          Text(
                            "Live Interactive Prototype",
                            style: TextStyle(
                              color: colors.foreground,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "Fully functional widgets wrapped inside physical device bounds.",
                            style: TextStyle(
                              color: colors.mutedForeground,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 48),
                          RefractionDeviceFrame(
                            deviceType: selectedDevice,
                            child: _ComponentCanvas(
                              activeComponent: selectedComponent,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDeviceToggle(
    String label,
    DeviceType type,
    RefractionColors colors,
  ) {
    final isSelected = selectedDevice == type;
    IconData iconData = Icons.smartphone;
    if (type == DeviceType.iphone) iconData = Icons.phone_iphone;
    if (type == DeviceType.android) iconData = Icons.phone_android;
    if (type == DeviceType.tablet) iconData = Icons.tablet_mac;

    return InkWell(
      onTap: () => setState(() => selectedDevice = type),
      child: Container(
        color: isSelected ? colors.accent : Colors.transparent,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        child: Row(
          children: [
            Icon(
              iconData,
              color: isSelected ? colors.foreground : colors.mutedForeground,
              size: 18,
            ),
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? colors.foreground : colors.mutedForeground,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ComponentCanvas extends StatelessWidget {
  final String activeComponent;

  const _ComponentCanvas({Key? key, required this.activeComponent})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;

    Widget content = const SizedBox.shrink();

    switch (activeComponent) {
      case 'Buttons':
        content = Column(
          children: [
            RefractionButton(
              onPressed: () {},
              child: const Text("Primary Button"),
            ),
            const SizedBox(height: 16),
            RefractionButton(
              variant: RefractionButtonVariant.secondary,
              onPressed: () {},
              child: const Text("Secondary Button"),
            ),
            const SizedBox(height: 16),
            RefractionButton(
              variant: RefractionButtonVariant.destructive,
              onPressed: () {},
              child: const Text("Destructive Action"),
            ),
            const SizedBox(height: 16),
            RefractionButton(
              variant: RefractionButtonVariant.outline,
              onPressed: () {},
              child: const Text("Outline Frame"),
            ),
            const SizedBox(height: 16),
            RefractionButton(
              variant: RefractionButtonVariant.ghost,
              onPressed: () {},
              child: const Text("Ghost Mode"),
            ),
            const SizedBox(height: 16),
            RefractionButton(
              isLoading: true,
              onPressed: () {},
              child: const Text("Loading"),
            ),
          ],
        );
        break;
      case 'Inputs & Forms':
        content = const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Standard Input"),
            SizedBox(height: 8),
            RefractionInput(placeholder: "Email address..."),
            SizedBox(height: 24),
            Text("Disabled Input"),
            SizedBox(height: 8),
            RefractionInput(placeholder: "Not accessible", disabled: true),
            SizedBox(height: 24),
            Text("OTP Verification Code"),
            SizedBox(height: 8),
            RefractionOtpInput(length: 6),
            SizedBox(height: 24),
            Text("Textarea"),
            SizedBox(height: 8),
            RefractionTextarea(placeholder: "Enter multi-line description..."),
          ],
        );
        break;
      case 'Badges & Toggles':
        content = Column(
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                RefractionBadge(child: Text("New")),
                RefractionBadge(
                  variant: RefractionBadgeVariant.secondary,
                  child: Text("Draft"),
                ),
                RefractionBadge(
                  variant: RefractionBadgeVariant.destructive,
                  child: Text("Error"),
                ),
                RefractionBadge(
                  variant: RefractionBadgeVariant.outline,
                  child: Text("v1.0.0"),
                ),
              ],
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Airplane Mode"),
                RefractionSwitch(value: true, onChanged: (v) {}),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Push Notifications"),
                RefractionSwitch(value: false, onChanged: (v) {}),
              ],
            ),
            const SizedBox(height: 40),
            Row(
              children: [
                const RefractionCheckbox(value: true),
                const SizedBox(width: 12),
                const Text("Accept Terms and Conditions"),
              ],
            ),
          ],
        );
        break;
      case 'Overlays & Dialogs':
        content = Column(
          children: [
            RefractionButton(
              onPressed: () {
                RefractionDialog.show(
                  context: context,
                  title: const Text("Payment Successful"),
                  content: const Text(
                    "Your transaction has been securely processed and receipt sent to your email.",
                  ),
                );
              },
              child: const Text("Open Dialog"),
            ),
            const SizedBox(height: 24),
            RefractionButton(
              variant: RefractionButtonVariant.secondary,
              onPressed: () {
                RefractionToast.show(
                  context: context,
                  title: "Network Reconnected",
                  description: "All services are operating nominally.",
                );
              },
              child: const Text("Trigger Toast"),
            ),
            const SizedBox(height: 24),
            RefractionTooltip(
              message: const Text("This is a rich tooltip layout"),
              child: const Icon(Icons.info_outline, size: 32),
            ),
            const SizedBox(height: 24),
            RefractionPopover(
              trigger: const RefractionButton(
                variant: RefractionButtonVariant.outline,
                onPressed: null, // let trigger handle
                child: Text("Open Popover Menu"),
              ),
              content: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Settings Configuration",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const RefractionInput(placeholder: "Name..."),
                  ],
                ),
              ),
            ),
          ],
        );
        break;
      case 'Tabs & Nav':
        content = RefractionTabs(
          tabs: const ["General", "Security", "Billing", "Advanced"],
          children: [
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text("General Settings Panel"),
              ),
            ),
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text("Security Keys & Passwords"),
              ),
            ),
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text("Invoices & Cards"),
              ),
            ),
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text("Danger Zone"),
              ),
            ),
          ],
        );
        break;
      case 'Cards & Layout':
        content = Column(
          children: [
            RefractionCard(
              child: Column(
                children: [
                  const RefractionCardHeader(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RefractionCardTitle("Payment Method"),
                        SizedBox(height: 8),
                        RefractionCardDescription(
                          "Update your billing details and preferences here.",
                        ),
                      ],
                    ),
                  ),
                  RefractionCardContent(
                    child: Column(
                      children: [
                        const RefractionInput(placeholder: "Cardholder Name"),
                        const SizedBox(height: 16),
                        const RefractionInput(placeholder: "Card Number"),
                      ],
                    ),
                  ),
                  RefractionCardFooter(
                    mainAxisAlignment: MainAxisAlignment.end,
                    child: RefractionButton(
                      onPressed: () {},
                      child: const Text("Save Changes"),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
        break;
      case 'App Navigation':
        content = const AppNavigationDemo();
        break;
      case 'Skeleton & Footer':
        content = Column(
          children: [
            Row(
              children: [
                const RefractionSkeleton(
                  shape: SkeletonShape.circular,
                  width: 48,
                ),
                const SizedBox(width: 16),
                const Expanded(child: RefractionSkeletonText(lines: 2)),
              ],
            ),
            const SizedBox(height: 48),
            Container(
              clipBehavior: Clip.hardEdge,
              decoration: BoxDecoration(
                border: Border.all(color: colors.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const RefractionFooter(
                copyright: "© 2026 Refraction UI Inc. All rights reserved.",
                socialLinks: [
                  SocialLink(
                    label: "Twitter",
                    href: "#",
                    icon: Icon(Icons.share, size: 16),
                  ),
                  SocialLink(
                    label: "GitHub",
                    href: "#",
                    icon: Icon(Icons.code, size: 16),
                  ),
                ],
                columns: [
                  FooterColumn(
                    title: "Product",
                    links: [
                      FooterLink(label: "Features", href: "#"),
                      FooterLink(label: "Pricing", href: "#"),
                    ],
                  ),
                ],
              ),
            ),
          ],
        );
        break;
      case 'Family Calendar':
        content = const FamilyCalendarApp();
        break;
      case 'Pregnancy Tracker':
        content = const PregnancyTrackerApp();
        break;
    }

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text(activeComponent, style: TextStyle(fontSize: 16)),
        backgroundColor: colors.card,
        foregroundColor: colors.foreground,
        elevation: 0,
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: colors.border, height: 1),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(padding: const EdgeInsets.all(24.0), child: content),
      ),
    );
  }
}

class AppNavigationDemo extends StatefulWidget {
  const AppNavigationDemo({super.key});

  @override
  State<AppNavigationDemo> createState() => _AppNavigationDemoState();
}

class _AppNavigationDemoState extends State<AppNavigationDemo> {
  String _currentPath = "/";

  void _navigate(String path) {
    setState(() {
      _currentPath = path;
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;

    Widget pageContent;
    switch (_currentPath) {
      case "/":
        pageContent = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Dashboard Overview",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: RefractionCard(
                    child: const Padding(
                      padding: EdgeInsets.all(16),
                      child: Text("Revenue: \$4,200"),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: RefractionCard(
                    child: const Padding(
                      padding: EdgeInsets.all(16),
                      child: Text("Signups: +12%"),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
        break;
      case "/customers":
        pageContent = const Text(
          "Customer Directory",
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        );
        break;
      case "/settings":
        pageContent = const Text(
          "Application Settings",
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        );
        break;
      case "/activity":
        pageContent = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Recent Activity",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            const RefractionSkeletonText(lines: 4),
          ],
        );
        break;
      default:
        pageContent = Center(child: Text("404 - $_currentPath Not Found"));
    }

    return Column(
      children: [
        RefractionBreadcrumbs(
          items: [
            const BreadcrumbItem(label: "Home", href: "/"),
            if (_currentPath != "/")
              BreadcrumbItem(label: _currentPath.substring(1).toUpperCase()),
          ],
          onNavigate: _navigate,
        ),
        const SizedBox(height: 32),
        Container(
          height: 500,
          decoration: BoxDecoration(
            border: Border.all(color: colors.border),
            borderRadius: BorderRadius.circular(12),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Scaffold(
              backgroundColor: colors.background,
              appBar: RefractionNavbar(
                logo: Icon(Icons.widgets, color: colors.primary),
                links: const [
                  NavLink(label: "Dashboard", href: "/"),
                  NavLink(label: "Customers", href: "/customers"),
                ],
                currentPath: _currentPath,
                onNavigate: _navigate,
              ),
              body: Row(
                children: [
                  RefractionSidebar(
                    currentPath: _currentPath,
                    onNavigate: _navigate,
                    sections: const [
                      SidebarSection(
                        title: "Core",
                        items: [
                          SidebarItem(
                            label: "Home",
                            href: "/",
                            icon: Icon(Icons.home),
                          ),
                          SidebarItem(
                            label: "Activity",
                            href: "/activity",
                            icon: Icon(Icons.show_chart),
                          ),
                        ],
                      ),
                      SidebarSection(
                        title: "System",
                        items: [
                          SidebarItem(
                            label: "Settings",
                            href: "/settings",
                            icon: Icon(Icons.settings),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: pageContent,
                    ),
                  ),
                ],
              ),
              bottomNavigationBar: RefractionBottomNav(
                currentPath: _currentPath,
                onNavigate: _navigate,
                tabs: const [
                  NavTab(
                    label: "Home",
                    href: "/",
                    icon: Icon(Icons.home_outlined),
                    activeIcon: Icon(Icons.home),
                  ),
                  NavTab(
                    label: "Customers",
                    href: "/customers",
                    icon: Icon(Icons.people_outline),
                    activeIcon: Icon(Icons.people),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
