import { LocationSelectorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const locationSelectorProps = [
  {
    name: 'defaultCountry',
    type: 'string',
    default: "'US'",
    description: 'Initially selected country code.',
  },
  {
    name: 'defaultLanguage',
    type: 'string',
    default: "'en'",
    description: 'Initially selected language code.',
  },
  {
    name: 'onCountryChange',
    type: '(country: string) => void',
    description: 'Called with the new country code whenever the country selection changes.',
  },
  {
    name: 'onLanguageChange',
    type: '(language: string) => void',
    description: 'Called with the new language code whenever the language selection changes.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the wrapper.',
  },
]

const usageCode = `import { LocationSelector } from '@refraction-ui/react-location-selector'

export function MyComponent() {
  return (
    <LocationSelector
      defaultCountry="US"
      defaultLanguage="en"
      onCountryChange={(c) => console.log('country', c)}
      onLanguageChange={(l) => console.log('language', l)}
    />
  )
}`

export default function LocationSelectorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Location Selector</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Paired country and language selects with built-in option lists and accessible labels. Uses the
          headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/location-selector</code>{' '}
          core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Renders country and language selects side by side with sensible defaults.
        </p>
        <LocationSelectorExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-location-selector" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Reacting to changes</h2>
        <p className="text-sm text-muted-foreground">
          Use the <code className="text-xs bg-muted px-1 rounded">onCountryChange</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">onLanguageChange</code> callbacks to react to the
          current selection.
        </p>
        <LocationSelectorExamples section="controlled" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={locationSelectorProps} />
      </section>
    </div>
  )
}
