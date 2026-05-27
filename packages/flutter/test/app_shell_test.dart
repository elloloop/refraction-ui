import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildAppShell({
    Widget? header,
    Widget? footer,
    Widget? leftSidebar,
    Widget? rightSidebar,
    required Widget content,
    double mobileBreakpoint = 768.0,
    bool isLeftSidebarOpen = false,
    bool isRightSidebarOpen = false,
    ValueChanged<bool>? onLeftSidebarOpenChanged,
    ValueChanged<bool>? onRightSidebarOpenChanged,
  }) {
    return RefractionTheme(
      data: RefractionThemeData.light(),
      child: Directionality(
        textDirection: TextDirection.ltr,
        child: Material(
          child: RefractionAppShell(
            header: header,
            footer: footer,
            leftSidebar: leftSidebar,
            rightSidebar: rightSidebar,
            content: content,
            mobileBreakpoint: mobileBreakpoint,
            isLeftSidebarOpen: isLeftSidebarOpen,
            isRightSidebarOpen: isRightSidebarOpen,
            onLeftSidebarOpenChanged: onLeftSidebarOpenChanged,
            onRightSidebarOpenChanged: onRightSidebarOpenChanged,
          ),
        ),
      ),
    );
  }

  group('RefractionAppShell', () {
    testWidgets('renders content', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildAppShell(content: const Text('Main Content')),
      );

      expect(find.text('Main Content'), findsOneWidget);
    });

    testWidgets('renders header when provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildAppShell(
          header: const Text('Header Widget'),
          content: const Text('Main Content'),
        ),
      );

      expect(find.text('Header Widget'), findsOneWidget);
    });

    testWidgets('renders footer when provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildAppShell(
          footer: const Text('Footer Widget'),
          content: const Text('Main Content'),
        ),
      );

      expect(find.text('Footer Widget'), findsOneWidget);
    });

    testWidgets('desktop mode: renders leftSidebar when provided', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1000, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      await tester.pumpWidget(
        buildAppShell(
          leftSidebar: const Text('Left Sidebar'),
          content: const Text('Main Content'),
        ),
      );

      expect(find.text('Left Sidebar'), findsOneWidget);
    });

    testWidgets('desktop mode: renders rightSidebar when provided', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1000, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      await tester.pumpWidget(
        buildAppShell(
          rightSidebar: const Text('Right Sidebar'),
          content: const Text('Main Content'),
        ),
      );

      expect(find.text('Right Sidebar'), findsOneWidget);
    });

    testWidgets('desktop mode: renders all sidebars and regions', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      await tester.pumpWidget(
        buildAppShell(
          header: const Text('Header'),
          footer: const Text('Footer'),
          leftSidebar: const Text('Left Sidebar'),
          rightSidebar: const Text('Right Sidebar'),
          content: const Text('Content'),
        ),
      );

      expect(find.text('Header'), findsOneWidget);
      expect(find.text('Footer'), findsOneWidget);
      expect(find.text('Left Sidebar'), findsOneWidget);
      expect(find.text('Right Sidebar'), findsOneWidget);
      expect(find.text('Content'), findsOneWidget);
    });

    testWidgets('mobile mode: leftSidebar hidden when closed', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      await tester.pumpWidget(
        buildAppShell(
          leftSidebar: const Text('Left Sidebar'),
          content: const Text('Content'),
          isLeftSidebarOpen: false,
        ),
      );

      // The widget is in the tree (AnimatedPositioned) but off-screen.
      final sidebarFinder = find.text('Left Sidebar');
      expect(sidebarFinder, findsOneWidget);

      final renderBox = tester.renderObject<RenderBox>(sidebarFinder);
      final offset = renderBox.localToGlobal(Offset.zero);
      expect(offset.dx < 0, true); // It should be off-screen to the left
    });

    testWidgets('mobile mode: leftSidebar visible when opened', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      await tester.pumpWidget(
        buildAppShell(
          leftSidebar: const Text('Left Sidebar'),
          content: const Text('Content'),
          isLeftSidebarOpen: true,
        ),
      );

      // Wait for animation
      await tester.pumpAndSettle();

      final sidebarFinder = find.text('Left Sidebar');
      expect(sidebarFinder, findsOneWidget);

      final renderBox = tester.renderObject<RenderBox>(sidebarFinder);
      final offset = renderBox.localToGlobal(Offset.zero);
      expect(offset.dx, 0.0); // It should be on-screen
    });

    testWidgets('mobile mode: rightSidebar visible when opened', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      await tester.pumpWidget(
        buildAppShell(
          rightSidebar: const Text('Right Sidebar'),
          content: const Text('Content'),
          isRightSidebarOpen: true,
        ),
      );

      await tester.pumpAndSettle();

      final sidebarFinder = find.text('Right Sidebar');
      expect(sidebarFinder, findsOneWidget);

      final renderBox = tester.renderObject<RenderBox>(sidebarFinder);
      final offset = renderBox.localToGlobal(Offset.zero);
      expect(offset.dx > 0, true); // It should be on the right side
    });

    testWidgets('mobile mode: tapping overlay closes sidebars with callbacks', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      bool leftClosed = false;
      await tester.pumpWidget(
        buildAppShell(
          leftSidebar: const Text('Left Sidebar'),
          content: const Text('Content'),
          isLeftSidebarOpen: true,
          onLeftSidebarOpenChanged: (val) {
            if (!val) leftClosed = true;
          },
        ),
      );

      await tester.pumpAndSettle();

      // Tap top center (overlay area)
      await tester.tapAt(const Offset(350, 100));
      await tester.pumpAndSettle();

      expect(leftClosed, isTrue);
    });

    testWidgets('mobile mode: tapping overlay closes sidebars internally', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      await tester.pumpWidget(
        buildAppShell(
          leftSidebar: const Text('Left Sidebar'),
          content: const Text('Content'),
          isLeftSidebarOpen: true, // initial state
        ),
      );

      await tester.pumpAndSettle();

      final sidebarFinder = find.text('Left Sidebar');
      final renderBoxBefore = tester.renderObject<RenderBox>(sidebarFinder);
      expect(renderBoxBefore.localToGlobal(Offset.zero).dx, 0.0);

      // Tap the overlay to close
      await tester.tapAt(const Offset(350, 100)); // Tap outside the 280px left sidebar
      await tester.pumpAndSettle();

      final renderBoxAfter = tester.renderObject<RenderBox>(sidebarFinder);
      expect(renderBoxAfter.localToGlobal(Offset.zero).dx < 0, true);
    });

    testWidgets('AppShell state can be toggled via of(context)', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      final GlobalKey key = GlobalKey();

      await tester.pumpWidget(
        buildAppShell(
          leftSidebar: const Text('Left Sidebar'),
          content: Builder(
            key: key,
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  RefractionAppShell.of(context)?.toggleLeftSidebar();
                },
                child: const Text('Toggle'),
              );
            },
          ),
        ),
      );

      await tester.pumpAndSettle();

      final sidebarFinder = find.text('Left Sidebar');
      final renderBoxBefore = tester.renderObject<RenderBox>(sidebarFinder);
      expect(renderBoxBefore.localToGlobal(Offset.zero).dx < 0, true);

      // Tap toggle
      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();

      final renderBoxAfter = tester.renderObject<RenderBox>(sidebarFinder);
      expect(renderBoxAfter.localToGlobal(Offset.zero).dx, 0.0);
    });

    testWidgets('AppShell state can toggle right sidebar via of(context)', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      final GlobalKey key = GlobalKey();

      await tester.pumpWidget(
        buildAppShell(
          rightSidebar: const Text('Right Sidebar'),
          content: Builder(
            key: key,
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  RefractionAppShell.of(context)?.toggleRightSidebar();
                },
                child: const Text('Toggle Right'),
              );
            },
          ),
        ),
      );

      await tester.pumpAndSettle();

      final sidebarFinder = find.text('Right Sidebar');
      final renderBoxBefore = tester.renderObject<RenderBox>(sidebarFinder);
      expect(renderBoxBefore.localToGlobal(Offset.zero).dx > 300, true);

      // Tap toggle
      await tester.tap(find.text('Toggle Right'));
      await tester.pumpAndSettle();

      final renderBoxAfter = tester.renderObject<RenderBox>(sidebarFinder);
      expect(renderBoxAfter.localToGlobal(Offset.zero).dx < 400, true); // It should move in
    });

    testWidgets('didUpdateWidget updates internal state', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      final stateValue = ValueNotifier<bool>(false);

      await tester.pumpWidget(
        ValueListenableBuilder<bool>(
          valueListenable: stateValue,
          builder: (context, isOpen, _) {
            return buildAppShell(
              leftSidebar: const Text('Left Sidebar'),
              content: const Text('Content'),
              isLeftSidebarOpen: isOpen,
            );
          },
        ),
      );

      await tester.pumpAndSettle();

      final sidebarFinder = find.text('Left Sidebar');
      expect(tester.renderObject<RenderBox>(sidebarFinder).localToGlobal(Offset.zero).dx < 0, true);

      // Update state
      stateValue.value = true;
      await tester.pumpAndSettle();

      expect(tester.renderObject<RenderBox>(sidebarFinder).localToGlobal(Offset.zero).dx, 0.0);
    });

    testWidgets('overlay is absent on desktop', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());
      addTearDown(() => tester.view.resetDevicePixelRatio());

      await tester.pumpWidget(
        buildAppShell(
          leftSidebar: const Text('Left Sidebar'),
          content: const Text('Content'),
          isLeftSidebarOpen: true, // Setting this should not cause an overlay on desktop
        ),
      );

      await tester.pumpAndSettle();

      // Check for IgnorePointer covering the screen, overlay only exists on mobile
      final overlayFinder = find.byWidgetPredicate((widget) => widget is IgnorePointer && widget.ignoring == false);
      expect(overlayFinder, findsNothing);
    });
  });

  group('RefractionAppShell Parametric dimensions', () {
    for (var width in [300, 400, 500, 600, 700]) {
      testWidgets('width $width evaluates to mobile mode', (tester) async {
        tester.view.physicalSize = Size(width.toDouble(), 800);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() => tester.view.resetPhysicalSize());
        addTearDown(() => tester.view.resetDevicePixelRatio());

        await tester.pumpWidget(
          buildAppShell(
            leftSidebar: const Text('Left'),
            content: const Text('Content'),
            mobileBreakpoint: 768,
            isLeftSidebarOpen: true,
          ),
        );
        await tester.pumpAndSettle();
        // Tapping overlay should close it, meaning overlay is active
        await tester.tapAt(const Offset(290, 100)); // Tap outside the 280px sidebar
        await tester.pumpAndSettle();
        final sidebarFinder = find.text('Left');
        expect(tester.renderObject<RenderBox>(sidebarFinder).localToGlobal(Offset.zero).dx < 0, true);
      });
    }

    for (var width in [800, 900, 1000, 1200, 1600]) {
      testWidgets('width $width evaluates to desktop mode', (tester) async {
        tester.view.physicalSize = Size(width.toDouble(), 800);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() => tester.view.resetPhysicalSize());
        addTearDown(() => tester.view.resetDevicePixelRatio());

        await tester.pumpWidget(
          buildAppShell(
            leftSidebar: const Text('Left'),
            content: const Text('Content'),
            mobileBreakpoint: 768,
          ),
        );
        await tester.pumpAndSettle();
        final sidebarFinder = find.text('Left');
        expect(tester.renderObject<RenderBox>(sidebarFinder).localToGlobal(Offset.zero).dx, 0.0);
      });
    }
  });
}
