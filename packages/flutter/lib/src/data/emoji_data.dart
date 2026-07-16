import 'emoji_dataset.g.dart';
import 'emoji_types.dart';

export 'emoji_renderers.dart';
export 'emoji_types.dart';

/// The library's complete, canonical emoji dataset.
///
/// Backed by the generated [kRefractionEmojiDataset] (see
/// `tool/generate_emoji_data.dart`) — the single source of truth that both
/// [RefractionEmojiPicker] and the composer's `refractionDefaultShortcodes()`
/// consume, so a picker selection and a `:shortcode:` always agree.
class EmojiData {
  const EmojiData._();

  /// Representative glyph per category (for tab affordances).
  static const Map<EmojiCategory, String> categoryIcons =
      EmojiCategoryMeta.icons;

  /// Human-readable category names.
  static const Map<EmojiCategory, String> categoryLabels =
      EmojiCategoryMeta.labels;

  /// All content categories in canonical order.
  static const List<EmojiCategory> categories = EmojiCategory.values;

  /// The flat dataset in canonical Unicode order.
  static const List<EmojiEntry> all = kRefractionEmojiDataset;

  static Map<EmojiCategory, List<EmojiEntry>>? _grouped;

  /// The dataset grouped by category (lazily computed once, then cached).
  static Map<EmojiCategory, List<EmojiEntry>> get data {
    final cached = _grouped;
    if (cached != null) return cached;
    final map = <EmojiCategory, List<EmojiEntry>>{
      for (final c in EmojiCategory.values) c: <EmojiEntry>[],
    };
    for (final entry in kRefractionEmojiDataset) {
      map[entry.category]!.add(entry);
    }
    return _grouped = {
      for (final e in map.entries) e.key: List.unmodifiable(e.value),
    };
  }

  /// Every emoji, flat.
  static List<EmojiEntry> getAllEmojis() => kRefractionEmojiDataset;

  /// Case-insensitive search over shortcodes, name, and keywords.
  ///
  /// Ranked by field priority so the most relevant glyph leads (a `:`
  /// shortcode picker feels instant this way): an exact shortcode match beats
  /// an exact name, which beats an exact keyword tag; prefix beats substring
  /// within each. So `joy` surfaces 😂 (shortcode) ahead of 😃 (keyword tag).
  static List<EmojiEntry> search(String rawQuery) {
    final query = rawQuery.toLowerCase().trim();
    if (query.isEmpty) return const [];
    // Lower score = better. 99 = no match.
    int rank(
      String term, {
      required int exact,
      required int prefix,
      required int sub,
    }) {
      if (term == query) return exact;
      if (term.startsWith(query)) return prefix;
      if (term.contains(query)) return sub;
      return 99;
    }

    final scored = <(int, int, EmojiEntry)>[];
    var order = 0;
    for (final entry in kRefractionEmojiDataset) {
      var best = 99;
      for (final s in entry.shortcodes) {
        final score = rank(s.toLowerCase(), exact: 0, prefix: 3, sub: 6);
        if (score < best) best = score;
      }
      final nameScore = rank(
        entry.name.toLowerCase(),
        exact: 1,
        prefix: 4,
        sub: 7,
      );
      if (nameScore < best) best = nameScore;
      for (final k in entry.keywords) {
        final ks = rank(k.toLowerCase(), exact: 2, prefix: 5, sub: 8);
        if (ks < best) best = ks;
      }
      if (best < 99) scored.add((best, order++, entry));
    }
    scored.sort((a, b) {
      final byScore = a.$1.compareTo(b.$1);
      return byScore != 0 ? byScore : a.$2.compareTo(b.$2);
    });
    return [for (final s in scored) s.$3];
  }
}
