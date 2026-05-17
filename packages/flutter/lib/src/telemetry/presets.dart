/// Behavior presets — a 1:1 port of `@refraction-ui/logger` `presets.ts`.
library;

import 'types.dart';

/// Behavior derived from [TelemetryConfig.env]. The manager reads these
/// fields to decide level filtering, batching, sampling, and flush triggers.
class TelemetryPreset {
  /// Creates a [TelemetryPreset].
  const TelemetryPreset({
    required this.minLevel,
    required this.batch,
    required this.batchSize,
    required this.sampleRate,
    required this.pretty,
    required this.beaconFlush,
  });

  /// Records strictly below this level are dropped.
  final LogLevel minLevel;

  /// Buffer records and deliver in batches instead of synchronously.
  final bool batch;

  /// Batch size before an automatic flush (only when [batch]).
  final int batchSize;

  /// Default sample rate when config omits `sampleRate`.
  final double sampleRate;

  /// Pretty, single-line console output (vs. structured JSON).
  final bool pretty;

  /// Flush buffered records on app-exit / background signals, using a
  /// beacon-style delivery when available.
  ///
  /// On the web this maps to `pagehide` + `visibilitychange` (hidden);
  /// on mobile/desktop it maps to the equivalent app-lifecycle background
  /// transition — handled internally behind one identical surface.
  final bool beaconFlush;

  /// Defensive copy so callers can't mutate a shared preset.
  TelemetryPreset copy() => TelemetryPreset(
    minLevel: minLevel,
    batch: batch,
    batchSize: batchSize,
    sampleRate: sampleRate,
    pretty: pretty,
    beaconFlush: beaconFlush,
  );
}

/// - development: sync, pretty, level=debug, no batching, sample everything.
/// - production: batched + sampled, level>=warn, beacon flush on exit.
///
/// The screaming-case name is intentional — it mirrors `PRESETS` in
/// `@refraction-ui/logger` for 1:1 API parity.
// ignore: constant_identifier_names
const Map<TelemetryEnv, TelemetryPreset> PRESETS =
    <TelemetryEnv, TelemetryPreset>{
      TelemetryEnv.development: TelemetryPreset(
        minLevel: LogLevel.debug,
        batch: false,
        batchSize: 1,
        sampleRate: 1,
        pretty: true,
        beaconFlush: false,
      ),
      TelemetryEnv.production: TelemetryPreset(
        minLevel: LogLevel.warn,
        batch: true,
        batchSize: 20,
        sampleRate: 0.25,
        pretty: false,
        beaconFlush: true,
      ),
    };

/// Resolve the preset for an env (defensive copy so callers can't mutate it).
TelemetryPreset resolvePreset(TelemetryEnv env) => PRESETS[env]!.copy();
