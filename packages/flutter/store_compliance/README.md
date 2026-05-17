# Store compliance — refraction_ui Flutter telemetry (Wave 1)

App Store / Play Store compliance for the telemetry/analytics layer is a
**MANDATORY, release-blocking deliverable** (epic #225 DESIGN CLARIFICATION
§3). Zero store-rejection risk is acceptance criteria. These artifacts cover
exactly the code added in Wave 1 (offline persistence, crash-on-next-launch,
native device/app context, ATT/consent sequencing).

| File | Purpose |
|---|---|
| `ios/PrivacyInfo.xcprivacy` | iOS **privacy-manifest fragment** + **required-reason API** declarations (file-timestamp `C617.1`, defensive UserDefaults `CA92.1`) covering the durable queue / crash store / native-context code. Pure-Dart packages can't embed a binary manifest, so the consuming app **merges** these arrays into its `ios/Runner/PrivacyInfo.xcprivacy`. |
| `PLAY_DATA_SAFETY.md` | Exact Google **Play Data Safety** mapping — what is/ isn't collected, linkage, tracking flags. |
| `ATT_CONSENT.md` | iOS **ATT/IDFA** handling + the **consent sequencing** the app must follow. The package never reads the IDFA and makes "ID before consent" structurally impossible via `TelemetryConsent`. |

### Guarantees that make review safe

- **No advertising / hardware identifiers** are ever read by this package
  (no IDFA/IDFV/GAID/MAC/IMEI/serial). Native context = OS name+version,
  coarse model, locale, consumer-supplied app version/build.
- **No tracking.** `NSPrivacyTracking=false` for this layer; nothing is
  joined across apps or shared with brokers.
- **Consumer endpoint only.** Telemetry is delivered to the consuming app's
  configured collector, never to a refraction-ui server.
- **No new native dependency.** Persistence uses `dart:io` file APIs (the
  same pattern Wave-0 analytics uses), so there is no transitive SDK whose
  own privacy manifest the consumer must also reconcile.
- **Off switch.** `enabled: false` ⇒ tree-shakeable no-op, zero collection.
