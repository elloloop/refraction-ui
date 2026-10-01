import { EMOJI_ARTWORK_KEYS } from './emoji-artwork.generated.js'
import { DEFAULT_TWEMOJI_BASE_URL, twemojiAssetUrl, twemojiFilename } from './twemoji.js'

/** One complete supported grapheme, with original UTF-16 offsets. */
export interface UnicodeEmojiRun {
  emoji: string
  start: number
  end: number
  url: string
}

/** Complete supported sequences only; never strip modifiers or split joiners. */
export function unicodeEmojiRuns(text: string, baseUrl = DEFAULT_TWEMOJI_BASE_URL): UnicodeEmojiRun[] {
  // Rendering must fail safely on engines without grapheme segmentation.
  // Code-point iteration could incorrectly replace part of an unsupported ZWJ.
  if (typeof Intl.Segmenter !== 'function') return []
  const runs: UnicodeEmojiRun[] = []
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  for (const { segment, index } of segmenter.segment(text)) {
    if (segment.includes('\uFE0E') || [...segment].every(character => character.charCodeAt(0) < 128)) continue
    if (!EMOJI_ARTWORK_KEYS.has(twemojiFilename(segment))) continue
    runs.push({ emoji: segment, start: index, end: index + segment.length, url: twemojiAssetUrl(segment, baseUrl) })
  }
  return runs
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!))
}

/** Safe display HTML. Unicode remains actual selectable text, even after load. */
export function unicodeEmojiHtml(text: string, baseUrl = DEFAULT_TWEMOJI_BASE_URL): string {
  let cursor = 0
  const fragments: string[] = []
  for (const run of unicodeEmojiRuns(text, baseUrl)) {
    fragments.push(escapeHtml(text.slice(cursor, run.start)),
      `<span data-rfr-unicode-emoji style="position:relative;display:inline-block"><span data-rfr-emoji-text>${escapeHtml(run.emoji)}</span><img data-rfr-emoji-art src="${escapeHtml(run.url)}" alt="" aria-hidden="true" draggable="false" style="position:absolute;inset:0;margin:auto;width:1em;height:1em;pointer-events:none;border-radius:0;opacity:0" /></span>`)
    cursor = run.end
  }
  fragments.push(escapeHtml(text.slice(cursor)))
  return fragments.join('')
}

/** Load/error fallback for SSR adapters; does not replace text or editing nodes. */
export function hydrateUnicodeEmojiArtwork(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-rfr-unicode-emoji]').forEach(span => {
    const text = span.querySelector<HTMLElement>('[data-rfr-emoji-text]')
    const image = span.querySelector<HTMLImageElement>('[data-rfr-emoji-art]')
    if (!text || !image || image.dataset.rfrEmojiInit) return
    image.dataset.rfrEmojiInit = 'true'
    const show = () => {
      const loaded = image.complete && image.naturalWidth > 0
      text.style.opacity = loaded ? '0' : ''
      image.style.opacity = loaded ? '1' : '0'
    }
    image.addEventListener('load', show)
    image.addEventListener('error', show)
    show()
  })
}


/** Enhance display text only. Never rewrite HTML attributes, code, or editors. */
export function enhanceUnicodeEmojiDisplay(root: HTMLElement, baseUrl = DEFAULT_TWEMOJI_BASE_URL): void {
  const document = root.ownerDocument
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const candidates: Text[] = []
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    if (node.parentElement?.closest('code,pre,script,style,svg,math,textarea,input,[contenteditable],[data-rfr-unicode-emoji]')) continue
    if (unicodeEmojiRuns(node.data, baseUrl).length > 0) candidates.push(node)
  }
  for (const node of candidates) {
    const template = document.createElement('template')
    template.innerHTML = unicodeEmojiHtml(node.data, baseUrl)
    node.replaceWith(template.content)
  }
  hydrateUnicodeEmojiArtwork(root)
}
