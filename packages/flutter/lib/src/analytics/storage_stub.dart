/// Default-storage stub for platforms with neither dart:io nor dart:html.
/// Returns null so the resolver falls back to in-memory storage.
library;

import 'types.dart';

AnalyticsStorage? createPlatformStorage() => null;
