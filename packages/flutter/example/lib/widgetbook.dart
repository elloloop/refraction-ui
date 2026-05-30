import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

import 'widgetbook.directories.g.dart';

void main() {
  runApp(const WidgetbookApp());
}

@widgetbook.App()
class WidgetbookApp extends StatelessWidget {
  const WidgetbookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Widgetbook.material(
      directories: directories,
      addons: [
        ThemeAddon(
          themes: [
            WidgetbookTheme(
              name: 'Refraction Light',
              data: RefractionThemeData.refractionLight(),
            ),
            WidgetbookTheme(
              name: 'Refraction Dark',
              data: RefractionThemeData.refractionDark(),
            ),
            WidgetbookTheme(
              name: 'Luxe Light',
              data: RefractionThemeData.luxeLight(),
            ),
            WidgetbookTheme(
              name: 'Luxe Dark',
              data: RefractionThemeData.luxeDark(),
            ),
            WidgetbookTheme(
              name: 'Warm Light',
              data: RefractionThemeData.warmLight(),
            ),
            WidgetbookTheme(
              name: 'Warm Dark',
              data: RefractionThemeData.warmDark(),
            ),
            WidgetbookTheme(
              name: 'Signal Light',
              data: RefractionThemeData.signalLight(),
            ),
            WidgetbookTheme(
              name: 'Signal Dark',
              data: RefractionThemeData.signalDark(),
            ),
            WidgetbookTheme(
              name: 'Pulse Light',
              data: RefractionThemeData.pulseLight(),
            ),
            WidgetbookTheme(
              name: 'Pulse Dark',
              data: RefractionThemeData.pulseDark(),
            ),
            WidgetbookTheme(
              name: 'Mono Light',
              data: RefractionThemeData.monoLight(),
            ),
            WidgetbookTheme(
              name: 'Mono Dark',
              data: RefractionThemeData.monoDark(),
            ),
          ],
          themeBuilder: (context, theme, child) {
            return RefractionTheme(
              data: theme,
              child: Scaffold(
                backgroundColor: theme.colors.background,
                body: Center(
                  child: DefaultTextStyle(
                    style: TextStyle(
                      color: theme.colors.foreground,
                      fontFamily: 'Inter',
                    ),
                    child: child,
                  ),
                ),
              ),
            );
          },
        ),
        DeviceFrameAddon(
          devices: [
            Devices.ios.iPhone13,
            Devices.macOS.macBookPro,
            Devices.windows.wideMonitor,
          ],
        ),
      ],
    );
  }
}
