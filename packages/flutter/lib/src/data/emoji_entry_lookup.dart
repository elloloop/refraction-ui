import 'emoji_data.dart';

final _entriesByGrapheme = {
  for (final entry in EmojiData.all) entry.emoji: entry,
};

/// Preserve picker metadata when an artwork-supported grapheme is in the
/// canonical dataset. Asset-only graphemes use the Unicode string as their name.
EmojiEntry emojiEntryForGrapheme(String emoji) =>
    _entriesByGrapheme[emoji] ??
    EmojiEntry(emoji: emoji, name: emoji, category: EmojiCategory.symbols);
