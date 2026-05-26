import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

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
    EmojiCategory.smileys: '😀',
    EmojiCategory.people: '👋',
    EmojiCategory.nature: '🐶',
    EmojiCategory.food: '🍎',
    EmojiCategory.travel: '🚗',
    EmojiCategory.activities: '⚽',
    EmojiCategory.objects: '💻',
    EmojiCategory.symbols: '❤',
    EmojiCategory.flags: '🏁',
  };

  static const Map<EmojiCategory, String> categoryLabels = {
    EmojiCategory.smileys: 'Smileys & Emotion',
    EmojiCategory.people: 'People & Body',
    EmojiCategory.nature: 'Animals & Nature',
    EmojiCategory.food: 'Food & Drink',
    EmojiCategory.travel: 'Travel & Places',
    EmojiCategory.activities: 'Activities',
    EmojiCategory.objects: 'Objects',
    EmojiCategory.symbols: 'Symbols',
    EmojiCategory.flags: 'Flags',
  };

  static const List<EmojiCategory> categories = EmojiCategory.values;

  static const Map<EmojiCategory, List<EmojiEntry>> data = {
    EmojiCategory.smileys: [
      EmojiEntry(
        emoji: '😀',
        name: 'grinning face',
        category: EmojiCategory.smileys,
        keywords: ['happy', 'smile', 'grin'],
      ),
      EmojiEntry(
        emoji: '😃',
        name: 'grinning face with big eyes',
        category: EmojiCategory.smileys,
        keywords: ['happy', 'smile'],
      ),
      EmojiEntry(
        emoji: '😄',
        name: 'grinning face with smiling eyes',
        category: EmojiCategory.smileys,
        keywords: ['happy', 'joy'],
      ),
      EmojiEntry(
        emoji: '😁',
        name: 'beaming face',
        category: EmojiCategory.smileys,
        keywords: ['happy', 'grin', 'beam'],
      ),
      EmojiEntry(
        emoji: '😆',
        name: 'grinning squinting face',
        category: EmojiCategory.smileys,
        keywords: ['laugh', 'happy'],
      ),
      EmojiEntry(
        emoji: '😅',
        name: 'grinning face with sweat',
        category: EmojiCategory.smileys,
        keywords: ['nervous', 'laugh'],
      ),
      EmojiEntry(
        emoji: '🤣',
        name: 'rolling on the floor laughing',
        category: EmojiCategory.smileys,
        keywords: ['lol', 'rofl', 'laugh'],
      ),
      EmojiEntry(
        emoji: '😂',
        name: 'face with tears of joy',
        category: EmojiCategory.smileys,
        keywords: ['laugh', 'cry', 'joy', 'lol'],
      ),
      EmojiEntry(
        emoji: '🙂',
        name: 'slightly smiling face',
        category: EmojiCategory.smileys,
        keywords: ['smile', 'happy'],
      ),
      EmojiEntry(
        emoji: '🙃',
        name: 'upside-down face',
        category: EmojiCategory.smileys,
        keywords: ['silly', 'sarcasm'],
      ),
      EmojiEntry(
        emoji: '😉',
        name: 'winking face',
        category: EmojiCategory.smileys,
        keywords: ['wink', 'flirt'],
      ),
      EmojiEntry(
        emoji: '😊',
        name: 'smiling face with smiling eyes',
        category: EmojiCategory.smileys,
        keywords: ['blush', 'happy'],
      ),
      EmojiEntry(
        emoji: '😇',
        name: 'smiling face with halo',
        category: EmojiCategory.smileys,
        keywords: ['angel', 'innocent'],
      ),
      EmojiEntry(
        emoji: '🥰',
        name: 'smiling face with hearts',
        category: EmojiCategory.smileys,
        keywords: ['love', 'crush', 'adore'],
      ),
      EmojiEntry(
        emoji: '😍',
        name: 'smiling face with heart-eyes',
        category: EmojiCategory.smileys,
        keywords: ['love', 'heart'],
      ),
      EmojiEntry(
        emoji: '🤩',
        name: 'star-struck',
        category: EmojiCategory.smileys,
        keywords: ['star', 'eyes', 'wow'],
      ),
      EmojiEntry(
        emoji: '😘',
        name: 'face blowing a kiss',
        category: EmojiCategory.smileys,
        keywords: ['kiss', 'love'],
      ),
      EmojiEntry(
        emoji: '😗',
        name: 'kissing face',
        category: EmojiCategory.smileys,
        keywords: ['kiss'],
      ),
      EmojiEntry(
        emoji: '😚',
        name: 'kissing face with closed eyes',
        category: EmojiCategory.smileys,
        keywords: ['kiss', 'love'],
      ),
      EmojiEntry(
        emoji: '😙',
        name: 'kissing face with smiling eyes',
        category: EmojiCategory.smileys,
        keywords: ['kiss'],
      ),
      EmojiEntry(
        emoji: '😋',
        name: 'face savoring food',
        category: EmojiCategory.smileys,
        keywords: ['yummy', 'delicious'],
      ),
      EmojiEntry(
        emoji: '😜',
        name: 'winking face with tongue',
        category: EmojiCategory.smileys,
        keywords: ['tongue', 'wink', 'silly'],
      ),
      EmojiEntry(
        emoji: '😝',
        name: 'squinting face with tongue',
        category: EmojiCategory.smileys,
        keywords: ['tongue', 'silly'],
      ),
      EmojiEntry(
        emoji: '🤑',
        name: 'money-mouth face',
        category: EmojiCategory.smileys,
        keywords: ['money', 'rich'],
      ),
      EmojiEntry(
        emoji: '🤗',
        name: 'hugging face',
        category: EmojiCategory.smileys,
        keywords: ['hug', 'warm'],
      ),
      EmojiEntry(
        emoji: '🤔',
        name: 'thinking face',
        category: EmojiCategory.smileys,
        keywords: ['think', 'hmm'],
      ),
      EmojiEntry(
        emoji: '🤐',
        name: 'zipper-mouth face',
        category: EmojiCategory.smileys,
        keywords: ['secret', 'quiet', 'zip'],
      ),
      EmojiEntry(
        emoji: '🤨',
        name: 'face with raised eyebrow',
        category: EmojiCategory.smileys,
        keywords: ['skeptical', 'doubt'],
      ),
      EmojiEntry(
        emoji: '😐',
        name: 'neutral face',
        category: EmojiCategory.smileys,
        keywords: ['meh', 'neutral'],
      ),
      EmojiEntry(
        emoji: '😑',
        name: 'expressionless face',
        category: EmojiCategory.smileys,
        keywords: ['blank', 'expressionless'],
      ),
    ],
    EmojiCategory.people: [
      EmojiEntry(
        emoji: '👋',
        name: 'waving hand',
        category: EmojiCategory.people,
        keywords: ['wave', 'hello', 'hi', 'bye'],
      ),
      EmojiEntry(
        emoji: '🤚',
        name: 'raised back of hand',
        category: EmojiCategory.people,
        keywords: ['hand', 'backhand'],
      ),
      EmojiEntry(
        emoji: '🖐',
        name: 'hand with fingers splayed',
        category: EmojiCategory.people,
        keywords: ['hand', 'fingers'],
      ),
      EmojiEntry(
        emoji: '✋',
        name: 'raised hand',
        category: EmojiCategory.people,
        keywords: ['hand', 'stop', 'high five'],
      ),
      EmojiEntry(
        emoji: '🖖',
        name: 'vulcan salute',
        category: EmojiCategory.people,
        keywords: ['spock', 'star trek'],
      ),
      EmojiEntry(
        emoji: '👌',
        name: 'OK hand',
        category: EmojiCategory.people,
        keywords: ['ok', 'perfect', 'fine'],
      ),
      EmojiEntry(
        emoji: '✌',
        name: 'victory hand',
        category: EmojiCategory.people,
        keywords: ['peace', 'victory', 'v'],
      ),
      EmojiEntry(
        emoji: '🤞',
        name: 'crossed fingers',
        category: EmojiCategory.people,
        keywords: ['luck', 'hope'],
      ),
      EmojiEntry(
        emoji: '🤘',
        name: 'love-you gesture',
        category: EmojiCategory.people,
        keywords: ['love', 'rock'],
      ),
      EmojiEntry(
        emoji: '🤙',
        name: 'call me hand',
        category: EmojiCategory.people,
        keywords: ['call', 'phone'],
      ),
      EmojiEntry(
        emoji: '👈',
        name: 'backhand index pointing left',
        category: EmojiCategory.people,
        keywords: ['left', 'point'],
      ),
      EmojiEntry(
        emoji: '👉',
        name: 'backhand index pointing right',
        category: EmojiCategory.people,
        keywords: ['right', 'point'],
      ),
      EmojiEntry(
        emoji: '👆',
        name: 'backhand index pointing up',
        category: EmojiCategory.people,
        keywords: ['up', 'point'],
      ),
      EmojiEntry(
        emoji: '👇',
        name: 'backhand index pointing down',
        category: EmojiCategory.people,
        keywords: ['down', 'point'],
      ),
      EmojiEntry(
        emoji: '☝',
        name: 'index pointing up',
        category: EmojiCategory.people,
        keywords: ['up', 'point'],
      ),
      EmojiEntry(
        emoji: '👍',
        name: 'thumbs up',
        category: EmojiCategory.people,
        keywords: ['like', 'yes', 'approve', 'thumbsup'],
      ),
      EmojiEntry(
        emoji: '👎',
        name: 'thumbs down',
        category: EmojiCategory.people,
        keywords: ['dislike', 'no', 'disapprove'],
      ),
      EmojiEntry(
        emoji: '✊',
        name: 'raised fist',
        category: EmojiCategory.people,
        keywords: ['fist', 'power'],
      ),
      EmojiEntry(
        emoji: '👊',
        name: 'oncoming fist',
        category: EmojiCategory.people,
        keywords: ['punch', 'fist bump'],
      ),
      EmojiEntry(
        emoji: '🤛',
        name: 'left-facing fist',
        category: EmojiCategory.people,
        keywords: ['fist'],
      ),
      EmojiEntry(
        emoji: '🤜',
        name: 'right-facing fist',
        category: EmojiCategory.people,
        keywords: ['fist'],
      ),
      EmojiEntry(
        emoji: '👏',
        name: 'clapping hands',
        category: EmojiCategory.people,
        keywords: ['clap', 'applause', 'bravo'],
      ),
      EmojiEntry(
        emoji: '🙌',
        name: 'raising hands',
        category: EmojiCategory.people,
        keywords: ['celebrate', 'hooray'],
      ),
      EmojiEntry(
        emoji: '👐',
        name: 'open hands',
        category: EmojiCategory.people,
        keywords: ['hands', 'open'],
      ),
      EmojiEntry(
        emoji: '🤲',
        name: 'palms up together',
        category: EmojiCategory.people,
        keywords: ['prayer', 'please'],
      ),
      EmojiEntry(
        emoji: '🤝',
        name: 'handshake',
        category: EmojiCategory.people,
        keywords: ['deal', 'agree', 'shake'],
      ),
      EmojiEntry(
        emoji: '🙏',
        name: 'folded hands',
        category: EmojiCategory.people,
        keywords: ['pray', 'please', 'thank you'],
      ),
    ],
    EmojiCategory.nature: [
      EmojiEntry(
        emoji: '🐶',
        name: 'dog face',
        category: EmojiCategory.nature,
        keywords: ['dog', 'puppy', 'pet'],
      ),
      EmojiEntry(
        emoji: '🐱',
        name: 'cat face',
        category: EmojiCategory.nature,
        keywords: ['cat', 'kitten', 'pet'],
      ),
      EmojiEntry(
        emoji: '🐭',
        name: 'mouse face',
        category: EmojiCategory.nature,
        keywords: ['mouse', 'rodent'],
      ),
      EmojiEntry(
        emoji: '🐹',
        name: 'hamster',
        category: EmojiCategory.nature,
        keywords: ['hamster', 'pet'],
      ),
      EmojiEntry(
        emoji: '🐰',
        name: 'rabbit face',
        category: EmojiCategory.nature,
        keywords: ['rabbit', 'bunny'],
      ),
      EmojiEntry(
        emoji: '🦊',
        name: 'fox',
        category: EmojiCategory.nature,
        keywords: ['fox', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐻',
        name: 'bear',
        category: EmojiCategory.nature,
        keywords: ['bear', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐼',
        name: 'panda',
        category: EmojiCategory.nature,
        keywords: ['panda', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐨',
        name: 'koala',
        category: EmojiCategory.nature,
        keywords: ['koala', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐯',
        name: 'tiger face',
        category: EmojiCategory.nature,
        keywords: ['tiger', 'animal'],
      ),
      EmojiEntry(
        emoji: '🦁',
        name: 'lion',
        category: EmojiCategory.nature,
        keywords: ['lion', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐮',
        name: 'cow face',
        category: EmojiCategory.nature,
        keywords: ['cow', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐷',
        name: 'pig face',
        category: EmojiCategory.nature,
        keywords: ['pig', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐸',
        name: 'frog',
        category: EmojiCategory.nature,
        keywords: ['frog', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐵',
        name: 'monkey face',
        category: EmojiCategory.nature,
        keywords: ['monkey', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐒',
        name: 'monkey',
        category: EmojiCategory.nature,
        keywords: ['monkey', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐔',
        name: 'chicken',
        category: EmojiCategory.nature,
        keywords: ['chicken', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐧',
        name: 'penguin',
        category: EmojiCategory.nature,
        keywords: ['penguin', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐦',
        name: 'bird',
        category: EmojiCategory.nature,
        keywords: ['bird', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐊',
        name: 'crocodile',
        category: EmojiCategory.nature,
        keywords: ['crocodile', 'animal'],
      ),
      EmojiEntry(
        emoji: '🐢',
        name: 'turtle',
        category: EmojiCategory.nature,
        keywords: ['turtle', 'slow'],
      ),
      EmojiEntry(
        emoji: '🐍',
        name: 'snake',
        category: EmojiCategory.nature,
        keywords: ['snake', 'animal'],
      ),
      EmojiEntry(
        emoji: '🌲',
        name: 'evergreen tree',
        category: EmojiCategory.nature,
        keywords: ['tree', 'pine'],
      ),
      EmojiEntry(
        emoji: '🌳',
        name: 'deciduous tree',
        category: EmojiCategory.nature,
        keywords: ['tree'],
      ),
      EmojiEntry(
        emoji: '🌴',
        name: 'palm tree',
        category: EmojiCategory.nature,
        keywords: ['palm', 'tree', 'tropical'],
      ),
      EmojiEntry(
        emoji: '🌵',
        name: 'cactus',
        category: EmojiCategory.nature,
        keywords: ['cactus', 'desert'],
      ),
      EmojiEntry(
        emoji: '🌷',
        name: 'tulip',
        category: EmojiCategory.nature,
        keywords: ['flower', 'tulip'],
      ),
      EmojiEntry(
        emoji: '🌹',
        name: 'rose',
        category: EmojiCategory.nature,
        keywords: ['flower', 'rose', 'love'],
      ),
    ],
    EmojiCategory.food: [
      EmojiEntry(
        emoji: '🍎',
        name: 'red apple',
        category: EmojiCategory.food,
        keywords: ['apple', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍊',
        name: 'tangerine',
        category: EmojiCategory.food,
        keywords: ['orange', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍋',
        name: 'lemon',
        category: EmojiCategory.food,
        keywords: ['lemon', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍌',
        name: 'banana',
        category: EmojiCategory.food,
        keywords: ['banana', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍉',
        name: 'watermelon',
        category: EmojiCategory.food,
        keywords: ['watermelon', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍇',
        name: 'grapes',
        category: EmojiCategory.food,
        keywords: ['grapes', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍓',
        name: 'strawberry',
        category: EmojiCategory.food,
        keywords: ['strawberry', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍒',
        name: 'cherries',
        category: EmojiCategory.food,
        keywords: ['cherry', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍑',
        name: 'peach',
        category: EmojiCategory.food,
        keywords: ['peach', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍍',
        name: 'pineapple',
        category: EmojiCategory.food,
        keywords: ['pineapple', 'fruit'],
      ),
      EmojiEntry(
        emoji: '🍔',
        name: 'hamburger',
        category: EmojiCategory.food,
        keywords: ['burger', 'fast food'],
      ),
      EmojiEntry(
        emoji: '🍕',
        name: 'pizza',
        category: EmojiCategory.food,
        keywords: ['pizza', 'food'],
      ),
      EmojiEntry(
        emoji: '🌮',
        name: 'taco',
        category: EmojiCategory.food,
        keywords: ['taco', 'mexican'],
      ),
      EmojiEntry(
        emoji: '🌯',
        name: 'burrito',
        category: EmojiCategory.food,
        keywords: ['burrito', 'mexican'],
      ),
      EmojiEntry(
        emoji: '🍟',
        name: 'french fries',
        category: EmojiCategory.food,
        keywords: ['fries', 'fast food'],
      ),
      EmojiEntry(
        emoji: '🍗',
        name: 'poultry leg',
        category: EmojiCategory.food,
        keywords: ['chicken', 'meat'],
      ),
      EmojiEntry(
        emoji: '🍖',
        name: 'meat on bone',
        category: EmojiCategory.food,
        keywords: ['meat', 'bone'],
      ),
      EmojiEntry(
        emoji: '🍣',
        name: 'sushi',
        category: EmojiCategory.food,
        keywords: ['sushi', 'japanese'],
      ),
      EmojiEntry(
        emoji: '🍰',
        name: 'shortcake',
        category: EmojiCategory.food,
        keywords: ['cake', 'dessert'],
      ),
      EmojiEntry(
        emoji: '🍫',
        name: 'chocolate bar',
        category: EmojiCategory.food,
        keywords: ['chocolate', 'candy'],
      ),
      EmojiEntry(
        emoji: '🍩',
        name: 'doughnut',
        category: EmojiCategory.food,
        keywords: ['donut', 'dessert'],
      ),
      EmojiEntry(
        emoji: '🍪',
        name: 'cookie',
        category: EmojiCategory.food,
        keywords: ['cookie', 'dessert'],
      ),
      EmojiEntry(
        emoji: '☕',
        name: 'hot beverage',
        category: EmojiCategory.food,
        keywords: ['coffee', 'tea', 'drink'],
      ),
      EmojiEntry(
        emoji: '🍺',
        name: 'beer mug',
        category: EmojiCategory.food,
        keywords: ['beer', 'drink'],
      ),
      EmojiEntry(
        emoji: '🍷',
        name: 'wine glass',
        category: EmojiCategory.food,
        keywords: ['wine', 'drink'],
      ),
    ],
    EmojiCategory.travel: [
      EmojiEntry(
        emoji: '🚗',
        name: 'automobile',
        category: EmojiCategory.travel,
        keywords: ['car', 'drive'],
      ),
      EmojiEntry(
        emoji: '🚕',
        name: 'taxi',
        category: EmojiCategory.travel,
        keywords: ['taxi', 'cab'],
      ),
      EmojiEntry(
        emoji: '🚌',
        name: 'bus',
        category: EmojiCategory.travel,
        keywords: ['bus', 'transit'],
      ),
      EmojiEntry(
        emoji: '🚂',
        name: 'locomotive',
        category: EmojiCategory.travel,
        keywords: ['train', 'rail'],
      ),
      EmojiEntry(
        emoji: '✈',
        name: 'airplane',
        category: EmojiCategory.travel,
        keywords: ['plane', 'fly', 'travel'],
      ),
      EmojiEntry(
        emoji: '🚀',
        name: 'rocket',
        category: EmojiCategory.travel,
        keywords: ['rocket', 'space', 'launch'],
      ),
      EmojiEntry(
        emoji: '🛸',
        name: 'flying saucer',
        category: EmojiCategory.travel,
        keywords: ['ufo', 'alien'],
      ),
      EmojiEntry(
        emoji: '🚢',
        name: 'ship',
        category: EmojiCategory.travel,
        keywords: ['ship', 'boat', 'cruise'],
      ),
      EmojiEntry(
        emoji: '🏠',
        name: 'house',
        category: EmojiCategory.travel,
        keywords: ['house', 'home'],
      ),
      EmojiEntry(
        emoji: '🏢',
        name: 'office building',
        category: EmojiCategory.travel,
        keywords: ['office', 'building', 'work'],
      ),
      EmojiEntry(
        emoji: '🏫',
        name: 'school',
        category: EmojiCategory.travel,
        keywords: ['school', 'education'],
      ),
      EmojiEntry(
        emoji: '🏥',
        name: 'hospital',
        category: EmojiCategory.travel,
        keywords: ['hospital', 'health'],
      ),
      EmojiEntry(
        emoji: '🌍',
        name: 'globe showing Europe-Africa',
        category: EmojiCategory.travel,
        keywords: ['earth', 'globe', 'world'],
      ),
      EmojiEntry(
        emoji: '🌎',
        name: 'globe showing Americas',
        category: EmojiCategory.travel,
        keywords: ['earth', 'globe', 'world'],
      ),
      EmojiEntry(
        emoji: '🌏',
        name: 'globe showing Asia-Australia',
        category: EmojiCategory.travel,
        keywords: ['earth', 'globe', 'world'],
      ),
      EmojiEntry(
        emoji: '🗼',
        name: 'Tokyo tower',
        category: EmojiCategory.travel,
        keywords: ['tokyo', 'japan', 'tower'],
      ),
      EmojiEntry(
        emoji: '🗽',
        name: 'Statue of Liberty',
        category: EmojiCategory.travel,
        keywords: ['statue', 'liberty', 'new york'],
      ),
      EmojiEntry(
        emoji: '⛰',
        name: 'mountain',
        category: EmojiCategory.travel,
        keywords: ['mountain', 'nature'],
      ),
      EmojiEntry(
        emoji: '🏖',
        name: 'beach with umbrella',
        category: EmojiCategory.travel,
        keywords: ['beach', 'vacation'],
      ),
      EmojiEntry(
        emoji: '🏝',
        name: 'desert island',
        category: EmojiCategory.travel,
        keywords: ['island', 'tropical'],
      ),
    ],
    EmojiCategory.activities: [
      EmojiEntry(
        emoji: '⚽',
        name: 'soccer ball',
        category: EmojiCategory.activities,
        keywords: ['soccer', 'football', 'sport'],
      ),
      EmojiEntry(
        emoji: '🏀',
        name: 'basketball',
        category: EmojiCategory.activities,
        keywords: ['basketball', 'sport'],
      ),
      EmojiEntry(
        emoji: '🏈',
        name: 'american football',
        category: EmojiCategory.activities,
        keywords: ['football', 'sport'],
      ),
      EmojiEntry(
        emoji: '⚾',
        name: 'baseball',
        category: EmojiCategory.activities,
        keywords: ['baseball', 'sport'],
      ),
      EmojiEntry(
        emoji: '🎾',
        name: 'tennis',
        category: EmojiCategory.activities,
        keywords: ['tennis', 'sport'],
      ),
      EmojiEntry(
        emoji: '🏐',
        name: 'volleyball',
        category: EmojiCategory.activities,
        keywords: ['volleyball', 'sport'],
      ),
      EmojiEntry(
        emoji: '🎱',
        name: 'pool 8 ball',
        category: EmojiCategory.activities,
        keywords: ['pool', 'billiards'],
      ),
      EmojiEntry(
        emoji: '🏓',
        name: 'ping pong',
        category: EmojiCategory.activities,
        keywords: ['table tennis', 'sport'],
      ),
      EmojiEntry(
        emoji: '🏆',
        name: 'trophy',
        category: EmojiCategory.activities,
        keywords: ['trophy', 'winner', 'award'],
      ),
      EmojiEntry(
        emoji: '🏅',
        name: 'sports medal',
        category: EmojiCategory.activities,
        keywords: ['medal', 'winner'],
      ),
      EmojiEntry(
        emoji: '🥇',
        name: 'first place medal',
        category: EmojiCategory.activities,
        keywords: ['gold', 'first', 'winner'],
      ),
      EmojiEntry(
        emoji: '🥈',
        name: 'second place medal',
        category: EmojiCategory.activities,
        keywords: ['silver', 'second'],
      ),
      EmojiEntry(
        emoji: '🥉',
        name: 'third place medal',
        category: EmojiCategory.activities,
        keywords: ['bronze', 'third'],
      ),
      EmojiEntry(
        emoji: '🎯',
        name: 'bullseye',
        category: EmojiCategory.activities,
        keywords: ['target', 'dart'],
      ),
      EmojiEntry(
        emoji: '🎮',
        name: 'video game',
        category: EmojiCategory.activities,
        keywords: ['game', 'controller'],
      ),
      EmojiEntry(
        emoji: '🎲',
        name: 'game die',
        category: EmojiCategory.activities,
        keywords: ['dice', 'game'],
      ),
      EmojiEntry(
        emoji: '🎵',
        name: 'musical note',
        category: EmojiCategory.activities,
        keywords: ['music', 'note'],
      ),
      EmojiEntry(
        emoji: '🎶',
        name: 'musical notes',
        category: EmojiCategory.activities,
        keywords: ['music', 'notes'],
      ),
      EmojiEntry(
        emoji: '🎤',
        name: 'microphone',
        category: EmojiCategory.activities,
        keywords: ['karaoke', 'sing', 'mic'],
      ),
      EmojiEntry(
        emoji: '🎬',
        name: 'clapper board',
        category: EmojiCategory.activities,
        keywords: ['movie', 'film'],
      ),
    ],
    EmojiCategory.objects: [
      EmojiEntry(
        emoji: '📱',
        name: 'mobile phone',
        category: EmojiCategory.objects,
        keywords: ['phone', 'mobile', 'cell'],
      ),
      EmojiEntry(
        emoji: '💻',
        name: 'laptop',
        category: EmojiCategory.objects,
        keywords: ['laptop', 'computer'],
      ),
      EmojiEntry(
        emoji: '🖥',
        name: 'desktop computer',
        category: EmojiCategory.objects,
        keywords: ['computer', 'desktop'],
      ),
      EmojiEntry(
        emoji: '⌨',
        name: 'keyboard',
        category: EmojiCategory.objects,
        keywords: ['keyboard', 'type'],
      ),
      EmojiEntry(
        emoji: '📷',
        name: 'camera',
        category: EmojiCategory.objects,
        keywords: ['camera', 'photo'],
      ),
      EmojiEntry(
        emoji: '📺',
        name: 'television',
        category: EmojiCategory.objects,
        keywords: ['tv', 'television'],
      ),
      EmojiEntry(
        emoji: '📧',
        name: 'e-mail',
        category: EmojiCategory.objects,
        keywords: ['email', 'mail'],
      ),
      EmojiEntry(
        emoji: '📝',
        name: 'memo',
        category: EmojiCategory.objects,
        keywords: ['memo', 'note', 'write'],
      ),
      EmojiEntry(
        emoji: '📖',
        name: 'open book',
        category: EmojiCategory.objects,
        keywords: ['book', 'read'],
      ),
      EmojiEntry(
        emoji: '📚',
        name: 'books',
        category: EmojiCategory.objects,
        keywords: ['books', 'library'],
      ),
      EmojiEntry(
        emoji: '📅',
        name: 'calendar',
        category: EmojiCategory.objects,
        keywords: ['calendar', 'date'],
      ),
      EmojiEntry(
        emoji: '📋',
        name: 'clipboard',
        category: EmojiCategory.objects,
        keywords: ['clipboard', 'paste'],
      ),
      EmojiEntry(
        emoji: '📌',
        name: 'pushpin',
        category: EmojiCategory.objects,
        keywords: ['pin', 'pushpin'],
      ),
      EmojiEntry(
        emoji: '📎',
        name: 'paperclip',
        category: EmojiCategory.objects,
        keywords: ['paperclip', 'attach'],
      ),
      EmojiEntry(
        emoji: '🔑',
        name: 'key',
        category: EmojiCategory.objects,
        keywords: ['key', 'lock'],
      ),
      EmojiEntry(
        emoji: '🔒',
        name: 'locked',
        category: EmojiCategory.objects,
        keywords: ['lock', 'secure'],
      ),
      EmojiEntry(
        emoji: '🔓',
        name: 'unlocked',
        category: EmojiCategory.objects,
        keywords: ['unlock', 'open'],
      ),
      EmojiEntry(
        emoji: '🔍',
        name: 'magnifying glass tilted left',
        category: EmojiCategory.objects,
        keywords: ['search', 'find'],
      ),
      EmojiEntry(
        emoji: '💡',
        name: 'light bulb',
        category: EmojiCategory.objects,
        keywords: ['idea', 'light'],
      ),
      EmojiEntry(
        emoji: '🔧',
        name: 'wrench',
        category: EmojiCategory.objects,
        keywords: ['tool', 'wrench', 'fix'],
      ),
      EmojiEntry(
        emoji: '🔨',
        name: 'hammer',
        category: EmojiCategory.objects,
        keywords: ['tool', 'hammer', 'build'],
      ),
      EmojiEntry(
        emoji: '⚙',
        name: 'gear',
        category: EmojiCategory.objects,
        keywords: ['settings', 'gear', 'config'],
      ),
    ],
    EmojiCategory.symbols: [
      EmojiEntry(
        emoji: '❤',
        name: 'red heart',
        category: EmojiCategory.symbols,
        keywords: ['heart', 'love'],
      ),
      EmojiEntry(
        emoji: '🧡',
        name: 'orange heart',
        category: EmojiCategory.symbols,
        keywords: ['heart', 'orange'],
      ),
      EmojiEntry(
        emoji: '💛',
        name: 'yellow heart',
        category: EmojiCategory.symbols,
        keywords: ['heart', 'yellow'],
      ),
      EmojiEntry(
        emoji: '💚',
        name: 'green heart',
        category: EmojiCategory.symbols,
        keywords: ['heart', 'green'],
      ),
      EmojiEntry(
        emoji: '💙',
        name: 'blue heart',
        category: EmojiCategory.symbols,
        keywords: ['heart', 'blue'],
      ),
      EmojiEntry(
        emoji: '💜',
        name: 'purple heart',
        category: EmojiCategory.symbols,
        keywords: ['heart', 'purple'],
      ),
      EmojiEntry(
        emoji: '💔',
        name: 'broken heart',
        category: EmojiCategory.symbols,
        keywords: ['heart', 'broken', 'sad'],
      ),
      EmojiEntry(
        emoji: '💕',
        name: 'two hearts',
        category: EmojiCategory.symbols,
        keywords: ['heart', 'love'],
      ),
      EmojiEntry(
        emoji: '💯',
        name: 'hundred points',
        category: EmojiCategory.symbols,
        keywords: ['100', 'perfect', 'score'],
      ),
      EmojiEntry(
        emoji: '💥',
        name: 'collision',
        category: EmojiCategory.symbols,
        keywords: ['boom', 'bang', 'explosion'],
      ),
      EmojiEntry(
        emoji: '💫',
        name: 'dizzy',
        category: EmojiCategory.symbols,
        keywords: ['star', 'dizzy'],
      ),
      EmojiEntry(
        emoji: '✨',
        name: 'sparkles',
        category: EmojiCategory.symbols,
        keywords: ['sparkle', 'shine', 'star'],
      ),
      EmojiEntry(
        emoji: '🔥',
        name: 'fire',
        category: EmojiCategory.symbols,
        keywords: ['fire', 'hot', 'flame'],
      ),
      EmojiEntry(
        emoji: '✅',
        name: 'check mark button',
        category: EmojiCategory.symbols,
        keywords: ['check', 'done', 'yes'],
      ),
      EmojiEntry(
        emoji: '❌',
        name: 'cross mark',
        category: EmojiCategory.symbols,
        keywords: ['no', 'wrong', 'x'],
      ),
      EmojiEntry(
        emoji: '❗',
        name: 'exclamation mark',
        category: EmojiCategory.symbols,
        keywords: ['exclamation', 'warning', 'alert'],
      ),
      EmojiEntry(
        emoji: '❓',
        name: 'question mark',
        category: EmojiCategory.symbols,
        keywords: ['question', 'what'],
      ),
      EmojiEntry(
        emoji: '🚫',
        name: 'prohibited',
        category: EmojiCategory.symbols,
        keywords: ['no', 'forbidden', 'stop'],
      ),
      EmojiEntry(
        emoji: '♻',
        name: 'recycling symbol',
        category: EmojiCategory.symbols,
        keywords: ['recycle', 'green'],
      ),
      EmojiEntry(
        emoji: '💬',
        name: 'speech balloon',
        category: EmojiCategory.symbols,
        keywords: ['speech', 'chat', 'message'],
      ),
      EmojiEntry(
        emoji: '💭',
        name: 'thought balloon',
        category: EmojiCategory.symbols,
        keywords: ['thought', 'think'],
      ),
      EmojiEntry(
        emoji: '🔔',
        name: 'bell',
        category: EmojiCategory.symbols,
        keywords: ['bell', 'notification', 'alert'],
      ),
    ],
    EmojiCategory.flags: [
      EmojiEntry(
        emoji: '🇺🇸',
        name: 'flag: United States',
        category: EmojiCategory.flags,
        keywords: ['us', 'usa', 'america'],
      ),
      EmojiEntry(
        emoji: '🇬🇧',
        name: 'flag: United Kingdom',
        category: EmojiCategory.flags,
        keywords: ['uk', 'britain', 'england'],
      ),
      EmojiEntry(
        emoji: '🇨🇦',
        name: 'flag: Canada',
        category: EmojiCategory.flags,
        keywords: ['canada'],
      ),
      EmojiEntry(
        emoji: '🇦🇺',
        name: 'flag: Australia',
        category: EmojiCategory.flags,
        keywords: ['australia'],
      ),
      EmojiEntry(
        emoji: '🇯🇵',
        name: 'flag: Japan',
        category: EmojiCategory.flags,
        keywords: ['japan'],
      ),
      EmojiEntry(
        emoji: '🇫🇷',
        name: 'flag: France',
        category: EmojiCategory.flags,
        keywords: ['france'],
      ),
      EmojiEntry(
        emoji: '🇩🇪',
        name: 'flag: Germany',
        category: EmojiCategory.flags,
        keywords: ['germany'],
      ),
      EmojiEntry(
        emoji: '🇮🇳',
        name: 'flag: India',
        category: EmojiCategory.flags,
        keywords: ['india'],
      ),
      EmojiEntry(
        emoji: '🇧🇷',
        name: 'flag: Brazil',
        category: EmojiCategory.flags,
        keywords: ['brazil'],
      ),
      EmojiEntry(
        emoji: '🇰🇷',
        name: 'flag: South Korea',
        category: EmojiCategory.flags,
        keywords: ['korea', 'south korea'],
      ),
      EmojiEntry(
        emoji: '🇮🇹',
        name: 'flag: Italy',
        category: EmojiCategory.flags,
        keywords: ['italy'],
      ),
      EmojiEntry(
        emoji: '🇪🇸',
        name: 'flag: Spain',
        category: EmojiCategory.flags,
        keywords: ['spain'],
      ),
      EmojiEntry(
        emoji: '🇲🇽',
        name: 'flag: Mexico',
        category: EmojiCategory.flags,
        keywords: ['mexico'],
      ),
      EmojiEntry(
        emoji: '🇷🇺',
        name: 'flag: Russia',
        category: EmojiCategory.flags,
        keywords: ['russia'],
      ),
      EmojiEntry(
        emoji: '🇨🇳',
        name: 'flag: China',
        category: EmojiCategory.flags,
        keywords: ['china'],
      ),
      EmojiEntry(
        emoji: '🏁',
        name: 'chequered flag',
        category: EmojiCategory.flags,
        keywords: ['finish', 'race'],
      ),
      EmojiEntry(
        emoji: '🏳',
        name: 'white flag',
        category: EmojiCategory.flags,
        keywords: ['surrender', 'peace'],
      ),
      EmojiEntry(
        emoji: '🏴',
        name: 'black flag',
        category: EmojiCategory.flags,
        keywords: ['pirate'],
      ),
      EmojiEntry(
        emoji: '🚩',
        name: 'triangular flag',
        category: EmojiCategory.flags,
        keywords: ['flag', 'marker'],
      ),
    ],
  };

  static List<EmojiEntry> getAllEmojis() {
    return categories.expand((cat) => data[cat]!).toList();
  }
}

class RefractionEmojiPicker extends StatefulWidget {
  final ValueChanged<EmojiEntry>? onSelect;
  final String search;
  final List<EmojiEntry> recentEmojis;
  final int maxRecent;

  const RefractionEmojiPicker({
    super.key,
    this.onSelect,
    this.search = '',
    this.recentEmojis = const [],
    this.maxRecent = 20,
  });

  @override
  State<RefractionEmojiPicker> createState() => _RefractionEmojiPickerState();
}

class _RefractionEmojiPickerState extends State<RefractionEmojiPicker> {
  late String _searchQuery;
  EmojiCategory _activeCategory = EmojiCategory.smileys;
  late List<EmojiEntry> _recentEmojis;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _searchQuery = widget.search;
    _recentEmojis = List.from(widget.recentEmojis);
    if (_recentEmojis.length > widget.maxRecent) {
      _recentEmojis = _recentEmojis.sublist(0, widget.maxRecent);
    }
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
    super.dispose();
  }

  List<EmojiEntry> _getFilteredEmojis() {
    if (_searchQuery.trim().isNotEmpty) {
      final query = _searchQuery.toLowerCase().trim();
      return EmojiData.getAllEmojis().where((entry) {
        return entry.name.toLowerCase().contains(query) ||
            entry.keywords.any((kw) => kw.toLowerCase().contains(query));
      }).toList();
    }
    return EmojiData.data[_activeCategory]!;
  }

  void _setSearch(String query) {
    setState(() {
      _searchQuery = query;
    });
  }

  void _select(EmojiEntry emoji) {
    setState(() {
      _recentEmojis = [
        emoji,
        ..._recentEmojis.where((e) => e.emoji != emoji.emoji),
      ];
      if (_recentEmojis.length > widget.maxRecent) {
        _recentEmojis = _recentEmojis.sublist(0, widget.maxRecent);
      }
    });
    widget.onSelect?.call(emoji);
  }

  void _setCategory(EmojiCategory category) {
    setState(() {
      _activeCategory = category;
      _searchQuery = '';
      _searchController.text = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final filteredEmojis = _getFilteredEmojis();

    return Container(
      width: 320, // w-80 is 20rem = 320px typically
      decoration: BoxDecoration(
        color: theme.colors.popover,
        borderRadius: BorderRadius.circular((theme.borderRadius + 4)),
        border: Border.all(color: theme.colors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Search Bar
          Container(
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: theme.colors.border)),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: _setSearch,
              style: TextStyle(
                color: theme.colors.popoverForeground,
                fontSize: 14,
              ),
              decoration: InputDecoration(
                hintText: 'Search emojis...',
                hintStyle: TextStyle(color: theme.colors.mutedForeground),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                border: InputBorder.none,
                isDense: true,
              ),
            ),
          ),

          // Category Tabs
          Container(
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: theme.colors.border)),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Row(
              children: EmojiCategory.values.map((cat) {
                final isActive = cat == _activeCategory;
                return Expanded(
                  child: InkWell(
                    onTap: () => _setCategory(cat),
                    borderRadius: BorderRadius.circular(theme.borderRadius),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      decoration: BoxDecoration(
                        color: isActive
                            ? theme.colors.accent
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(theme.borderRadius),
                      ),
                      child: Text(
                        EmojiData.categoryIcons[cat]!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 18),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Emoji Grid
          ConstrainedBox(
            constraints: const BoxConstraints(
              maxHeight: 256,
            ), // max-h-64 = 256px
            child:
                _searchQuery.trim().isEmpty &&
                    _recentEmojis.isNotEmpty &&
                    _activeCategory == EmojiCategory.smileys
                ? ListView(
                    padding: const EdgeInsets.all(8),
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        child: Text(
                          'Recently Used',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: theme.colors.mutedForeground,
                          ),
                        ),
                      ),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 8,
                              mainAxisSpacing: 2,
                              crossAxisSpacing: 2,
                            ),
                        itemCount: _recentEmojis.length,
                        itemBuilder: (context, index) {
                          return _buildEmojiButton(_recentEmojis[index], theme);
                        },
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        child: Text(
                          EmojiData.categoryLabels[_activeCategory]!,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: theme.colors.mutedForeground,
                          ),
                        ),
                      ),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 8,
                              mainAxisSpacing: 2,
                              crossAxisSpacing: 2,
                            ),
                        itemCount: filteredEmojis.length,
                        itemBuilder: (context, index) {
                          return _buildEmojiButton(
                            filteredEmojis[index],
                            theme,
                          );
                        },
                      ),
                    ],
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(8),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 8,
                          mainAxisSpacing: 2,
                          crossAxisSpacing: 2,
                        ),
                    itemCount: filteredEmojis.length,
                    itemBuilder: (context, index) {
                      return _buildEmojiButton(filteredEmojis[index], theme);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmojiButton(EmojiEntry emoji, RefractionTheme theme) {
    return InkWell(
      onTap: () => _select(emoji),
      borderRadius: BorderRadius.circular(theme.borderRadius), // rounded
      hoverColor: theme.colors.accent, // hover:bg-accent
      child: Tooltip(
        message: emoji.name,
        child: Container(
          alignment: Alignment.center,
          child: Text(emoji.emoji, style: const TextStyle(fontSize: 18)),
        ),
      ),
    );
  }
}
