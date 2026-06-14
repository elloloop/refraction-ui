import Component from './TelemetryScript.astro'

const meta = {
  title: 'Astro/Logger',
  component: Component,
}

export default meta

export const Default = {
  args: {
    app: 'Example app',
    env: undefined,
    endpoint: 'Example endpoint',
    enabled: false,
    sampleRate: 42,
    redactKeys: ['Item 1', 'Item 2']
  }
}
