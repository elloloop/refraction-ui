import { describe, it, expect } from 'vitest'
import { composerClipboardImages, ComposerImagePasteError, DEFAULT_COMPOSER_IMAGE_MAX_BYTES } from '../src/clipboard.js'

describe('clipboard image boundary', () => {
  const png = { name: 'fixture.png', type: 'image/png', size: 12 }
  it('keeps original payloads and order; ignores unsupported formats', () => {
    const jpeg = { name: 'photo.jpg', type: 'image/jpeg', size: 18 }
    expect(composerClipboardImages([png, { ...png, type: 'image/gif' }, jpeg])).toEqual([png, jpeg])
    expect(composerClipboardImages([png])[0]).toBe(png)
  })
  it('validates the full batch atomically, including empty payloads and configured limits', () => {
    expect(() => composerClipboardImages([png, { ...png, size: 0 }])).toThrow(ComposerImagePasteError)
    expect(() => composerClipboardImages([png], 11)).toThrow('max-size')
    expect(composerClipboardImages([{ ...png, size: DEFAULT_COMPOSER_IMAGE_MAX_BYTES }])).toHaveLength(1)
    expect(() => composerClipboardImages([{ ...png, size: DEFAULT_COMPOSER_IMAGE_MAX_BYTES + 1 }])).toThrow('max-size')
  })
})
