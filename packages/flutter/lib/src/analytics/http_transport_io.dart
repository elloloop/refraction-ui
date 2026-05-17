/// dart:io transport (Android, iOS, macOS, Windows, Linux). Uses the core
/// HttpClient so the package stays dependency-free. The unload "beacon" is a
/// best-effort fire-and-forget keepalive POST (mobile/desktop have no
/// navigator.sendBeacon; this is the platform-equivalent fallback).
library;

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'types.dart';

class _IoTransport implements HttpTransport {
  final HttpClient _client = HttpClient()
    ..connectionTimeout = const Duration(seconds: 10);

  @override
  Future<int> post({
    required String url,
    required Map<String, String> headers,
    required String body,
  }) async {
    final req = await _client.postUrl(Uri.parse(url));
    headers.forEach(req.headers.set);
    req.add(utf8.encode(body));
    final res = await req.close();
    // Drain so the connection can be reused / released.
    await res.drain<void>();
    return res.statusCode;
  }

  @override
  bool beacon({required String url, required String body}) {
    // Beacon-equivalent on IO: fire-and-forget POST that we do not await.
    // Errors are swallowed — this is the unload best-effort path.
    unawaited(() async {
      try {
        final req = await _client.postUrl(Uri.parse(url));
        req.headers.set(HttpHeaders.contentTypeHeader, 'text/plain');
        req.add(utf8.encode(body));
        final res = await req.close();
        await res.drain<void>();
      } catch (_) {
        // best-effort
      }
    }());
    return true;
  }
}

HttpTransport createPlatformTransport() => _IoTransport();
