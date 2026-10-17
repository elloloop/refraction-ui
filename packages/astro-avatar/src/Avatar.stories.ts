import Component from './Avatar.astro'

const meta = {
  title: 'Astro/Avatar',
  component: Component,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'square'] },
    presence: { control: 'select', options: [undefined, 'online', 'away', 'busy', 'dnd', 'offline'] },
  },
}

export default meta

const initials =
  '<span class="flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit] bg-muted text-muted-foreground text-sm">AL</span>'

export const Default = {
  args: {
    default: initials,
    size: 'md',
  },
}

/** A named avatar whose status joins its name: "Ada Lovelace (Away)". */
export const WithPresence = {
  args: {
    default: initials,
    size: 'md',
    presence: 'away',
    'aria-label': 'Ada Lovelace',
  },
}
