'use client'
import { PresenceIndicator } from '@refraction-ui/react-presence-indicator'
interface PresenceIndicatorExamplesProps { section: 'basic' }
export function PresenceIndicatorExamples({ section }: PresenceIndicatorExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-2.5">
            <PresenceIndicator status="online" showLabel />
            <span className="text-xs text-muted-foreground font-medium">Online</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <PresenceIndicator status="away" showLabel />
            <span className="text-xs text-muted-foreground font-medium">Away</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <PresenceIndicator status="busy" showLabel />
            <span className="text-xs text-muted-foreground font-medium">Busy</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <PresenceIndicator status="offline" showLabel />
            <span className="text-xs text-muted-foreground font-medium">Offline</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}
