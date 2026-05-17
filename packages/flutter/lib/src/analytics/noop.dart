/// The noop collector returned when `enabled: false`.
///
/// Every method is empty so calls are free and a production build can compile
/// analytics off entirely. Kept in its own module so the live collector / sink
/// code is not reachable on the `enabled:false` path.
library;

import 'types.dart';

const String _zeroId = '00000000-0000-4000-8000-000000000000';

class _NoopSession implements SessionApi {
  @override
  String id() => _zeroId;
  @override
  String start() => _zeroId;
  @override
  void end() {}
  @override
  void set(AnalyticsProperties props) {}
}

class _NoopConsent implements ConsentApi {
  @override
  void grant(List<String> categories) {}
  @override
  void revoke(List<String> categories) {}
  @override
  List<String> granted() => const [];
  @override
  bool isGranted(String category) => false;
}

class NoopAnalytics implements Analytics {
  NoopAnalytics();

  @override
  final SessionApi session = _NoopSession();

  @override
  final ConsentApi consent = _NoopConsent();

  @override
  void track(
    String event, [
    AnalyticsProperties? properties,
    CallOptions? opts,
  ]) {}

  @override
  void identify(
    String userId, [
    AnalyticsProperties? traits,
    CallOptions? opts,
  ]) {}

  @override
  void page([
    String? name,
    AnalyticsProperties? properties,
    CallOptions? opts,
  ]) {}

  @override
  void screen([
    String? name,
    AnalyticsProperties? properties,
    CallOptions? opts,
  ]) {}

  @override
  void group(
    String groupId, [
    AnalyticsProperties? traits,
    CallOptions? opts,
  ]) {}

  @override
  void alias(String userId, [String? previousId, CallOptions? opts]) {}

  @override
  String anonymousId() => _zeroId;

  @override
  String? userId() => null;

  @override
  Analytics withContext(Map<String, Object?> context) => this;

  @override
  void addSink(AnalyticsSink sink) {}

  @override
  void removeSink(String name) {}

  @override
  List<String> get sinks => const [];

  @override
  Future<void> flush() async {}

  @override
  void reset() {}

  @override
  bool get enabled => false;
}

/// The noop collector returned when `enabled: false`.
Analytics createNoopAnalytics() => NoopAnalytics();
