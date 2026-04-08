'use client'
import { AvatarGroup } from '@refraction-ui/react-avatar-group'
interface AvatarGroupExamplesProps { section: 'basic' }
export function AvatarGroupExamples({ section }: AvatarGroupExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <AvatarGroup
          users={[
            { id: '1', name: 'Alice Johnson', src: 'https://i.pravatar.cc/150?u=a' },
            { id: '2', name: 'Bob Smith', src: 'https://i.pravatar.cc/150?u=b' },
            { id: '3', name: 'Carol White', src: 'https://i.pravatar.cc/150?u=c' },
            { id: '4', name: 'Dave Brown' },
            { id: '5', name: 'Eve Davis' },
          ]}
          max={4}
          size="md"
        />
      </div>
    )
  }
  return null
}
