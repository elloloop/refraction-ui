/// Native-context fallback for platforms with neither `dart:io` nor web
/// interop (e.g. a bare unit-test VM). Returns an empty map — the overrides
/// path still works.
library;

/// No platform probes available — empty context.
Map<String, Object?> collectNativeContext() => <String, Object?>{};
