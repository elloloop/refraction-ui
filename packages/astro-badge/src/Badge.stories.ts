import Badge from './Badge.astro'

const meta = {
  title: 'Astro/Badge',
  component: Badge,
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
}

export default meta

export const Default = { args: { variant: 'default' } }
export const Secondary = { args: { variant: 'secondary' } }
export const Outline = { args: { variant: 'outline' } }
