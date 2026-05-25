import * as React from 'react'
import { createConversation } from '@refraction-ui/conversation'
import type {
  ConversationAPI,
  ConversationConfig,
  ConversationState,
} from '@refraction-ui/conversation'

export interface UseConversationResult {
  /** Live store snapshot (re-renders on change) */
  state: ConversationState
  /** The underlying store, for advanced/imperative use */
  api: ConversationAPI
  // Bound actions (stable references)
  sendMessage: ConversationAPI['sendMessage']
  newConversation: ConversationAPI['newConversation']
  selectConversation: ConversationAPI['selectConversation']
  deleteConversation: ConversationAPI['deleteConversation']
  renameConversation: ConversationAPI['renameConversation']
  editMessage: ConversationAPI['editMessage']
  deleteMessage: ConversationAPI['deleteMessage']
  react: ConversationAPI['react']
  retryLast: ConversationAPI['retryLast']
  stop: ConversationAPI['stop']
  openThread: ConversationAPI['openThread']
  closeThread: ConversationAPI['closeThread']
  setThreadingMode: ConversationAPI['setThreadingMode']
}

/**
 * useConversation — binds the headless `createConversation` store to React via
 * `useSyncExternalStore`. The store is created once; a changing `config.transport`
 * is hot-swapped so consumers can wire the backend after mount.
 */
export function useConversation(config?: ConversationConfig): UseConversationResult {
  const apiRef = React.useRef<ConversationAPI | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createConversation(config)
  }
  const api = apiRef.current

  const state = React.useSyncExternalStore(api.subscribe, api.getState, api.getState)

  const transport = config?.transport
  React.useEffect(() => {
    if (transport) api.setTransport(transport)
  }, [api, transport])

  return {
    state,
    api,
    sendMessage: api.sendMessage,
    newConversation: api.newConversation,
    selectConversation: api.selectConversation,
    deleteConversation: api.deleteConversation,
    renameConversation: api.renameConversation,
    editMessage: api.editMessage,
    deleteMessage: api.deleteMessage,
    react: api.react,
    retryLast: api.retryLast,
    stop: api.stop,
    openThread: api.openThread,
    closeThread: api.closeThread,
    setThreadingMode: api.setThreadingMode,
  }
}
