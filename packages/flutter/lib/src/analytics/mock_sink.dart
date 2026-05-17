/// A mock sink that records every call — used for testing the router and the
/// wire-contract conformance suite. Mirrors `createMockSink` from
/// `@refraction-ui/analytics`.
library;

import 'types.dart';

class MockDelivery {
  MockDelivery(this.batch, this.ctx);
  final List<AnalyticsEvent> batch;
  final SinkDeliverContext ctx;
}

class MockSink implements AnalyticsSink {
  MockSink({String? name, List<String>? consentCategories})
    : _name = name ?? 'mock',
      _consentCategories = consentCategories;

  final String _name;
  final List<String>? _consentCategories;

  /// All events received across all deliver() calls (flattened).
  final List<AnalyticsEvent> events = [];

  /// Each deliver() call's batch + context.
  final List<MockDelivery> deliveries = [];

  /// init() call contexts.
  final List<SinkInitContext> initCalls = [];

  /// flush() invocation count.
  int flushCalls = 0;

  /// shutdown() invocation count.
  int shutdownCalls = 0;

  @override
  String get name => _name;

  @override
  List<String>? get consentCategories => _consentCategories;

  @override
  void init(SinkInitContext ctx) {
    initCalls.add(ctx);
  }

  @override
  void deliver(List<AnalyticsEvent> batch, SinkDeliverContext ctx) {
    deliveries.add(MockDelivery(batch, ctx));
    events.addAll(batch);
  }

  @override
  void flush() {
    flushCalls++;
  }

  @override
  void shutdown() {
    shutdownCalls++;
  }
}

/// Create an [AnalyticsSink] that captures everything for assertion.
MockSink createMockSink({String? name, List<String>? consentCategories}) =>
    MockSink(name: name, consentCategories: consentCategories);
