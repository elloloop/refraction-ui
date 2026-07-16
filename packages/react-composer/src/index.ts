export {
  RefractionComposer,
  DEFAULT_COMPOSER_STRINGS,
} from './composer.js'
export type {
  RefractionComposerProps,
  RefractionComposerStrings,
  PrimaryActionContext,
  SuggestionRenderContext,
} from './composer.js'
export { useComposer } from './use-composer.js'
export type { UseComposerResult } from './use-composer.js'

// Core re-exports. Explicit (not `export *`) so the meta's `export *` fan-in
// cannot collide with names other adapters already surface — in particular
// react-conversation owns `Composer`/`ComposerProps`/`SlashCommand`/`Mention`
// and react-thread-view owns `MessageAttachment`.
export {
  createComposer,
  createEmojiTrigger,
  toMessageAttachment,
  composerSurfaceVariants,
  composerFieldClass,
  composerTrayClass,
  composerAttachmentChipVariants,
  composerTokenPillClass,
  composerMenuClass,
  composerMenuItemVariants,
  composerCounterVariants,
  composerPrimaryActionVariants,
  composerAccessoryPanelClass,
  composerAccessoryToggleVariants,
} from '@refraction-ui/composer'
export type {
  ComposerAPI,
  ComposerAttachment,
  ComposerAttachmentDraft,
  ComposerAttachmentKind,
  ComposerAttachmentStatus,
  ComposerCandidate,
  ComposerConfig,
  ComposerDraft,
  ComposerDraftStore,
  ComposerEvent,
  ComposerMode,
  ComposerOutput,
  ComposerSelection,
  ComposerState,
  ComposerSubmission,
  ComposerToken,
  ComposerTrigger,
  ComposerTriggerResolver,
  ComposerTriggerScope,
  ComposerValidationResult,
  ComposerValidator,
  CounterState,
  EmojiTriggerOptions,
  EnterResult,
  PlacedToken,
  ResolvedToken,
  SuggestionState,
} from '@refraction-ui/composer'
