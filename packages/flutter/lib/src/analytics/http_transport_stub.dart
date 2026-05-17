/// Transport stub for platforms with neither dart:io nor dart:html. A sink
/// must be given an explicit transport in that (rare) case.
library;

import 'types.dart';

class _UnavailableTransport implements HttpTransport {
  @override
  Future<int> post({
    required String url,
    required Map<String, String> headers,
    required String body,
  }) {
    throw StateError(
      'No HTTP transport available on this platform — inject an '
      'HttpTransport via HttpSinkOptions.transport.',
    );
  }

  @override
  bool beacon({required String url, required String body}) => false;
}

HttpTransport createPlatformTransport() => _UnavailableTransport();
