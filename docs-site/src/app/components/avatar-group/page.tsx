import { AvatarGroupExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const avatarGroupProps = [
  { name: 'users', type: 'AvatarUser[]', description: "Array of { id, name, src?, status? }. status ('online' | 'away' | 'busy' | 'dnd' | 'offline') shows a presence dot and joins the avatar's name. Without a src, or when it fails to load, the avatar shows the person's initials." },
  { name: 'max', type: 'number', description: 'Max avatars before overflow badge.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of avatars.' },
  { name: 'onOverflowClick', type: '(trigger: HTMLButtonElement) => void', description: 'Makes the "+N" badge a button, called with it when pressed, e.g. to open a list of everyone. Without it the badge is a label ("2 more users"), not a button.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { AvatarGroup } from '@refraction-ui/react'
export function MyComponent() {
  return (
    <AvatarGroup
      users={[{ id: '1', name: 'Alice', src: '/avatar.jpg' }]}
      max={3}
    />
  )
}`
const astroUsageCode = `---
import { AvatarGroup } from '@refraction-ui/astro'
---
<!-- overflowButton makes "+N" a button; handle its click yourself. -->
<AvatarGroup
  users={[{ id: '1', name: 'Alice', src: '/avatar.jpg', status: 'online' }]}
  max={3}
  overflowButton
/>
<script>
  document.querySelector('[data-rfr-avatar-group-overflow]')
    ?.addEventListener('click', () => { /* open a list of everyone */ })
</script>`
export default function AvatarGroupPage() {
  return (
    <div className="space-y-12">
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
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Presence, missing photos and everyone else</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A status puts a dot at each avatar&apos;s bottom end corner, over the next avatar in the stack,
          and joins its name (&ldquo;Ada Lovelace (online)&rdquo;). The initials show while a photo
          loads and stay when it fails, as Grace Hopper&apos;s does here. With{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">onOverflowClick</code>{' '}
          the &ldquo;+N&rdquo; badge is a button: reach it with Tab and press it to see everyone.
        </p>
        <AvatarGroupExamples section="presence" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: astroUsageCode }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={avatarGroupProps} /></section>
    </div>
  )
}
