/// Built-in `console` sink — the dev preset's default. Prints each canonical
/// envelope so engineers can see exactly what would ship over the wire.
library;

import 'types.dart';

/// Logger SPI (defaults to `print`). Injectable for tests / custom routing.
typedef AnalyticsLogger = void Function(String message);

class ConsoleSink implements AnalyticsSink {
  ConsoleSink({AnalyticsLogger? logger, List<String>? consentCategories})
    : _logger = logger ?? _printLogger,
      _consentCategories = consentCategories;

  static void _printLogger(String message) {
    // ignore: avoid_print
    print(message);
  }

  final AnalyticsLogger _logger;
  final List<String>? _consentCategories;

  @override
  String get name => 'console';

  @override
  List<String>? get consentCategories => _consentCategories;

  @override
  void deliver(List<AnalyticsEvent> batch, SinkDeliverContext ctx) {
    for (final ev in batch) {
      final label =
          '[analytics] ${ev.type.wire}${ev.event != null ? ' ${ev.event}' : ''}';
      _logger('$label ${ev.toJson()}');
    }
  }

  @override
  void init(SinkInitContext ctx) {}

  @override
  void flush() {}

  @override
  void shutdown() {}
}

/// Create the built-in dev-preset console sink.
AnalyticsSink createConsoleSink({
  AnalyticsLogger? logger,
  List<String>? consentCategories,
}) => ConsoleSink(logger: logger, consentCategories: consentCategories);
