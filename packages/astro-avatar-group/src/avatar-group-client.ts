/**
 * Browser behaviour of the Astro `AvatarGroup`: each photo is laid over its
 * initials, which go once the photo loads; a photo that fails is removed, so
 * the initials stay. Reads where each image got to first, because an image
 * can settle before this script runs.
 */

import { getAvatarImageStatus } from '@refraction-ui/avatar-group'

const IMAGE = 'img[data-rfr-avatar-group-image]'
const INITIALS = '[data-rfr-avatar-group-initials]'
const INITIALIZED = 'data-rfr-avatar-group-init'

function settle(image: HTMLImageElement): void {
  const status = getAvatarImageStatus(image)
  if (status === 'loaded') image.parentElement?.querySelector<HTMLElement>(INITIALS)?.remove()
  if (status === 'failed') image.remove()
}

/** Wire one photo. Safe to call again: a photo is wired once. */
export function initAvatarGroupImage(image: HTMLImageElement): void {
  if (image.hasAttribute(INITIALIZED)) return
  image.setAttribute(INITIALIZED, '')
  image.addEventListener('load', () => settle(image))
  image.addEventListener('error', () => settle(image))
  settle(image)
}

/** Wire every avatar-group photo under `scope`. */
export function initAvatarGroups(scope: ParentNode): void {
  scope.querySelectorAll<HTMLImageElement>(IMAGE).forEach(initAvatarGroupImage)
}
