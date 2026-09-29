// Deliberately no testWidgets/ensureInitialized: this public controller can be
// used by hosts before runApp, without touching the rendering binding.
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  test(
    'standalone controller notifications remain synchronous without a binding',
    () {
      final controller = RefractionComposerController();
      addTearDown(controller.dispose);
      final drafts = <String>[];
      controller.addListener(() => drafts.add(controller.state.value));
      controller.insertTextAtCursor('standalone draft');
      expect(drafts, ['standalone draft']);
      controller.core.setDisabled(true);
      expect(controller.state.canSend, isFalse);
      expect(drafts, ['standalone draft', 'standalone draft']);
    },
  );
}
