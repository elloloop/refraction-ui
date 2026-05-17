/// Resolves the default [HttpTransport] for the current platform via a
/// conditional import. dart:io HttpClient on Android/iOS/desktop; browser
/// fetch/sendBeacon on Flutter web. The platform difference is internal —
/// the consumer never sees it, the HTTP sink only ever talks to the SPI.
library;

import 'types.dart';
import 'http_transport_stub.dart'
    if (dart.library.io) 'http_transport_io.dart'
    if (dart.library.html) 'http_transport_html.dart'
    as platform;

/// Resolve the platform transport (throws if no transport is reachable —
/// the caller is expected to inject one in that case).
HttpTransport resolveHttpTransport() => platform.createPlatformTransport();
