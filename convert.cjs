const fs = require('fs');
const tsCode = fs.readFileSync('packages/emoji-picker/src/emoji-data.ts', 'utf8');

const jsCode = tsCode
  .replace(/export type .*?\n/g, '')
  .replace(/export interface .*?\}[\n]/gs, '')
  .replace(/export const .*?: .*? =/g, 'const EMOJI_DATA =')
  .replace(/export function.*?\n\}/gs, '')
  .replace(/export const EMOJI_CATEGORIES.*?;/g, '')
  .replace(/export const CATEGORY_LABELS.*?;/g, '');

const match = tsCode.match(/export const EMOJI_DATA: Record<EmojiCategory, EmojiEntry\[\]> = (\{.*?\});/s);

let dartOut = `import 'package:flutter/material.dart';\nimport '../theme/theme.dart';\n\n`;

dartOut += `enum EmojiCategory {\n  smileys,\n  people,\n  nature,\n  food,\n  travel,\n  activities,\n  objects,\n  symbols,\n  flags,\n}\n\n`;

dartOut += `class EmojiEntry {\n  final String emoji;\n  final String name;\n  final EmojiCategory category;\n  final List<String> keywords;\n\n  const EmojiEntry({\n    required this.emoji,\n    required this.name,\n    required this.category,\n    required this.keywords,\n  });\n}\n\n`;

// Parse EMOJI_DATA manually or through naive string replacement
// Actually, it's valid JS except for \u{XXXX} which is valid JS but we can just use node to eval it if we strip types
let cleanedCode = tsCode.replace(/export const EMOJI_DATA: Record<EmojiCategory, EmojiEntry\[\]> = /s, 'module.exports = ').replace(/export.*?\n/g, '').replace(/import.*?\n/g,'').replace(/export interface.*?\}\n/gs,'').replace(/export type.*?\n/g, '');
fs.writeFileSync('temp.cjs', cleanedCode);
