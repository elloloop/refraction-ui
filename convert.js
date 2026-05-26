const fs = require('fs');

const tsData = fs.readFileSync('packages/emoji-picker/src/emoji-data.ts', 'utf8');

// I'll parse it using a regex or just evaluate it
const EMOJI_CATEGORIES = [
  'smileys',
  'people',
  'nature',
  'food',
  'travel',
  'activities',
  'objects',
  'symbols',
  'flags',
];

const CATEGORY_ICONS = {
  smileys: '\u{1F600}',
  people: '\u{1F44B}',
  nature: '\u{1F436}',
  food: '\u{1F34E}',
  travel: '\u{1F697}',
  activities: '\u26BD',
  objects: '\u{1F4BB}',
  symbols: '\u2764',
  flags: '\u{1F3C1}',
};

const CATEGORY_LABELS = {
  smileys: 'Smileys & Emotion',
  people: 'People & Body',
  nature: 'Animals & Nature',
  food: 'Food & Drink',
  travel: 'Travel & Places',
  activities: 'Activities',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
};

// Instead of fully parsing, let's just make a script that outputs Dart directly from the JS
