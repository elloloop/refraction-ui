/// createAnalytics — the neutral Segment-spec collector/router.
///
/// 1:1 Dart port of `createAnalytics` from `@refraction-ui/analytics`. A
/// single factory returns the entire public surface and fans the canonical
/// envelope out to registered sinks. There is NO privileged engine — the
/// built-in HTTP sink and every vendor adapter are equal sinks.
///
/// Presets:
///   dev  — synchronous delivery + a console sink (see exactly what ships).
///   prod — batching + sampling + a background/unload beacon flush.
///
/// When `enabled: false`, a noop is returned and no live collector / sink
/// code runs. The structure and public API are identical across Flutter web,
/// Android, iOS and desktop — platform differences (storage, transport) are
/// internal, behind conditional imports.
library;

import 'dart:async';
import 'dart:math';

import 'consent.dart';
import 'console_sink.dart';
import 'http_sink.dart';
import 'identity.dart';
import 'noop.dart';
import 'redaction.dart';
import 'session.dart';
import 'types.dart';
import 'uuid.dart';

const AnalyticsLibrary _library = AnalyticsLibrary(
  name: '@refraction-ui/analytics',
  version: '0.1.0',
);

/// The shared collector. One instance backs the root facade and every
/// `withContext()` child — identical to the shared closure in the TS port.
class _Core {
  _Core(this.config)
    : preset = config.preset ?? (config.env == 'production' ? 'prod' : 'dev'),
      sampleRate = config.sampleRate,
      batchSize = config.batchSize,
      session = Session(config.session, now: config.now),
      identity = Identity(config.identity),
      consent = Consent(config.consent),
      redactor = Redactor(config.redactKeys),
      random = config.random ?? Random().nextDouble {
    if (config.endpoint != null) {
      registerSink(
        createHttpSink(
          HttpSinkOptions(
            endpoint: config.endpoint!,
            writeKey: config.writeKey ?? '',
            transport: config.httpTransport,
          ),
        ),
      );
    }
    if (preset == 'dev') {
      registerSink(createConsoleSink());
    }
    for (final s in config.sinks) {
      registerSink(s);
    }
    _startTimer();
  }

  final AnalyticsConfig config;
  final String preset;
  final double sampleRate;
  final int batchSize;
  final Session session;
  final Identity identity;
  final Consent consent;
  final Redactor redactor;
  final double Function() random;

  final Map<String, AnalyticsSink> sinks = {};
  final List<String> sinkOrder = [];
  final Set<String> initialized = {};

  final List<AnalyticsEvent> buffer = [];
  Timer? _timer;

  void registerSink(AnalyticsSink sink) {
    if (!sinks.containsKey(sink.name)) sinkOrder.add(sink.name);
    sinks[sink.name] = sink;
  }

  void removeSink(String name) {
    if (sinks.containsKey(name)) {
      sinks.remove(name);
      sinkOrder.remove(name);
      initialized.remove(name);
    }
  }

  Future<void>? _ensureInit(AnalyticsSink sink) {
    if (initialized.contains(sink.name)) return null;
    initialized.add(sink.name);
    final r = sink.init(
      SinkInitContext(
        app: config.app,
        env: config.env,
        endpoint: config.endpoint,
      ),
    );
    if (r is Future) return r;
    return null;
  }

  void _startTimer() {
    if (preset != 'prod' || _timer != null) return;
    _timer = Timer.periodic(
      Duration(milliseconds: config.flushIntervalMs),
      (_) => unawaited(flush()),
    );
  }

  Future<void> deliverToSinks(List<AnalyticsEvent> batch, bool unload) async {
    if (batch.isEmpty) return;
    final ctx = SinkDeliverContext(unload: unload);
    for (final sinkName in sinkOrder) {
      final sink = sinks[sinkName];
      if (sink == null) continue;
      if (!consent.allows(sink.consentCategories)) continue;
      final inited = _ensureInit(sink);
      if (inited != null) await inited;
      final r = sink.deliver(batch, ctx);
      if (r is Future) await r;
    }
  }

  Future<void> flush({bool unload = false}) async {
    final batch = List<AnalyticsEvent>.of(buffer);
    buffer.clear();
    await deliverToSinks(batch, unload);
    for (final sinkName in sinkOrder) {
      final sink = sinks[sinkName];
      if (sink != null && consent.allows(sink.consentCategories)) {
        final r = sink.flush();
        if (r is Future) await r;
      }
    }
  }

  bool _sampled() {
    if (sampleRate >= 1) return true;
    if (sampleRate <= 0) return false;
    return random() < sampleRate;
  }

  void _enqueue(AnalyticsEvent ev) {
    if (preset == 'dev') {
      unawaited(deliverToSinks([ev], false));
      return;
    }
    buffer.add(ev);
    if (buffer.length >= batchSize) {
      unawaited(flush());
    }
  }

  AnalyticsContext _buildContext(
    Map<String, Object?>? extra,
    Map<String, Object?> childCtx,
  ) {
    return AnalyticsContext(
      app: config.app,
      env: config.env,
      library: _library,
      extra: {...childCtx, ...?extra},
    );
  }

  void emit(
    AnalyticsEventType type,
    Map<String, Object?> fields,
    Map<String, Object?> childCtx,
    CallOptions? opts,
  ) {
    if (!_sampled()) return;

    final sessionId = session.touch();
    final sessionProps = session.props();

    var properties = fields['properties'] as AnalyticsProperties?;
    if (sessionProps != null &&
        (properties != null ||
            type == AnalyticsEventType.track ||
            type == AnalyticsEventType.page ||
            type == AnalyticsEventType.screen)) {
      properties = {...sessionProps, ...(properties ?? {})};
    }

    final ev = AnalyticsEvent(
      type: type,
      event: fields['event'] as String?,
      messageId: uuidv4(),
      anonymousId: identity.anonymousId(),
      userId: (fields['userId'] as String?) ?? identity.userId(),
      groupId: fields['groupId'] as String?,
      previousId: fields['previousId'] as String?,
      sessionId: sessionId,
      properties: properties,
      traits: fields['traits'] as AnalyticsProperties?,
      context: _buildContext(opts?.context, childCtx),
      timestamp: opts?.timestamp ?? DateTime.now().toUtc().toIso8601String(),
      schemaVersion: kSchemaVersion,
    );

    _enqueue(ev);
  }
}

class _SessionFacade implements SessionApi {
  _SessionFacade(this._s);
  final Session _s;
  @override
  String id() => _s.id();
  @override
  String start() => _s.start();
  @override
  void end() => _s.end();
  @override
  void set(AnalyticsProperties props) => _s.set(props);
}

/// A thin facade over a shared [_Core]. The root and every `withContext()`
/// child are facades over the same core, differing only by `_childCtx`
/// (mirrors `makeApi(childCtx)` in the TS port).
class _Facade implements Analytics {
  _Facade(this._core, this._childCtx);

  final _Core _core;
  final Map<String, Object?> _childCtx;

  @override
  void track(
    String event, [
    AnalyticsProperties? properties,
    CallOptions? opts,
  ]) {
    _core.emit(
      AnalyticsEventType.track,
      {'event': event, 'properties': _core.redactor.redact(properties)},
      _childCtx,
      opts,
    );
  }

  @override
  void identify(
    String userId, [
    AnalyticsProperties? traits,
    CallOptions? opts,
  ]) {
    _core.identity.setUserId(userId);
    _core.emit(
      AnalyticsEventType.identify,
      {'traits': _core.redactor.redact(traits)},
      _childCtx,
      opts,
    );
  }

  @override
  void page([
    String? name,
    AnalyticsProperties? properties,
    CallOptions? opts,
  ]) {
    _core.emit(
      AnalyticsEventType.page,
      {'event': name, 'properties': _core.redactor.redact(properties)},
      _childCtx,
      opts,
    );
  }

  @override
  void screen([
    String? name,
    AnalyticsProperties? properties,
    CallOptions? opts,
  ]) {
    _core.emit(
      AnalyticsEventType.screen,
      {'event': name, 'properties': _core.redactor.redact(properties)},
      _childCtx,
      opts,
    );
  }

  @override
  void group(String groupId, [AnalyticsProperties? traits, CallOptions? opts]) {
    _core.emit(
      AnalyticsEventType.group,
      {'groupId': groupId, 'traits': _core.redactor.redact(traits)},
      _childCtx,
      opts,
    );
  }

  @override
  void alias(String userId, [String? previousId, CallOptions? opts]) {
    final stitch = _core.identity.alias(userId, previousId);
    _core.emit(
      AnalyticsEventType.alias,
      {'userId': stitch.userId, 'previousId': stitch.previousId},
      _childCtx,
      opts,
    );
  }

  @override
  SessionApi get session => _SessionFacade(_core.session);

  @override
  ConsentApi get consent => _core.consent;

  @override
  String anonymousId() => _core.identity.anonymousId();

  @override
  String? userId() => _core.identity.userId();

  @override
  Analytics withContext(Map<String, Object?> context) {
    return _Facade(_core, {..._childCtx, ...context});
  }

  @override
  void addSink(AnalyticsSink sink) => _core.registerSink(sink);

  @override
  void removeSink(String name) => _core.removeSink(name);

  @override
  List<String> get sinks => List<String>.of(_core.sinkOrder);

  @override
  Future<void> flush() => _core.flush();

  @override
  void reset() {
    _core.identity.reset();
    _core.session.end();
  }

  @override
  bool get enabled => true;
}

/// createAnalytics — the neutral Segment-spec collector/router. Returns the
/// entire public [Analytics] surface. When `enabled: false`, a noop is
/// returned and the live collector code does not run.
Analytics createAnalytics(AnalyticsConfig config) {
  if (!config.enabled) {
    return createNoopAnalytics();
  }
  return _Facade(_Core(config), const {});
}
