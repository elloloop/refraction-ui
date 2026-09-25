import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';

import '../theme/hsl_color.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';
import 'tooltip.dart';

/// Something a person can do to one message — reply, react, copy, edit,
/// delete.
@immutable
class RefractionMessageAction {
  /// The action's glyph.
  final IconData icon;

  /// The action's name: its tooltip, its label in a menu, and the custom
  /// action a screen reader offers on the message.
  final String label;

  /// Called when the action is chosen.
  final VoidCallback onSelected;

  /// Paints the action as irreversible (in [RefractionColors.destructive]).
  final bool destructive;

  /// Creates a [RefractionMessageAction].
  const RefractionMessageAction({
    required this.icon,
    required this.label,
    required this.onSelected,
    this.destructive = false,
  });
}

/// One message in a team conversation, laid out the way work chat reads
/// best: every message left-aligned, an avatar and a name at the start of a
/// run, continuations tucked under it with their time in the gutter on
/// hover.
///
/// On hover — and whenever the row or anything in it has keyboard focus —
/// the row lights up and offers [actions] in a floating
/// [RefractionMessageToolbar]. On touch, [onLongPress] asks for them (a
/// secondary click does too). Screen readers reach every action as a custom
/// semantics action on the row, so nothing depends on hovering.
///
/// The row is a keyboard stop when it has [actions]: Tab lands on the
/// message (drawn with the theme focus ring), the next Tab walks its
/// toolbar.
///
/// Group consecutive messages into runs by passing [continuation]; see
/// `buildMessageTimeline` for the grouping rule.
///
/// ```dart
/// RefractionMessageRow(
///   authorName: 'Dev Patel',
///   avatar: RefractionAvatar(fallbackText: 'Dev Patel', size: 36),
///   timestamp: '10:42',
///   body: Text('Shipping the fix now'),
///   actions: [
///     RefractionMessageAction(
///       icon: Icons.reply,
///       label: 'Reply',
///       onSelected: () => reply(message),
///     ),
///   ],
/// )
/// ```
class RefractionMessageRow extends StatefulWidget {
  /// Who sent it.
  final String authorName;

  /// The sender's picture, drawn at the start of a run.
  final Widget avatar;

  /// When it was sent, formatted as it should read. Beside the name at the
  /// start of a run; in the gutter on hover/focus for a continuation.
  final String? timestamp;

  /// What it says: text, mentions, attachments, a
  /// [RefractionMessageTombstone].
  final Widget body;

  /// Same sender moments after the message above: no avatar or name.
  final bool continuation;

  /// Shown above [body]: the message this one replies to (typically a
  /// [RefractionMessageQuote]).
  final Widget? quote;

  /// Shown under [body]: reactions, a delivery state, a retry.
  final Widget? footer;

  /// When set, drawn quietly after [body] (e.g. "(edited)").
  final String? editedLabel;

  /// What the message allows; the hover toolbar, the keyboard and screen
  /// readers offer these.
  final List<RefractionMessageAction> actions;

  /// Touch long-press (and secondary click): ask for [actions], e.g. in a
  /// sheet.
  final VoidCallback? onLongPress;

  /// Draws the row marked — the message a link, a search or a task pointed
  /// at.
  final bool highlighted;

  /// What a screen reader announces for the whole row. Defaults to
  /// `"<authorName>, <timestamp>"`; the body's own text follows it.
  final String? semanticLabel;

  /// The avatar's size, and with it the gutter's width. Defaults to `36`.
  final double avatarSize;

  /// Creates a [RefractionMessageRow].
  const RefractionMessageRow({
    super.key,
    required this.authorName,
    required this.avatar,
    required this.body,
    this.timestamp,
    this.continuation = false,
    this.quote,
    this.footer,
    this.editedLabel,
    this.actions = const [],
    this.onLongPress,
    this.highlighted = false,
    this.semanticLabel,
    this.avatarSize = 36,
  });

  @override
  State<RefractionMessageRow> createState() => _RefractionMessageRowState();
}

class _RefractionMessageRowState extends State<RefractionMessageRow> {
  static const Duration _fade = Duration(milliseconds: 120);
  static const double _focusRingWidth = 2;

  /// How far the hover fill moves from the page toward `surfaceSubtle` —
  /// a full step reads as a selection, not a hover, in dark palettes.
  static const double _hoverTint = 0.6;

  final LayerLink _toolbarAnchor = LayerLink();
  final OverlayPortalController _toolbar = OverlayPortalController();
  late final FocusNode _focusNode = FocusNode(
    debugLabel: 'RefractionMessageRow',
  );

  bool _rowHovered = false;
  bool _toolbarHovered = false;
  bool _focusWithin = false;
  bool _showFocusRing = false;

  bool get _hasActions => widget.actions.isNotEmpty;
  bool get _active => _rowHovered || _toolbarHovered || _focusWithin;

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  void _update(VoidCallback change) {
    setState(change);
    if (_hasActions && _active) {
      _toolbar.show();
    } else {
      _toolbar.hide();
    }
  }

  @override
  void didUpdateWidget(RefractionMessageRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!_hasActions && _toolbar.isShowing) _toolbar.hide();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final background = widget.highlighted
        ? colors.primarySoft
        : _active
        ? ColorMath.mix(colors.background, colors.surfaceSubtle, _hoverTint)
        : colors.background.withValues(alpha: 0);

    Widget row = AnimatedContainer(
      duration: _fade,
      padding: EdgeInsets.fromLTRB(
        theme.spacingLg,
        widget.continuation ? theme.spacingXs / 2 : theme.spacingSm,
        theme.spacingLg,
        theme.spacingXs / 2,
      ),
      color: background,
      // A foreground ring never shifts layout when focus arrives.
      foregroundDecoration: _showFocusRing
          ? BoxDecoration(
              border: Border.all(color: colors.ring, width: _focusRingWidth),
            )
          : null,
      child: _buildContent(theme),
    );

    row = CompositedTransformTarget(
      link: _toolbarAnchor,
      child: OverlayPortal(
        controller: _toolbar,
        overlayChildBuilder: (context) => _buildToolbarOverlay(theme),
        child: row,
      ),
    );

    row = MouseRegion(
      onEnter: (_) => _update(() => _rowHovered = true),
      onExit: (_) => _update(() => _rowHovered = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onLongPress: widget.onLongPress,
        onSecondaryTap: widget.onLongPress,
        child: row,
      ),
    );

    row = Focus(
      focusNode: _focusNode,
      canRequestFocus: _hasActions,
      skipTraversal: !_hasActions,
      onFocusChange: (hasFocus) => _update(() {
        _focusWithin = hasFocus;
        _showFocusRing =
            _focusNode.hasPrimaryFocus &&
            FocusManager.instance.highlightMode ==
                FocusHighlightMode.traditional;
      }),
      onKeyEvent: _onKey,
      child: FocusTraversalGroup(
        policy: WidgetOrderTraversalPolicy(),
        child: row,
      ),
    );

    final timestamp = widget.timestamp;
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label:
          widget.semanticLabel ??
          (timestamp == null
              ? widget.authorName
              : '${widget.authorName}, $timestamp'),
      onLongPress: widget.onLongPress,
      customSemanticsActions: {
        for (final action in widget.actions)
          CustomSemanticsAction(label: action.label): action.onSelected,
      },
      child: row,
    );
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent || !node.hasPrimaryFocus) {
      return KeyEventResult.ignored;
    }
    // The context-menu key and Shift+F10 open the action menu, as they do
    // on every desktop platform.
    final key = event.logicalKey;
    final shift = HardwareKeyboard.instance.isShiftPressed;
    if (key == LogicalKeyboardKey.contextMenu ||
        (shift && key == LogicalKeyboardKey.f10)) {
      final onLongPress = widget.onLongPress;
      if (onLongPress == null) return KeyEventResult.ignored;
      onLongPress();
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  Widget _buildToolbarOverlay(RefractionThemeData theme) {
    return Positioned(
      left: 0,
      top: 0,
      child: CompositedTransformFollower(
        link: _toolbarAnchor,
        targetAnchor: Alignment.topRight,
        followerAnchor: Alignment.centerRight,
        offset: Offset(-theme.spacingLg, 0),
        child: MouseRegion(
          onEnter: (_) => _update(() => _toolbarHovered = true),
          onExit: (_) => _update(() => _toolbarHovered = false),
          child: RefractionMessageToolbar(actions: widget.actions),
        ),
      ),
    );
  }

  Widget _buildContent(RefractionThemeData theme) {
    final colors = theme.colors;
    final typography = theme.resolvedTypography;
    final gutter = widget.avatarSize + theme.spacingMd;
    final timestamp = widget.timestamp;
    final metaStyle = typography.caption.copyWith(
      color: colors.mutedForeground,
    );

    final body = widget.editedLabel == null
        ? widget.body
        : Wrap(
            crossAxisAlignment: WrapCrossAlignment.end,
            spacing: theme.spacingXs,
            children: [
              widget.body,
              Text(widget.editedLabel!, style: metaStyle),
            ],
          );

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: gutter,
          child: widget.continuation
              ? Padding(
                  padding: EdgeInsets.only(top: theme.spacingXs / 2),
                  child: ExcludeSemantics(
                    child: AnimatedOpacity(
                      duration: _fade,
                      opacity: _active && timestamp != null ? 1 : 0,
                      child: Text(
                        timestamp ?? '',
                        maxLines: 1,
                        overflow: TextOverflow.clip,
                        style: metaStyle,
                      ),
                    ),
                  ),
                )
              : Align(
                  alignment: AlignmentDirectional.topStart,
                  // Hug the avatar vertically: without a factor, Align grows
                  // to the row's max height in any bounded parent.
                  heightFactor: 1,
                  child: ExcludeSemantics(child: widget.avatar),
                ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (!widget.continuation)
                Padding(
                  padding: EdgeInsets.only(bottom: theme.spacingXs / 2),
                  child: ExcludeSemantics(
                    child: Wrap(
                      spacing: theme.spacingSm,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          widget.authorName,
                          style: typography.body.copyWith(
                            color: colors.foreground,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (timestamp != null)
                          Text(timestamp, style: metaStyle),
                      ],
                    ),
                  ),
                ),
              if (widget.quote != null) widget.quote!,
              DefaultTextStyle.merge(
                style: typography.body.copyWith(color: colors.foreground),
                child: body,
              ),
              if (widget.footer != null)
                Padding(
                  padding: EdgeInsets.only(top: theme.spacingXs),
                  child: widget.footer!,
                ),
            ],
          ),
        ),
      ],
    );
  }
}

/// The message a reply answers, quoted above it: a rule, the author, the
/// text on at most [maxLines] lines. Pass [onTap] to jump to the original.
class RefractionMessageQuote extends StatelessWidget {
  /// Who wrote the quoted message; null when it is not known.
  final String? author;

  /// What it said.
  final String text;

  /// Jumps to the quoted message.
  final VoidCallback? onTap;

  /// Lines of [text] shown before it ellipsizes. Defaults to 2.
  final int maxLines;

  /// Creates a [RefractionMessageQuote].
  const RefractionMessageQuote({
    super.key,
    this.author,
    required this.text,
    this.onTap,
    this.maxLines = 2,
  });

  static const double _ruleWidth = 3;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final typography = theme.resolvedTypography;
    final quote = Container(
      margin: EdgeInsets.only(bottom: theme.spacingXs),
      padding: EdgeInsetsDirectional.only(start: theme.spacingSm),
      decoration: BoxDecoration(
        border: BorderDirectional(
          // Mid-way between border and muted ink, so the rule survives the
          // hover fill (which equals `border` in several dark palettes).
          start: BorderSide(
            color: ColorMath.mix(colors.border, colors.mutedForeground, 0.5),
            width: _ruleWidth,
          ),
        ),
      ),
      child: Text.rich(
        TextSpan(
          children: [
            if (author != null)
              TextSpan(
                text: '$author  ',
                style: typography.caption.copyWith(
                  color: colors.foreground,
                  fontWeight: FontWeight.w600,
                ),
              ),
            TextSpan(
              text: text,
              style: typography.caption.copyWith(color: colors.mutedForeground),
            ),
          ],
        ),
        maxLines: maxLines,
        overflow: TextOverflow.ellipsis,
      ),
    );
    final label = author == null
        ? 'Replying to: $text'
        : 'Replying to $author: $text';
    if (onTap == null) {
      return Semantics(
        container: true,
        label: label,
        child: ExcludeSemantics(child: quote),
      );
    }
    return Semantics(
      container: true,
      button: true,
      label: label,
      onTap: onTap,
      child: ExcludeSemantics(
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(onTap: onTap, child: quote),
        ),
      ),
    );
  }
}

/// What a deleted message leaves behind: a quiet, italic note in place of
/// the body.
class RefractionMessageTombstone extends StatelessWidget {
  /// The note. Defaults to "This message was deleted."
  final String label;

  /// Creates a [RefractionMessageTombstone].
  const RefractionMessageTombstone({
    super.key,
    this.label = 'This message was deleted.',
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final style = theme.resolvedTypography.body.copyWith(
      color: colors.mutedForeground,
      fontStyle: FontStyle.italic,
    );
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.block, size: style.fontSize, color: colors.mutedForeground),
        SizedBox(width: theme.spacingXs),
        Flexible(child: Text(label, style: style)),
      ],
    );
  }
}

/// A message's actions as a row of icon buttons on a floating surface —
/// the hover toolbar of [RefractionMessageRow]. Every button has a tooltip,
/// a screen-reader label, keyboard focus and Enter/Space activation.
class RefractionMessageToolbar extends StatelessWidget {
  /// The actions offered.
  final List<RefractionMessageAction> actions;

  /// Glyph size. Defaults to `18`.
  final double iconSize;

  /// Creates a [RefractionMessageToolbar].
  const RefractionMessageToolbar({
    super.key,
    required this.actions,
    this.iconSize = 18,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    return Container(
      padding: EdgeInsets.all(theme.spacingXs / 2),
      decoration: BoxDecoration(
        color: colors.popover,
        borderRadius: BorderRadius.circular(theme.radiusMd),
        border: Border.all(color: colors.border),
        boxShadow: theme.elevationSm,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final action in actions)
            _ToolbarButton(action: action, iconSize: iconSize),
        ],
      ),
    );
  }
}

class _ToolbarButton extends StatefulWidget {
  final RefractionMessageAction action;
  final double iconSize;

  const _ToolbarButton({required this.action, required this.iconSize});

  @override
  State<_ToolbarButton> createState() => _ToolbarButtonState();
}

class _ToolbarButtonState extends State<_ToolbarButton> {
  static const double _focusRingWidth = 2;

  bool _hovered = false;
  bool _focused = false;

  late final Map<Type, Action<Intent>> _actions = {
    ActivateIntent: CallbackAction<ActivateIntent>(
      onInvoke: (_) {
        widget.action.onSelected();
        return null;
      },
    ),
  };

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final action = widget.action;
    final size = theme.controlHeightSm;
    return Semantics(
      button: true,
      label: action.label,
      onTap: action.onSelected,
      excludeSemantics: true,
      child: RefractionTooltip(
        message: Text(action.label),
        child: FocusableActionDetector(
          actions: _actions,
          mouseCursor: SystemMouseCursors.click,
          onShowHoverHighlight: (value) => setState(() => _hovered = value),
          onShowFocusHighlight: (value) => setState(() => _focused = value),
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: action.onSelected,
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                color: _hovered || _focused ? colors.accent : null,
                borderRadius: BorderRadius.circular(theme.radiusSm),
                border: _focused
                    ? Border.all(color: colors.ring, width: _focusRingWidth)
                    : null,
              ),
              alignment: Alignment.center,
              child: Icon(
                action.icon,
                size: widget.iconSize,
                color: action.destructive
                    ? colors.destructive
                    : _hovered || _focused
                    ? colors.accentForeground
                    : colors.mutedForeground,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
