import type { ChatMessage, ConversationState, ThreadingMode } from './types.js'

/** Sort by timestamp ascending (oldest first). */
function byTime(a: ChatMessage, b: ChatMessage): number {
  return a.timestamp.getTime() - b.timestamp.getTime()
}

/** Find a message by id. */
export function findMessage(messages: ChatMessage[], id: string): ChatMessage | undefined {
  return messages.find((m) => m.id === id)
}

/** Resolve a message id to its thread root (itself if it's already a root). */
export function rootIdOf(messages: ChatMessage[], id: string): string {
  const m = findMessage(messages, id)
  if (!m) return id
  return m.parentId ?? m.id
}

/** Root (main-timeline) messages — those not belonging to a reply-thread. */
export function selectRoots(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((m) => !m.parentId).sort(byTime)
}

/** Replies belonging to a thread root, oldest first (excludes the root itself). */
export function selectReplies(messages: ChatMessage[], rootId: string): ChatMessage[] {
  return messages.filter((m) => m.parentId === rootId).sort(byTime)
}

/** A full thread: root message followed by its replies. */
export function selectThreadMessages(messages: ChatMessage[], rootId: string): ChatMessage[] {
  const root = findMessage(messages, rootId)
  const replies = selectReplies(messages, rootId)
  return root ? [root, ...replies] : replies
}

/** Number of replies in a thread. */
export function getReplyCount(messages: ChatMessage[], rootId: string): number {
  return messages.reduce((n, m) => (m.parentId === rootId ? n + 1 : n), 0)
}

/**
 * The main timeline for the active conversation, honoring the threading mode:
 * - `'inline'`: every message in chronological order (replies included).
 * - `'panel'`: only root messages (replies hidden behind their thread).
 */
export function selectMainTimeline(
  messages: ChatMessage[],
  mode: ThreadingMode,
): ChatMessage[] {
  if (mode === 'panel') return selectRoots(messages)
  return [...messages].sort(byTime)
}

/** Convenience: main timeline from a store snapshot. */
export function selectTimelineFromState(state: ConversationState): ChatMessage[] {
  return selectMainTimeline(state.messages, state.threadingMode)
}
