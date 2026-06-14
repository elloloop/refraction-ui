import Component from './Navbar.astro'

const meta = {
  title: 'Astro/Navbar',
  component: Component,
  argTypes: {
    links: { control: 'text' },
    currentPath: { control: 'text' },
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] },
    logo: { control: 'text' },
    actions: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    links: '',
    currentPath: '',
    variant: 'default',
    logo: '<span>logo content</span>',
    actions: '<span>actions content</span>',
  },
  render: (args: any) => {
    const { logo, actions, ...props } = args;
    return {
      Component,
      props,
      slots: { logo, actions },
    };
  },
}
