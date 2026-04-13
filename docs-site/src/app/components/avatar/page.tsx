import { AvatarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const avatarProps = [
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of the avatar.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
  { name: 'children', type: 'ReactNode', description: 'AvatarImage and/or AvatarFallback.' },
]

const usageCode = `import { Avatar, AvatarImage, AvatarFallback } from '@refraction-ui/react-avatar'

export function MyComponent() {
  return (
    <Avatar size="lg">
      <AvatarImage src="/avatar.jpg" alt="User" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  )
}`

export default function AvatarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Avatar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A circular avatar with image support and fallback initials. Five sizes from xs to xl.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/avatar</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">Five sizes from extra-small to extra-large.</p>
        <AvatarExamples section="sizes" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Image & Fallback</h2>
        <p className="text-sm text-muted-foreground">Shows image when available, falls back to initials on error.</p>
        <AvatarExamples section="fallback" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-avatar" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={avatarProps} />
      </section>
    </div>
  )
}
