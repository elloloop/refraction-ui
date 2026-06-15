import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Helper to parse color strings (e.g. hex #FFFFFF).
Color? _parseColor(String? colorStr) {
  if (colorStr == null) return null;
  if (colorStr.startsWith('#')) {
    final hex = colorStr.replaceFirst('#', '');
    if (hex.length == 6) {
      return Color(int.parse('FF$hex', radix: 16));
    } else if (hex.length == 8) {
      return Color(int.parse(hex, radix: 16));
    }
  }
  return null;
}

/// A single column definition for the Kanban board.
class KanbanColumnDef {
  /// Unique identifier for this column (matches cards' column id).
  final String id;

  /// Display title of the column (e.g. stage name).
  final String title;

  /// Optional accent color applied via [_parseColor] (hex code like `#00FF00`).
  final String? accent;

  /// Optional note or gate description shown below the column header.
  final String? note;

  const KanbanColumnDef({
    required this.id,
    required this.title,
    this.accent,
    this.note,
  });
}

/// The card surface inside a column.
class RefractionKanbanCard extends StatefulWidget {
  /// Content of the card.
  final Widget child;

  /// Optional accent color for a top border treatment (hex color value).
  final String? accent;

  /// Whether the card should show hover/click affordance.
  final bool clickable;

  /// Called when the card is tapped.
  final VoidCallback? onTap;

  const RefractionKanbanCard({
    super.key,
    required this.child,
    this.accent,
    this.clickable = false,
    this.onTap,
  });

  @override
  State<RefractionKanbanCard> createState() => _RefractionKanbanCardState();
}

class _RefractionKanbanCardState extends State<RefractionKanbanCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final accentColor = _parseColor(widget.accent);

    Widget card = Container(
      decoration: BoxDecoration(
        color: widget.clickable && _isHovered
            ? colors.accent.withValues(alpha: 0.6)
            : colors.card,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (accentColor != null)
            Container(
              height: 2,
              decoration: BoxDecoration(
                color: accentColor,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(theme.borderRadius),
                  topRight: Radius.circular(theme.borderRadius),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: DefaultTextStyle(
              style: theme.textStyle.copyWith(
                color: colors.foreground,
                fontSize: 14,
              ),
              child: widget.child,
            ),
          ),
        ],
      ),
    );

    if (widget.clickable) {
      card = MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: widget.onTap,
          behavior: HitTestBehavior.opaque,
          child: card,
        ),
      );
    }

    return card;
  }
}

/// A single stage column with a header and optional note bar.
class RefractionKanbanColumn extends StatelessWidget {
  /// Column definition (id, title, accent, note).
  final KanbanColumnDef def;

  /// Card count shown in the header badge. If omitted, derived from children.
  final int? count;

  /// Card elements placed inside the column.
  final List<Widget> children;

  const RefractionKanbanColumn({
    super.key,
    required this.def,
    this.count,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final derivedCount = count ?? children.length;
    final accentColor = _parseColor(def.accent);

    return Container(
      width: 280,
      decoration: BoxDecoration(
        color: colors.muted.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(theme.borderRadius + 4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 8),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    def.title,
                    style: theme.textStyle.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: colors.foreground,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: colors.muted,
                    borderRadius: BorderRadius.circular(9999),
                  ),
                  child: Text(
                    '$derivedCount',
                    style: theme.textStyle.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: colors.mutedForeground,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Accent bar
          Container(
            height: 2,
            color: accentColor ?? Colors.transparent,
          ),
          // Optional note bar
          if (def.note != null && def.note!.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(left: 16, right: 16, bottom: 8, top: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: colors.muted,
                borderRadius: BorderRadius.circular(theme.borderRadius),
              ),
              child: Text(
                def.note!,
                style: theme.textStyle.copyWith(
                  fontSize: 12,
                  color: colors.mutedForeground,
                ),
              ),
            ),
          // Body / Cards
          Expanded(
            child: ListView(
              padding: const EdgeInsets.only(left: 12, right: 12, bottom: 12, top: 4),
              children: children,
            ),
          ),
        ],
      ),
    );
  }
}

/// A generic multi-column stage board.
class RefractionKanbanBoard<T> extends StatelessWidget {
  /// Column definitions (order determines left-to-right render order).
  final List<KanbanColumnDef> columns;

  /// All cards to distribute into columns.
  final List<T> cards;

  /// Selector returning the column id for a card.
  final String Function(T card) getCardColumnId;

  /// Selector returning a unique key/id for a card.
  final String Function(T card) getCardKey;

  /// Render a single card inside a column.
  final Widget Function(T card, KanbanColumnDef columnDef) renderCard;

  /// Max visible cards per column before showing "+N more". Defaults to 5.
  final int cardCap;

  /// Called when the user taps "+N more" for a column.
  final void Function(String columnId)? onShowMore;

  const RefractionKanbanBoard({
    super.key,
    required this.columns,
    required this.cards,
    required this.getCardColumnId,
    required this.getCardKey,
    required this.renderCard,
    this.cardCap = 5,
    this.onShowMore,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return SizedBox(
      height: 500,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: columns.length,
        separatorBuilder: (context, index) => const SizedBox(width: 16),
        itemBuilder: (context, index) {
          final def = columns[index];
          // Filter cards matching this column id
          final colCards = cards.where((c) => getCardColumnId(c) == def.id).toList();
          final count = colCards.length;
          final visibleCards = colCards.take(cardCap).toList();
          final overflow = count - visibleCards.length;

          return RefractionKanbanColumn(
            def: def,
            count: count,
            children: [
              ...visibleCards.map((card) => Padding(
                key: ValueKey(getCardKey(card)),
                padding: const EdgeInsets.only(bottom: 8.0),
                child: renderCard(card, def),
              )),
              if (overflow > 0)
                MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: GestureDetector(
                    onTap: () => onShowMore?.call(def.id),
                    child: Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(theme.borderRadius),
                        border: Border.all(color: colors.border),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '+$overflow more',
                        style: theme.textStyle.copyWith(
                          fontSize: 12,
                          color: colors.mutedForeground,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
