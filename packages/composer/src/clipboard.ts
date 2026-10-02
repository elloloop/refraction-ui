/** Clipboard payload rules shared by browser adapters; no clipboard access. */
export const DEFAULT_COMPOSER_IMAGE_MAX_BYTES = 100 * 1024 * 1024

export interface ComposerClipboardFile {
  readonly name: string
  readonly type: string
  readonly size: number
}

export class ComposerImagePasteError extends Error {
  constructor(readonly reason: 'empty' | 'max-size', readonly fileName: string) {
    super(`Cannot paste image ${fileName}: ${reason}`)
    this.name = 'ComposerImagePasteError'
  }
}

/** PNG/JPEG only. Reject the entire image batch before handing anything to a host. */
export function composerClipboardImages<T extends ComposerClipboardFile>(
  files: Iterable<T>,
  maxBytes = DEFAULT_COMPOSER_IMAGE_MAX_BYTES,
): T[] {
  const images = Array.from(files).filter(file => file.type === 'image/png' || file.type === 'image/jpeg')
  for (const image of images) {
    if (image.size === 0) throw new ComposerImagePasteError('empty', image.name)
    if (image.size > maxBytes) throw new ComposerImagePasteError('max-size', image.name)
  }
  return images
}
