import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/browser_chrome_mock.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionBrowserChromeMock)
Widget browserChromeMockDefaultUseCase(BuildContext context) {
  return RefractionBrowserChromeMock(
    url: 'easyloops.dev/dashboard/analytics',
    child: Container(
      height: 200,
      color: Colors.grey.shade50,
      alignment: Alignment.center,
      child: const Text('Mock Dashboard Content'),
    ),
  );
}

@widgetbook.UseCase(name: 'Live Stream', type: RefractionBrowserChromeMock)
Widget browserChromeMockLiveUseCase(BuildContext context) {
  return RefractionBrowserChromeMock(
    url: 'easyloops.dev/live-demo',
    status: RefractionBrowserChromeStatus.live,
    child: Container(
      height: 200,
      color: Colors.black,
      alignment: Alignment.center,
      child: const Text(
        'Video Player Preview',
        style: TextStyle(color: Colors.white),
      ),
    ),
  );
}

@widgetbook.UseCase(name: 'Recording', type: RefractionBrowserChromeMock)
Widget browserChromeMockRecUseCase(BuildContext context) {
  return RefractionBrowserChromeMock(
    url: 'easyloops.dev/recording/session_123',
    status: RefractionBrowserChromeStatus.rec,
    child: Container(
      height: 200,
      color: Colors.grey.shade900,
      alignment: Alignment.center,
      child: const Text(
        'Session Recording Active',
        style: TextStyle(color: Colors.white),
      ),
    ),
  );
}
