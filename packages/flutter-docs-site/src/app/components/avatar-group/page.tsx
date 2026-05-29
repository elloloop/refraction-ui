import { AvatarGroupExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
import { FrameworkTabs } from '@/components/framework-tabs'

const avatarGroupProps = [
  { name: 'users', type: 'AvatarUser[]', description: 'Array of { id, name, src? }.' },
  { name: 'max', type: 'number', description: 'Max avatars before overflow badge.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of avatars.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { AvatarGroup } from '@refraction-ui/react-avatar-group'
export function MyComponent() {
  return (
    <AvatarGroup
      users={[{ id: '1', name: 'Alice', src: '/avatar.jpg' }]}
      max={3}
    />
  )
}`

export default function AvatarGroupPage() {
  return (
    <div className="space-y-12">
      <FrameworkTabs />
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Avatar Group</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Overlapping avatar stack with overflow badge. Shows team members or participants.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/avatar-group</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Overlapping avatars with overflow count badge.</p>
        <AvatarGroupExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-avatar-group" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock 
          frameworks={{ 
            react: usageCode, 
            astro: '<!-- Astro implementation pending -->',
            flutter: `import 'package:refraction_ui/refraction_ui.dart';\n\nWidget build(BuildContext context) {\n  return RefractionAvatarGroup(\n    max: 4,\n    avatars: [\n      RefractionAvatar(fallbackText: 'AJ', imageUrl: 'https://i.pravatar.cc/150?u=a'),\n      RefractionAvatar(fallbackText: 'BS', imageUrl: 'https://i.pravatar.cc/150?u=b'),\n      RefractionAvatar(fallbackText: 'CW', imageUrl: 'https://i.pravatar.cc/150?u=c'),\n    ],\n  );\n}`
          }} 
        />
      </section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={avatarGroupProps} /></section>
    </div>
  )
}
