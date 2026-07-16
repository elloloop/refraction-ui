import 'package:flutter/material.dart';

import '../data/emoji_data.dart';
import '../theme/refraction_colors.dart';
import '../theme/refraction_theme.dart';

// The emoji model + dataset are defined once in `lib/src/data/*` and shared
// by the composer's shortcode resolver, so a picker selection and a
// `:shortcode:` always resolve to the same glyph. Re-exported here so
// existing `import '.../emoji_picker.dart'` call sites keep working.
export '../data/emoji_data.dart';

/// A special, non-Unicode tab surfaced alongside the emoji categories.
enum _SpecialTab { recents, stickers }

/// A full-featured emoji picker: the complete Unicode set, category tabs with
/// animated switching, ranked search, recents, and a delightful press/hover
/// feel.
///
/// ## Uniform rendering seam
///
/// Native emoji glyphs are NOT uniform across platforms/OS versions. This
/// picker renders the native glyph by default but every glyph goes through a
/// single [emojiRenderer] seam, so a host can later swap in a uniform set
/// (Noto / Fluent / Twemoji / Lottie) with **zero** changes to the dataset or
/// this widget:
///
/// ```dart
/// RefractionEmojiPicker(
///   emojiRenderer: (context, entry, size) =>
///       Image.asset('assets/twemoji/${entry.emoji.codeUnits.join('-')}.png',
///           width: size, height: size),
/// )
/// ```
///
/// ## Stickers seam
///
/// [stickers] is empty by default (the maintainer decides separately whether
/// to bundle a set). Passing a non-empty list reveals a stickers tab; each
/// sticker paints through its own builder or a glyph fallback.
class RefractionEmojiPicker extends StatefulWidget {
  /// Fired when an emoji is chosen.
  final ValueChanged<EmojiEntry>? onSelect;

  /// Fired when a sticker is chosen.
  final ValueChanged<EmojiSticker>? onStickerSelect;

  /// Externally controlled search query (optional).
  final String search;

  /// Seed recents (most-recent first).
  final List<EmojiEntry> recentEmojis;

  /// How many recents to retain.
  final int maxRecent;

  /// Host- or future-bundled stickers. Empty by default.
  final List<EmojiSticker> stickers;

  /// The seam for uniform glyph rendering. Defaults to the bundled uniform
  /// Twemoji set ([twemojiEmojiRenderer]); pass [defaultEmojiRenderer] for
  /// native OS glyphs, or your own for Noto/Fluent/etc.
  final EmojiRenderer emojiRenderer;

  /// Glyph size inside a cell.
  final double emojiSize;

  /// Overall picker width.
  final double width;

  /// When true, the grid fills the available vertical space (use inside a
  /// bounded box such as the composer's accessory panel). When false (the
  /// default) the picker sizes to a fixed 256dp grid so it works as a
  /// free-floating popover with unbounded height.
  final bool fillHeight;

  const RefractionEmojiPicker({
    super.key,
    this.onSelect,
    this.onStickerSelect,
    this.search = '',
    this.recentEmojis = const [],
    this.maxRecent = 24,
    this.stickers = const [],
    this.emojiRenderer = twemojiEmojiRenderer,
    this.emojiSize = 22,
    this.width = 320,
    this.fillHeight = false,
  });

  @override
  State<RefractionEmojiPicker> createState() => _RefractionEmojiPickerState();
}

class _RefractionEmojiPickerState extends State<RefractionEmojiPicker> {
  // One easing family, shared with the composer (issue #426 §7.10).
  static const Duration _switchBase = Duration(milliseconds: 180);
  static const Duration _switchReduced = Duration(milliseconds: 90);
  static const Curve _curve = Curves.easeOutCubic;

  late String _searchQuery;
  EmojiCategory _activeCategory = EmojiCategory.smileys;
  _SpecialTab? _activeSpecial;
  late List<EmojiEntry> _recentEmojis;
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _tabScrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _searchQuery = widget.search;
    _recentEmojis = _clampRecents(widget.recentEmojis);
    if (_recentEmojis.isNotEmpty) _activeSpecial = _SpecialTab.recents;
    _searchController.text = _searchQuery;
  }

  @override
  void didUpdateWidget(covariant RefractionEmojiPicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.search != oldWidget.search && widget.search != _searchQuery) {
      _searchQuery = widget.search;
      _searchController.text = _searchQuery;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabScrollController.dispose();
    super.dispose();
  }

  List<EmojiEntry> _clampRecents(List<EmojiEntry> source) {
    final list = List<EmojiEntry>.from(source);
    return list.length > widget.maxRecent
        ? list.sublist(0, widget.maxRecent)
        : list;
  }

  bool get _searching => _searchQuery.trim().isNotEmpty;

  List<EmojiEntry> _visibleEmojis() {
    if (_searching) return EmojiData.search(_searchQuery);
    if (_activeSpecial == _SpecialTab.recents) return _recentEmojis;
    if (_activeSpecial == _SpecialTab.stickers) return const [];
    return EmojiData.data[_activeCategory]!;
  }

  void _setSearch(String query) => setState(() => _searchQuery = query);

  void _select(EmojiEntry emoji) {
    setState(() {
      _recentEmojis = _clampRecents([
        emoji,
        ..._recentEmojis.where((e) => e.emoji != emoji.emoji),
      ]);
    });
    widget.onSelect?.call(emoji);
  }

  void _setCategory(EmojiCategory category) {
    setState(() {
      _activeCategory = category;
      _activeSpecial = null;
      _searchQuery = '';
      _searchController.clear();
    });
  }

  void _setSpecial(_SpecialTab tab) {
    setState(() {
      _activeSpecial = tab;
      _searchQuery = '';
      _searchController.clear();
    });
  }

  Duration _switchDuration(bool reduceMotion) =>
      reduceMotion ? _switchReduced : _switchBase;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final reduceMotion = MediaQuery.of(context).disableAnimations;

    return Container(
      width: widget.width,
      decoration: BoxDecoration(
        color: colors.popover,
        borderRadius: BorderRadius.circular(theme.borderRadius + 4),
        border: Border.all(color: colors.border),
        boxShadow: theme.data.heavyShadow,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        mainAxisSize: widget.fillHeight ? MainAxisSize.max : MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildSearchBar(colors),
          _buildTabStrip(theme, colors, reduceMotion),
          _wrapBody(
            AnimatedSwitcher(
              duration: _switchDuration(reduceMotion),
              switchInCurve: _curve,
              switchOutCurve: _curve,
              // Opacity-only cross-fade — never a slide/scale (keeps reduced
              // motion honest per issue #426 §7.10).
              transitionBuilder: (child, animation) =>
                  FadeTransition(opacity: animation, child: child),
              layoutBuilder: (currentChild, previousChildren) => Stack(
                alignment: Alignment.topCenter,
                children: [...previousChildren, ?currentChild],
              ),
              child: KeyedSubtree(
                key: ValueKey(_switcherKey()),
                child: _buildBody(theme, colors),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Fills the remaining height inside a bounded parent, or clamps to a fixed
  /// grid height when free-floating.
  Widget _wrapBody(Widget body) {
    if (widget.fillHeight) return Expanded(child: body);
    return ConstrainedBox(
      constraints: const BoxConstraints(maxHeight: 256, minHeight: 256),
      child: body,
    );
  }

  String _switcherKey() {
    if (_searching) return 'search:$_searchQuery';
    if (_activeSpecial != null) return 'special:${_activeSpecial!.name}';
    return 'cat:${_activeCategory.name}';
  }

  Widget _buildSearchBar(RefractionColors colors) {
    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: colors.border)),
      ),
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsetsDirectional.only(start: 12),
            child: Icon(Icons.search, size: 18, color: colors.mutedForeground),
          ),
          Expanded(
            child: TextField(
              controller: _searchController,
              onChanged: _setSearch,
              style: TextStyle(color: colors.popoverForeground, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search emoji',
                hintStyle: TextStyle(color: colors.mutedForeground),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 10,
                ),
                border: InputBorder.none,
                isDense: true,
              ),
            ),
          ),
          if (_searching)
            IconButton(
              icon: Icon(Icons.close, size: 16, color: colors.mutedForeground),
              splashRadius: 16,
              onPressed: () {
                _searchController.clear();
                _setSearch('');
              },
            ),
        ],
      ),
    );
  }

  Widget _buildTabStrip(
    RefractionTheme theme,
    RefractionColors colors,
    bool reduceMotion,
  ) {
    final tabs = <Widget>[
      if (_recentEmojis.isNotEmpty)
        _buildTab(
          theme: theme,
          colors: colors,
          reduceMotion: reduceMotion,
          glyph: '🕘',
          label: 'Recently used',
          active: !_searching && _activeSpecial == _SpecialTab.recents,
          onTap: () => _setSpecial(_SpecialTab.recents),
        ),
      for (final cat in EmojiCategory.values)
        _buildTab(
          theme: theme,
          colors: colors,
          reduceMotion: reduceMotion,
          glyph: EmojiData.categoryIcons[cat]!,
          label: EmojiData.categoryLabels[cat]!,
          active:
              !_searching && _activeSpecial == null && _activeCategory == cat,
          onTap: () => _setCategory(cat),
        ),
      if (widget.stickers.isNotEmpty)
        _buildTab(
          theme: theme,
          colors: colors,
          reduceMotion: reduceMotion,
          glyph: '🎟️',
          label: 'Stickers',
          active: !_searching && _activeSpecial == _SpecialTab.stickers,
          onTap: () => _setSpecial(_SpecialTab.stickers),
        ),
    ];

    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: colors.border)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
      child: Scrollbar(
        controller: _tabScrollController,
        child: SingleChildScrollView(
          controller: _tabScrollController,
          scrollDirection: Axis.horizontal,
          child: Row(children: tabs),
        ),
      ),
    );
  }

  Widget _buildTab({
    required RefractionTheme theme,
    required RefractionColors colors,
    required bool reduceMotion,
    required String glyph,
    required String label,
    required bool active,
    required VoidCallback onTap,
  }) {
    return Semantics(
      button: true,
      selected: active,
      label: label,
      child: Tooltip(
        message: label,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(theme.borderRadius),
          child: AnimatedContainer(
            duration: reduceMotion ? Duration.zero : _switchBase,
            curve: _curve,
            width: 34,
            padding: const EdgeInsets.symmetric(vertical: 6),
            margin: const EdgeInsets.symmetric(horizontal: 1),
            decoration: BoxDecoration(
              color: active ? colors.accent : Colors.transparent,
              borderRadius: BorderRadius.circular(theme.borderRadius),
            ),
            child: Text(
              glyph,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 18, height: 1.0),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBody(RefractionTheme theme, RefractionColors colors) {
    if (!_searching && _activeSpecial == _SpecialTab.stickers) {
      return _buildStickerBody(theme, colors);
    }
    final emojis = _visibleEmojis();
    if (emojis.isEmpty) {
      return _buildEmpty(
        colors,
        _searching ? 'No emoji match "$_searchQuery"' : 'Nothing here yet',
      );
    }
    final header = _searching
        ? null
        : (_activeSpecial == _SpecialTab.recents
              ? 'Recently used'
              : EmojiData.categoryLabels[_activeCategory]!);
    return _buildGrid(theme, colors, emojis, header);
  }

  Widget _buildGrid(
    RefractionTheme theme,
    RefractionColors colors,
    List<EmojiEntry> emojis,
    String? header,
  ) {
    return CustomScrollView(
      slivers: [
        if (header != null)
          SliverToBoxAdapter(child: _sectionHeader(colors, header)),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 8,
              mainAxisSpacing: 2,
              crossAxisSpacing: 2,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) => _EmojiCell(
                key: ValueKey(emojis[index].emoji),
                entry: emojis[index],
                theme: theme,
                renderer: widget.emojiRenderer,
                size: widget.emojiSize,
                onTap: () => _select(emojis[index]),
              ),
              childCount: emojis.length,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStickerBody(RefractionTheme theme, RefractionColors colors) {
    final stickers = widget.stickers;
    if (stickers.isEmpty) {
      return _buildEmpty(colors, 'No stickers yet');
    }
    return GridView.builder(
      padding: const EdgeInsets.all(8),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 6,
        crossAxisSpacing: 6,
      ),
      itemCount: stickers.length,
      itemBuilder: (context, index) {
        final sticker = stickers[index];
        return Semantics(
          button: true,
          label: sticker.label,
          child: InkWell(
            borderRadius: BorderRadius.circular(theme.borderRadius),
            onTap: () => widget.onStickerSelect?.call(sticker),
            child: Center(
              child:
                  sticker.builder?.call(context, 48) ??
                  Text(
                    sticker.glyph ?? '🎟️',
                    style: const TextStyle(fontSize: 40),
                  ),
            ),
          ),
        );
      },
    );
  }

  Widget _sectionHeader(RefractionColors colors, String text) => Padding(
    padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
    child: Text(
      text,
      style: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: colors.mutedForeground,
      ),
    ),
  );

  Widget _buildEmpty(RefractionColors colors, String text) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(fontSize: 13, color: colors.mutedForeground),
      ),
    ),
  );
}

/// A single emoji cell with a delightful press (scale-down) + hover feel.
///
/// The press scale is suppressed under reduced motion; hover/splash feedback
/// remains so the affordance never feels dead.
class _EmojiCell extends StatefulWidget {
  final EmojiEntry entry;
  final RefractionTheme theme;
  final EmojiRenderer renderer;
  final double size;
  final VoidCallback onTap;

  const _EmojiCell({
    super.key,
    required this.entry,
    required this.theme,
    required this.renderer,
    required this.size,
    required this.onTap,
  });

  @override
  State<_EmojiCell> createState() => _EmojiCellState();
}

class _EmojiCellState extends State<_EmojiCell> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final colors = widget.theme.colors;
    final reduceMotion = MediaQuery.of(context).disableAnimations;
    final scale = (_pressed && !reduceMotion) ? 0.82 : 1.0;
    return Semantics(
      button: true,
      label: widget.entry.name,
      child: Tooltip(
        message: ':${widget.entry.shortcode}:',
        waitDuration: const Duration(milliseconds: 500),
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTapDown: (_) => setState(() => _pressed = true),
            onTapUp: (_) => setState(() => _pressed = false),
            onTapCancel: () => setState(() => _pressed = false),
            onTap: widget.onTap,
            child: AnimatedScale(
              scale: scale,
              duration: const Duration(milliseconds: 90),
              curve: Curves.easeOutCubic,
              child: _HoverHighlight(
                color: colors.accent,
                radius: widget.theme.borderRadius,
                child: Center(
                  child: widget.renderer(context, widget.entry, widget.size),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// A lightweight hover background (cheaper than an InkWell per cell across a
/// 1800-entry grid; avoids a Material ancestor requirement).
class _HoverHighlight extends StatefulWidget {
  final Widget child;
  final Color color;
  final double radius;

  const _HoverHighlight({
    required this.child,
    required this.color,
    required this.radius,
  });

  @override
  State<_HoverHighlight> createState() => _HoverHighlightState();
}

class _HoverHighlightState extends State<_HoverHighlight> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: _hovered ? widget.color : Colors.transparent,
          borderRadius: BorderRadius.circular(widget.radius),
        ),
        child: widget.child,
      ),
    );
  }
}
