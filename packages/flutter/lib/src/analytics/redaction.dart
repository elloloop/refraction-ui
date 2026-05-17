/// PII redaction.
///
/// A built-in deny-list of well-known PII key names (email/phone/name and
/// common variants) plus any caller-supplied `redactKeys`. Matching is
/// case-insensitive and substring-based so `userEmail`, `email_address`,
/// `phoneNumber`, `fullName`, etc. are all caught. Redaction recurses into
/// nested maps and lists so PII cannot hide one level down.
library;

import 'types.dart';

/// Built-in PII deny-list (substring, case-insensitive, separator-insensitive).
const List<String> piiDenyList = [
  'email',
  'phone',
  'mobile',
  'firstname',
  'lastname',
  'fullname',
  'givenname',
  'surname',
  'password',
  'passwd',
  'ssn',
  'creditcard',
  'cardnumber',
  'cvv',
  'dob',
  'dateofbirth',
  'address',
];

/// Keys that are PII only as an *exact* (normalised) match.
const List<String> piiExactKeys = ['name'];

/// Replacement token written in place of a redacted value.
const String redacted = '[REDACTED]';

String _normalize(String key) =>
    key.toLowerCase().replaceAll(RegExp(r'[_\-\s]'), '');

/// Build a key matcher from the deny-list + extra keys. `extra` entries match
/// exactly (case-insensitive, normalised); deny-list entries match as
/// substrings.
class Redactor {
  Redactor([List<String> extraKeys = const []])
    : _exact = {...extraKeys.map(_normalize), ...piiExactKeys.map(_normalize)},
      _deny = piiDenyList.map(_normalize).toList();

  final Set<String> _exact;
  final List<String> _deny;

  bool shouldRedact(String key) {
    final n = _normalize(key);
    if (_exact.contains(n)) return true;
    return _deny.any(n.contains);
  }

  Object? _walk(Object? value) {
    if (value is List) {
      return value.map(_walk).toList();
    }
    if (value is Map) {
      final out = <String, Object?>{};
      value.forEach((k, v) {
        final key = '$k';
        out[key] = shouldRedact(key) ? redacted : _walk(v);
      });
      return out;
    }
    return value;
  }

  /// Redact a properties/traits bag (returns a new map).
  AnalyticsProperties? redact(AnalyticsProperties? props) {
    if (props == null) return null;
    return _walk(props) as AnalyticsProperties;
  }
}
