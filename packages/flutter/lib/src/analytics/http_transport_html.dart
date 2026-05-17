/// Flutter-web transport (dart:html). Standard path uses HttpRequest with the
/// Authorization header; the unload path uses the real `navigator.sendBeacon`
/// (cannot set headers — write key travels in the query string per the wire
/// contract).
library;

// ignore: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html' as html;

import 'types.dart';

class _HtmlTransport implements HttpTransport {
  @override
  Future<int> post({
    required String url,
    required Map<String, String> headers,
    required String body,
  }) async {
    try {
      final res = await html.HttpRequest.request(
        url,
        method: 'POST',
        requestHeaders: headers,
        sendData: body,
      );
      return res.status ?? 0;
    } on html.ProgressEvent catch (e) {
      final target = e.target;
      if (target is html.HttpRequest) {
        // 4xx/5xx surface as a ProgressEvent — return the real status so the
        // sink applies the wire-contract retry/no-retry rules.
        return target.status ?? 0;
      }
      // Genuine network failure → transient (throw → sink retries).
      throw StateError('network error');
    }
  }

  @override
  bool beacon({required String url, required String body}) {
    try {
      return html.window.navigator.sendBeacon(url, body);
    } catch (_) {
      return false;
    }
  }
}

HttpTransport createPlatformTransport() => _HtmlTransport();
