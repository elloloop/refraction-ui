import {
  StatsGrid,
  ProgressBar,
  BadgeDisplay,
} from '@refraction-ui/react-progress-display'
import { ProgressDisplayExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Data Display/ProgressDisplay' }
export default meta

export const Basic = {
  render: () => <ProgressDisplayExamples section="basic" />,
}

export const Stats = {
  render: () => (
    <StatsGrid
      stats={[
        { label: 'Users', value: '1,234', color: 'primary' },
        { label: 'Revenue', value: '$12.4k', color: 'success' },
        { label: 'Errors', value: '23', color: 'destructive' },
      ]}
    />
  ),
}

export const ProgressBarSizes = {
  render: () => (
    <div className="w-72 space-y-3">
      <ProgressBar value={45} size="sm" />
      <ProgressBar value={60} />
      <ProgressBar value={90} size="lg" />
    </div>
  ),
}

export const Badges = {
  render: () => (
    <BadgeDisplay
      badges={[
        { name: 'Early Adopter', icon: '🌟', isUnlocked: true },
        { name: 'Top Contributor', icon: '🏆', isUnlocked: true },
        { name: 'Beta Tester', icon: '🧪', isUnlocked: false },
      ]}
    />
  ),
}
