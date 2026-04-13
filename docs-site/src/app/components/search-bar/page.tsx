import { SearchBarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const searchBarProps = [
  { name: 'value', type: 'string', description: 'Controlled search value.' },
  { name: 'onValueChange', type: '(value: string) => void', description: 'Callback when value changes.' },
  { name: 'onSearch', type: '(value: string) => void', description: 'Callback with debounced search query.' },
  { name: 'debounceMs', type: 'number', default: '300', description: 'Debounce delay in ms.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading spinner.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text.' },
  { name: 'children', type: 'ReactNode', description: 'SearchResults component.' },
]

const usageCode = `import { SearchBar, SearchResults, SearchResultItem } from '@refraction-ui/react-search-bar'

export function MyComponent() {
  const [results, setResults] = useState([])
  return (
    <SearchBar placeholder="Search..." onSearch={(q) => setResults(search(q))}>
      <SearchResults>
        {results.map((r) => <SearchResultItem key={r}>{r}</SearchResultItem>)}
      </SearchResults>
    </SearchBar>
  )
}`

export default function SearchBarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Search Bar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A search input with debounced search, suggestions dropdown, and clear button.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/search-bar</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Type to search with debounced suggestions.</p>
        <SearchBarExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-search-bar" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={searchBarProps} />
      </section>
    </div>
  )
}
