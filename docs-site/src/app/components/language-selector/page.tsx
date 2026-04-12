import { LanguageSelectorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const langSelectorProps = [
  { name: 'value', type: 'string | string[]', description: 'Selected language value(s).' },
  { name: 'onValueChange', type: '(value: string | string[]) => void', description: 'Callback when selection changes.' },
  { name: 'options', type: 'LanguageOption[]', description: 'Array of { value, label, group? }.' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow multiple selections.' },
  { name: 'placeholder', type: 'string', default: "'Select language...'", description: 'Placeholder text.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { LanguageSelector } from '@refraction-ui/react-language-selector'

export function MyComponent() {
  const [lang, setLang] = useState('en')
  return (
    <LanguageSelector
      value={lang}
      onValueChange={setLang}
      options={[
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
      ]}
    />
  )
}`

export default function LanguageSelectorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Language Selector</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A dropdown language selector with single and multi-select support. Groups options by category.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/language-selector</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Select a language from the dropdown.</p>
        <LanguageSelectorExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-language-selector" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={langSelectorProps} />
      </section>
    </div>
  )
}
