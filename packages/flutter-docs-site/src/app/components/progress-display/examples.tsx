'use client'

import { StatsGrid, ProgressBar, BadgeDisplay } from '@refraction-ui/react-progress-display'

interface ProgressDisplayExamplesProps {
  section: 'basic'
}

export function ProgressDisplayExamples({ section }: ProgressDisplayExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Stats Grid</span>
            <StatsGrid
              stats={[
                { label: 'Users', value: '1,234', color: 'primary' },
                { label: 'Revenue', value: '$12.4k', color: 'success' },
                { label: 'Errors', value: '23', color: 'destructive' },
              ]}
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Progress Bars</span>
            <div className="space-y-3">
              <ProgressBar value={75} />
              <ProgressBar value={45} size="sm" />
              <ProgressBar value={90} size="lg" />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Badge Display</span>
            <BadgeDisplay
              badges={[
                { name: 'Early Adopter', icon: '🌟', isUnlocked: true },
                { name: 'Top Contributor', icon: '🏆', isUnlocked: true },
                { name: 'Beta Tester', icon: '🧪', isUnlocked: false },
              ]}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
