import Component from './Sidebar.astro'

const meta = {
  title: 'Astro/Sidebar',
  component: Component,
  argTypes: {
    sections: { control: 'text' },
    currentPath: { control: 'text' },
    collapsed: { control: 'boolean' },
    userRoles: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    sections: '',
    currentPath: '',
    collapsed: false,
    userRoles: '',
  },
}
