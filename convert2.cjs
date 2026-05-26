const fs = require('fs');

const EMOJI_CATEGORIES = [
  'smileys', 'people', 'nature', 'food', 'travel', 'activities', 'objects', 'symbols', 'flags'
];

const CATEGORY_ICONS = {
  smileys: '\u{1F600}', people: '\u{1F44B}', nature: '\u{1F436}', food: '\u{1F34E}',
  travel: '\u{1F697}', activities: '\u26BD', objects: '\u{1F4BB}', symbols: '\u2764', flags: '\u{1F3C1}'
};

const CATEGORY_LABELS = {
  smileys: 'Smileys & Emotion', people: 'People & Body', nature: 'Animals & Nature',
  food: 'Food & Drink', travel: 'Travel & Places', activities: 'Activities',
  objects: 'Objects', symbols: 'Symbols', flags: 'Flags'
};

// We will read temp.cjs but just eval it
const tempCode = fs.readFileSync('temp.cjs', 'utf8');
const dataStr = tempCode.substring(0, tempCode.indexOf('/** All categories'));
const data = eval('(' + dataStr.replace('module.exports =', '').trim() + ')');

let dartCode = `import 'package:flutter/material.dart';

enum EmojiCategory {
  smileys,
  people,
  nature,
  food,
  travel,
  activities,
  objects,
  symbols,
  flags,
}

class EmojiEntry {
  final String emoji;
  final String name;
  final EmojiCategory category;
  final List<String> keywords;

  const EmojiEntry({
    required this.emoji,
    required this.name,
    required this.category,
    required this.keywords,
  });
}

class EmojiData {
  static const Map<EmojiCategory, String> categoryIcons = {
    EmojiCategory.smileys: '${CATEGORY_ICONS.smileys}',
    EmojiCategory.people: '${CATEGORY_ICONS.people}',
    EmojiCategory.nature: '${CATEGORY_ICONS.nature}',
    EmojiCategory.food: '${CATEGORY_ICONS.food}',
    EmojiCategory.travel: '${CATEGORY_ICONS.travel}',
    EmojiCategory.activities: '${CATEGORY_ICONS.activities}',
    EmojiCategory.objects: '${CATEGORY_ICONS.objects}',
    EmojiCategory.symbols: '${CATEGORY_ICONS.symbols}',
    EmojiCategory.flags: '${CATEGORY_ICONS.flags}',
  };

  static const Map<EmojiCategory, String> categoryLabels = {
    EmojiCategory.smileys: '${CATEGORY_LABELS.smileys}',
    EmojiCategory.people: '${CATEGORY_LABELS.people}',
    EmojiCategory.nature: '${CATEGORY_LABELS.nature}',
    EmojiCategory.food: '${CATEGORY_LABELS.food}',
    EmojiCategory.travel: '${CATEGORY_LABELS.travel}',
    EmojiCategory.activities: '${CATEGORY_LABELS.activities}',
    EmojiCategory.objects: '${CATEGORY_LABELS.objects}',
    EmojiCategory.symbols: '${CATEGORY_LABELS.symbols}',
    EmojiCategory.flags: '${CATEGORY_LABELS.flags}',
  };

  static const List<EmojiCategory> categories = EmojiCategory.values;

  static const Map<EmojiCategory, List<EmojiEntry>> data = {
`;

for (const cat of EMOJI_CATEGORIES) {
  dartCode += `    EmojiCategory.${cat}: [\n`;
  for (const entry of data[cat]) {
    const kws = entry.keywords.map(k => `'${k.replace(/'/g, "\\'")}'`).join(', ');
    dartCode += `      EmojiEntry(emoji: '${entry.emoji}', name: '${entry.name.replace(/'/g, "\\'")}', category: EmojiCategory.${entry.category}, keywords: [${kws}]),\n`;
  }
  dartCode += `    ],\n`;
}

dartCode += `  };

  static List<EmojiEntry> getAllEmojis() {
    return categories.expand((cat) => data[cat]!).toList();
  }
}
`;

fs.writeFileSync('packages/flutter/lib/src/components/emoji_picker_data.dart', dartCode);
