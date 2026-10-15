import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';
import 'package:refraction_ui/refraction_ui.dart';

class EmojiAssets extends CachingAssetBundle {
  EmojiAssets(this.key);
  final String key;
  @override
  Future<ByteData> load(String asset) {
    if (asset == 'AssetManifest.bin') {
      final path = 'packages/refraction_ui/assets/emoji_animated/$key.json';
      return Future.value(
        const StandardMessageCodec().encodeMessage({
          path: [
            {'asset': path},
          ],
        })!,
      );
    }
    const prefix = 'packages/refraction_ui/';
    return rootBundle.load(
      asset.startsWith(prefix) ? asset.substring(prefix.length) : asset,
    );
  }
}

Widget app(
  AssetBundle bundle, {
  required bool animate,
  bool reduced = false,
  bool dark = false,
}) => MaterialApp(
  home: DefaultAssetBundle(
    bundle: bundle,
    child: RefractionTheme(
      data: dark
          ? RefractionThemeData.minimalDark()
          : RefractionThemeData.minimalLight(),
      child: MediaQuery(
        data: MediaQueryData(disableAnimations: reduced),
        child: RefractionEmojiGlyph(emoji: '🎉', animate: animate),
      ),
    ),
  ),
);

void main() {
  tearDown(RefractionAnimatedEmoji.reset);
  test(
    'animation keys preserve ZWJ and skin tone while removing presentation selector',
    () {
      expect(refractionAnimatedEmojiKey('❤️'), '2764');
      expect(refractionAnimatedEmojiKey('👩🏽‍💻'), '1f469_1f3fd_200d_1f4bb');
    },
  );
  test(
    'manifests are cached per asset bundle without crossing host bundles',
    () async {
      final first = EmojiAssets('1f389');
      final second = EmojiAssets('2764');
      expect(await RefractionAnimatedEmoji.keys(first), {'1f389'});
      expect(await RefractionAnimatedEmoji.keys(second), {'2764'});
      expect(
        RefractionAnimatedEmoji.keys(first),
        same(RefractionAnimatedEmoji.keys(first)),
      );
    },
  );
  for (final dark in [false, true]) {
    testWidgets(
      'motion responds to prop and reduced-motion changes dark=$dark',
      (tester) async {
        final bundle = EmojiAssets('1f389');
        await tester.pumpWidget(app(bundle, animate: false, dark: dark));
        await tester.pumpAndSettle();
        expect(find.byType(Lottie), findsOneWidget);
        final controller = tester
            .widget<Lottie>(find.byType(Lottie))
            .controller!;
        expect(controller.isAnimating, isFalse);
        await tester.pumpWidget(app(bundle, animate: true, dark: dark));
        await tester.pump(const Duration(milliseconds: 100));
        expect(controller.isAnimating, isTrue);
        await tester.pumpWidget(
          app(bundle, animate: true, reduced: true, dark: dark),
        );
        await tester.pump();
        expect(controller.isAnimating, isFalse);
        expect(controller.value, 0);
        await tester.pumpWidget(app(bundle, animate: true, dark: dark));
        await tester.pump(const Duration(milliseconds: 100));
        expect(controller.isAnimating, isTrue);
        await tester.pumpWidget(app(bundle, animate: false, dark: dark));
        await tester.pump();
        expect(controller.isAnimating, isFalse);
        expect(tester.takeException(), isNull);
        await tester.pumpWidget(const SizedBox());
      },
    );
  }
}
