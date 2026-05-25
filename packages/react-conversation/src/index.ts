export { useConversation, type UseConversationResult } from './use-conversation.js'
export { Chat, type ChatProps } from './chat.js'
export { Composer, type ComposerProps, type SlashCommand, type Mention } from './composer.js'

// Re-export core store, selectors, and types for convenience
export {
  createConversation,
  findMessage,
  rootIdOf,
  selectRoots,
  selectReplies,
  selectThreadMessages,
  getReplyCount,
  selectMainTimeline,
  selectTimelineFromState,
  type ChatAuthor,
  type ChatRole,
  type MessageStatus,
  type ThreadingMode,
  // MessageReaction / MessageAttachment are surfaced by react-thread-view in the
  // meta; re-exporting them here too would collide on `export *`.
  type ChatMessage,
  type Conversation,
  type SendContext,
  type TransportChunk,
  type ChatTransport,
  type ConversationState,
  type ConversationConfig,
  type SendOptions,
  type ConversationAPI,
} from '@refraction-ui/conversation'
