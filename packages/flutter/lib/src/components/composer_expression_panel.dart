import 'package:flutter/material.dart';

import '../theme/refraction_theme.dart';
import 'emoji_picker.dart' show EmojiCategory, EmojiData, EmojiEntry;

/// Builds the visual for a single emoji glyph in the built-in expression
/// panel (issue #432 — Nesta feedback).
///
/// Hosts supply this to render emoji through a bundled, cross-platform
/// consistent font (e.g. Noto Color Emoji) instead of the platform font,
/// so the same glyph looks identical on iOS, Android, and web. The default
/// cell renders `emoji` with [ComposerExpressionPanelConfig.emojiTextStyle]
/// over the platform font.
typedef ComposerEmojiCellBuilder =
    Widget Function(BuildContext context, String emoji);

/// Builds the visual for a single sticker in the built-in expression panel.
///
/// Stickers are host content (illustrated characters/scenes) — the package
/// ships no default pack. When omitted, a labelled placeholder chip renders,
/// which keeps widget tests and goldens free of network/asset dependencies.
typedef ComposerStickerCellBuilder =
    Widget Function(BuildContext context, ComposerSticker sticker);

/// A Fitzpatrick skin-tone selection applied to modifiable emoji in the
/// built-in emoji picker. [none] is the default (yellow) presentation.
enum ComposerSkinTone {
  /// No modifier — the default emoji presentation.
  none,

  /// Fitzpatrick type 1–2.
  light,

  /// Fitzpatrick type 3.
  mediumLight,

  /// Fitzpatrick type 4.
  medium,

  /// Fitzpatrick type 5.
  mediumDark,

  /// Fitzpatrick type 6.
  dark,
}

/// Unicode Fitzpatrick modifier scalar for each [ComposerSkinTone].
const Map<ComposerSkinTone, String> _skinToneModifiers = {
  ComposerSkinTone.none: '',
  ComposerSkinTone.light: '\u{1F3FB}',
  ComposerSkinTone.mediumLight: '\u{1F3FC}',
  ComposerSkinTone.medium: '\u{1F3FD}',
  ComposerSkinTone.mediumDark: '\u{1F3FE}',
  ComposerSkinTone.dark: '\u{1F3FF}',
};

/// Swatch colours for the skin-tone selector. These are the standard
/// Fitzpatrick swatches (intrinsic to the emoji spec, not theme tokens).
const Map<ComposerSkinTone, Color> _skinToneSwatches = {
  ComposerSkinTone.none: Color(0xFFFFC83D),
  ComposerSkinTone.light: Color(0xFFFADCBC),
  ComposerSkinTone.mediumLight: Color(0xFFE0BB95),
  ComposerSkinTone.medium: Color(0xFFBF8F68),
  ComposerSkinTone.mediumDark: Color(0xFF9B643D),
  ComposerSkinTone.dark: Color(0xFF594539),
};

/// The base emoji that accept a trailing Fitzpatrick skin-tone modifier.
///
/// Deliberately an allowlist (the hand/person gestures in [EmojiData]):
/// appending a modifier to a non-modifiable base (flags, ZWJ sequences)
/// produces broken glyphs, so [applyComposerSkinTone] only tones these.
const Set<String> composerSkinToneModifiableEmoji = {
  '👋',
  '🤚',
  '🖐',
  '✋',
  '🖖',
  '👌',
  '✌',
  '🤞',
  '🤘',
  '🤙',
  '👈',
  '👉',
  '👆',
  '👇',
  '☝',
  '👍',
  '👎',
  '✊',
  '👊',
  '🤛',
  '🤜',
  '👏',
  '🙌',
  '👐',
  '🤲',
  '🙏',
};

/// Returns [emoji] with the [tone] Fitzpatrick modifier applied, or [emoji]
/// unchanged when [tone] is [ComposerSkinTone.none] or the base does not
/// support skin-tone modifiers (see [composerSkinToneModifiableEmoji]).
///
/// Pure function so the modifier matrix is unit-testable.
String applyComposerSkinTone(String emoji, ComposerSkinTone tone) {
  if (tone == ComposerSkinTone.none) return emoji;
  if (!composerSkinToneModifiableEmoji.contains(emoji)) return emoji;
  return '$emoji${_skinToneModifiers[tone]!}';
}

// -- Jumbo-emoji detection (shared primitive) -----------------------------

/// Counts the grapheme clusters in [text] when it consists solely of emoji
/// (ignoring surrounding/inner whitespace); returns `-1` when any
/// non-emoji character is present, and `0` for empty/whitespace input.
///
/// This is the shared primitive a conversation/bubble renderer uses to
/// decide whether an emoji-only message should render "jumbo". Detection is
/// a pragmatic range heuristic — it is not a full Unicode emoji parser.
int composerEmojiOnlyClusterCount(String text) {
  final trimmed = text.trim();
  if (trimmed.isEmpty) return 0;
  var count = 0;
  for (final cluster in trimmed.characters) {
    if (cluster.trim().isEmpty) continue;
    if (!_isEmojiCluster(cluster)) return -1;
    count++;
  }
  return count;
}

/// Whether [text] is an emoji-only message of `1..maxClusters` clusters —
/// the "jumbo emoji" case (WhatsApp/iMessage render such messages large).
bool composerIsJumboEmoji(String text, {int maxClusters = 3}) {
  final count = composerEmojiOnlyClusterCount(text);
  return count >= 1 && count <= maxClusters;
}

bool _isEmojiCluster(String cluster) {
  var hasPictographic = false;
  for (final rune in cluster.runes) {
    if (_isEmojiScalar(rune)) {
      hasPictographic = true;
      continue;
    }
    if (_isEmojiModifierScalar(rune)) continue;
    return false;
  }
  return hasPictographic;
}

bool _isEmojiScalar(int rune) {
  return (rune >= 0x1F000 && rune <= 0x1FAFF) ||
      (rune >= 0x2600 && rune <= 0x27BF) ||
      (rune >= 0x2300 && rune <= 0x23FF) ||
      (rune >= 0x2B00 && rune <= 0x2BFF) ||
      (rune >= 0x2190 && rune <= 0x21FF) ||
      rune == 0x00A9 ||
      rune == 0x00AE ||
      rune == 0x203C ||
      rune == 0x2049 ||
      rune == 0x2122 ||
      rune == 0x2139 ||
      rune == 0x24C2 ||
      rune == 0x3030 ||
      rune == 0x303D ||
      rune == 0x3297 ||
      rune == 0x3299;
}

bool _isEmojiModifierScalar(int rune) {
  return rune == 0x200D || // zero-width joiner
      rune == 0xFE0E || // variation selector-15 (text)
      rune == 0xFE0F || // variation selector-16 (emoji)
      rune == 0x20E3 || // combining enclosing keycap
      (rune >= 0x1F3FB && rune <= 0x1F3FF); // skin-tone modifiers
}

// -- Sticker model --------------------------------------------------------

/// One selectable sticker in a [ComposerStickerPack].
@immutable
class ComposerSticker {
  /// Stable identifier (used for de-duplication and analytics).
  final String id;

  /// Accessible label / tooltip (e.g. "waving mascot").
  final String label;

  /// Optional image URL — rendered by the host via
  /// [ComposerExpressionPanelConfig.stickerBuilder]. Kept as data only so
  /// the component never performs I/O itself.
  final String? imageUrl;

  /// Creates a sticker descriptor.
  const ComposerSticker({required this.id, required this.label, this.imageUrl});
}

/// A named group of [ComposerSticker]s shown as a tab in the sticker view.
@immutable
class ComposerStickerPack {
  /// Stable identifier.
  final String id;

  /// Display name for the pack tab.
  final String name;

  /// The stickers in this pack.
  final List<ComposerSticker> stickers;

  /// Creates a sticker pack.
  const ComposerStickerPack({
    required this.id,
    required this.name,
    required this.stickers,
  });
}

/// Localisable strings for [ComposerExpressionPanel] (English defaults).
@immutable
class ComposerExpressionPanelStrings {
  /// Search field placeholder.
  final String searchHint;

  /// "Recently used" section header.
  final String recentsLabel;

  /// Emoji view toggle label.
  final String emojiTabLabel;

  /// Sticker view toggle label.
  final String stickersTabLabel;

  /// Skin-tone selector accessible label.
  final String skinToneLabel;

  /// Empty state when a search yields no emoji.
  final String noEmojiResultsLabel;

  /// Empty state when no sticker packs are supplied.
  final String emptyStickersLabel;

  /// Creates the strings bundle.
  const ComposerExpressionPanelStrings({
    this.searchHint = 'Search emoji',
    this.recentsLabel = 'Recently used',
    this.emojiTabLabel = 'Emoji',
    this.stickersTabLabel = 'Stickers',
    this.skinToneLabel = 'Skin tone',
    this.noEmojiResultsLabel = 'No emoji found',
    this.emptyStickersLabel = 'No stickers yet',
  });
}

/// Data + rendering configuration for the composer's built-in expression
/// (emoji + sticker) panel.
///
/// Every knob is optional; the zero-argument default is a complete emoji
/// picker (categories, search, skin tones, recents) over the package's
/// [EmojiData] set, with no sticker tab.
@immutable
class ComposerExpressionPanelConfig {
  /// The emoji catalog. When null, the package's [EmojiData] set is used.
  /// Supply a custom list to override the data source; entries are grouped
  /// by their [EmojiEntry.category].
  final List<EmojiEntry>? emojis;

  /// Text style for the default emoji glyph — inject a bundled font here for
  /// cross-platform-consistent rendering. Merged over a size default, so a
  /// host can pass just a `fontFamily`.
  final TextStyle? emojiTextStyle;

  /// Full override of one emoji cell's visual (wins over [emojiTextStyle]).
  final ComposerEmojiCellBuilder? emojiCellBuilder;

  /// Sticker packs shown in the sticker view. Empty (the default) hides the
  /// sticker toggle entirely — stickers are opt-in, host-supplied content
  /// and never duplicate the emoji set.
  final List<ComposerStickerPack> stickerPacks;

  /// Renders one sticker; when null a labelled placeholder chip is shown.
  final ComposerStickerCellBuilder? stickerBuilder;

  /// Whether the emoji search field is shown.
  final bool enableSearch;

  /// Whether the skin-tone selector is shown.
  final bool enableSkinTones;

  /// Whether a "Recently used" section is shown when recents exist.
  final bool enableRecents;

  /// How many recents to retain.
  final int maxRecents;

  /// Emoji grid columns.
  final int emojiColumns;

  /// UI strings.
  final ComposerExpressionPanelStrings strings;

  /// Creates the configuration.
  const ComposerExpressionPanelConfig({
    this.emojis,
    this.emojiTextStyle,
    this.emojiCellBuilder,
    this.stickerPacks = const [],
    this.stickerBuilder,
    this.enableSearch = true,
    this.enableSkinTones = true,
    this.enableRecents = true,
    this.maxRecents = 24,
    this.emojiColumns = 8,
    this.strings = const ComposerExpressionPanelStrings(),
  });
}

/// The built-in expression panel: a full emoji picker (categories, search,
/// skin tones, recents) plus an optional host-supplied sticker view. This
/// is the default content of the composer's keyboard-replacement accessory
/// panel, and is also usable standalone inside a custom
/// `accessoryPanelBuilder`.
///
/// The widget is presentation only: it emits a selection through
/// [onEmojiSelected] / [onStickerSelected] and never mutates a controller
/// or performs I/O.
class ComposerExpressionPanel extends StatefulWidget {
  /// Data + rendering configuration.
  final ComposerExpressionPanelConfig config;

  /// Called with the final glyph (skin tone already applied) to insert.
  final ValueChanged<String> onEmojiSelected;

  /// Called when a sticker is chosen (null disables selection).
  final ValueChanged<ComposerSticker>? onStickerSelected;

  /// Recently used glyphs, most-recent first (owned by the host so they
  /// survive panel open/close). Rendered literally, without re-toning.
  final List<String> recentEmojis;

  /// Creates the panel.
  const ComposerExpressionPanel({
    super.key,
    required this.onEmojiSelected,
    this.onStickerSelected,
    this.recentEmojis = const [],
    this.config = const ComposerExpressionPanelConfig(),
  });

  @override
  State<ComposerExpressionPanel> createState() =>
      _ComposerExpressionPanelState();
}

enum _ExpressionView { emoji, stickers }

class _ComposerExpressionPanelState extends State<ComposerExpressionPanel> {
  final TextEditingController _searchController = TextEditingController();
  late Map<EmojiCategory, List<EmojiEntry>> _byCategory;
  late List<EmojiCategory> _categories;
  late Map<String, String> _nameByEmoji;
  late EmojiCategory _activeCategory;

  _ExpressionView _view = _ExpressionView.emoji;
  String _activeStickerPackId = '';
  ComposerSkinTone _skinTone = ComposerSkinTone.none;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _rebuildCatalog();
    if (widget.config.stickerPacks.isNotEmpty) {
      _activeStickerPackId = widget.config.stickerPacks.first.id;
    }
  }

  @override
  void didUpdateWidget(covariant ComposerExpressionPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!identical(widget.config.emojis, oldWidget.config.emojis)) {
      _rebuildCatalog();
    }
  }

  void _rebuildCatalog() {
    final all = widget.config.emojis ?? EmojiData.getAllEmojis();
    final map = <EmojiCategory, List<EmojiEntry>>{};
    final names = <String, String>{};
    for (final entry in all) {
      map.putIfAbsent(entry.category, () => <EmojiEntry>[]).add(entry);
      names.putIfAbsent(entry.emoji, () => entry.name);
    }
    _byCategory = map;
    _categories = EmojiData.categories.where(map.containsKey).toList();
    _nameByEmoji = names;
    _activeCategory = _categories.isNotEmpty
        ? _categories.first
        : EmojiCategory.smileys;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<EmojiEntry> get _searchResults {
    final query = _searchQuery.toLowerCase().trim();
    return [
      for (final list in _byCategory.values)
        for (final entry in list)
          if (entry.name.toLowerCase().contains(query) ||
              entry.keywords.any((kw) => kw.toLowerCase().contains(query)))
            entry,
    ];
  }

  void _selectEmoji(String glyph, {required bool applyTone}) {
    final resolved = applyTone
        ? applyComposerSkinTone(glyph, _skinTone)
        : glyph;
    widget.onEmojiSelected(resolved);
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final hasStickers = widget.config.stickerPacks.isNotEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (hasStickers) _buildViewToggle(theme),
        Expanded(
          child: _view == _ExpressionView.emoji
              ? _buildEmojiView(theme)
              : _buildStickerView(theme),
        ),
      ],
    );
  }

  // -- Emoji view ---------------------------------------------------------

  Widget _buildEmojiView(RefractionTheme theme) {
    final colors = theme.colors;
    final searching = _searchQuery.trim().isNotEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (widget.config.enableSearch)
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 8, 8, 4),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() => _searchQuery = value),
              style: TextStyle(color: colors.foreground, fontSize: 14),
              decoration: InputDecoration(
                isDense: true,
                prefixIcon: Icon(
                  Icons.search,
                  size: 18,
                  color: colors.mutedForeground,
                ),
                hintText: widget.config.strings.searchHint,
                hintStyle: TextStyle(color: colors.mutedForeground),
                filled: true,
                fillColor: colors.muted,
                contentPadding: const EdgeInsets.symmetric(vertical: 8),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
        if (!searching) _buildCategoryTabs(theme),
        Expanded(child: _buildEmojiGrid(theme, searching)),
        if (widget.config.enableSkinTones) _buildSkinToneRow(theme),
      ],
    );
  }

  Widget _buildCategoryTabs(RefractionTheme theme) {
    final colors = theme.colors;
    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        children: [
          for (final category in _categories)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
              child: Semantics(
                button: true,
                selected: category == _activeCategory,
                label: EmojiData.categoryLabels[category],
                excludeSemantics: true,
                child: InkWell(
                  onTap: () => setState(() => _activeCategory = category),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                  child: Container(
                    width: 36,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: category == _activeCategory
                          ? colors.accent
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(theme.borderRadius),
                    ),
                    child: Text(
                      EmojiData.categoryIcons[category]!,
                      style: const TextStyle(fontSize: 18),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildEmojiGrid(RefractionTheme theme, bool searching) {
    final colors = theme.colors;
    if (searching) {
      final results = _searchResults;
      if (results.isEmpty) {
        return Center(
          child: Text(
            widget.config.strings.noEmojiResultsLabel,
            style: TextStyle(color: colors.mutedForeground, fontSize: 13),
          ),
        );
      }
      return _emojiGridView([for (final e in results) e.emoji]);
    }

    final showRecents =
        widget.config.enableRecents &&
        widget.recentEmojis.isNotEmpty &&
        _activeCategory == _categories.first;
    final categoryGlyphs = [
      for (final e in _byCategory[_activeCategory] ?? const <EmojiEntry>[])
        e.emoji,
    ];
    if (!showRecents) return _emojiGridView(categoryGlyphs);

    final recents = widget.recentEmojis.take(widget.config.maxRecents).toList();
    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 4),
      children: [
        _sectionHeader(theme, widget.config.strings.recentsLabel),
        _emojiGridView(recents, shrinkWrap: true, recents: true),
        _sectionHeader(theme, EmojiData.categoryLabels[_activeCategory]!),
        _emojiGridView(categoryGlyphs, shrinkWrap: true),
      ],
    );
  }

  Widget _sectionHeader(RefractionTheme theme, String label) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: theme.colors.mutedForeground,
        ),
      ),
    );
  }

  Widget _emojiGridView(
    List<String> glyphs, {
    bool shrinkWrap = false,
    bool recents = false,
  }) {
    return GridView.builder(
      shrinkWrap: shrinkWrap,
      physics: shrinkWrap ? const NeverScrollableScrollPhysics() : null,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: widget.config.emojiColumns,
        mainAxisSpacing: 2,
        crossAxisSpacing: 2,
      ),
      itemCount: glyphs.length,
      itemBuilder: (context, index) =>
          _buildEmojiCell(glyphs[index], applyTone: !recents),
    );
  }

  Widget _buildEmojiCell(String glyph, {required bool applyTone}) {
    final theme = RefractionTheme.of(context);
    final cell =
        widget.config.emojiCellBuilder?.call(context, glyph) ??
        Center(
          child: Text(
            glyph,
            style: const TextStyle(
              fontSize: 24,
            ).merge(widget.config.emojiTextStyle),
          ),
        );
    return Semantics(
      button: true,
      excludeSemantics: true,
      label: _nameByEmoji[glyph] ?? glyph,
      child: InkWell(
        onTap: () => _selectEmoji(glyph, applyTone: applyTone),
        borderRadius: BorderRadius.circular(theme.borderRadius),
        hoverColor: theme.colors.accent,
        child: cell,
      ),
    );
  }

  Widget _buildSkinToneRow(RefractionTheme theme) {
    final colors = theme.colors;
    return Container(
      height: 36,
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: colors.border)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          for (final tone in ComposerSkinTone.values)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 3),
              child: Semantics(
                button: true,
                selected: tone == _skinTone,
                label: '${widget.config.strings.skinToneLabel}: ${tone.name}',
                child: GestureDetector(
                  onTap: () => setState(() => _skinTone = tone),
                  child: Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _skinToneSwatches[tone],
                      border: Border.all(
                        color: tone == _skinTone
                            ? colors.primary
                            : colors.border,
                        width: tone == _skinTone ? 2 : 1,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // -- Sticker view -------------------------------------------------------

  Widget _buildViewToggle(RefractionTheme theme) {
    final colors = theme.colors;
    Widget tab(String label, _ExpressionView view) {
      final active = _view == view;
      return Expanded(
        child: InkWell(
          onTap: () => setState(() => _view = view),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: active ? colors.primary : Colors.transparent,
                  width: 2,
                ),
              ),
            ),
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                color: active ? colors.foreground : colors.mutedForeground,
              ),
            ),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: colors.border)),
      ),
      child: Row(
        children: [
          tab(widget.config.strings.emojiTabLabel, _ExpressionView.emoji),
          tab(widget.config.strings.stickersTabLabel, _ExpressionView.stickers),
        ],
      ),
    );
  }

  Widget _buildStickerView(RefractionTheme theme) {
    final colors = theme.colors;
    final packs = widget.config.stickerPacks;
    if (packs.isEmpty) {
      return Center(
        child: Text(
          widget.config.strings.emptyStickersLabel,
          style: TextStyle(color: colors.mutedForeground, fontSize: 13),
        ),
      );
    }
    final activePack = packs.firstWhere(
      (pack) => pack.id == _activeStickerPackId,
      orElse: () => packs.first,
    );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (packs.length > 1)
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              children: [
                for (final pack in packs)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: InkWell(
                      onTap: () =>
                          setState(() => _activeStickerPackId = pack.id),
                      child: Chip(
                        label: Text(pack.name),
                        backgroundColor: pack.id == _activeStickerPackId
                            ? colors.accent
                            : colors.muted,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        Expanded(child: _buildStickerGrid(theme, activePack)),
      ],
    );
  }

  Widget _buildStickerGrid(RefractionTheme theme, ComposerStickerPack pack) {
    return GridView.builder(
      padding: const EdgeInsets.all(8),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
      ),
      itemCount: pack.stickers.length,
      itemBuilder: (context, index) {
        final sticker = pack.stickers[index];
        final cell =
            widget.config.stickerBuilder?.call(context, sticker) ??
            _defaultStickerCell(theme, sticker);
        return Semantics(
          button: true,
          label: sticker.label,
          excludeSemantics: true,
          child: InkWell(
            onTap: widget.onStickerSelected == null
                ? null
                : () => widget.onStickerSelected!(sticker),
            borderRadius: BorderRadius.circular(theme.borderRadius),
            child: cell,
          ),
        );
      },
    );
  }

  Widget _defaultStickerCell(RefractionTheme theme, ComposerSticker sticker) {
    final colors = theme.colors;
    return Container(
      alignment: Alignment.center,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: colors.muted,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border),
      ),
      child: Text(
        sticker.label,
        textAlign: TextAlign.center,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(fontSize: 11, color: colors.mutedForeground),
      ),
    );
  }
}
