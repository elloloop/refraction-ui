import 'dart:async';

import 'package:flutter/material.dart';

import '../data/emoji_data.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';
import 'tooltip.dart';

/// A single reaction item used in a [RefractionReactionBar].
///
/// Give either an [emoji] glyph (rendered through the bar's
/// [RefractionReactionBar.emojiRenderer] — bundled Twemoji by default, so it
/// never depends on a platform or web emoji font — and animated with the
/// bundled Noto Lottie when the user reacts) or a custom [icon].
class RefractionReaction {
  /// Unique identifier for this reaction (e.g., 'thumbs_up', 'heart').
  final String id;

  /// A custom visual (an [Icon], an image). Wins over [emoji].
  final Widget? icon;

  /// The emoji glyph, e.g. `👍`. Used when [icon] is null.
  final String? emoji;

  /// What a screen reader calls this reaction ("thumbs up"). Defaults to the
  /// Unicode name of [emoji], then to [id].
  final String? label;

  /// The number of times this reaction has been selected. Defaults to 0.
  final int count;

  /// Whether the current user has selected this reaction. Defaults to false.
  final bool isActive;

  /// Who reacted, as display names, for the hover/long-press tooltip.
  /// Empty hides the tooltip.
  final List<String> reactors;

  /// Creates a [RefractionReaction].
  const RefractionReaction({
    required this.id,
    this.icon,
    this.emoji,
    this.label,
    this.count = 0,
    this.isActive = false,
    this.reactors = const [],
  }) : assert(icon != null || emoji != null, 'Give an icon or an emoji');

  /// Creates a copy of this reaction with the given fields replaced.
  RefractionReaction copyWith({
    String? id,
    Widget? icon,
    String? emoji,
    String? label,
    int? count,
    bool? isActive,
    List<String>? reactors,
  }) {
    return RefractionReaction(
      id: id ?? this.id,
      icon: icon ?? this.icon,
      emoji: emoji ?? this.emoji,
      label: label ?? this.label,
      count: count ?? this.count,
      isActive: isActive ?? this.isActive,
      reactors: reactors ?? this.reactors,
    );
  }

  /// The accessible name: [label], else the emoji's Unicode name, else [id].
  String get resolvedLabel {
    if (label != null) return label!;
    final glyph = emoji;
    if (glyph != null) {
      final entry = EmojiData.lookup(glyph);
      if (entry != null) return entry.name;
    }
    return id;
  }
}

/// User-facing strings of a [RefractionReactionBar] (English defaults).
class RefractionReactionBarStrings {
  /// Label/tooltip of the add-reaction button.
  final String addReaction;

  /// Label of the overflow chip; receives the hidden count.
  final String Function(int hidden) showMore;

  /// Label of the chip that collapses an expanded bar.
  final String showLess;

  /// A reaction's screen-reader description.
  final String Function(String label, int count, bool reactedByYou)
  reactionSemantics;

  /// The who-reacted tooltip.
  final String Function(List<String> reactors, String label) reactorsTooltip;

  /// Creates the strings; every field has an English default.
  const RefractionReactionBarStrings({
    this.addReaction = 'Add reaction',
    this.showMore = _showMore,
    this.showLess = 'Show less',
    this.reactionSemantics = _reactionSemantics,
    this.reactorsTooltip = _reactorsTooltip,
  });

  static String _showMore(int hidden) => '+$hidden';

  static String _reactionSemantics(String label, int count, bool mine) {
    final noun = count == 1 ? 'reaction' : 'reactions';
    final you = mine ? ', including you' : '';
    return '$label: $count $noun$you';
  }

  /// Names shown before "and N others".
  static const int _namedReactors = 3;

  static String _reactorsTooltip(List<String> reactors, String label) {
    final String who;
    if (reactors.length == 1) {
      who = reactors.single;
    } else if (reactors.length <= _namedReactors) {
      who =
          '${reactors.sublist(0, reactors.length - 1).join(', ')} and '
          '${reactors.last}';
    } else {
      final others = reactors.length - _namedReactors;
      who =
          '${reactors.take(_namedReactors).join(', ')} and $others '
          '${others == 1 ? 'other' : 'others'}';
    }
    return '$who reacted with $label';
  }
}

/// A row of reaction chips under a message — Slack-style: compact pills,
/// your own reactions highlighted, who-reacted on hover or long-press, an
/// add-reaction button, and an overflow chip past [maxVisible].
///
/// Every chip is a toggle button for keyboards (Tab, Enter/Space) and screen
/// readers ("thumbs up: 3 reactions, including you", with its toggled
/// state). Emoji render through [emojiRenderer] (bundled Twemoji by default)
/// — never through a platform emoji font, which on the web is fetched from a
/// CDN a strict Content-Security-Policy blocks. When a reaction becomes
/// yours, its chip pops and — where Google's Noto set has an animation —
/// plays it once (skipped when the platform asks for reduced motion).
///
/// ```dart
/// RefractionReactionBar(
///   reactions: [
///     RefractionReaction(id: 'up', emoji: '👍', count: 3,
///       reactors: ['Ana', 'Dev', 'Sam']),
///   ],
///   onReactionTapped: toggle,
///   onAddReaction: openPicker,
/// )
/// ```
class RefractionReactionBar extends StatefulWidget {
  /// The list of reactions to display.
  final List<RefractionReaction> reactions;

  /// Fired when a reaction chip is activated, with its [RefractionReaction.id].
  final ValueChanged<String>? onReactionTapped;

  /// Shows a trailing add-reaction button (e.g. to open an emoji picker).
  final VoidCallback? onAddReaction;

  /// Whether to show the count next to each reaction. Defaults to true.
  final bool showCounts;

  /// Chips shown before an overflow chip ("+N") that expands the bar.
  /// Null (default) shows all.
  final int? maxVisible;

  /// Renders [RefractionReaction.emoji]. Defaults to the bundled Twemoji.
  final EmojiRenderer emojiRenderer;

  /// Plays the pop (and Noto animation) when a reaction becomes yours.
  final bool animateOnReact;

  /// The spacing between reaction items. Defaults to the theme's
  /// `spacingXs`.
  final double? spacing;

  /// User-facing strings.
  final RefractionReactionBarStrings strings;

  /// Creates a [RefractionReactionBar].
  const RefractionReactionBar({
    super.key,
    required this.reactions,
    this.onReactionTapped,
    this.onAddReaction,
    this.showCounts = true,
    this.maxVisible,
    this.emojiRenderer = twemojiEmojiRenderer,
    this.animateOnReact = true,
    this.spacing,
    this.strings = const RefractionReactionBarStrings(),
  });

  @override
  State<RefractionReactionBar> createState() => _RefractionReactionBarState();
}

class _RefractionReactionBarState extends State<RefractionReactionBar> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final spacing = widget.spacing ?? theme.spacingXs;
    final reactions = widget.reactions;
    final limit = widget.maxVisible;
    final overflowing = limit != null && reactions.length > limit;
    final shown = overflowing && !_expanded
        ? reactions.take(limit).toList()
        : reactions;

    return Wrap(
      spacing: spacing,
      runSpacing: spacing,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        for (final reaction in shown)
          _ReactionChip(
            key: ValueKey(reaction.id),
            reaction: reaction,
            onTap: widget.onReactionTapped == null
                ? null
                : () => widget.onReactionTapped!(reaction.id),
            showCount: widget.showCounts,
            renderer: widget.emojiRenderer,
            animateOnReact: widget.animateOnReact,
            strings: widget.strings,
          ),
        if (overflowing)
          _BarButton(
            label: _expanded
                ? widget.strings.showLess
                : widget.strings.showMore(reactions.length - limit),
            onTap: () => setState(() => _expanded = !_expanded),
            child: Text(
              _expanded
                  ? widget.strings.showLess
                  : widget.strings.showMore(reactions.length - limit),
            ),
          ),
        if (widget.onAddReaction != null)
          RefractionTooltip(
            message: Text(widget.strings.addReaction),
            child: _BarButton(
              label: widget.strings.addReaction,
              onTap: widget.onAddReaction!,
              child: const Icon(Icons.add_reaction_outlined),
            ),
          ),
      ],
    );
  }
}

/// Shared pill geometry so chips and buttons line up.
class _PillStyle {
  const _PillStyle._();

  static double height(RefractionThemeData theme) =>
      theme.controlHeightSm * 0.75;

  static double glyph(RefractionThemeData theme) =>
      theme.resolvedTypography.body.fontSize ?? theme.spacingLg;

  static EdgeInsets padding(RefractionThemeData theme) =>
      EdgeInsets.symmetric(horizontal: theme.spacingSm - theme.spacingXs / 2);
}

class _ReactionChip extends StatefulWidget {
  final RefractionReaction reaction;
  final VoidCallback? onTap;
  final bool showCount;
  final EmojiRenderer renderer;
  final bool animateOnReact;
  final RefractionReactionBarStrings strings;

  const _ReactionChip({
    super.key,
    required this.reaction,
    required this.onTap,
    required this.showCount,
    required this.renderer,
    required this.animateOnReact,
    required this.strings,
  });

  @override
  State<_ReactionChip> createState() => _ReactionChipState();
}

class _ReactionChipState extends State<_ReactionChip>
    with SingleTickerProviderStateMixin {
  static const Duration _popDuration = Duration(milliseconds: 260);
  static const double _popScale = 1.25;
  static const double _focusRingWidth = 2;

  late final AnimationController _pop = AnimationController(
    vsync: this,
    duration: _popDuration,
  );
  late final Animation<double> _scale = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 1.0, end: _popScale), weight: 1),
    TweenSequenceItem(tween: Tween(begin: _popScale, end: 1.0), weight: 1),
  ]).animate(CurvedAnimation(parent: _pop, curve: Curves.easeOut));

  bool _hovered = false;
  bool _focused = false;
  bool _playingLottie = false;
  Timer? _lottieTimer;

  late final Map<Type, Action<Intent>> _actions = {
    ActivateIntent: CallbackAction<ActivateIntent>(
      onInvoke: (_) {
        widget.onTap?.call();
        return null;
      },
    ),
  };

  @override
  void didUpdateWidget(_ReactionChip oldWidget) {
    super.didUpdateWidget(oldWidget);
    final becameMine = widget.reaction.isActive && !oldWidget.reaction.isActive;
    if (!becameMine || !widget.animateOnReact) return;
    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) return;
    _pop.forward(from: 0);
    final glyph = widget.reaction.emoji;
    if (widget.reaction.icon == null &&
        glyph != null &&
        animatedEmojiKey(glyph) != null) {
      _playingLottie = true;
    }
  }

  @override
  void dispose() {
    _lottieTimer?.cancel();
    _pop.dispose();
    super.dispose();
  }

  Widget _glyph(BuildContext context, double size) {
    final reaction = widget.reaction;
    if (reaction.icon != null) return reaction.icon!;
    final glyph = reaction.emoji!;
    final entry =
        EmojiData.lookup(glyph) ??
        EmojiEntry(emoji: glyph, name: glyph, category: EmojiCategory.symbols);
    final still = widget.renderer(context, entry, size);
    final key = animatedEmojiKey(glyph);
    if (!_playingLottie || key == null) return still;
    return animatedEmojiLottie(
      key,
      size: size,
      fallback: still,
      repeat: false,
      onLoaded: (length) {
        _lottieTimer?.cancel();
        _lottieTimer = Timer(length, () {
          if (mounted) setState(() => _playingLottie = false);
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final reaction = widget.reaction;
    final mine = reaction.isActive;
    final label = reaction.resolvedLabel;
    final glyphSize = _PillStyle.glyph(theme);

    final background = mine
        ? colors.primarySoft
        : _hovered || _focused
        ? colors.accent
        : colors.surfaceSubtle;
    final border = _focused
        ? colors.ring
        : mine
        ? colors.primary
        : _hovered
        ? colors.border
        : colors.surfaceSubtle;
    final ink = mine ? colors.primarySoftForeground : colors.mutedForeground;
    final countStyle = theme.resolvedTypography.caption.copyWith(
      color: ink,
      fontWeight: FontWeight.w600,
      fontFeatures: const [FontFeature.tabularFigures()],
    );

    Widget chip = AnimatedContainer(
      duration: const Duration(milliseconds: 120),
      height: _PillStyle.height(theme),
      padding: _PillStyle.padding(theme),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(theme.radiusPill),
        border: Border.all(
          color: border,
          width: _focused ? _focusRingWidth : 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          ScaleTransition(
            scale: _scale,
            child: IconTheme(
              data: IconThemeData(color: ink, size: glyphSize),
              child: DefaultTextStyle.merge(
                style: TextStyle(color: ink, fontSize: glyphSize, height: 1),
                child: SizedBox.square(
                  dimension: glyphSize,
                  child: Center(child: _glyph(context, glyphSize)),
                ),
              ),
            ),
          ),
          if (widget.showCount && reaction.count > 0) ...[
            SizedBox(width: theme.spacingXs),
            Text('${reaction.count}', style: countStyle),
          ],
        ],
      ),
    );

    chip = FocusableActionDetector(
      enabled: widget.onTap != null,
      actions: _actions,
      mouseCursor: widget.onTap == null
          ? SystemMouseCursors.basic
          : SystemMouseCursors.click,
      onShowHoverHighlight: (value) => setState(() => _hovered = value),
      onShowFocusHighlight: (value) => setState(() => _focused = value),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.onTap,
        child: chip,
      ),
    );

    if (reaction.reactors.isNotEmpty) {
      chip = RefractionTooltip(
        message: Text(widget.strings.reactorsTooltip(reaction.reactors, label)),
        child: chip,
      );
    }

    return Semantics(
      button: true,
      toggled: mine,
      enabled: widget.onTap != null,
      label: widget.strings.reactionSemantics(label, reaction.count, mine),
      onTap: widget.onTap,
      excludeSemantics: true,
      child: chip,
    );
  }
}

/// The overflow and add-reaction pills: same geometry as a chip.
class _BarButton extends StatefulWidget {
  final String label;
  final VoidCallback onTap;
  final Widget child;

  const _BarButton({
    required this.label,
    required this.onTap,
    required this.child,
  });

  @override
  State<_BarButton> createState() => _BarButtonState();
}

class _BarButtonState extends State<_BarButton> {
  static const double _focusRingWidth = 2;

  bool _hovered = false;
  bool _focused = false;

  late final Map<Type, Action<Intent>> _actions = {
    ActivateIntent: CallbackAction<ActivateIntent>(
      onInvoke: (_) {
        widget.onTap();
        return null;
      },
    ),
  };

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final ink = _hovered || _focused
        ? colors.accentForeground
        : colors.mutedForeground;
    return Semantics(
      button: true,
      label: widget.label,
      onTap: widget.onTap,
      excludeSemantics: true,
      child: FocusableActionDetector(
        actions: _actions,
        mouseCursor: SystemMouseCursors.click,
        onShowHoverHighlight: (value) => setState(() => _hovered = value),
        onShowFocusHighlight: (value) => setState(() => _focused = value),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: widget.onTap,
          child: Container(
            height: _PillStyle.height(theme),
            padding: _PillStyle.padding(theme),
            decoration: BoxDecoration(
              color: _hovered || _focused
                  ? colors.accent
                  : colors.surfaceSubtle,
              borderRadius: BorderRadius.circular(theme.radiusPill),
              border: Border.all(
                color: _focused ? colors.ring : colors.surfaceSubtle,
                width: _focused ? _focusRingWidth : 1,
              ),
            ),
            // Hug the content: an aligned Container fills a Wrap's width.
            child: Center(
              widthFactor: 1,
              child: IconTheme(
                data: IconThemeData(color: ink, size: _PillStyle.glyph(theme)),
                child: DefaultTextStyle(
                  style: theme.resolvedTypography.caption.copyWith(
                    color: ink,
                    fontWeight: FontWeight.w600,
                  ),
                  child: widget.child,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
