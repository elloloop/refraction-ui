/// Durable-store fallback for platforms with neither `dart:io` nor web
/// interop. Returns null so the resolver uses the in-memory store.
library;

import 'durable_store.dart';

DurableStore? createPlatformDurableStore() => null;
