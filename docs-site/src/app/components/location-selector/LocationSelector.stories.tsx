import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { LocationSelector } from '@refraction-ui/react-location-selector'

const meta: Meta<typeof LocationSelector> = {
  title: 'Components/LocationSelector',
  component: LocationSelector,
  args: {
    defaultCountry: 'US',
    defaultLanguage: 'en',
  },
  argTypes: {
    defaultCountry: { control: 'text' },
    defaultLanguage: { control: 'text' },
    onCountryChange: { action: 'country changed' },
    onLanguageChange: { action: 'language changed' },
  },
}
export default meta

type Story = StoryObj<typeof LocationSelector>

export const Uncontrolled: Story = {
  render: (args) => (
    <div className="max-w-md w-full">
      <LocationSelector {...args} />
    </div>
  ),
}

export const Controlled: Story = {
  render: (args) => {
    const [country, setCountry] = useState('US')
    const [language, setLanguage] = useState('en')
    return (
      <div className="max-w-md w-full">
        <LocationSelector
          {...args}
          defaultCountry={country}
          defaultLanguage={language}
          onCountryChange={(c) => {
            setCountry(c)
            args.onCountryChange?.(c)
          }}
          onLanguageChange={(l) => {
            setLanguage(l)
            args.onLanguageChange?.(l)
          }}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Selected:{' '}
          <code className="rounded bg-muted px-1 font-mono text-xs">{country}</code> /{' '}
          <code className="rounded bg-muted px-1 font-mono text-xs">{language}</code>
        </p>
      </div>
    )
  },
}