import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('redact (parity with redact.ts)', () {
    test('empty keys returns the value unchanged (same identity)', () {
      final input = <String, Object?>{'a': 1};
      expect(identical(redact(input, const <String>[]), input), isTrue);
    });

    test('case-insensitive key matching', () {
      final out = redact(
        <String, Object?>{'Password': 'p', 'TOKEN': 't', 'keep': 'v'},
        <String>['password', 'token'],
      );
      expect(out['Password'], '[REDACTED]');
      expect(out['TOKEN'], '[REDACTED]');
      expect(out['keep'], 'v');
    });

    test('deep redaction through nested maps and lists', () {
      final out = redact(
        <String, Object?>{
          'outer': <String, Object?>{
            'secret': 'x',
            'list': <Object?>[
              <String, Object?>{'secret': 'y', 'ok': 1},
            ],
          },
        },
        <String>['secret'],
      );
      final outer = out['outer']! as Map;
      expect(outer['secret'], '[REDACTED]');
      final list = outer['list']! as List;
      final item = list.first as Map;
      expect(item['secret'], '[REDACTED]');
      expect(item['ok'], 1);
    });

    test('does not mutate the input', () {
      final input = <String, Object?>{'password': 'p'};
      redact(input, <String>['password']);
      expect(input['password'], 'p');
    });

    test('cycle-safe', () {
      final cyclic = <String, Object?>{'a': 1};
      cyclic['self'] = cyclic;
      final out = redact(cyclic, <String>['nope']);
      expect(out['a'], 1);
      expect(out['self'], '[Circular]');
    });

    test('non-object scalars pass through', () {
      final out = redact(
        <String, Object?>{'n': 5, 'b': true, 's': 'str', 'nil': null},
        <String>['x'],
      );
      expect(out['n'], 5);
      expect(out['b'], true);
      expect(out['s'], 'str');
      expect(out['nil'], isNull);
    });
  });
}
