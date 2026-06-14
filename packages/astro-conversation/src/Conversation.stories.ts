import Component from './Chat.astro'

const meta = {
  title: 'Astro/Conversation',
  component: Component,
}

export default meta

export const Default = {
  args: {
    config: undefined,
    showConversationList: false,
    currentUserId: 'Example currentUserId'
  }
}
