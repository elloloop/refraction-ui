# Google Play — Data Safety mapping (refraction_ui telemetry, Wave 1)

Release-blocking, MANDATORY store-compliance artifact (epic #225 DESIGN
CLARIFICATION §3). This documents **exactly what the Flutter telemetry layer
collects** so a consuming app can complete the Play Console **Data safety**
form and pass review with **zero rejection risk**.

> Data goes to the **consuming app's own collector endpoint** (configured via
> `TelemetryConfig.endpoint`), never to a refraction-ui server. The package
> only *captures and queues*; the consumer chooses the destination.

## Does this layer collect or share data?

| Question (Play form) | Answer for this layer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** — diagnostics only (see table). |
| Is all collected data encrypted in transit? | The consumer's collector endpoint **must** be HTTPS (the package does not downgrade). |
| Do you provide a way to request deletion? | Consumer-owned (their collector / backend). |
| Is data collection optional? | Yes — `enabled: false` disables it entirely (tree-shakeable no-op); production sampling/consent gating applies. |

## Data types collected by THIS layer

| Play data type | Collected? | What | Why | Linked to user? | Used for tracking? |
|---|---|---|---|---|---|
| **Crash logs** (App activity → Crash logs / Diagnostics) | Yes | Exception type, message, stack trace; persisted once for crash-on-next-launch | App functionality / diagnostics | No (no identifier attached by this layer) | No |
| **Diagnostics** (Performance / Other) | Yes | Log records & span durations the app emits, post-redaction | App functionality / performance | No | No |
| **Device or other IDs** (Advertising ID, etc.) | **No** | The package never reads the Advertising ID / GAID / IMEI / MAC / serial | — | — | — |
| **App info & performance → Other app performance data** | Yes | OS name+version, coarse device model (`"Android"`), locale, app version/build (consumer-supplied) | Diagnostics: bucket telemetry by platform | No | No |
| Personal info / Location / Contacts / Photos / Messages / Audio / Files | **No** | Not accessed by this layer | — | — | — |

### Notes for the consuming app's submission

1. **Redaction is on the app.** This layer ships `redact()` and honors
   `redactKeys`, but if the *app* puts PII in log context that PII is
   collected. Declare accordingly; prefer redacting it.
2. **Advertising ID:** if the consuming app *separately* attaches an ad ID it
   MUST go through `TelemetryConsent` (see `ATT_CONSENT.md`) and the app must
   then add **Advertising ID** to its Data safety form. By default this layer
   adds nothing.
3. **No tracking.** Nothing here joins data across apps/sites or shares with
   data brokers. Answer "Used for tracking? No" for every row above.
4. **Storage:** the offline queue is a namespaced file under the app's
   private temp dir (Android internal storage) — not user-accessible, not
   shared, cleared once delivered.
