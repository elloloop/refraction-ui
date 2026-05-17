/// Session engine.
///
/// A session is a span of continuous activity. It ends after `timeoutMs` of
/// inactivity (GA4 parity, default 30 min) or when a *new* campaign is
/// detected. State is persisted via the storage SPI so it survives relaunch
/// (and is shared cross-isolate when the same storage is injected).
library;

import 'dart:convert';

import 'storage.dart';
import 'types.dart';
import 'uuid.dart';

/// GA4 parity: 30 minutes of inactivity ends a session.
const int defaultSessionTimeoutMs = 30 * 60 * 1000;

const String _defaultKey = 'rfx:analytics:session';

/// Recognised campaign params (UTM + common click ids). GA4 parity.
const List<String> _campaignParams = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
];

/// Derive a stable campaign fingerprint from a URL's query string. A change in
/// this fingerprint (a *new* campaign, not its absence) forces a new session,
/// matching GA4's "campaign change resets the session" behaviour.
String? campaignFingerprint(String? search) {
  if (search == null || search.isEmpty) return null;
  var qs = search;
  final q = qs.indexOf('?');
  if (q != -1) qs = qs.substring(q + 1);

  final params = <String, String>{};
  for (final pair in qs.split('&')) {
    if (pair.isEmpty) continue;
    final eq = pair.indexOf('=');
    if (eq == -1) {
      params[Uri.decodeQueryComponent(pair)] = '';
    } else {
      final k = Uri.decodeQueryComponent(pair.substring(0, eq));
      final v = Uri.decodeQueryComponent(pair.substring(eq + 1));
      params[k] = v;
    }
  }

  final pairs = <String>[];
  for (final p in _campaignParams) {
    final v = params[p];
    if (v != null && v.isNotEmpty) pairs.add('$p=$v');
  }
  return pairs.isEmpty ? null : pairs.join('&');
}

class _PersistedSession {
  _PersistedSession({
    required this.id,
    required this.lastActivity,
    this.campaign,
    this.props,
  });

  final String id;
  int lastActivity;
  final String? campaign;
  AnalyticsProperties? props;

  Map<String, Object?> toJson() => {
    'id': id,
    'lastActivity': lastActivity,
    if (campaign != null) 'campaign': campaign,
    if (props != null) 'props': props,
  };

  static _PersistedSession? tryParse(String raw) {
    try {
      final m = jsonDecode(raw);
      if (m is Map && m['id'] is String) {
        return _PersistedSession(
          id: m['id'] as String,
          lastActivity: (m['lastActivity'] as num?)?.toInt() ?? 0,
          campaign: m['campaign'] as String?,
          props: (m['props'] as Map?)?.cast<String, Object?>(),
        );
      }
    } catch (_) {
      // corrupt — treat as none
    }
    return null;
  }
}

/// Session engine. Mirrors `createSession` from `@refraction-ui/analytics`.
class Session {
  Session(SessionConfig? config, {int Function()? now})
    : _storage = resolveStorage(config?.storage),
      _key = config?.storageKey ?? _defaultKey,
      _timeoutMs = config?.timeoutMs ?? defaultSessionTimeoutMs,
      _resetOnCampaign = config?.resetOnCampaign ?? true,
      _now = now ?? (() => DateTime.now().millisecondsSinceEpoch);

  final AnalyticsStorage _storage;
  final String _key;
  final int _timeoutMs;
  final bool _resetOnCampaign;
  final int Function() _now;

  _PersistedSession? _read() {
    final raw = _storage.get(_key);
    if (raw == null) return null;
    return _PersistedSession.tryParse(raw);
  }

  void _write(_PersistedSession s) {
    _storage.set(_key, jsonEncode(s.toJson()));
  }

  _PersistedSession _mint(String? campaign) {
    final s = _PersistedSession(
      id: uuidv4(),
      lastActivity: _now(),
      campaign: campaign,
    );
    _write(s);
    return s;
  }

  /// Return the live session, creating/rotating it as required by the
  /// inactivity timeout and (optionally) a campaign change.
  _PersistedSession _ensure([String? campaign]) {
    final existing = _read();
    final t = _now();
    if (existing == null) return _mint(campaign);

    if (t - existing.lastActivity > _timeoutMs) {
      return _mint(campaign);
    }
    if (_resetOnCampaign && campaign != null && existing.campaign != campaign) {
      return _mint(campaign);
    }
    return existing;
  }

  /// Get the current session id, rotating if expired.
  String id([String? campaign]) => _ensure(campaign).id;

  /// Force a brand-new session.
  String start([String? campaign]) => _mint(campaign).id;

  /// End the current session (next id() mints a fresh one).
  void end() => _storage.remove(_key);

  /// Touch activity so the inactivity window slides forward.
  String touch([String? campaign]) {
    final s = _ensure(campaign);
    s.lastActivity = _now();
    _write(s);
    return s.id;
  }

  /// Attach/merge session-scoped properties.
  void set(AnalyticsProperties props) {
    final s = _ensure();
    s.props = {...(s.props ?? {}), ...props};
    _write(s);
  }

  /// Read session-scoped properties (null when none).
  AnalyticsProperties? props() => _read()?.props;
}
