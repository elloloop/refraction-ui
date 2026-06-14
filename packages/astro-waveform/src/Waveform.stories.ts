import Component from './Waveform.astro'

const meta = {
  title: 'Astro/Waveform',
  component: Component,
  argTypes: {
    samples: { control: 'text' },
    intensity: { control: 'number' },
    amplitude: { control: 'number' },
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] },
    height: { control: 'number' },
    width: { control: 'number' },
    barCount: { control: 'number' },
    smoothing: { control: 'number' },
    color: { control: 'text' },
    paused: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    samples: '',
    intensity: 0,
    amplitude: 0,
    variant: 'default',
    height: 0,
    width: 0,
    barCount: 0,
    smoothing: 0,
    color: '',
    paused: false,
  },
}
