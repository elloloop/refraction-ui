import Component from './VoicePill.astro'

const meta = {
  title: 'Astro/VoicePill',
  component: Component,
  argTypes: {
    speaker: { control: 'text' },
    label: { control: 'text' },
    sub: { control: 'text' },
    subtitle: { control: 'text' },
    intensity: { control: 'number' },
    muted: { control: 'boolean' },
    position: { control: 'text' },
    showMuteButton: { control: 'boolean' },
    avatar: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    speaker: '',
    label: '',
    sub: '',
    subtitle: '',
    intensity: 0,
    muted: false,
    position: '',
    showMuteButton: false,
    avatar: '<span>avatar content</span>',
  },
  render: (args: any) => {
    const { avatar, ...props } = args;
    return {
      Component,
      props,
      slots: { avatar },
    };
  },
}
