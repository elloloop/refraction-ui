import { PresenceIndicator } from '@refraction-ui/react-presence-indicator'
import { PresenceIndicatorExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Data Display/PresenceIndicator' }
export default meta

export const Basic = {
  render: () => <PresenceIndicatorExamples section="basic" />,
}

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2.5">
        <PresenceIndicator status="online" size="sm" showLabel />
        <span className="text-xs text-muted-foreground font-medium">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <PresenceIndicator status="online" size="md" showLabel />
        <span className="text-xs text-muted-foreground font-medium">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <PresenceIndicator status="online" size="lg" showLabel />
        <span className="text-xs text-muted-foreground font-medium">Large</span>
      </div>
    </div>
  ),
}

export const CustomLabel = {
  render: () => (
    <PresenceIndicator status="busy" label="In a meeting" showLabel />
  ),
}
