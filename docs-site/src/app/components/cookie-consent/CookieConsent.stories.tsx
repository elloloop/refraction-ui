import type { Meta, StoryObj } from '@storybook/react'
import { CookieConsent, useCookieConsent } from '@refraction-ui/react-cookie-consent'

const meta: Meta<typeof CookieConsent> = {
  title: 'Components/CookieConsent',
  component: CookieConsent,
  argTypes: {
    policyUrl: { control: 'text' },
  },
  args: {
    policyUrl: '#',
  },
}

export default meta

type Story = StoryObj<typeof CookieConsent>

export const Default: Story = {
  render: (args) => {
    const consent = useCookieConsent({ version: 'docs-demo' })
    return (
      <div className="relative min-h-[220px]">
        <CookieConsent {...args} consent={consent} />
      </div>
    )
  },
}
