/// Consent gate.
///
/// Holds the set of granted consent categories. The router asks the gate, per
/// sink, whether *all* of that sink's required categories are granted before
/// delivering. A sink with no declared categories is always allowed (it is the
/// sink author's responsibility to declare what it needs).
library;

import 'types.dart';

/// Consent gate. Mirrors `createConsent` from `@refraction-ui/analytics`.
class Consent implements ConsentApi {
  Consent(ConsentConfig? config)
    : strict = config?.strict ?? false,
      _granted = {...(config?.granted ?? const <String>[])};

  /// True when at least one sink could receive (used by strict mode).
  final bool strict;
  final Set<String> _granted;

  @override
  void grant(List<String> categories) {
    _granted.addAll(categories);
  }

  @override
  void revoke(List<String> categories) {
    _granted.removeAll(categories);
  }

  @override
  List<String> granted() => _granted.toList();

  @override
  bool isGranted(String category) => _granted.contains(category);

  /// True when every required category is granted (empty list ⇒ allowed).
  bool allows(List<String>? required) {
    if (required == null || required.isEmpty) return true;
    return required.every(_granted.contains);
  }
}
