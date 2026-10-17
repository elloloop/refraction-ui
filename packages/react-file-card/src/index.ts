export { FileCard, type FileCardProps, type FileCardOpenEvent } from './file-card.js'
export { FileCardKindIcon } from './file-card-icons.js'

// Re-export headless helpers for consumers formatting files elsewhere.
export {
  resolveFileCardKind,
  formatFileCardBytes,
  formatFileCardDuration,
  formatFileCardDimensions,
  truncateFileCardName,
  FILE_CARD_KINDS,
  FILE_CARD_DEFAULT_LABELS,
  fileCardVariants,
  type FileKind,
  type FileCardStatus,
  type FileCardDimensions,
  type FileCardNumberFormatter,
  type FileCardLabels,
  type FileCardLabelOverrides,
} from '@refraction-ui/file-card'
