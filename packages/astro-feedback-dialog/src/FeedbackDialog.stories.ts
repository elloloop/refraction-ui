import Component from './FeedbackDialog.astro'

const meta = {
  title: 'Astro/FeedbackDialog',
  component: Component,
}

export default meta

export const Default = {
  args: {
    open: false,
    type: 'default'
  }
}
