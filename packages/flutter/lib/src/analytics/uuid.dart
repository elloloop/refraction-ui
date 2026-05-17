/// uuidv4 — RFC 4122 version 4 UUID.
///
/// Uses `Random.secure()` when available and degrades to a non-secure
/// `Random` only as a last resort. No external dependency by design (this is
/// the neutral router; the package ships zero deps beyond Flutter).
library;

import 'dart:math';

Random _rng() {
  try {
    return Random.secure();
  } catch (_) {
    return Random();
  }
}

/// Generate an RFC 4122 v4 UUID.
String uuidv4([Random? random]) {
  final rng = random ?? _rng();
  final bytes = List<int>.generate(16, (_) => rng.nextInt(256));

  // Per RFC 4122 §4.4: set version (4) and variant (10xx) bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  String hex(int b) => b.toRadixString(16).padLeft(2, '0');

  final b = bytes.map(hex).toList();
  return '${b[0]}${b[1]}${b[2]}${b[3]}-'
      '${b[4]}${b[5]}-'
      '${b[6]}${b[7]}-'
      '${b[8]}${b[9]}-'
      '${b[10]}${b[11]}${b[12]}${b[13]}${b[14]}${b[15]}';
}

/// RFC 4122 v4 shape matcher (case-insensitive).
final RegExp uuidV4Re = RegExp(
  r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  caseSensitive: false,
);

/// True when [value] is a well-formed v4 UUID.
bool isUuidV4(Object? value) {
  return value is String && uuidV4Re.hasMatch(value);
}
