import Component from './Reveal.astro'

const meta = {
  title: 'Astro/Reveal',
  component: Component,
  argTypes: {
    pattern: {
      control: 'select',
      options: ['page-in', 'page-back', 'side-next', 'side-prev', 'fold-in', 'sheet-in', 'scrim-in', 'handoff', 'celebrate', 'grow', 'nudge', 'icon-swap', 'num-pop'],
    },
  },
}

export default meta

export const Default = {
  args: { pattern: 'page-in' },
}
