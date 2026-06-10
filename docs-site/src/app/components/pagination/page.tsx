import { PaginationExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const paginationProps = [
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the wrapper element.',
  },
  {
    name: '...props',
    type: 'React.HTMLAttributes<HTMLDivElement>',
    description:
      'All standard div attributes are forwarded. Add role="navigation" and aria-label for accessibility.',
  },
]

const usageCode = `import { Pagination } from '@refraction-ui/react'
import { useState } from 'react'

export function MyPager() {
  const totalPages = 5
  const [page, setPage] = useState(1)

  return (
    <Pagination role="navigation" aria-label="Pagination" className="flex items-center gap-2">
      <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button key={n} aria-current={n === page ? 'page' : undefined} onClick={() => setPage(n)}>
          {n}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
    </Pagination>
  )
}`

export default function PaginationPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pagination</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A lightweight, unstyled wrapper for building page navigation. It forwards native attributes so you
          can layer in your own page buttons, range logic, and accessibility roles.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Previous / next controls with a numbered page for each item, tracking the current page in state.
        </p>
        <PaginationExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-pagination" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Truncated range</h2>
        <p className="text-sm text-muted-foreground">
          For larger datasets, render a windowed range with ellipses around the current page and first/last
          shortcuts.
        </p>
        <PaginationExamples section="range" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={paginationProps} />
      </section>
    </div>
  )
}
