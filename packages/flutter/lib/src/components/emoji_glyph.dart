import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:lottie/lottie.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// The package refraction_ui ships its emoji art under.
const String _package = 'refraction_ui';

/// The bundled-asset key of [emoji]'s animated Noto Lottie, as refraction_ui
/// names the files under `assets/emoji_animated/` (`1f525` for 🔥,
/// `2764` for ❤️): its code points in lowercase hex, joined with `_`, with
/// the emoji presentation selector (U+FE0F) left out.
String refractionAnimatedEmojiKey(String emoji) => emoji.runes
    .where((rune) => rune != 0xFE0F)
    .map((rune) => rune.toRadixString(16))
    .join('_');

/// Which emoji refraction_ui bundles an animation for, read once from the
/// app's asset manifest — so an emoji refraction_ui starts animating in a
/// later release animates here with no change on this side.
class RefractionAnimatedEmoji {
  RefractionAnimatedEmoji._();

  static Expando<Future<Set<String>>> _keys = Expando();

  /// The bundled animation keys (see [refractionAnimatedEmojiKey]).
  static Future<Set<String>> keys([AssetBundle? bundle]) {
    final source = bundle ?? rootBundle;
    return _keys[source] ??= _load(source);
  }

  static Future<Set<String>> _load(AssetBundle bundle) async {
    const prefix = 'packages/$_package/assets/emoji_animated/';
    const suffix = '.json';
    final manifest = await AssetManifest.loadFromAssetBundle(bundle);
    return {
      for (final asset in manifest.listAssets())
        if (asset.startsWith(prefix) && asset.endsWith(suffix))
          asset.substring(prefix.length, asset.length - suffix.length),
    };
  }

  /// Forgets the loaded manifest (tests that swap the asset bundle).
  @visibleForTesting
  static void reset() => _keys = Expando();
}

/// One emoji drawn from refraction_ui's bundled art, never from the
/// platform's emoji font: the animated Noto Lottie when refraction_ui ships
/// one for it, otherwise the uniform Twemoji glyph (and the native glyph
/// only for an emoji neither set has). Every emoji takes the same path, so
/// one that gains an animation upstream animates here too.
///
/// The art is fetched when the glyph first builds, so on the web an emoji
/// nobody has opened yet costs nothing. Decorative: the caller says what it
/// means to a screen reader.
///
/// ```dart
/// RefractionEmojiGlyph(emoji: '🎉', size: 32)
/// ```
class RefractionEmojiGlyph extends StatefulWidget {
  /// The emoji, e.g. `'🫡'`.
  final String emoji;

  /// The square the glyph fills.
  final double size;

  /// Whether an animated emoji plays at all. When the platform asks for
  /// reduced motion it never does.
  final bool animate;

  /// Whether an animated emoji loops; otherwise it plays once and rests on
  /// its opening pose (a Noto animation's last frame can be empty).
  final bool repeat;

  /// Creates a [RefractionEmojiGlyph].
  const RefractionEmojiGlyph({
    super.key,
    required this.emoji,
    this.size = 24,
    this.animate = true,
    this.repeat = true,
  });

  @override
  State<RefractionEmojiGlyph> createState() => _RefractionEmojiGlyphState();
}

class _RefractionEmojiGlyphState extends State<RefractionEmojiGlyph>
    with SingleTickerProviderStateMixin {
  late Future<Set<String>> _animated;
  late final AnimationController _motion;
  bool _reducedMotion = false;

  @override
  void initState() {
    super.initState();
    _motion = AnimationController(vsync: this);
  }

  @override
  void dispose() {
    _motion.dispose();
    super.dispose();
  }

  void _syncPlayback() {
    if (_motion.duration == null) return;
    if (!widget.animate || _reducedMotion) {
      _motion.stop();
      _motion.value = 0;
    } else if (widget.repeat) {
      if (!_motion.isAnimating) _motion.repeat();
    } else {
      _motion.forward(from: 0).whenCompleteOrCancel(() {
        if (mounted && !_motion.isAnimating) _motion.value = 0;
      });
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _animated = RefractionAnimatedEmoji.keys(DefaultAssetBundle.of(context));
    _reducedMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    _syncPlayback();
  }

  @override
  void didUpdateWidget(covariant RefractionEmojiGlyph oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.emoji != widget.emoji) {
      _motion.stop();
      _motion.value = 0;
      _motion.duration = null;
    } else if (oldWidget.repeat != widget.repeat) {
      _motion.stop();
    }
    if (oldWidget.animate != widget.animate ||
        oldWidget.repeat != widget.repeat) {
      _syncPlayback();
    }
  }

  Widget _still(BuildContext context) {
    final artwork = twemojiEmojiRenderer(
      context,
      EmojiEntry(
        emoji: widget.emoji,
        name: widget.emoji,
        category: EmojiCategory.symbols,
      ),
      widget.size,
    );
    return SizedBox.square(
      dimension: widget.size,
      // Twemoji's monochrome plus is fixed charcoal; it disappears on dark
      // chat surfaces. Tint only this signal, preserving multicolored artwork.
      child: widget.emoji == '➕'
          ? ColorFiltered(
              colorFilter: ColorFilter.mode(
                context.refractionTheme.colors.foreground,
                BlendMode.srcIn,
              ),
              child: artwork,
            )
          : artwork,
    );
  }

  @override
  Widget build(BuildContext context) {
    final key = refractionAnimatedEmojiKey(widget.emoji);
    return ExcludeSemantics(
      child: FutureBuilder<Set<String>>(
        future: _animated,
        builder: (context, snapshot) {
          final animated = snapshot.data?.contains(key) ?? false;
          if (!animated) return _still(context);
          return Lottie.asset(
            'assets/emoji_animated/$key.json',
            package: _package,
            width: widget.size,
            height: widget.size,
            controller: _motion,
            onLoaded: (composition) {
              _motion.duration = composition.duration;
              _syncPlayback();
            },
            errorBuilder: (context, error, stackTrace) => _still(context),
          );
        },
      ),
    );
  }
}
