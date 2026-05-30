'use client'
import { AvatarGroup } from '@refraction-ui/react-avatar-group'
import { useFramework } from '@/components/framework-context'
import { FlutterPreview } from '@/components/flutter-preview'

interface AvatarGroupExamplesProps { section: 'basic' }

export function AvatarGroupExamples({ section }: AvatarGroupExamplesProps) {
  const { framework } = useFramework()

  if (framework === 'flutter') {
    return <FlutterPreview path="components/refractionavatargroup/default" height={300} />
  }
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <AvatarGroup
          users={[
            { id: '1', name: 'Alice Johnson', src: 'https://avatars.githubusercontent.com/u/1024025?v=4' },
            { id: '2', name: 'Bob Smith', src: 'https://avatars.githubusercontent.com/u/1024026?v=4' },
            { id: '3', name: 'Carol White', src: 'https://avatars.githubusercontent.com/u/1024027?v=4' },
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
