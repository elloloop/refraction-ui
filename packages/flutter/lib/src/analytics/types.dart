/// refraction_ui analytics — type contracts.
///
/// 1:1 Dart port of `@refraction-ui/analytics`. The library is a neutral
/// Segment-spec collector/router. The app instruments once via the canonical
/// API; the router fans the canonical envelope out to N pluggable sinks.
/// There is NO privileged engine — every vendor is a sink.
///
/// The public API, the canonical Segment `AnalyticsEvent` envelope, the
/// `AnalyticsSink` SPI, and the built-in HTTP sink's wire contract are reused
/// verbatim from the web library (#213 / #214 / #221). Platform differences
/// (storage, transport) are internal implementation details behind one
/// identical surface — uniform across Flutter web/Android/iOS/desktop.
library;

import 'dart:async';

/// Canonical Segment event types.
enum AnalyticsEventType { track, identify, page, screen, group, alias }

/// Wire name for an [AnalyticsEventType] (matches the TS string union).
extension AnalyticsEventTypeWire on AnalyticsEventType {
  String get wire {
    switch (this) {
      case AnalyticsEventType.track:
        return 'track';
      case AnalyticsEventType.identify:
        return 'identify';
      case AnalyticsEventType.page:
        return 'page';
      case AnalyticsEventType.screen:
        return 'screen';
      case AnalyticsEventType.group:
        return 'group';
      case AnalyticsEventType.alias:
        return 'alias';
    }
  }
}

/// Schema version stamped onto every envelope and the wire contract path.
const int kSchemaVersion = 1;

/// Arbitrary, JSON-serialisable bag of values.
typedef AnalyticsProperties = Map<String, Object?>;

/// Library identity stamped into [AnalyticsContext.library].
class AnalyticsLibrary {
  const AnalyticsLibrary({required this.name, required this.version});

  final String name;
  final String version;

  Map<String, Object?> toJson() => {'name': name, 'version': version};
}

/// Page block attached to an event when a navigation context is available.
class AnalyticsPage {
  const AnalyticsPage({
    this.path,
    this.url,
    this.referrer,
    this.title,
    this.search,
  });

  final String? path;
  final String? url;
  final String? referrer;
  final String? title;
  final String? search;

  Map<String, Object?> toJson() {
    final out = <String, Object?>{};
    if (path != null) out['path'] = path;
    if (url != null) out['url'] = url;
    if (referrer != null) out['referrer'] = referrer;
    if (title != null) out['title'] = title;
    if (search != null) out['search'] = search;
    return out;
  }
}

/// The context block attached to every event. `library` identifies the
/// collector; `app`/`env` identify the product instance. Free-form additions
/// are contributed by `with(context)` children via [extra].
class AnalyticsContext {
  const AnalyticsContext({
    required this.app,
    required this.env,
    required this.library,
    this.page,
    this.extra = const {},
  });

  final String app;
  final String env;
  final AnalyticsLibrary library;
  final AnalyticsPage? page;

  /// Free-form additions contributed by `with(context)` children.
  final Map<String, Object?> extra;

  Map<String, Object?> toJson() {
    final out = <String, Object?>{'app': app, 'env': env};
    if (page != null) out['page'] = page!.toJson();
    out.addAll(extra);
    // `library` is fixed last (mirrors the TS spread order so `with()` cannot
    // clobber the collector identity).
    out['library'] = library.toJson();
    return out;
  }
}

/// The canonical Segment envelope. Every sink receives events in exactly this
/// shape; the built-in HTTP sink ships it verbatim over the wire contract.
class AnalyticsEvent {
  const AnalyticsEvent({
    required this.type,
    required this.messageId,
    required this.anonymousId,
    required this.sessionId,
    required this.context,
    required this.timestamp,
    required this.schemaVersion,
    this.event,
    this.userId,
    this.groupId,
    this.previousId,
    this.properties,
    this.traits,
  });

  /// Segment call type.
  final AnalyticsEventType type;

  /// Event name (track/screen) or page name (page).
  final String? event;

  /// Idempotency key — backends MUST dedupe on this.
  final String messageId;

  /// Persistent, non-PII, resettable client id.
  final String anonymousId;

  /// Opaque app-supplied id (set after identify).
  final String? userId;

  /// Group id (group calls).
  final String? groupId;

  /// Previous id (alias calls).
  final String? previousId;

  /// Analytics session id (UUIDv4, minted at session start).
  final String sessionId;

  /// track/page/screen/group payload.
  final AnalyticsProperties? properties;

  /// identify/group trait payload.
  final AnalyticsProperties? traits;

  /// Collector + product context.
  final AnalyticsContext context;

  /// ISO-8601 client timestamp.
  final String timestamp;

  /// Envelope schema version.
  final int schemaVersion;

  AnalyticsEvent copyWith({AnalyticsProperties? properties}) {
    return AnalyticsEvent(
      type: type,
      event: event,
      messageId: messageId,
      anonymousId: anonymousId,
      userId: userId,
      groupId: groupId,
      previousId: previousId,
      sessionId: sessionId,
      properties: properties ?? this.properties,
      traits: traits,
      context: context,
      timestamp: timestamp,
      schemaVersion: schemaVersion,
    );
  }

  /// Canonical wire JSON — key order/shape identical to the TS envelope.
  Map<String, Object?> toJson() {
    final out = <String, Object?>{
      'type': type.wire,
      'messageId': messageId,
      'anonymousId': anonymousId,
      'sessionId': sessionId,
    };
    if (event != null) out['event'] = event;
    if (userId != null) out['userId'] = userId;
    if (groupId != null) out['groupId'] = groupId;
    if (previousId != null) out['previousId'] = previousId;
    if (properties != null) out['properties'] = properties;
    if (traits != null) out['traits'] = traits;
    out['context'] = context.toJson();
    out['timestamp'] = timestamp;
    out['schemaVersion'] = schemaVersion;
    return out;
  }
}

/// Context handed to `sink.init`.
class SinkInitContext {
  const SinkInitContext({required this.app, required this.env, this.endpoint});

  final String app;
  final String env;
  final String? endpoint;
}

/// Context handed to every `sink.deliver`.
class SinkDeliverContext {
  const SinkDeliverContext({required this.unload});

  /// True on the unload/background path — sinks should prefer a beacon.
  final bool unload;
}

/// Sink SPI — implemented by adapter packages (GA4, Azure, PostHog) and by the
/// built-in HTTP sink. A sink declares the consent categories it requires; the
/// router will not deliver to a sink whose categories are not all granted.
abstract class AnalyticsSink {
  /// Stable sink identifier.
  String get name;

  /// Consent categories this sink requires (e.g. `['analytics']`).
  List<String>? get consentCategories;

  /// Called once before the first delivery.
  FutureOr<void> init(SinkInitContext ctx) {}

  /// Deliver a batch of canonical events.
  FutureOr<void> deliver(List<AnalyticsEvent> batch, SinkDeliverContext ctx);

  /// Flush any buffered state (best-effort).
  FutureOr<void> flush() {}

  /// Release resources on reset()/shutdown.
  FutureOr<void> shutdown() {}
}

/// Cross-platform persistence SPI. The default picks platform storage
/// (web localStorage / IO file) internally — invisible to the consumer.
abstract class AnalyticsStorage {
  String? get(String key);
  void set(String key, String value);
  void remove(String key);
}

/// Session engine configuration.
class SessionConfig {
  const SessionConfig({
    this.timeoutMs,
    this.resetOnCampaign,
    this.storage,
    this.storageKey,
  });

  /// Inactivity timeout in ms before a new session is minted. GA4 = 30 min.
  final int? timeoutMs;

  /// Reset the session when a campaign/utm change is detected.
  final bool? resetOnCampaign;

  /// Persistence backend; defaults to platform storage → memory.
  final AnalyticsStorage? storage;

  /// Storage key namespace.
  final String? storageKey;
}

/// Identity engine configuration.
class IdentityConfig {
  const IdentityConfig({this.storage, this.storageKey});

  final AnalyticsStorage? storage;
  final String? storageKey;
}

/// Consent gate configuration.
class ConsentConfig {
  const ConsentConfig({this.granted, this.strict});

  /// Categories granted at boot.
  final List<String>? granted;

  /// If true, an event is dropped entirely when NO sink can receive it.
  /// If false (default), events are still buffered until consent is granted.
  final bool? strict;
}

/// Consent gate runtime API.
abstract class ConsentApi {
  void grant(List<String> categories);
  void revoke(List<String> categories);
  List<String> granted();
  bool isGranted(String category);
}

/// Session runtime API.
abstract class SessionApi {
  /// Current session id (mints one lazily if none active).
  String id();

  /// Force-start a new session, returning the new id.
  String start();

  /// End the current session.
  void end();

  /// Attach arbitrary session-scoped properties.
  void set(AnalyticsProperties props);
}

/// HTTP transport SPI — the built-in HTTP sink talks to this, never to a
/// concrete client. The default resolves a platform transport (dart:io /
/// browser) via conditional import — platform difference is internal.
abstract class HttpTransport {
  /// Issue a POST. Returns the HTTP status code. Throw to signal a network
  /// error (the sink treats a throw as transient → retry).
  Future<int> post({
    required String url,
    required Map<String, String> headers,
    required String body,
  });

  /// Best-effort beacon (unload/background path). Returns true if accepted.
  bool beacon({required String url, required String body});
}

/// Built-in HTTP sink options (Segment HTTP Tracking API wire contract).
class HttpSinkOptions {
  const HttpSinkOptions({
    required this.endpoint,
    required this.writeKey,
    this.maxRetries = 3,
    this.backoffBaseMs = 500,
    this.transport,
    this.consentCategories = const ['analytics'],
    this.maxBatchBytes = 500000,
    this.maxEventBytes = 32000,
    this.sleep,
  });

  /// Base endpoint; events POST to `{endpoint}/v{schemaVersion}/batch`.
  final String endpoint;

  /// Write key — sent as `Authorization: Basic base64(writeKey:)`.
  final String writeKey;

  /// Max retries for 429/5xx (exponential backoff). Default 3.
  final int maxRetries;

  /// Base backoff delay in ms. Default 500.
  final int backoffBaseMs;

  /// Injected transport (defaults to the resolved platform transport).
  final HttpTransport? transport;

  /// Consent categories this sink requires. Default `['analytics']`.
  final List<String> consentCategories;

  /// Soft per-batch byte cap (Segment ≈ 500KB). Default 500000.
  final int maxBatchBytes;

  /// Soft per-event byte cap (Segment ≈ 32KB). Default 32000.
  final int maxEventBytes;

  /// Injected sleep (for deterministic backoff tests).
  final Future<void> Function(Duration)? sleep;
}

/// `createAnalytics` configuration.
class AnalyticsConfig {
  const AnalyticsConfig({
    required this.app,
    required this.env,
    this.endpoint,
    this.writeKey,
    this.enabled = true,
    this.sampleRate = 1,
    this.redactKeys = const [],
    this.sinks = const [],
    this.session,
    this.identity,
    this.consent,
    this.preset,
    this.batchSize = 20,
    this.flushIntervalMs = 10000,
    this.httpTransport,
    this.random,
    this.now,
  });

  /// Product/app identifier (stamped into context.app).
  final String app;

  /// Environment, e.g. 'development' | 'production'. Drives presets.
  final String env;

  /// When set, a built-in HTTP sink is auto-registered to this endpoint.
  final String? endpoint;

  /// Write key for the auto-registered HTTP sink.
  final String? writeKey;

  /// Kill switch — when false, a tree-shakeable noop is returned. Default true.
  final bool enabled;

  /// 0..1 sampling rate applied per top-level call. Default 1.
  final double sampleRate;

  /// Extra property/trait keys to redact (in addition to the PII deny-list).
  final List<String> redactKeys;

  /// Explicit sinks (in addition to / instead of the auto HTTP sink).
  final List<AnalyticsSink> sinks;

  /// Session engine config.
  final SessionConfig? session;

  /// Identity engine config.
  final IdentityConfig? identity;

  /// Consent gate config.
  final ConsentConfig? consent;

  /// Force a preset. Defaults: env=='production' → 'prod', else 'dev'.
  final String? preset;

  /// Batch size before an automatic flush (prod). Default 20.
  final int batchSize;

  /// Auto-flush interval in ms (prod). Default 10000.
  final int flushIntervalMs;

  /// Transport for the auto-registered HTTP sink (test injection).
  final HttpTransport? httpTransport;

  /// Injected RNG for deterministic sampling tests (0..1).
  final double Function()? random;

  /// Injected clock (epoch ms) for deterministic session tests.
  final int Function()? now;
}

/// Options accepted by every top-level call.
class CallOptions {
  const CallOptions({this.timestamp, this.context});

  /// Per-call timestamp override (ISO-8601).
  final String? timestamp;

  /// Per-call context overrides (shallow-merged into context.extra).
  final Map<String, Object?>? context;
}

/// The public analytics surface returned by `createAnalytics`.
abstract class Analytics {
  void track(
    String event, [
    AnalyticsProperties? properties,
    CallOptions? opts,
  ]);
  void identify(
    String userId, [
    AnalyticsProperties? traits,
    CallOptions? opts,
  ]);
  void page([String? name, AnalyticsProperties? properties, CallOptions? opts]);
  void screen([
    String? name,
    AnalyticsProperties? properties,
    CallOptions? opts,
  ]);
  void group(String groupId, [AnalyticsProperties? traits, CallOptions? opts]);
  void alias(String userId, [String? previousId, CallOptions? opts]);

  /// Analytics-session API (NOT replay).
  SessionApi get session;

  /// Consent gate API.
  ConsentApi get consent;

  /// Persistent, non-PII anonymous id.
  String anonymousId();

  /// Current opaque user id (if identified).
  String? userId();

  /// Derive a child that merges extra context into every event.
  Analytics withContext(Map<String, Object?> context);

  /// Register an additional sink at runtime.
  void addSink(AnalyticsSink sink);

  /// Remove a sink by name.
  void removeSink(String name);

  /// Registered sink names.
  List<String> get sinks;

  /// Flush all sinks (and the internal batch).
  Future<void> flush();

  /// Reset identity + session (privacy-safe logout). Mints a fresh
  /// anonymousId and ends the session.
  void reset();

  /// Whether this is a live collector (false for the noop).
  bool get enabled;
}
