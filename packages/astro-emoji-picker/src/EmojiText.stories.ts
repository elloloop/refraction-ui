import Component from './EmojiText.astro'

export default { title: 'Astro/EmojiText', component: Component }
export const KeyboardUnicode = { args: { text: 'Keyboard 🔥 ❤️‍🔥 👨‍👩‍👧‍👦 🇬🇧 1️⃣ · fallback 👍🏽 ✈︎' } }

export const NativeUnicode = { args: { text: 'Private text 🔥 👨‍👩‍👧‍👦 🇬🇧 1️⃣', nativeOnly: true } }
