import { GifPickerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const gifPickerProps = [
  {
    name: 'results',
    type: 'GifPickerItem[]',
    description:
      'GIFs for the active tab and query: `{ id, previewUrl, animatedUrl, width, height, alt, title?, badge? }`. Duplicate ids and items with no safe image URL are dropped.',
  },
  {
    name: 'onSelect',
    type: '(item: GifPickerItem) => void',
    description: 'Called when the user picks a GIF.',
  },
  {
    name: 'onSearch',
    type: "(query: string, tab: 'popular' | 'recent' | 'yours') => void",
    description:
      'Loader. Called with the trimmed query and tab after typing settles, on Enter, and immediately on tab change. The component never fetches.',
  },
  {
    name: 'onLoadMore',
    type: '() => void',
    description: 'Called by the Load more button. Shown only together with `hasMore`.',
  },
  {
    name: 'hasMore',
    type: 'boolean',
    default: 'false',
    description: 'Whether another page exists.',
  },
  {
    name: 'status',
    type: "'ready' | 'loading' | 'error'",
    default: "'ready'",
    description:
      'State of your loader. With no results it shows skeletons or the error state; with results it keeps them and shows the status inline.',
  },
  {
    name: 'onRetry',
    type: '() => void',
    description: 'Shows a Try again button in the error state.',
  },
  {
    name: 'tab',
    type: "'popular' | 'recent' | 'yours'",
    description: 'Active tab (controlled).',
  },
  {
    name: 'defaultTab',
    type: "'popular' | 'recent' | 'yours'",
    default: "'popular'",
    description: 'Initial tab (uncontrolled).',
  },
  {
    name: 'onTabChange',
    type: '(tab) => void',
    description: 'Called when the active tab changes.',
  },
  {
    name: 'tabs',
    type: "Array<'popular' | 'recent' | 'yours'>",
    default: "['popular', 'recent', 'yours']",
    description: 'Which tabs to show, in order.',
  },
  {
    name: 'defaultQuery',
    type: 'string',
    default: "''",
    description: 'Initial search text (assumed to match the initial `results`).',
  },
  {
    name: 'debounceMs',
    type: 'number',
    default: '300',
    description: 'Delay between the last keystroke and `onSearch` (`GIF_PICKER_DEFAULT_DEBOUNCE_MS`).',
  },
  {
    name: 'columns',
    type: 'number',
    default: '3',
    description: 'Grid columns. Arrow-key navigation follows the same layout.',
  },
  {
    name: 'reducedMotion',
    type: 'boolean',
    description:
      'Force still images. When unset, stills are used whenever the user prefers reduced motion.',
  },
  {
    name: 'labels',
    type: 'GifPickerLabelOverrides',
    description:
      'Override any visible or announced text (search, tabs, empty/loading/error copy, result count, …).',
  },
  {
    name: 'emptyState',
    type: 'React.ReactNode',
    description: 'Custom content for the empty state, e.g. an upload prompt on the Yours tab.',
  },
  {
    name: 'attribution',
    type: 'React.ReactNode',
    description: 'Provider attribution slot shown in the footer (e.g. "Powered by …").',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Maximum width of the panel.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { GifPicker, type GifPickerItem } from '@refraction-ui/react'

export function ComposerGifs({ onSend }: { onSend: (gif: GifPickerItem) => void }) {
  const [results, setResults] = React.useState<GifPickerItem[]>([])
  const [status, setStatus] = React.useState<'ready' | 'loading' | 'error'>('loading')

  const load = React.useCallback(async (query: string, tab: 'popular' | 'recent' | 'yours') => {
    setStatus('loading')
    try {
      setResults(await myGifProvider.search({ query, tab })) // your API, mapped to GifPickerItem
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  React.useEffect(() => { load('', 'popular') }, [load])

  return (
    <GifPicker
      results={results}
      status={status}
      onSearch={load}
      onRetry={() => load('', 'popular')}
      onSelect={onSend}
      attribution={<span>Powered by My Provider</span>}
    />
  )
}`

export default function GifPickerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">GIF Picker</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A searchable GIF grid with Popular, Recent and Yours tabs for a message composer. It is
          provider-agnostic: you pass the results and a loader, and the picker handles debounced
          search, lazy aspect-preserving images, reduced motion, badges, keyboard navigation and
          the empty, loading and error states.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Wired to a small in-memory provider. Type to search (debounced), switch tabs, load more,
          and pick a GIF — picks appear under Recent. Your own GIFs carry an “In review” badge.
        </p>
        <GifPickerExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Loading, error and empty</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">status</code> from your loader. Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">onRetry</code> to offer a retry button; the
          empty message depends on the tab and the query.
        </p>
        <GifPickerExamples section="states" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Reduced motion</h2>
        <p className="text-sm text-muted-foreground">
          Under <code className="text-xs bg-muted px-1 rounded">prefers-reduced-motion: reduce</code>{' '}
          the still <code className="text-xs bg-muted px-1 rounded">previewUrl</code> is shown instead
          of the animation. <code className="text-xs bg-muted px-1 rounded">reducedMotion</code> forces it.
        </p>
        <GifPickerExamples section="reduced-motion" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>The picker is a labelled group with a labelled search box and a WAI-ARIA tab list (arrow keys, Home and End).</li>
          <li>
            The grid has one tab stop. Arrow keys move between GIFs, Home / End go to the ends of the
            row, and Ctrl + Home / End to the ends of the grid. Enter or Space picks the focused GIF.
          </li>
          <li>Each GIF is a button named by its alt text plus its badge, so “In review” is announced, not just shown.</li>
          <li>A polite live region announces the result count and the loading, error and empty states.</li>
          <li>Animated images switch to their still frame when the user prefers reduced motion.</li>
          <li>Every control shows a focus ring; GIF cells and action buttons are at least 44 px tall.</li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={gifPickerProps} />
      </section>
    </div>
  )
}
