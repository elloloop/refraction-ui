# App Tracking Transparency (ATT) / IDFA + consent sequencing

Release-blocking store-compliance artifact (epic #225 §3). Explains how the
Flutter telemetry layer guarantees **no identifiers before consent** and how
a consuming app must sequence the iOS ATT prompt.

## What refraction_ui does and does NOT do

- **Does NOT** read the IDFA / IDFV / advertising ID. No `AdSupport`, no
  `app_tracking_transparency` dependency. The native context
  (`native_context_io.dart`) is OS name/version + coarse model + locale +
  app version/build only — **nothing identifying**.
- **Does NOT** present the ATT prompt (that is the app's call, on the app's
  schedule, with the app's `NSUserTrackingUsageDescription`).
- **Does** provide `TelemetryConsent`, a gate that makes correct sequencing
  the default and makes "an ID set before consent" structurally impossible.

## Required sequence (iOS)

```
1. App launches.
   createTelemetry(...) + installMobileTelemetry(...)         ← no tracking id
   TelemetryConsent starts in `notDetermined`.
   → telemetry flows with crash/diagnostics ONLY, no IDFA.

2. App decides to ask (its own UX, after first frame, per Apple HIG).
   App calls ATTrackingManager.requestTrackingAuthorization
   (its own plugin/native code).

3. App reports the result back:
   consent.setTrackingAuthorized(TrackingState.authorized | .denied)

4. ONLY if authorized:
   final idfa = <app reads IDFA via its own plugin>;
   consent.attachTrackingId(idfa);   // guarded: no-op unless authorized
   → from now on consent.trackingContext() carries {'trackingId': idfa}
     and the app can merge it into telemetry context.

5. If the user later revokes (Settings):
   consent.setTrackingAuthorized(TrackingState.denied)
   → trackingId is cleared immediately; nothing further is emitted.
```

`attachTrackingId()` returns `false` and stores nothing while the state is
`notDetermined`/`denied` — a programming mistake cannot leak an ID early.

## Android / web / desktop

There is no ATT prompt. Construct
`TelemetryConsent(initial: TrackingState.notApplicable)`; tracking IDs remain
disallowed until the app explicitly authorizes via category/marketing consent
and calls `setTrackingAuthorized(authorized)`. The API is identical — no
per-platform consumer branching (uniform surface, epic #225 §2).

## Checklist for the consuming app

- [ ] iOS `Info.plist` has `NSUserTrackingUsageDescription` **only if** the
      app attaches an ad ID. If it does not, do not add it (and keep
      `NSPrivacyTracking=false` in the merged `PrivacyInfo.xcprivacy`).
- [ ] ATT prompt shown after first frame, never at the very first launch
      instant, never before any value.
- [ ] No call to `attachTrackingId` before `setTrackingAuthorized(authorized)`
      (the gate enforces this; the check is a belt-and-braces).
- [ ] If an ad ID is attached, the app's iOS privacy manifest +
      Play Data Safety form are updated to declare it (see the sibling docs).
