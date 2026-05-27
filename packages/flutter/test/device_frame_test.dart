import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/device_frame.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return RefractionTheme(
      data: RefractionThemeData.light(),
      child: MaterialApp(
        home: Scaffold(
          body: Center(
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: child,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Finder getFrameContainer() {
    return find.byWidgetPredicate((w) => w is Container && w.decoration is BoxDecoration && (w.decoration as BoxDecoration).border != null);
  }

  group('RefractionDeviceFrame Basics', () {
    testWidgets('renders successfully with default settings', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame()));
      expect(find.byType(RefractionDeviceFrame), findsOneWidget);
    });

    testWidgets('default device is iphone', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame()));
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, 'iPhone device frame in portrait orientation');
    });

    testWidgets('default orientation is portrait', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame()));
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, contains('portrait'));
    });

    testWidgets('displays a child widget', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionDeviceFrame(
            child: Text('Device Content'),
          ),
        ),
      );
      expect(find.text('Device Content'), findsOneWidget);
    });
  });

  group('Device Types and Semantics', () {
    testWidgets('iphone semantics', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionDeviceFrame(device: RefractionDeviceType.iphone),
        ),
      );
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, 'iPhone device frame in portrait orientation');
    });

    testWidgets('ipad semantics', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionDeviceFrame(device: RefractionDeviceType.ipad),
        ),
      );
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, 'iPad device frame in portrait orientation');
    });

    testWidgets('androidPhone semantics', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionDeviceFrame(device: RefractionDeviceType.androidPhone),
        ),
      );
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, 'Android Phone device frame in portrait orientation');
    });

    testWidgets('androidTablet semantics', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionDeviceFrame(device: RefractionDeviceType.androidTablet),
        ),
      );
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, 'Android Tablet device frame in portrait orientation');
    });
  });

  group('Orientation Semantics', () {
    testWidgets('landscape orientation semantics', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionDeviceFrame(
            device: RefractionDeviceType.iphone,
            orientation: RefractionDeviceOrientation.landscape,
          ),
        ),
      );
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, 'iPhone device frame in landscape orientation');
    });

    testWidgets('ipad landscape orientation semantics', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionDeviceFrame(
            device: RefractionDeviceType.ipad,
            orientation: RefractionDeviceOrientation.landscape,
          ),
        ),
      );
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, 'iPad device frame in landscape orientation');
    });

    testWidgets('androidPhone landscape orientation semantics', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionDeviceFrame(
            device: RefractionDeviceType.androidPhone,
            orientation: RefractionDeviceOrientation.landscape,
          ),
        ),
      );
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, 'Android Phone device frame in landscape orientation');
    });

    testWidgets('androidTablet landscape orientation semantics', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionDeviceFrame(
            device: RefractionDeviceType.androidTablet,
            orientation: RefractionDeviceOrientation.landscape,
          ),
        ),
      );
      final semantics = tester.getSemantics(find.byType(RefractionDeviceFrame));
      expect(semantics.label, 'Android Tablet device frame in landscape orientation');
    });
  });

  group('Dimensions: Portrait', () {
    testWidgets('iphone has correct portrait dimensions', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.iphone)));
      final container = tester.widget<Container>(getFrameContainer().first);
      expect(container.constraints?.maxWidth, 375);
      expect(container.constraints?.maxHeight, 812);
    });

    testWidgets('ipad has correct portrait dimensions', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.ipad)));
      final container = tester.widget<Container>(getFrameContainer().first);
      expect(container.constraints?.maxWidth, 810);
      expect(container.constraints?.maxHeight, 1080);
    });

    testWidgets('androidPhone has correct portrait dimensions', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidPhone)));
      final container = tester.widget<Container>(getFrameContainer().first);
      expect(container.constraints?.maxWidth, 360);
      expect(container.constraints?.maxHeight, 800);
    });

    testWidgets('androidTablet has correct portrait dimensions', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidTablet)));
      final container = tester.widget<Container>(getFrameContainer().first);
      expect(container.constraints?.maxWidth, 800);
      expect(container.constraints?.maxHeight, 1280);
    });
  });

  group('Dimensions: Landscape', () {
    testWidgets('iphone has correct landscape dimensions', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(
        device: RefractionDeviceType.iphone,
        orientation: RefractionDeviceOrientation.landscape,
      )));
      final container = tester.widget<Container>(getFrameContainer().first);
      expect(container.constraints?.maxWidth, 812);
      expect(container.constraints?.maxHeight, 375);
    });

    testWidgets('ipad has correct landscape dimensions', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(
        device: RefractionDeviceType.ipad,
        orientation: RefractionDeviceOrientation.landscape,
      )));
      final container = tester.widget<Container>(getFrameContainer().first);
      expect(container.constraints?.maxWidth, 1080);
      expect(container.constraints?.maxHeight, 810);
    });

    testWidgets('androidPhone has correct landscape dimensions', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(
        device: RefractionDeviceType.androidPhone,
        orientation: RefractionDeviceOrientation.landscape,
      )));
      final container = tester.widget<Container>(getFrameContainer().first);
      expect(container.constraints?.maxWidth, 800);
      expect(container.constraints?.maxHeight, 360);
    });

    testWidgets('androidTablet has correct landscape dimensions', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(
        device: RefractionDeviceType.androidTablet,
        orientation: RefractionDeviceOrientation.landscape,
      )));
      final container = tester.widget<Container>(getFrameContainer().first);
      expect(container.constraints?.maxWidth, 1280);
      expect(container.constraints?.maxHeight, 800);
    });
  });

  group('Notch Rendering', () {
    testWidgets('iphone renders notch in portrait', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.iphone)));
      
      // Look for the specific notch container (width = 375 * 0.4 = 150)
      final notchFinder = find.byWidgetPredicate((widget) {
        if (widget is Container) {
          final box = widget.constraints;
          return box?.maxWidth == 150 && box?.maxHeight == 30;
        }
        return false;
      });
      expect(notchFinder, findsOneWidget);
    });

    testWidgets('iphone renders notch in landscape', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(
        device: RefractionDeviceType.iphone,
        orientation: RefractionDeviceOrientation.landscape,
      )));
      // width = 812 * 0.4 = 324.8
      final notchFinder = find.byWidgetPredicate((widget) {
        if (widget is Container) {
          final box = widget.constraints;
          return box?.maxWidth == 324.8 && box?.maxHeight == 30;
        }
        return false;
      });
      expect(notchFinder, findsOneWidget);
    });

    testWidgets('ipad does not render notch', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.ipad)));
      // No notch should have height 30
      final notchFinder = find.byWidgetPredicate((widget) => widget is Container && widget.constraints?.maxHeight == 30);
      expect(notchFinder, findsNothing);
    });

    testWidgets('androidPhone does not render notch', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidPhone)));
      final notchFinder = find.byWidgetPredicate((widget) => widget is Container && widget.constraints?.maxHeight == 30);
      expect(notchFinder, findsNothing);
    });

    testWidgets('androidTablet does not render notch', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidTablet)));
      final notchFinder = find.byWidgetPredicate((widget) => widget is Container && widget.constraints?.maxHeight == 30);
      expect(notchFinder, findsNothing);
    });
  });

  group('Home Indicator Rendering', () {
    testWidgets('iphone renders home indicator in portrait', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.iphone)));
      // width = 375 * 0.35 = 131.25
      final homeIndFinder = find.byWidgetPredicate((widget) => widget is Container && widget.constraints?.maxHeight == 5 && widget.constraints?.maxWidth == 131.25);
      expect(homeIndFinder, findsOneWidget);
    });

    testWidgets('iphone renders home indicator in landscape', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(
        device: RefractionDeviceType.iphone,
        orientation: RefractionDeviceOrientation.landscape,
      )));
      // width = 812 * 0.35 = 284.2
      final homeIndFinder = find.byWidgetPredicate((widget) => widget is Container && widget.constraints?.maxHeight == 5 && widget.constraints?.maxWidth == 284.2);
      expect(homeIndFinder, findsOneWidget);
    });

    testWidgets('ipad renders home indicator in portrait', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.ipad)));
      // width = 810 * 0.35 = 283.5
      final homeIndFinder = find.byWidgetPredicate((widget) => widget is Container && widget.constraints?.maxHeight == 5 && widget.constraints?.maxWidth == 283.5);
      expect(homeIndFinder, findsOneWidget);
    });

    testWidgets('ipad renders home indicator in landscape', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(
        device: RefractionDeviceType.ipad,
        orientation: RefractionDeviceOrientation.landscape,
      )));
      // width = 1080 * 0.35 = 378
      final homeIndFinder = find.byWidgetPredicate((widget) => widget is Container && widget.constraints?.maxHeight == 5 && widget.constraints?.maxWidth == 378.0);
      expect(homeIndFinder, findsOneWidget);
    });

    testWidgets('androidPhone does not render home indicator', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidPhone)));
      final homeIndFinder = find.byWidgetPredicate((widget) => widget is Container && widget.constraints?.maxHeight == 5);
      expect(homeIndFinder, findsNothing);
    });

    testWidgets('androidTablet does not render home indicator', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidTablet)));
      final homeIndFinder = find.byWidgetPredicate((widget) => widget is Container && widget.constraints?.maxHeight == 5);
      expect(homeIndFinder, findsNothing);
    });
  });

  group('Border Widths and Radius Constraints', () {
    testWidgets('iphone has correct border width and radius', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.iphone)));
      final container = tester.widget<Container>(getFrameContainer().first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.border?.top.width, 6);
      expect(decoration.borderRadius, BorderRadius.circular(44));
    });

    testWidgets('ipad has correct border width and radius', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.ipad)));
      final container = tester.widget<Container>(getFrameContainer().first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.border?.top.width, 6);
      expect(decoration.borderRadius, BorderRadius.circular(18));
    });

    testWidgets('androidPhone has correct border width and radius', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidPhone)));
      final container = tester.widget<Container>(getFrameContainer().first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.border?.top.width, 4);
      expect(decoration.borderRadius, BorderRadius.circular(24));
    });

    testWidgets('androidTablet has correct border width and radius', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidTablet)));
      final container = tester.widget<Container>(getFrameContainer().first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.border?.top.width, 4);
      expect(decoration.borderRadius, BorderRadius.circular(16));
    });
  });

  group('Shadow and Inner Clipping', () {
    testWidgets('frame has soft shadow', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.iphone)));
      final container = tester.widget<Container>(getFrameContainer().first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.boxShadow, isNotEmpty);
      expect(decoration.boxShadow!.length, 2);
    });

    testWidgets('frame uses ClipRRect for inner child', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.iphone)));
      final clipRRect = tester.widget<ClipRRect>(find.byType(ClipRRect));
      // iphone: radius 44, border 6 => inner radius 38
      expect(clipRRect.borderRadius, BorderRadius.circular(38));
    });

    testWidgets('ipad frame inner clipping', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.ipad)));
      final clipRRect = tester.widget<ClipRRect>(find.byType(ClipRRect));
      // ipad: radius 18, border 6 => inner radius 12
      expect(clipRRect.borderRadius, BorderRadius.circular(12));
    });
    
    testWidgets('androidPhone frame inner clipping', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidPhone)));
      final clipRRect = tester.widget<ClipRRect>(find.byType(ClipRRect));
      // androidPhone: radius 24, border 4 => inner radius 20
      expect(clipRRect.borderRadius, BorderRadius.circular(20));
    });

    testWidgets('androidTablet frame inner clipping', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.androidTablet)));
      final clipRRect = tester.widget<ClipRRect>(find.byType(ClipRRect));
      // androidTablet: radius 16, border 4 => inner radius 12
      expect(clipRRect.borderRadius, BorderRadius.circular(12));
    });
  });

  group('Background Color', () {
    testWidgets('screen background takes theme background color', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.iphone)));
      final container = tester.widget<Container>(find.byWidgetPredicate(
        (w) => w is Container && w.color == Colors.white
      ).first);
      expect(container.color, Colors.white);
    });
    
    testWidgets('notches have black background', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.iphone)));
      final notchContainer = tester.widget<Container>(find.byWidgetPredicate(
        (w) => w is Container && w.constraints?.maxHeight == 30
      ));
      expect((notchContainer.decoration as BoxDecoration).color, Colors.black);
    });

    testWidgets('home indicator has correct color', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(device: RefractionDeviceType.iphone)));
      final homeInd = tester.widget<Container>(find.byWidgetPredicate(
        (w) => w is Container && w.constraints?.maxHeight == 5
      ));
      expect((homeInd.decoration as BoxDecoration).color, const Color(0xFFD1D5DB));
    });
  });
  
  group('Child layout', () {
    testWidgets('child expands properly within frame', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const RefractionDeviceFrame(
        device: RefractionDeviceType.iphone,
        child: SizedBox(width: 50, height: 50),
      )));
      // Find the screen container that wraps the child
      final screenContainer = find.byWidgetPredicate(
        (w) => w is Container && w.color == Colors.white
      ).first;
      expect(screenContainer, findsOneWidget);
    });
  });

  group('Multiple Frames on Screen', () {
    testWidgets('Can render all device types without crashing', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(
        const SingleChildScrollView(
          child: Column(
            children: [
              RefractionDeviceFrame(device: RefractionDeviceType.iphone),
              RefractionDeviceFrame(device: RefractionDeviceType.ipad),
              RefractionDeviceFrame(device: RefractionDeviceType.androidPhone),
              RefractionDeviceFrame(device: RefractionDeviceType.androidTablet),
            ],
          ),
        ),
      ));
      expect(find.byType(RefractionDeviceFrame), findsNWidgets(4));
    });
  });
}
