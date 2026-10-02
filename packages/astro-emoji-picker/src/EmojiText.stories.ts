import Component from './EmojiText.astro'

export default { title: 'Astro/EmojiText', component: Component }
export const KeyboardUnicode = { args: { emojiArtwork: true, text: 'Keyboard 🔥 ❤️‍🔥 👨‍👩‍👧‍👦 🇬🇧 1️⃣ · fallback 👍🏽 ✈︎' } }

export const NativeUnicode = { args: { text: 'Private text 🔥 👨‍👩‍👧‍👦 🇬🇧 1️⃣', emojiArtwork: false } }
