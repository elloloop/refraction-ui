import { Navbar } from '@refraction-ui/react-navbar'
import { NavbarExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/Navbar' }
export default meta

export const Basic = { render: () => <NavbarExamples section="basic" /> }

export const Variants = {
  render: () => (
    <div className="flex w-full flex-col gap-6">
      {(['solid', 'blur', 'gradient', 'transparent'] as const).map((variant) => (
        <div key={variant} className="space-y-2">
          <span className="text-xs text-muted-foreground font-medium capitalize">
            {variant}
          </span>
          <div className="rounded-lg border overflow-hidden">
            <Navbar
              variant={variant}
              links={[
                { label: 'Home', href: '/' },
                { label: 'Docs', href: '/docs' },
                { label: 'Components', href: '/components' },
              ]}
              currentPath="/docs"
              logo={<span className="font-bold text-sm">MyApp</span>}
            />
          </div>
        </div>
      ))}
    </div>
  ),
}
