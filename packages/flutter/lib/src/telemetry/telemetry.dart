/// Refraction UI telemetry — a 1:1 Dart port of the `@refraction-ui/logger`
/// public surface. Same names and semantics: [createTelemetry], the
/// vendor-neutral [TelemetrySink], dev/prod presets, a tree-shakeable noop
/// kill switch, child loggers, spans, and redaction.
///
/// Uniform across every Flutter target (web / android / ios / desktop): the
/// public API and package structure are identical; platform differences
/// (app-exit flush wiring, vendor engine) are internal details behind one
/// surface via conditional imports. The console engine is the default;
/// the consumer supplies their own collector endpoint (data goes to *their*
/// endpoint, never refraction-ui's). The OTLP/vendor wire envelope is
/// identical to the web library.
///
/// ```dart
/// import 'package:refraction_ui/refraction_ui.dart';
///
/// final telemetry = createTelemetry(const TelemetryConfig(
///   app: 'interview-service',
///   env: TelemetryEnv.production,
///   endpoint: 'https://collector.example/ingest', // optional
///   sampleRate: 0.25,                              // optional
///   redactKeys: ['password', 'token'],             // optional
/// ));
///
/// telemetry.warn('rate limited', {'route': '/v1/answer'});
///
/// final session = telemetry.child({'sessionId': 's-123'});
/// final turn = session.child({'turnId': 't-7'});
///
/// final span = turn.startSpan('llm-call', {'model': 'gpt'});
/// try {
///   // ... async work ...
///   span.end();
/// } catch (err) {
///   span.end(SpanEndOptions(error: err));
/// }
///
/// await telemetry.flush();
/// ```
library;

// Types (vendor-neutral — no Faro/Grafana/OTel type is exported).
export 'types.dart'
    show
        LogLevel,
        LogLevelName,
        LEVEL_ORDER,
        LogContext,
        LogRecord,
        SpanRecord,
        SpanError,
        TelemetrySink,
        TelemetryEnv,
        TelemetryEnvName,
        TelemetryConfig,
        SpanEndOptions,
        Logger,
        Span,
        Telemetry;

// Manager.
export 'telemetry_manager.dart' show createTelemetry;

// Presets.
export 'presets.dart' show TelemetryPreset, PRESETS, resolvePreset;

// Built-in transports.
export 'console_sink.dart'
    show
        createConsoleSink,
        ConsoleSinkOptions,
        ConsoleLike,
        logRecordToJson,
        spanRecordToJson;

// Vendor engine (internal abstraction behind TelemetrySink; Wave 1 binding).
export 'faro_engine.dart'
    show
        createFaroSink,
        FaroEngineOptions,
        FaroTransport,
        flattenContext,
        faroLevelName;

// Kill switch.
export 'noop.dart' show createNoopTelemetry;

// Utilities.
export 'redact.dart' show redact;

// Mock sink (for testing).
export 'mock_sink.dart' show createMockSink, MockSinkExtended;

// App-exit flush hook (uniform surface; platform wiring is internal).
export 'lifecycle.dart' show LifecycleHook, LifecycleSubscription;
